import math
import os
import sys
import unittest
import uuid

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


if __name__ == "__main__":
    unittest.main()
