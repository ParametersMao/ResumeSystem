"""Small deterministic RAG smoke evaluation for release checks."""

import json
import os
import sys
import uuid

from qdrant_client import QdrantClient

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import rag


CASES = [
    ("Vue TypeScript 前端性能优化", 101),
    ("用户增长 A/B 测试 激活率", 102),
    ("预算 审计 税务合规", 103),
]

DOCUMENTS = [
    (101, "前端岗位指南", "前端工程师需要掌握 Vue、TypeScript、性能优化与工程化。"),
    (102, "产品运营指南", "用户增长岗位关注激活率、留存、A/B 测试与数据分析。"),
    (103, "财务岗位指南", "财务岗位关注预算管理、审计、税务合规与成本控制。"),
]


def main() -> int:
    rag.EMBEDDING_BACKEND = "hash"
    rag.MIN_SEARCH_SCORE = 0.08
    rag.COLLECTION_NAME = f"eval_{uuid.uuid4().hex}"
    rag._qdrant_client = QdrantClient(location=":memory:")
    for document_id, name, text in DOCUMENTS:
        rag.index_document(
            document_id=document_id,
            name=name,
            category="evaluation",
            file_name=f"{document_id}.txt",
            content_type="text/plain",
            data=text.encode(),
        )

    details = []
    hits = 0
    for query, expected_id in CASES:
        results = rag.search_documents(query, limit=1, category="evaluation")
        actual_id = results[0]["documentId"] if results else None
        passed = actual_id == expected_id
        hits += int(passed)
        details.append({"query": query, "expected": expected_id, "actual": actual_id, "passed": passed})

    report = {
        "metric": "recall_at_1",
        "score": round(hits / len(CASES), 4),
        "passed": hits == len(CASES),
        "cases": details,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
