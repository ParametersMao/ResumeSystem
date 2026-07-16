from __future__ import annotations

from contextlib import redirect_stderr, redirect_stdout
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.error


SCRIPT_PATH = (
    Path(__file__).resolve().parents[1] / "scripts" / "bootstrap_fixture.py"
)
SPEC = importlib.util.spec_from_file_location("bootstrap_fixture_client", SCRIPT_PATH)
assert SPEC is not None and SPEC.loader is not None
bootstrap_fixture = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(bootstrap_fixture)


class FakeResponse:
    def __init__(
        self,
        payload: bytes,
        *,
        status: int = 200,
        content_type: str = "application/json",
    ) -> None:
        self.payload = payload
        self.status = status
        self.headers = {"Content-Type": content_type}

    def __enter__(self) -> "FakeResponse":
        return self

    def __exit__(self, *_args: object) -> None:
        return None

    def getcode(self) -> int:
        return self.status

    def read(self, size: int = -1) -> bytes:
        return self.payload if size < 0 else self.payload[:size]


def index_response(document_id: int = 42) -> dict[str, object]:
    return {
        "document_id": document_id,
        "chunk_count": 7,
        "embedding_backend": "fastembed",
        "embedding_model": "BAAI/bge-small-zh-v1.5",
        "source_type": "standard",
        "scope": "global",
        "owner_user_id": None,
        "resume_id": None,
        "licensed": True,
        "pii_reviewed": True,
        "expires_at": None,
        "enabled": True,
    }


