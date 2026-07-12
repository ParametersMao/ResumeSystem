"""Authenticated HTTP smoke test for the running Agent + Qdrant service."""

import json
import os
import urllib.request
import uuid


BASE_URL = os.getenv("AGENT_SMOKE_URL", "http://127.0.0.1:8000").rstrip("/")
SECRET = os.getenv("AGENT_INTERNAL_SECRET", "")
DOCUMENT_ID = 910001


def request(path: str, *, method: str = "GET", body: bytes | None = None, content_type: str | None = None):
    headers = {"X-Agent-Secret": SECRET}
    if content_type:
        headers["Content-Type"] = content_type
    req = urllib.request.Request(f"{BASE_URL}{path}", data=body, method=method, headers=headers)
    with urllib.request.urlopen(req, timeout=20) as response:
        return json.loads(response.read().decode())


def multipart() -> tuple[bytes, str]:
    boundary = f"----resume-agent-{uuid.uuid4().hex}"
    parts: list[bytes] = []
    for name, value in [("document_id", str(DOCUMENT_ID)), ("name", "端到端测试知识"), ("category", "smoke")]:
        parts.append(
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode()
        )
    text = "前端工程师需要掌握 Vue、TypeScript、性能优化和工程化实践。".encode()
    parts.append(
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"guide.txt\"\r\nContent-Type: text/plain\r\n\r\n".encode()
        + text
        + b"\r\n"
    )
    parts.append(f"--{boundary}--\r\n".encode())
    return b"".join(parts), f"multipart/form-data; boundary={boundary}"


def main() -> int:
    if not SECRET:
        raise RuntimeError("AGENT_INTERNAL_SECRET is required")
    body, content_type = multipart()
    indexed = request("/rag/index", method="POST", body=body, content_type=content_type)
    search_body = json.dumps({"query": "Vue TypeScript 前端性能优化", "limit": 3, "category": "smoke"}).encode()
    searched = request("/rag/search", method="POST", body=search_body, content_type="application/json")
    metrics = request("/metrics")
    request(f"/rag/documents/{DOCUMENT_ID}", method="DELETE")

    results = searched.get("results") or []
    passed = bool(results and results[0].get("sourceId") == f"{DOCUMENT_ID}:0")
    print(json.dumps({
        "passed": passed,
        "indexedChunks": indexed.get("chunk_count"),
        "topSource": results[0].get("sourceId") if results else None,
        "topScore": results[0].get("score") if results else None,
        "metrics": metrics.get("rag", {}),
        "cleanup": True,
    }, ensure_ascii=False, indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
