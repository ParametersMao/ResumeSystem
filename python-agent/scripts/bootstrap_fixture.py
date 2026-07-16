from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import secrets
import socket
import sys
from typing import Any
import urllib.error
import urllib.request


AGENT_BASE_URL = "http://127.0.0.1:8000"
MAX_FIXTURE_BYTES = 10 * 1024 * 1024
MAX_RESPONSE_BYTES = 64 * 1024
# The release flow calls an already-healthy, warm Agent. Give indexing one
# minute of margin over the 120-second health budget without allowing a stuck
# local request to consume the deployment window indefinitely.
DEFAULT_TIMEOUT_SECONDS = 180
MIN_TIMEOUT_SECONDS = 30
MAX_TIMEOUT_SECONDS = 300


class FixtureClientError(RuntimeError):
    """A bounded, secret-safe failure suitable for release logs."""

    def __init__(self, code: str) -> None:
        super().__init__(code)
        self.code = code


class _NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(
        self,
        req: urllib.request.Request,
        fp: Any,
        code: int,
        msg: str,
        headers: Any,
        newurl: str,
    ) -> None:
        # Never forward the internal credential, even if the local service is
        # accidentally configured to redirect to another origin.
        return None


# Loopback traffic must never inherit host proxy settings. Apart from avoiding
# needless deployment failures, this prevents AGENT_INTERNAL_SECRET from being
# sent to a configured HTTP proxy.
_HTTP_OPENER = urllib.request.build_opener(
    urllib.request.ProxyHandler({}),
    _NoRedirectHandler(),
)


def _timeout_seconds() -> int:
    raw = os.getenv(
        "RAG_BOOTSTRAP_HTTP_TIMEOUT_SECONDS",
        str(DEFAULT_TIMEOUT_SECONDS),
    )
    try:
        timeout = int(raw)
    except (TypeError, ValueError) as error:
        raise FixtureClientError("invalid_timeout_configuration") from error
    if not MIN_TIMEOUT_SECONDS <= timeout <= MAX_TIMEOUT_SECONDS:
        raise FixtureClientError("invalid_timeout_configuration")
    return timeout


def _agent_secret() -> str:
    secret = os.getenv("AGENT_INTERNAL_SECRET", "")
    if not secret:
        raise FixtureClientError("agent_secret_not_configured")
    if secret != secret.strip() or any(
        not 33 <= ord(character) <= 126 for character in secret
    ):
        raise FixtureClientError("invalid_agent_secret")
    return secret


def _unique_json_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise FixtureClientError("duplicate_json_key")
        result[key] = value
    return result


def _reject_json_constant(_value: str) -> None:
    raise FixtureClientError("invalid_json_response")


def _read_json_response(response: Any) -> dict[str, Any]:
    status = response.getcode()
    if type(status) is not int or status != 200:
        raise FixtureClientError("unexpected_http_status")

    content_type = response.headers.get("Content-Type", "")
    if content_type.split(";", 1)[0].strip().lower() != "application/json":
        raise FixtureClientError("invalid_response_content_type")

    raw = response.read(MAX_RESPONSE_BYTES + 1)
    if len(raw) > MAX_RESPONSE_BYTES:
        raise FixtureClientError("response_too_large")
    try:
        decoded = raw.decode("utf-8")
        payload = json.loads(
            decoded,
            object_pairs_hook=_unique_json_object,
            parse_constant=_reject_json_constant,
        )
    except FixtureClientError:
        raise
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise FixtureClientError("invalid_json_response") from error
    if type(payload) is not dict:
        raise FixtureClientError("invalid_json_response")
    return payload


def _open_json_request(request: urllib.request.Request) -> dict[str, Any]:
    try:
        with _HTTP_OPENER.open(request, timeout=_timeout_seconds()) as response:
            return _read_json_response(response)
    except urllib.error.HTTPError as error:
        # Do not read or print the response body: application errors can contain
        # document text or infrastructure details. The status is enough to
        # diagnose the class of release failure.
        error.close()
        raise FixtureClientError(f"agent_http_{int(error.code)}") from None
    except (TimeoutError, socket.timeout):
        raise FixtureClientError("agent_request_timeout") from None
    except urllib.error.URLError:
        raise FixtureClientError("agent_unreachable") from None
    except OSError:
        raise FixtureClientError("agent_transport_error") from None


