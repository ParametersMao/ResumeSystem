"""Release-only live LLM + RAG Agent probe, executed inside resume-agent."""

from __future__ import annotations

import json
import os
import sys
import urllib.request


def post_json(url: str, payload: dict, headers: dict[str, str] | None = None) -> dict:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json", **(headers or {})},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=max(60, int(os.getenv("LLM_TIMEOUT_SECONDS", "120")) + 30)) as response:
        return json.load(response)


def qdrant_probe_text(document_id: int) -> str:
    qdrant_url = os.getenv("QDRANT_URL", "http://qdrant:6333").rstrip("/")
    collection = os.environ["QDRANT_COLLECTION"]
    headers: dict[str, str] = {}
    if os.getenv("QDRANT_API_KEY"):
        headers["api-key"] = os.environ["QDRANT_API_KEY"]
    result = post_json(
        f"{qdrant_url}/collections/{collection}/points/scroll",
        {
            "filter": {
                "must": [
                    {"key": "document_id", "match": {"value": document_id}},
                    {"key": "enabled", "match": {"value": True}},
                    {"key": "scope", "match": {"value": "global"}},
                ]
            },
            "limit": 1,
            "with_payload": True,
            "with_vector": False,
        },
        headers,
    )
    points = ((result.get("result") or {}).get("points") or [])
    text = str(((points[0] if points else {}).get("payload") or {}).get("text") or "").strip()
    if not text:
        raise RuntimeError("probe_text_missing")
    return text[:1800]


def main() -> int:
    document_id = int(sys.argv[1])
    selected_text = qdrant_probe_text(document_id)
    response = post_json(
        "http://127.0.0.1:8000/agent/generate",
        {
            "task_type": "generate",
            "context": {
                "section_type": "experience",
                "job_title": "软件工程师",
                "selected_text": selected_text,
                "user_instruction": "请依据知识库规范生成一条简洁、量化、可核验的经历描述。",
            },
            "options": {"execution_mode": "live", "strict_sources": True, "temperature": 0.1},
        },
        {"X-Agent-Secret": os.environ["AGENT_INTERNAL_SECRET"]},
    )
    expected_steps = {"perception", "retrieval", "planning", "analysis", "execution", "validation"}
    actual_steps = {str(step.get("name")) for step in response.get("steps") or []}
    sources = response.get("sources") or []
    structured = (response.get("suggestions") or response.get("diagnostics") or response.get("patch"))
    if response.get("execution_mode") != "live":
        raise RuntimeError("execution_mode_not_live")
    if response.get("provider") != os.getenv("AI_PROVIDER"):
        raise RuntimeError("provider_mismatch")
    if response.get("model") != os.getenv("OPENAI_MODEL"):
        raise RuntimeError("model_mismatch")
    if int(response.get("token_used") or 0) <= 0:
        raise RuntimeError("token_usage_missing")
    if actual_steps != expected_steps:
        raise RuntimeError("agent_step_contract_mismatch")
    if not sources or not any(item.get("documentId") == document_id for item in sources):
        raise RuntimeError("rag_source_contract_mismatch")
    if not structured:
        raise RuntimeError("structured_result_missing")
    print(
        "OK|{}|{}|{}|{}".format(
            response.get("provider"),
            response.get("model"),
            response.get("token_used"),
            len(sources),
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"ERROR|{type(error).__name__}|{str(error)[:300]}")
        raise SystemExit(1)
