from __future__ import annotations

import argparse
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.rag import delete_document, index_document


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

    if args.command == "delete":
        delete_document(args.document_id, ignore_missing=True)
        print(f"DELETED|{args.document_id}")
        return 0

    path: Path = args.path
    if not path.is_file():
        parser.error("fixture path does not exist")
    result = index_document(
        document_id=args.document_id,
        name="ResumeSystem Resume Writing Standard v1",
        category="resume-standard",
        file_name="resume-writing-standard-v1.md",
        content_type="text/markdown",
        data=path.read_bytes(),
        source_type="standard",
        scope="global",
        licensed=True,
        pii_reviewed=True,
        enabled=True,
    )
    print(
        "OK|"
        f"{result['document_id']}|"
        f"{result['chunk_count']}|"
        f"{result['embedding_backend']}|"
        f"{result['embedding_model']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
