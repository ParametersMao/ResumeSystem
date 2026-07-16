import math
import os
import sys
import threading
import unittest
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from unittest.mock import call, patch

from qdrant_client import QdrantClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import rag
from app import main as agent_main


def cosine(left: list[float], right: list[float]) -> float:
    return sum(a * b for a, b in zip(left, right)) / (
        math.sqrt(sum(value * value for value in left))
        * math.sqrt(sum(value * value for value in right))
    )


class RagTest(unittest.TestCase):
    def setUp(self) -> None:
        self._rag_enabled_environment = patch.dict(os.environ, {"RAG_ENABLED": "true"})
        self._rag_enabled_environment.start()
        rag.EMBEDDING_BACKEND = "hash"
        rag.MIN_SEARCH_SCORE = 0.08
        rag.COLLECTION_NAME = f"test_{uuid.uuid4().hex}"
        rag._embedding_model = None
        rag._qdrant_client = QdrantClient(location=":memory:")
        with rag._document_mutation_states_guard:
            rag._document_mutation_states.clear()

    def tearDown(self) -> None:
        rag._embedding_model = None
        rag._qdrant_client = None
        with rag._document_mutation_states_guard:
            rag._document_mutation_states.clear()
        self._rag_enabled_environment.stop()

    def _assert_reindex_rejects_concurrent_mutation(self, mutation) -> None:
        embed_started = threading.Event()
        release_embed = threading.Event()
        original_embed_texts = rag.embed_texts

        def blocking_embed(texts):
            embed_started.set()
            self.assertTrue(release_embed.wait(timeout=2))
            return original_embed_texts(texts)

        with patch.object(rag, "embed_texts", side_effect=blocking_embed):
            with ThreadPoolExecutor(max_workers=1) as executor:
                first = executor.submit(
                    rag.index_document,
                    document_id=70,
                    name="Concurrent document",
                    category="standard",
                    file_name="concurrent.txt",
                    content_type="text/plain",
                    data=b"Concurrent mutation guard resume guidance",
                )
                self.assertTrue(embed_started.wait(timeout=1))
                try:
                    with self.assertRaises(rag.DocumentMutationConflict):
                        mutation()
                finally:
                    release_embed.set()
                first.result(timeout=2)

    def test_embedding_model_initialization_is_single_flight(self) -> None:
        rag.EMBEDDING_BACKEND = "fastembed"
        sentinel = object()
        calls = 0
        calls_lock = threading.Lock()
        initialization_started = threading.Event()
        release_initialization = threading.Event()

        def construct_model(**_kwargs):
            nonlocal calls
            with calls_lock:
                calls += 1
            initialization_started.set()
            self.assertTrue(release_initialization.wait(timeout=1))
            return sentinel

        with patch.object(rag, "TextEmbedding", side_effect=construct_model):
            with ThreadPoolExecutor(max_workers=2) as executor:
                first = executor.submit(rag.get_embedding_model)
                self.assertTrue(initialization_started.wait(timeout=1))
                with self.assertRaisesRegex(RuntimeError, "already in progress"):
                    rag.get_embedding_model()
                release_initialization.set()
                model = first.result(timeout=1)

        self.assertEqual(calls, 1)
        self.assertIs(model, sentinel)
        self.assertIs(rag.get_embedding_model(), sentinel)

    def test_initialize_rag_runtime_creates_collection_from_embedding_dimension(self) -> None:
        rag.EMBEDDING_BACKEND = "fastembed"

        class ProbeModel:
            def __init__(self) -> None:
                self.inputs: list[list[str]] = []

            def embed(self, texts):
                self.inputs.append(list(texts))
                return [[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]]

        model = ProbeModel()
        with patch.object(rag, "get_embedding_model", return_value=model):
            result = rag.initialize_rag_runtime(max_attempts=1)

        collection = rag.get_qdrant_client().get_collection(rag.COLLECTION_NAME)
        vector_config = collection.config.params.vectors
        self.assertEqual(result["vector_size"], 7)
        self.assertEqual(int(vector_config.size), 7)
        self.assertEqual(result["attempts"], 1)
        self.assertEqual(len(model.inputs), 1)
        self.assertEqual(len(model.inputs[0]), 1)

    def test_initialize_rag_runtime_retries_temporarily_unavailable_qdrant(self) -> None:
        rag.EMBEDDING_BACKEND = "hash"
        delegate = rag.get_qdrant_client()

        class TemporarilyUnavailableClient:
            def __init__(self) -> None:
                self.collection_checks = 0

            def collection_exists(self, collection_name: str) -> bool:
                self.collection_checks += 1
                if self.collection_checks < 3:
                    raise ConnectionError("qdrant is still starting")
                return delegate.collection_exists(collection_name)

            def __getattr__(self, name: str):
                return getattr(delegate, name)

        client = TemporarilyUnavailableClient()
        with (
            patch.object(rag, "get_qdrant_client", return_value=client),
            patch.object(rag, "get_embedding_model") as get_model,
            patch.object(rag.time, "sleep") as sleep,
        ):
            result = rag.initialize_rag_runtime(
                max_attempts=3,
                retry_delay_seconds=0.25,
            )

        self.assertEqual(result["attempts"], 3)
        self.assertEqual(result["embedding_backend"], "hash")
        self.assertEqual(result["vector_size"], rag.HASH_VECTOR_SIZE)
        self.assertEqual(client.collection_checks, 3)
        self.assertTrue(delegate.collection_exists(rag.COLLECTION_NAME))
        self.assertEqual(sleep.call_args_list, [call(0.25), call(0.25)])
        get_model.assert_not_called()

    def test_initialize_rag_runtime_dimension_conflict_fails_without_retry(self) -> None:
        rag.get_qdrant_client().create_collection(
            collection_name=rag.COLLECTION_NAME,
            vectors_config=rag.models.VectorParams(
                size=4,
                distance=rag.models.Distance.COSINE,
            ),
        )
        rag.EMBEDDING_BACKEND = "fastembed"

        class ProbeModel:
            def embed(self, _texts):
                return [[0.1, 0.2, 0.3]]

        with (
            patch.object(rag, "get_embedding_model", return_value=ProbeModel()),
            patch.object(
                rag,
                "get_qdrant_client",
                wraps=rag.get_qdrant_client,
            ) as get_client,
            patch.object(rag.time, "sleep") as sleep,
        ):
            with self.assertRaises(ValueError):
                rag.initialize_rag_runtime(
                    max_attempts=5,
                    retry_delay_seconds=0.25,
                )

        sleep.assert_not_called()
        get_client.assert_called_once_with()

    def test_initialize_rag_runtime_hash_backend_skips_embedding_model(self) -> None:
        rag.EMBEDDING_BACKEND = "hash"
        with patch.object(rag, "get_embedding_model") as get_model:
            result = rag.initialize_rag_runtime(max_attempts=1)

        self.assertTrue(result["initialized"])
        self.assertEqual(result["embedding_backend"], "hash")
        self.assertEqual(result["vector_size"], rag.HASH_VECTOR_SIZE)
        get_model.assert_not_called()

    def test_initialize_rag_runtime_rejects_unknown_embedding_backend(self) -> None:
        rag.EMBEDDING_BACKEND = "remote-provider"
        with (
            patch.object(rag, "get_embedding_model") as get_model,
            patch.object(rag, "get_qdrant_client") as get_client,
        ):
            with self.assertRaisesRegex(ValueError, "Unsupported embedding backend"):
                rag.initialize_rag_runtime(max_attempts=3)

        get_model.assert_not_called()
        get_client.assert_not_called()

    def test_health_probe_requests_are_single_flight(self) -> None:
        active = 0
        maximum_active = 0
        state_lock = threading.Lock()
        probe_started = threading.Event()
        release_probe = threading.Event()

        def run_probe(_document_id, _expected_chunk_count):
            nonlocal active, maximum_active
            with state_lock:
                active += 1
                maximum_active = max(maximum_active, active)
            probe_started.set()
            try:
                self.assertTrue(release_probe.wait(timeout=1))
                return {"ok": True}
            finally:
                with state_lock:
                    active -= 1

        with patch.object(rag, "_verify_document_searchable", side_effect=run_probe):
            with ThreadPoolExecutor(max_workers=4) as executor:
                first = executor.submit(rag.verify_document_searchable, 1, 1)
                self.assertTrue(probe_started.wait(timeout=1))
                queued = [
                    executor.submit(rag.verify_document_searchable, 1, 1)
                    for _ in range(3)
                ]
                in_progress = [future.result(timeout=1) for future in queued]
                release_probe.set()
                results = [first.result(timeout=1), *in_progress]

        self.assertEqual(maximum_active, 1)
        self.assertEqual(sum(1 for result in results if result["ok"]), 1)
        self.assertEqual(
            sum(1 for result in results if result.get("reason") == "probe_in_progress"),
            3,
        )

    def test_same_document_reindex_conflict_is_fail_fast(self) -> None:
        self._assert_reindex_rejects_concurrent_mutation(
            lambda: rag.index_document(
                document_id=70,
                name="Second rebuild",
                category="standard",
                file_name="second.txt",
                content_type="text/plain",
                data=b"Second concurrent rebuild",
            )
        )

    def test_reindex_conflicts_with_disable(self) -> None:
        self._assert_reindex_rejects_concurrent_mutation(
            lambda: rag.set_document_enabled(70, False)
        )

    def test_reindex_conflicts_with_delete(self) -> None:
        self._assert_reindex_rejects_concurrent_mutation(
            lambda: rag.delete_document(70)
        )

    def test_health_probe_fails_closed_when_rag_is_disabled(self) -> None:
        with patch.dict(os.environ, {"RAG_ENABLED": "false"}):
            with patch.object(rag, "_verify_document_searchable") as verify:
                result = rag.verify_document_searchable(1, 1)

            self.assertFalse(result["ok"])
            self.assertEqual(result["reason"], "rag_disabled")
            verify.assert_not_called()
            self.assertFalse(rag.get_rag_status()["enabled"])

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

    def test_health_probe_binds_ready_document_to_searchable_points(self) -> None:
        indexed = rag.index_document(
            document_id=3,
            name="可检索健康文档",
            category="standard",
            file_name="health.txt",
            content_type="text/plain",
            data="任意可替换的简历规范内容，健康探针从已索引文本自身派生查询。".encode(),
        )

        result = rag.verify_document_searchable(3, indexed["chunk_count"])

        self.assertTrue(result["ok"])
        self.assertEqual(result["documentId"], 3)
        self.assertEqual(result["indexedChunks"], indexed["chunk_count"])
        self.assertTrue(result["denseVerified"])
        self.assertGreaterEqual(result["denseScore"], rag.DENSE_HEALTH_MIN_COSINE)
        self.assertGreaterEqual(
            result["minimumVectorCosine"], rag.DENSE_HEALTH_MIN_COSINE
        )
        self.assertRegex(result["sourceSha256"], r"^[0-9a-f]{64}$")
        self.assertEqual(result["verifiedChunkDigests"], indexed["chunk_count"])
        self.assertEqual(result["reason"], "ok")

        mismatch = rag.verify_document_searchable(3, indexed["chunk_count"] + 1)
        self.assertFalse(mismatch["ok"])
        self.assertEqual(mismatch["reason"], "chunk_count_mismatch")

        rag.set_document_enabled(3, False)
        disabled = rag.verify_document_searchable(3, indexed["chunk_count"])
        self.assertFalse(disabled["ok"])
        self.assertEqual(disabled["reason"], "enabled_global_points_missing")

    def test_health_probe_rejects_lexical_match_with_wrong_dense_vector(self) -> None:
        indexed = rag.index_document(
            document_id=4,
            name="Dense attestation",
            category="standard",
            file_name="dense.txt",
            content_type="text/plain",
            data=b"FastEmbed dense vectors must match every stored chunk.",
        )
        client = rag.get_qdrant_client()
        points, _ = client.scroll(
            collection_name=rag.COLLECTION_NAME,
            scroll_filter=rag._document_filter(4),
            with_payload=True,
            with_vectors=True,
        )
        self.assertEqual(len(points), 1)
        client.upsert(
            collection_name=rag.COLLECTION_NAME,
            points=[
                rag.models.PointStruct(
                    id=points[0].id,
                    vector=[1.0] + [0.0] * (rag.HASH_VECTOR_SIZE - 1),
                    payload=points[0].payload,
                )
            ],
            wait=True,
        )

        result = rag.verify_document_searchable(4, indexed["chunk_count"])

        self.assertFalse(result["ok"])
        self.assertEqual(result["reason"], "stored_vector_mismatch")

    def test_health_probe_rejects_tampered_chunk_digest(self) -> None:
        indexed = rag.index_document(
            document_id=5,
            name="Digest attestation",
            category="standard",
            file_name="digest.txt",
            content_type="text/plain",
            data=b"Source and chunk digests bind Qdrant to the uploaded file.",
        )
        client = rag.get_qdrant_client()
        points, _ = client.scroll(
            collection_name=rag.COLLECTION_NAME,
            scroll_filter=rag._document_filter(5),
            with_payload=True,
            with_vectors=True,
        )
        payload = dict(points[0].payload or {})
        payload["chunk_sha256"] = "0" * 64
        client.upsert(
            collection_name=rag.COLLECTION_NAME,
            points=[
                rag.models.PointStruct(
                    id=points[0].id,
                    vector=points[0].vector,
                    payload=payload,
                )
            ],
            wait=True,
        )

        result = rag.verify_document_searchable(5, indexed["chunk_count"])

        self.assertFalse(result["ok"])
        self.assertEqual(result["reason"], "chunk_digest_mismatch")

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


