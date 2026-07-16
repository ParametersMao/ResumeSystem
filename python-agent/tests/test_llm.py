import json
import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.llm import LlmError, call_structured_llm
from app.schemas import AgentRequest


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, _type, _value, _traceback):
        return False

    def read(self):
        return json.dumps(self.payload).encode()


class StructuredLlmResponseTest(unittest.TestCase):
    def setUp(self) -> None:
        self.environment = patch.dict(
            os.environ,
            {
                "OPENAI_API_URL": "https://llm.example",
                "OPENAI_API_KEY": "test-key",
                "OPENAI_MODEL": "test-model",
            },
        )
        self.environment.start()
        self.request = AgentRequest.model_validate({"context": {"content": "resume"}})

    def tearDown(self) -> None:
        self.environment.stop()

    def call_with(self, payload):
        with patch(
            "app.llm.urllib.request.urlopen",
            return_value=FakeResponse(payload),
        ):
            return call_structured_llm(self.request)

    def test_rejects_non_object_or_malformed_choices(self) -> None:
        for payload in ([], {"choices": [None]}, {"choices": [{"message": None}]}):
            with self.subTest(payload=payload):
                with self.assertRaises(LlmError):
                    self.call_with(payload)

    def test_rejects_non_numeric_or_negative_token_usage(self) -> None:
        for token_value in ("not-a-number", -1, True):
            with self.subTest(token_value=token_value):
                with self.assertRaises(LlmError):
                    self.call_with(
                        {
                            "choices": [{"message": {"content": '{"diagnostics": []}'}}],
                            "usage": {"total_tokens": token_value},
                        }
                    )

    def test_accepts_valid_structured_response(self) -> None:
        result, token_used = self.call_with(
            {
                "choices": [
                    {"message": {"content": '{"diagnostics": ["ok"]}'}}
                ],
                "usage": {"total_tokens": "12"},
            }
        )

        self.assertEqual(result, {"diagnostics": ["ok"]})
        self.assertEqual(token_used, 12)


if __name__ == "__main__":
    unittest.main()