def _multipart_body(
    document_id: int,
    fixture_bytes: bytes,
) -> tuple[bytes, str]:
    boundary = f"ResumeSystemFixture-{secrets.token_hex(24)}"
    body = bytearray()

    def add_field(name: str, value: str) -> None:
        body.extend(f"--{boundary}\r\n".encode("ascii"))
        body.extend(
            f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(
                "ascii"
            )
        )
        body.extend(value.encode("utf-8"))
        body.extend(b"\r\n")

    for name, value in (
        ("document_id", str(document_id)),
        ("name", "ResumeSystem Resume Writing Standard v1"),
        ("category", "resume-standard"),
        ("source_type", "standard"),
        ("scope", "global"),
        ("licensed", "true"),
        ("pii_reviewed", "true"),
        ("enabled", "true"),
    ):
        add_field(name, value)

    body.extend(f"--{boundary}\r\n".encode("ascii"))
    body.extend(
        b'Content-Disposition: form-data; name="file"; '
        b'filename="resume-writing-standard-v1.md"\r\n'
    )
    body.extend(b"Content-Type: text/markdown\r\n\r\n")
    body.extend(fixture_bytes)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode("ascii"))
    return bytes(body), boundary


def _require_exact(payload: dict[str, Any], key: str, expected: Any) -> None:
    value = payload.get(key)
    if type(value) is not type(expected) or value != expected:
        raise FixtureClientError(f"invalid_index_response_{key}")


def _validate_index_response(
    payload: dict[str, Any],
    document_id: int,
) -> tuple[int, str, str]:
    _require_exact(payload, "document_id", document_id)
    _require_exact(payload, "source_type", "standard")
    _require_exact(payload, "scope", "global")
    _require_exact(payload, "owner_user_id", None)
    _require_exact(payload, "resume_id", None)
    _require_exact(payload, "licensed", True)
    _require_exact(payload, "pii_reviewed", True)
    _require_exact(payload, "expires_at", None)
    _require_exact(payload, "enabled", True)

    chunk_count = payload.get("chunk_count")
    if type(chunk_count) is not int or chunk_count < 1:
        raise FixtureClientError("invalid_index_response_chunk_count")

    backend = payload.get("embedding_backend")
    if backend != "fastembed" or type(backend) is not str:
        raise FixtureClientError("invalid_index_response_embedding_backend")

    expected_model = os.getenv("EMBEDDING_MODEL", "").strip()
    model = payload.get("embedding_model")
    if not expected_model:
        raise FixtureClientError("embedding_model_not_configured")
    if type(model) is not str or model != expected_model:
        raise FixtureClientError("invalid_index_response_embedding_model")
    if len(model) > 256 or any(character in model for character in "|\r\n"):
        raise FixtureClientError("invalid_index_response_embedding_model")
    return chunk_count, backend, model


def index_fixture(document_id: int, path: Path) -> tuple[int, str, str]:
    try:
        file_size = path.stat().st_size
        if not 1 <= file_size <= MAX_FIXTURE_BYTES:
            raise FixtureClientError("invalid_fixture_size")
        fixture_bytes = path.read_bytes()
    except FixtureClientError:
        raise
    except OSError:
        raise FixtureClientError("fixture_read_failed") from None
    # Detect a size change or truncated read without exposing the path in a
    # failure message.
    if len(fixture_bytes) != file_size:
        raise FixtureClientError("fixture_changed_during_read")

    body, boundary = _multipart_body(document_id, fixture_bytes)
    request = urllib.request.Request(
        f"{AGENT_BASE_URL}/rag/index",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Content-Length": str(len(body)),
            "X-Agent-Secret": _agent_secret(),
            "Connection": "close",
        },
        method="POST",
    )
    payload = _open_json_request(request)
    return _validate_index_response(payload, document_id)


def delete_fixture(document_id: int) -> None:
    request = urllib.request.Request(
        f"{AGENT_BASE_URL}/rag/documents/{document_id}",
        headers={
            "Accept": "application/json",
            "X-Agent-Secret": _agent_secret(),
            "Connection": "close",
        },
        method="DELETE",
    )
    payload = _open_json_request(request)
    if payload.get("success") is not True:
        raise FixtureClientError("invalid_delete_response")


def main() -> int:
    parser = argparse.ArgumentParser(description="Manage the release RAG fixture")
    subparsers = parser.add_subparsers(dest="command", required=True)

    index_parser = subparsers.add_parser("index")
    index_parser.add_argument("document_id", type=int)
    index_parser.add_argument("path", type=Path)

    delete_parser = subparsers.add_parser("delete")
    delete_parser.add_argument("document_id", type=int)

    args = parser.parse_args()
    if args.document_id < 1:
        parser.error("document_id must be positive")

    try:
        if args.command == "delete":
            delete_fixture(args.document_id)
            print(f"DELETED|{args.document_id}")
            return 0

        path: Path = args.path
        if not path.is_file():
            parser.error("fixture path does not exist")
        chunk_count, backend, model = index_fixture(args.document_id, path)
        print(f"OK|{args.document_id}|{chunk_count}|{backend}|{model}")
        return 0
    except FixtureClientError as error:
        print(f"ERROR|{error.code}", file=sys.stderr)
        return 1
    except Exception:
        # Keep unexpected failures bounded and secret-safe too. A traceback from
        # urllib can include a Request object carrying the internal header.
        print("ERROR|unexpected_client_failure", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