class AgentHealthTest(unittest.TestCase):
    def test_health_is_degraded_when_rag_is_disabled(self) -> None:
        with patch.object(
            agent_main,
            "get_rag_status",
            return_value={
                "enabled": False,
                "embedding_backend": "fastembed",
                "qdrant_reachable": True,
                "collection_ready": True,
            },
        ):
            result = agent_main.health()

        self.assertEqual(result["status"], "degraded")

    def test_health_requires_real_embedding_and_ready_collection(self) -> None:
        with patch.object(
            agent_main,
            "get_rag_status",
            return_value={
                "enabled": True,
                "embedding_backend": "fastembed",
                "qdrant_reachable": True,
                "collection_ready": True,
            },
        ):
            result = agent_main.health()

        self.assertEqual(result["status"], "ok")

    def test_mutation_conflict_is_exposed_as_http_409(self) -> None:
        with patch.object(
            agent_main,
            "delete_document",
            side_effect=rag.DocumentMutationConflict("document 1 is busy"),
        ):
            with self.assertRaises(agent_main.HTTPException) as raised:
                agent_main.rag_delete(1)

        self.assertEqual(raised.exception.status_code, 409)

    def test_missing_strict_rag_evidence_is_exposed_as_http_424(self) -> None:
        request = agent_main.AgentRequest.model_validate({"context": {}})
        with patch.object(
            agent_main,
            "run_agent",
            side_effect=agent_main.RagSourceUnavailableError("private JD missing"),
        ):
            with self.assertRaises(agent_main.HTTPException) as raised:
                agent_main.run_agent_safely(request)

        self.assertEqual(raised.exception.status_code, 424)
        self.assertEqual(raised.exception.detail, "private JD missing")

    def test_live_llm_failure_is_exposed_as_http_502(self) -> None:
        request = agent_main.AgentRequest.model_validate({"context": {}})
        with patch.object(
            agent_main,
            "run_agent",
            side_effect=agent_main.LlmError("upstream unavailable"),
        ):
            with self.assertRaises(agent_main.HTTPException) as raised:
                agent_main.run_agent_safely(request)

        self.assertEqual(raised.exception.status_code, 502)
        self.assertEqual(raised.exception.detail, "upstream unavailable")


if __name__ == "__main__":
    unittest.main()
