from __future__ import annotations

import hashlib
import io
import math
import os
import re
import uuid
from dataclasses import dataclass
from typing import Any

from docx import Document
from fastembed import TextEmbedding
from pypdf import PdfReader
from qdrant_client import QdrantClient, models


COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "resume_knowledge")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-zh-v1.5")
EMBEDDING_BACKEND = os.getenv("EMBEDDING_BACKEND", "fastembed").lower()
HASH_VECTOR_SIZE = 384
MIN_SEARCH_SCORE = float(os.getenv("RAG_MIN_SCORE", "0.35"))


@dataclass
class ParsedChunk:
    index: int
    text: str


_embedding_model: TextEmbedding | None = None
_qdrant_client: QdrantClient | None = None


def index_document(
    *,
    document_id: int,
    name: str,
    category: str,
    file_name: str,
    content_type: str,
    data: bytes,
) -> dict[str, Any]:
    text = extract_text(file_name, content_type, data)
    chunks = split_text(text)
    if not chunks:
        raise ValueError("文档中没有可索引的有效文本。")

    vectors = embed_texts([chunk.text for chunk in chunks])
    client = get_qdrant_client()
    ensure_collection(client, len(vectors[0]))
    delete_document(document_id, client=client, ignore_missing=True)

    points = [
        models.PointStruct(
            id=_point_id(document_id, chunk.index),
            vector=vector,
            payload={
                "document_id": document_id,
                "document_name": name,
                "category": category,
                "file_name": file_name,
                "chunk_index": chunk.index,
                "text": chunk.text,
                "enabled": True,
            },
        )
        for chunk, vector in zip(chunks, vectors)
    ]
    client.upsert(collection_name=COLLECTION_NAME, points=points, wait=True)
    return {
        "document_id": document_id,
        "chunk_count": len(chunks),
        "embedding_backend": EMBEDDING_BACKEND,
        "embedding_model": EMBEDDING_MODEL if EMBEDDING_BACKEND == "fastembed" else "hash-384",
    }


def search_documents(query: str, limit: int = 5, category: str | None = None) -> list[dict[str, Any]]:
    query = str(query or "").strip()
    if not query:
        return []
    client = get_qdrant_client()
    if not client.collection_exists(COLLECTION_NAME):
        return []

    must = [
        models.FieldCondition(key="enabled", match=models.MatchValue(value=True)),
    ]
    if category:
        must.append(models.FieldCondition(key="category", match=models.MatchValue(value=category)))

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=embed_texts([query])[0],
        query_filter=models.Filter(must=must),
        limit=max(1, min(limit, 20)),
        with_payload=True,
    ).points
    return [
        {
            "documentId": int(item.payload.get("document_id", 0)),
            "documentName": str(item.payload.get("document_name", "")),
            "category": str(item.payload.get("category", "")),
            "chunkIndex": int(item.payload.get("chunk_index", 0)),
            "text": str(item.payload.get("text", "")),
            "score": round(float(item.score or 0), 6),
        }
        for item in results
        if float(item.score or 0) >= MIN_SEARCH_SCORE
    ]


def delete_document(
    document_id: int,
    *,
    client: QdrantClient | None = None,
    ignore_missing: bool = False,
) -> None:
    client = client or get_qdrant_client()
    if not client.collection_exists(COLLECTION_NAME):
        if ignore_missing:
            return
        return
    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="document_id",
                        match=models.MatchValue(value=document_id),
                    )
                ]
            )
        ),
        wait=True,
    )


def set_document_enabled(document_id: int, enabled: bool) -> None:
    client = get_qdrant_client()
    if not client.collection_exists(COLLECTION_NAME):
        return
    client.set_payload(
        collection_name=COLLECTION_NAME,
        payload={"enabled": enabled},
        points=models.Filter(
            must=[
                models.FieldCondition(
                    key="document_id",
                    match=models.MatchValue(value=document_id),
                )
            ]
        ),
        wait=True,
    )


def extract_text(file_name: str, content_type: str, data: bytes) -> str:
    suffix = os.path.splitext(file_name.lower())[1]
    if suffix == ".pdf" or content_type == "application/pdf":
        reader = PdfReader(io.BytesIO(data))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if suffix == ".docx":
        document = Document(io.BytesIO(data))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    if suffix in {".txt", ".md", ".markdown"} or content_type.startswith("text/"):
        return data.decode("utf-8-sig", errors="replace")
    raise ValueError("仅支持 PDF、DOCX、TXT、Markdown 文件。")


def split_text(text: str, chunk_size: int = 700, overlap: int = 100) -> list[ParsedChunk]:
    normalized = re.sub(r"\r\n?", "\n", text)
    normalized = re.sub(r"[ \t]+", " ", normalized)
    paragraphs = [part.strip() for part in re.split(r"\n{2,}", normalized) if part.strip()]
    chunks: list[str] = []
    buffer = ""

    for paragraph in paragraphs:
        if len(buffer) + len(paragraph) + 1 <= chunk_size:
            buffer = f"{buffer}\n{paragraph}".strip()
            continue
        if buffer:
            chunks.append(buffer)
        if len(paragraph) <= chunk_size:
            buffer = paragraph
            continue
        start = 0
        while start < len(paragraph):
            end = min(start + chunk_size, len(paragraph))
            chunks.append(paragraph[start:end].strip())
            if end >= len(paragraph):
                break
            start = max(end - overlap, start + 1)
        buffer = ""

    if buffer:
        chunks.append(buffer)
    return [ParsedChunk(index=index, text=value) for index, value in enumerate(chunks) if value]


def embed_texts(texts: list[str]) -> list[list[float]]:
    if EMBEDDING_BACKEND == "hash":
        return [_hash_embedding(text) for text in texts]
    model = get_embedding_model()
    return [vector.tolist() for vector in model.embed(texts)]


def get_embedding_model() -> TextEmbedding:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = TextEmbedding(model_name=EMBEDDING_MODEL)
    return _embedding_model


def get_qdrant_client() -> QdrantClient:
    global _qdrant_client
    if _qdrant_client is not None:
        return _qdrant_client
    url = os.getenv("QDRANT_URL", "http://qdrant:6333")
    if url == ":memory:":
        _qdrant_client = QdrantClient(location=":memory:")
    else:
        _qdrant_client = QdrantClient(
            url=url,
            api_key=os.getenv("QDRANT_API_KEY") or None,
            timeout=30,
        )
    return _qdrant_client


def ensure_collection(client: QdrantClient, vector_size: int) -> None:
    if client.collection_exists(COLLECTION_NAME):
        return
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(size=vector_size, distance=models.Distance.COSINE),
    )
    client.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="document_id",
        field_schema=models.PayloadSchemaType.INTEGER,
    )
    client.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="category",
        field_schema=models.PayloadSchemaType.KEYWORD,
    )
    client.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="enabled",
        field_schema=models.PayloadSchemaType.BOOL,
    )


def _point_id(document_id: int, chunk_index: int) -> str:
    digest = hashlib.sha256(f"{document_id}:{chunk_index}".encode()).hexdigest()[:32]
    return str(uuid.UUID(digest))


def _hash_embedding(text: str) -> list[float]:
    vector = [0.0] * HASH_VECTOR_SIZE
    tokens = re.findall(r"[\w\u4e00-\u9fff]+", text.lower())
    for token in tokens:
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "big") % HASH_VECTOR_SIZE
        vector[index] += -1.0 if digest[4] & 1 else 1.0
    norm = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [value / norm for value in vector]
