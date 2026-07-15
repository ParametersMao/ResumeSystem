"""Version-tolerant exact-document RAG recovery probe.

Executed through ``docker exec -i resume-agent python -`` so it works against an
older Agent image that has /rag/search but does not contain the v1.3.4 probe
endpoint or client script.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


def request_json(url: str, payload: dict, headers: dict[str, str] | None = None) -> dict:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", **(headers or {})},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def main() -> int:
    document_id = int(sys.argv[1])
    expected_chunks = int(sys.argv[2])
    expected_source_sha256 = sys.argv[3] if len(sys.argv) > 3 else ""

    try:
        attestation = request_json(
            "http://127.0.0.1:8000/rag/health-probe",
            {
                "documentId": document_id,
                "expectedChunkCount": expected_chunks,
            },
            {"X-Agent-Secret": os.environ["AGENT_INTERNAL_SECRET"]},
        )
    except urllib.error.HTTPError as error:
        if error.code not in {404, 405} or expected_source_sha256:
            raise
        attestation = None

    if attestation is not None:
        source_sha256 = str(attestation.get("sourceSha256", ""))
        if not (
            attestation.get("ok") is True
            and attestation.get("denseVerified") is True
            and int(attestation.get("documentId", 0)) == document_id
            and int(attestation.get("indexedChunks", 0)) == expected_chunks
            and int(attestation.get("verifiedChunkDigests", 0)) == expected_chunks
            and float(attestation.get("denseScore", -1)) >= 0.995
            and float(attestation.get("minimumVectorCosine", -1)) >= 0.995
            and len(source_sha256) == 64
            and (not expected_source_sha256 or source_sha256 == expected_source_sha256)
        ):
            raise RuntimeError("dense_attestation_failed")
        print(
            f"OK|{document_id}|{expected_chunks}|{source_sha256}|"
            f"{float(attestation['denseScore']):.6f}|"
            f"{float(attestation['minimumVectorCosine']):.6f}|"
            f"{attestation.get('matchedSourceId', '')}"
        )
        return 0

    qdrant_url = os.getenv("QDRANT_URL", "http://qdrant:6333").rstrip("/")
    collection = os.environ["QDRANT_COLLECTION"]
    qdrant_headers: dict[str, str] = {}
    if os.getenv("QDRANT_API_KEY"):
        qdrant_headers["api-key"] = os.environ["QDRANT_API_KEY"]

    points: list[dict] = []
    offset = None
    while True:
        payload = {
            "filter": {
                "must": [
                    {"key": "document_id", "match": {"value": document_id}},
                    {"key": "enabled", "match": {"value": True}},
                    {"key": "scope", "match": {"value": "global"}},
                ]
            },
            "limit": 256,
            "with_payload": True,
            "with_vector": False,
        }
        if offset is not None:
            payload["offset"] = offset
        scroll = request_json(
            f"{qdrant_url}/collections/{collection}/points/scroll",
            payload,
            qdrant_headers,
        )
        result = scroll.get("result") or {}
        points.extend(result.get("points") or [])
        offset = result.get("next_page_offset")
        if offset is None:
            break
        if len(points) > 10000:
            raise RuntimeError("probe_document_too_large")
    if len(points) != expected_chunks:
        raise RuntimeError(f"chunk_count_mismatch:{len(points)}")
    probe_text = str((points[0].get("payload") or {}).get("text") or "").strip()
    if not probe_text:
        raise RuntimeError("probe_text_missing")

    search = request_json(
        "http://127.0.0.1:8000/rag/search",
        {"query": probe_text, "limit": 20, "scope": "global"},
        {"X-Agent-Secret": os.environ["AGENT_INTERNAL_SECRET"]},
    )
    match = next(
        (
            item
            for item in search.get("results") or []
            if item.get("documentId") == document_id and item.get("scope") == "global"
        ),
        None,
    )
    if match is None:
        raise RuntimeError("retrieval_did_not_return_document")
    print(f"OK|{document_id}|{expected_chunks}|{match.get('sourceId', '')}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:  # recovery probe must emit one bounded diagnostic
        print(f"ERROR|{type(error).__name__}|{str(error)[:200]}")
        raise SystemExit(1)
