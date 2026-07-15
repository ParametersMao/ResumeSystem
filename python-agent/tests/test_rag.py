import math
import os
import sys
import unittest
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from qdrant_client import QdrantClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import rag


def cosine(left: list[float], right: list[float]) -> float:
    return sum(a * b for a, b in zip(left, right)) / (
        math.sqrt(sum(value * value for value in left))
        * math.sqrt(sum(value * value for value in right))
    )


class RagTest(unittest.TestCase):
    def setUp(self) -> None:
        rag.EMBEDDING_BACKEND = "hash"
        rag.MIN_SEARCH_SCORE = 0.08
        rag.COLLECTION_NAME = f"test_{uuid.uuid4().hex}"
        rag._qdrant_client = QdrantClient(location=":memory:")

    def tearDown(self) -> None:
        rag._qdrant_client = None

    def test_split_text_keeps_overlap_for_long_content(self) -> None:
        chunks = rag.split_text("前端性能优化" * 80, chunk_size=120, overlap=20)
        self.assertGreater(len(chunks), 2)
        self.assertLessEqual(max(len(chunk.text) for chunk in chunks), 120)

    def test_hash_embedding_handles_chinese_partial_overlap(self) -> None:
        query = rag._hash_embedding("前端性能优化 TypeScript")
        relevant = rag._hash_embedding("负责前端性能优化与 TypeScript 工程化")
        unrelated = rag._hash_embedding("财务审计与税务合规")
        self.assertGreater(cosine(query, relevant), cosine(query, unrelated))

    def test_index_and_search_returns_traceable_source(self) -> None:
        rag.index_document(
            document_id=1,
            name="前端岗位指南",
            category="job-guide",
            file_name="frontend.txt",
            content_type="text/plain",
            data="前端工程师需要掌握 Vue、TypeScript、性能优化与工程化。".encode(),
        )
        rag.index_document(
            document_id=2,
            name="财务岗位指南",
            category="job-guide",
            file_name="finance.txt",
            content_type="text/plain",
            data="财务岗位关注审计、预算、税务合规与成本控制。".encode(),
        )

        results = rag.search_documents("Vue TypeScript 前端性能优化", limit=2)
        self.assertTrue(results)
        self.assertEqual(results[0]["documentId"], 1)
        self.assertEqual(results[0]["sourceId"], "1:0")
        self.assertIn("excerpt", results[0])
        self.assertEqual(results[0]["retrievalMethod"], "hybrid-dense-bm25")
        self.assertGreater(results[0]["lexicalScore"], 0)

    def test_hybrid_retrieval_promotes_exact_technical_terms(self) -> None:
        rag.index_document(
            document_id=10,
            name="精确技能指南",
            category="job-guide",
            file_name="exact.txt",
            content_type="text/plain",
            data="前端工程化要求掌握 Webpack Module Federation 与微前端。".encode(),
        )
        rag.index_document(
            document_id=11,
            name="通用开发指南",
            category="job-guide",
            file_name="general.txt",
            content_type="text/plain",
            data="软件工程师需要负责系统开发、测试、上线与团队协作。".encode(),
        )
        results = rag.search_documents("Module Federation", limit=2)
        self.assertEqual(results[0]["documentId"], 10)
        self.assertGreater(results[0]["lexicalScore"], 0)

    def test_private_job_descriptions_are_filtered_inside_qdrant(self) -> None:
        common = "Python FastAPI 数据平台 岗位要求"
        rag.index_document(
            document_id=20,
            name="全局写作规范",
            category="standard",
            file_name="standard.txt",
            content_type="text/plain",
            data=f"{common} 使用行动结果结构。".encode(),
            source_type="standard",
        )
        rag.index_document(
            document_id=21,
            name="用户一 JD",
            category="job-guide",
            file_name="jd-1.txt",
            content_type="text/plain",
            data=f"{common} 用户一私有关键词 AlphaTenant。".encode(),
            source_type="job-description",
            scope="private",
            owner_user_id=101,
            resume_id="resume-a",
        )
        rag.index_document(
            document_id=22,
            name="用户二 JD",
            category="job-guide",
            file_name="jd-2.txt",
            content_type="text/plain",
            data=f"{common} 用户二私有关键词 BetaTenant。".encode(),
            source_type="job-description",
            scope="private",
            owner_user_id=202,
            resume_id="resume-b",
        )

        anonymous = rag.search_documents(common, limit=10)
        self.assertEqual({item["documentId"] for item in anonymous}, {20})

        owner_one = rag.search_documents(
            common,
            limit=10,
            owner_user_id=101,
            resume_id="resume-a",
        )
        self.assertIn(20, {item["documentId"] for item in owner_one})
        self.assertIn(21, {item["documentId"] for item in owner_one})
        self.assertNotIn(22, {item["documentId"] for item in owner_one})

        private_only = rag.search_documents(
            common,
            limit=10,
            scope="private",
            owner_user_id=202,
            resume_id="resume-b",
        )
        self.assertEqual({item["documentId"] for item in private_only}, {22})
        self.assertTrue(all(item["scope"] == "private" for item in private_only))

        with self.assertRaisesRegex(ValueError, "owner_user_id"):
            rag.search_documents(common, scope="private")

    def test_resume_exemplar_requires_license_and_pii_review(self) -> None:
        kwargs = {
            "document_id": 30,
            "name": "脱敏样例",
            "category": "example",
            "file_name": "example.txt",
            "content_type": "text/plain",
            "data": "负责后端性能治理和稳定性建设。".encode(),
            "source_type": "resume-exemplar",
        }
        with self.assertRaisesRegex(ValueError, "licensed=true"):
            rag.index_document(**kwargs)
        with self.assertRaisesRegex(ValueError, "piiReviewed=true"):
            rag.index_document(**kwargs, licensed=True)

        rag.index_document(**kwargs, licensed=True, pii_reviewed=True)
        results = rag.search_documents(
            "后端性能治理",
            source_types=["resume-exemplar"],
        )
        self.assertEqual(results[0]["documentId"], 30)
        self.assertEqual(results[0]["factType"], "example")
        self.assertTrue(results[0]["licensed"])
        self.assertTrue(results[0]["piiReviewed"])

    def test_expired_private_knowledge_is_filtered_in_qdrant(self) -> None:
        base = {
            "category": "job-guide",
            "content_type": "text/plain",
            "source_type": "job-description",
            "scope": "private",
            "owner_user_id": 303,
            "resume_id": "resume-expiry",
        }
        rag.index_document(
            **base,
            document_id=31,
            name="已过期 JD",
            file_name="expired.txt",
            data="Python 后端工程 ExpiredPrivateToken".encode(),
            expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        )
        rag.index_document(
            **base,
            document_id=32,
            name="有效 JD",
            file_name="valid.txt",
            data="Python 后端工程 ValidPrivateToken".encode(),
            expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        )
        results = rag.search_documents(
            "Python 后端工程",
            limit=10,
            scope="private",
            owner_user_id=303,
            resume_id="resume-expiry",
        )
        self.assertEqual({item["documentId"] for item in results}, {32})

    def test_failed_rebuild_restores_old_searchable_points(self) -> None:
        rag.index_document(
            document_id=40,
            name="稳定旧索引",
            category="standard",
            file_name="old.txt",
            content_type="text/plain",
            data="旧版本保留词 LegacyStableToken 简历写作规范。".encode(),
        )
        client = rag.get_qdrant_client()
        original_upsert = client.upsert
        first_attempt = True

        def partially_write_then_fail(*args, **kwargs):
            nonlocal first_attempt
            if first_attempt:
                first_attempt = False
                points = kwargs["points"]
                original_upsert(
                    collection_name=kwargs["collection_name"],
                    points=points[:1],
                    wait=True,
                )
                raise RuntimeError("simulated replacement failure")
            return original_upsert(*args, **kwargs)

        with patch.object(client, "upsert", side_effect=partially_write_then_fail):
            with self.assertRaisesRegex(RuntimeError, "simulated replacement failure"):
                rag.index_document(
                    document_id=40,
                    name="失败的新索引",
                    category="standard",
                    file_name="new.txt",
                    content_type="text/plain",
                    data="新版本替换词 NewReplacementToken。".encode(),
                )

        old_results = rag.search_documents("LegacyStableToken", limit=5)
        self.assertEqual(old_results[0]["documentId"], 40)
        self.assertIn("LegacyStableToken", old_results[0]["text"])
        new_results = rag.search_documents("NewReplacementToken", limit=5)
        self.assertFalse(any(item["documentId"] == 40 for item in new_results))

    def test_reindex_preserves_disabled_document_state(self) -> None:
        rag.index_document(
            document_id=41,
            name="Disabled document",
            category="standard",
            file_name="disabled-old.txt",
            content_type="text/plain",
            data=b"OldDisabledToken resume guidance",
        )
        rag.set_document_enabled(41, False)

        result = rag.index_document(
            document_id=41,
            name="Reindexed disabled document",
            category="standard",
            file_name="disabled-new.txt",
            content_type="text/plain",
            data=b"NewDisabledToken resume guidance",
        )

        self.assertFalse(result["enabled"])
        self.assertFalse(rag.search_documents("NewDisabledToken", limit=5))
        points, _ = rag.get_qdrant_client().scroll(
            collection_name=rag.COLLECTION_NAME,
            scroll_filter=rag._document_filter(41),
            with_payload=True,
            limit=10,
        )
        self.assertTrue(points)
        self.assertTrue(all(point.payload["enabled"] is False for point in points))

    def test_first_index_can_be_explicitly_disabled(self) -> None:
        result = rag.index_document(
            document_id=42,
            name="Initially disabled document",
            category="standard",
            file_name="disabled.txt",
            content_type="text/plain",
            data=b"ExplicitDisabledToken resume guidance",
            enabled=False,
        )

        self.assertFalse(result["enabled"])
        self.assertFalse(rag.search_documents("ExplicitDisabledToken", limit=5))

    def test_rag_status_only_marks_qdrant_reachable_after_real_request(self) -> None:
        class UnreachableClient:
            def collection_exists(self, _collection_name: str) -> bool:
                raise ConnectionError("qdrant unavailable")

        with patch.object(rag, "get_qdrant_client", return_value=UnreachableClient()):
            status = rag.get_rag_status()

        self.assertFalse(status["qdrant_reachable"])
        self.assertFalse(status["collection_ready"])
        self.assertIn("qdrant unavailable", status["error"])


if __name__ == "__main__":
    unittest.main()