class BootstrapFixtureClientTest(unittest.TestCase):
    def setUp(self) -> None:
        self.environment = patch.dict(
            os.environ,
            {
                "AGENT_INTERNAL_SECRET": "test-internal-secret",
                "EMBEDDING_MODEL": "BAAI/bge-small-zh-v1.5",
                "RAG_BOOTSTRAP_HTTP_TIMEOUT_SECONDS": "60",
            },
            clear=False,
        )
        self.environment.start()
        self.addCleanup(self.environment.stop)

    def test_module_does_not_import_agent_rag_runtime(self) -> None:
        source = SCRIPT_PATH.read_text(encoding="utf-8")
        self.assertNotIn("app.rag", source)
        self.assertNotIn("fastembed", source.lower().split("def _validate_index_response", 1)[0])
        self.assertNotIn("qdrant", source.lower())

    def test_index_posts_multipart_to_loopback_and_validates_result(self) -> None:
        fixture = b"# Resume standard\n\nUse measurable outcomes.\n"
        response = FakeResponse(json.dumps(index_response()).encode("utf-8"))
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "fixture.md"
            path.write_bytes(fixture)
            with patch.object(
                bootstrap_fixture._HTTP_OPENER,
                "open",
                return_value=response,
            ) as opened:
                result = bootstrap_fixture.index_fixture(42, path)

        self.assertEqual(result, (7, "fastembed", "BAAI/bge-small-zh-v1.5"))
        request = opened.call_args.args[0]
        self.assertEqual(request.full_url, "http://127.0.0.1:8000/rag/index")
        self.assertEqual(request.get_method(), "POST")
        self.assertEqual(request.get_header("X-agent-secret"), "test-internal-secret")
        self.assertEqual(opened.call_args.kwargs["timeout"], 60)
        self.assertIn(b'name="document_id"\r\n\r\n42\r\n', request.data)
        self.assertIn(b'name="licensed"\r\n\r\ntrue\r\n', request.data)
        self.assertIn(b'name="pii_reviewed"\r\n\r\ntrue\r\n', request.data)
        self.assertIn(
            b'filename="resume-writing-standard-v1.md"\r\n'
            b"Content-Type: text/markdown\r\n\r\n" + fixture,
            request.data,
        )
        self.assertEqual(int(request.get_header("Content-length")), len(request.data))

    def test_index_rejects_bool_disguised_as_integer(self) -> None:
        payload = index_response()
        payload["chunk_count"] = True
        with self.assertRaisesRegex(
            bootstrap_fixture.FixtureClientError,
            "invalid_index_response_chunk_count",
        ):
            bootstrap_fixture._validate_index_response(payload, 42)

    def test_index_rejects_metadata_or_model_mismatch(self) -> None:
        payload = index_response()
        payload["licensed"] = False
        with self.assertRaisesRegex(
            bootstrap_fixture.FixtureClientError,
            "invalid_index_response_licensed",
        ):
            bootstrap_fixture._validate_index_response(payload, 42)

        payload = index_response()
        payload["embedding_model"] = "unexpected/model"
        with self.assertRaisesRegex(
            bootstrap_fixture.FixtureClientError,
            "invalid_index_response_embedding_model",
        ):
            bootstrap_fixture._validate_index_response(payload, 42)

    def test_json_response_rejects_duplicate_keys_and_wrong_content_type(self) -> None:
        duplicate = FakeResponse(b'{"success":true,"success":false}')
        with self.assertRaisesRegex(
            bootstrap_fixture.FixtureClientError,
            "duplicate_json_key",
        ):
            bootstrap_fixture._read_json_response(duplicate)

        html = FakeResponse(b"{}", content_type="text/html")
        with self.assertRaisesRegex(
            bootstrap_fixture.FixtureClientError,
            "invalid_response_content_type",
        ):
            bootstrap_fixture._read_json_response(html)

    def test_json_response_rejects_body_larger_than_limit(self) -> None:
        oversized = FakeResponse(b" " * (bootstrap_fixture.MAX_RESPONSE_BYTES + 1))
        with self.assertRaisesRegex(
            bootstrap_fixture.FixtureClientError,
            "response_too_large",
        ):
            bootstrap_fixture._read_json_response(oversized)

    def test_json_response_requires_exact_http_200(self) -> None:
        for status in (201, 202, 204):
            with self.subTest(status=status), self.assertRaisesRegex(
                bootstrap_fixture.FixtureClientError,
                "unexpected_http_status",
            ):
                bootstrap_fixture._read_json_response(
                    FakeResponse(b"{}", status=status)
                )

    def test_delete_uses_authenticated_delete_and_requires_success_true(self) -> None:
        success = FakeResponse(b'{"success":true}')
        with patch.object(
            bootstrap_fixture._HTTP_OPENER,
            "open",
            return_value=success,
        ) as opened:
            bootstrap_fixture.delete_fixture(91)
        request = opened.call_args.args[0]
        self.assertEqual(
            request.full_url,
            "http://127.0.0.1:8000/rag/documents/91",
        )
        self.assertEqual(request.get_method(), "DELETE")
        self.assertEqual(request.get_header("X-agent-secret"), "test-internal-secret")

        failure = FakeResponse(b'{"success":1}')
        with patch.object(
            bootstrap_fixture._HTTP_OPENER,
            "open",
            return_value=failure,
        ), self.assertRaisesRegex(
            bootstrap_fixture.FixtureClientError,
            "invalid_delete_response",
        ):
            bootstrap_fixture.delete_fixture(91)

    def test_main_http_failure_never_prints_secret_or_response_body(self) -> None:
        leaked_body = b'test-internal-secret private document text'
        error = urllib.error.HTTPError(
            "http://127.0.0.1:8000/rag/documents/91",
            422,
            "Unprocessable Entity",
            {},
            io.BytesIO(leaked_body),
        )
        stdout = io.StringIO()
        stderr = io.StringIO()
        with patch.object(
            bootstrap_fixture._HTTP_OPENER,
            "open",
            side_effect=error,
        ), patch.object(
            bootstrap_fixture.sys,
            "argv",
            ["bootstrap_fixture.py", "delete", "91"],
        ), redirect_stdout(stdout), redirect_stderr(stderr):
            exit_code = bootstrap_fixture.main()

        self.assertEqual(exit_code, 1)
        self.assertEqual(stdout.getvalue(), "")
        self.assertEqual(stderr.getvalue(), "ERROR|agent_http_422\n")
        self.assertNotIn("test-internal-secret", stderr.getvalue())
        self.assertNotIn("private document text", stderr.getvalue())

    def test_missing_secret_and_invalid_timeout_fail_with_bounded_codes(self) -> None:
        with patch.dict(os.environ, {"AGENT_INTERNAL_SECRET": ""}):
            with self.assertRaisesRegex(
                bootstrap_fixture.FixtureClientError,
                "agent_secret_not_configured",
            ):
                bootstrap_fixture._agent_secret()

        with patch.dict(os.environ, {"AGENT_INTERNAL_SECRET": "secret\tvalue"}):
            with self.assertRaisesRegex(
                bootstrap_fixture.FixtureClientError,
                "invalid_agent_secret",
            ):
                bootstrap_fixture._agent_secret()

        with patch.dict(
            os.environ,
            {"RAG_BOOTSTRAP_HTTP_TIMEOUT_SECONDS": "9999"},
        ):
            with self.assertRaisesRegex(
                bootstrap_fixture.FixtureClientError,
                "invalid_timeout_configuration",
            ):
                bootstrap_fixture._timeout_seconds()

        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(bootstrap_fixture._timeout_seconds(), 180)

    def test_help_does_not_require_runtime_environment(self) -> None:
        stdout = io.StringIO()
        with patch.dict(os.environ, {}, clear=True), patch.object(
            bootstrap_fixture.sys,
            "argv",
            ["bootstrap_fixture.py", "--help"],
        ), redirect_stdout(stdout), self.assertRaises(SystemExit) as raised:
            bootstrap_fixture.main()

        self.assertEqual(raised.exception.code, 0)
        self.assertIn("Manage the release RAG fixture", stdout.getvalue())

    def test_loopback_opener_disables_environment_proxies(self) -> None:
        proxy_handlers = [
            handler
            for handler in bootstrap_fixture._HTTP_OPENER.handlers
            if isinstance(handler, urllib.request.ProxyHandler)
        ]
        # An empty ProxyHandler has no protocol methods and is therefore not
        # retained by build_opener; supplying it still suppresses the default
        # environment-backed ProxyHandler.
        self.assertEqual(proxy_handlers, [])


if __name__ == "__main__":
    unittest.main()
