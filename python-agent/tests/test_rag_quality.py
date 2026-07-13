import json
import os
import sys
import unittest
import uuid

from qdrant_client import QdrantClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import rag
from app.graph import retrieval_node, validation_node
from app.schemas import AgentRequest, AgentStep, ResumeContext


FIXTURE_DIR = os.path.join(os.path.dirname(__file__), "fixtures")


class RagQualityGateTest(unittest.TestCase):
    def setUp(self) -> None:
        rag.EMBEDDING_BACKEND = "hash"
        rag.MIN_SEARCH_SCORE = 0.08
        rag.COLLECTION_NAME = f"quality_{uuid.uuid4().hex}"
        rag._qdrant_client = QdrantClient(location=":memory:")
        documents = [
            (101, "前端岗位指南", "job-guide", "Vue TypeScript 前端性能优化 工程化 组件设计"),
            (102, "财务岗位指南", "job-guide", "预算管理 财务审计 税务合规 成本控制"),
            (103, "增长岗位指南", "job-guide", "用户增长 A/B 测试 激活率 留存率 数据分析"),
            (104, "校园运营指南", "campus-guide", "校园活动 新媒体 内容运营 社团协作"),
        ]
        for document_id, name, category, text in documents:
            rag.index_document(
                document_id=document_id,
                name=name,
                category=category,
                file_name=f"{document_id}.txt",
                content_type="text/plain",
                data=text.encode("utf-8"),
            )

    def tearDown(self) -> None:
        rag._qdrant_client = None

    def test_top1_job_retrieval_eval_set(self) -> None:
        with open(os.path.join(FIXTURE_DIR, "rag_eval_cases.json"), encoding="utf-8") as handle:
            cases = json.load(handle)
        correct = 0
        for case in cases:
            results = rag.search_documents(case["query"], limit=3, category=case["category"])
            self.assertTrue(results, case["query"])
            correct += int(results[0]["documentId"] == case["expected_document_id"])
        self.assertEqual(correct / len(cases), 1.0)

    def test_category_filter_and_disabled_document(self) -> None:
        filtered = rag.search_documents("内容运营", limit=5, category="job-guide")
        self.assertNotIn(104, [item["documentId"] for item in filtered])

        rag.set_document_enabled(103, False)
        disabled = rag.search_documents("用户增长 A/B 测试", limit=5)
        self.assertNotIn(103, [item["documentId"] for item in disabled])

    def test_empty_collection_degrades_without_failure(self) -> None:
        rag.COLLECTION_NAME = f"missing_{uuid.uuid4().hex}"
        request = AgentRequest(
            task_type="diagnose",
            context=ResumeContext(job_title="前端工程师", section_type="experience"),
        )
        perception = AgentStep(
            name="perception",
            title="上下文感知",
            summary="test",
            output={"job_title": "前端工程师"},
        )
        result = retrieval_node(request, perception)
        self.assertEqual(result.output["sources"], [])
        self.assertTrue(result.output["enabled"])

    def test_strict_source_mode_fails_closed(self) -> None:
        rag.COLLECTION_NAME = f"missing_{uuid.uuid4().hex}"
        request = AgentRequest(
            task_type="diagnose",
            context=ResumeContext(job_title="前端工程师", section_type="experience"),
            options={"strict_sources": True},
        )
        perception = AgentStep(name="perception", title="上下文感知", summary="test", output={"job_title": "前端工程师"})
        with self.assertRaisesRegex(RuntimeError, "阻止无依据生成"):
            retrieval_node(request, perception)

    def test_validation_flags_numbers_not_present_in_source(self) -> None:
        request = AgentRequest(
            task_type="polish",
            context=ResumeContext(selected_text="负责用户增长和留存优化。"),
        )
        execution = AgentStep(
            name="execution",
            title="执行生成",
            summary="test",
            output={"suggestions": [{"text": "推动留存率提升 35%。"}]},
        )
        result = validation_node(request, execution, {})
        warnings = result.output.get("warnings", [])
        self.assertTrue(any("35%" in warning and "必须核实" in warning for warning in warnings))

    def test_graph_routes_only_current_resume_private_jd(self) -> None:
        for document_id, owner_id, resume_id, tenant_token in [
            (201, 11, "resume-one", "OwnerOnePrivate"),
            (202, 22, "resume-two", "OwnerTwoPrivate"),
        ]:
            rag.index_document(
                document_id=document_id,
                name=f"{tenant_token} JD",
                category="job-guide",
                file_name=f"{document_id}.txt",
                content_type="text/plain",
                data=f"Vue TypeScript 前端工程师 {tenant_token}".encode(),
                source_type="job-description",
                scope="private",
                owner_user_id=owner_id,
                resume_id=resume_id,
            )
        rag.index_document(
            document_id=203,
            name="授权脱敏样例",
            category="example",
            file_name="example.txt",
            content_type="text/plain",
            data="Vue TypeScript 前端工程师 ExampleOnly".encode(),
            source_type="resume-exemplar",
            licensed=True,
            pii_reviewed=True,
        )

        request = AgentRequest(
            task_type="diagnose",
            context=ResumeContext(
                user_id=11,
                resume_id="resume-one",
                job_title="前端工程师",
                selected_text="Vue TypeScript",
            ),
        )
        perception = AgentStep(
            name="perception",
            title="上下文感知",
            summary="test",
            output={"job_title": "前端工程师"},
        )
        result = retrieval_node(request, perception)
        ids = {item["documentId"] for item in result.output["sources"]}
        self.assertIn(201, ids)
        self.assertNotIn(202, ids)
        self.assertNotIn(203, ids)
        self.assertEqual(
            result.output["sourceTypes"],
            ["standard", "role-framework", "job-description"],
        )

        polish = request.model_copy(
            update={"task_type": "polish", "options": {"includeExemplars": True}}
        )
        polish_result = retrieval_node(polish, perception)
        self.assertIn("resume-exemplar", polish_result.output["sourceTypes"])
        example_sources = [
            item
            for item in polish_result.output["sources"]
            if item["sourceType"] == "resume-exemplar"
        ]
        self.assertTrue(example_sources)
        self.assertTrue(all(item["factType"] == "example" for item in example_sources))

    def test_resume_diagnosis_fails_when_only_global_sources_match(self) -> None:
        request = AgentRequest(
            task_type="diagnose",
            context=ResumeContext(
                user_id=11,
                resume_id="missing-private-jd",
                job_title="前端工程师",
                selected_text="Vue TypeScript",
            ),
        )
        perception = AgentStep(
            name="perception",
            title="上下文感知",
            summary="test",
            output={"job_title": "前端工程师"},
        )

        with self.assertRaisesRegex(RuntimeError, "私有 JD 诊断失败"):
            retrieval_node(request, perception)


if __name__ == "__main__":
    unittest.main()
