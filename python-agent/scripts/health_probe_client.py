from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


def main() -> int:
    try:
        document_id = int(sys.argv[1])
        expected_chunk_count = int(sys.argv[2])
        timeout_seconds = int(sys.argv[3])
        payload = json.dumps(
            {
                "documentId": document_id,
                "expectedChunkCount": expected_chunk_count,
            }
        ).encode()
        request = urllib.request.Request(
            "http://127.0.0.1:8000/rag/health-probe",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "X-Agent-Secret": os.environ["AGENT_INTERNAL_SECRET"],
            },
        )
        response = json.load(urllib.request.urlopen(request, timeout=timeout_seconds))
        source_sha256 = str(response.get("sourceSha256", ""))
        dense_score = float(response.get("denseScore", -1))
        minimum_vector_cosine = float(response.get("minimumVectorCosine", -1))
        verified_chunks = int(response.get("verifiedChunkDigests", 0))
        dense_verified = response.get("denseVerified") is True
        if (
            response.get("ok")
            and dense_verified
            and len(source_sha256) == 64
            and all(character in "0123456789abcdef" for character in source_sha256)
            and verified_chunks == int(response.get("indexedChunks", 0))
            and dense_score >= 0.995
            and minimum_vector_cosine >= 0.995
        ):
            print(
                "OK|"
                f"{response.get('documentId')}|"
                f"{response.get('indexedChunks')}|"
                f"{source_sha256}|"
                f"{dense_score:.6f}|"
                f"{minimum_vector_cosine:.6f}|"
                f"{response.get('matchedSourceId')}"
            )
        else:
            reason = (
                "dense_attestation_failed"
                if response.get("ok")
                else response.get("reason", "unknown")
            )
            print("IN_PROGRESS" if reason == "probe_in_progress" else f"FAIL|{reason}")
    except urllib.error.HTTPError as error:
        print(f"HTTP|{error.code}")
    except urllib.error.URLError as error:
        print("TIMEOUT" if isinstance(error.reason, TimeoutError) else "URL_ERROR")
    except TimeoutError:
        print("TIMEOUT")
    except Exception as error:  # The class is useful; messages may contain internals.
        print(f"ERROR|{type(error).__name__}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
