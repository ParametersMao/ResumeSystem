from __future__ import annotations

import hashlib
import io
import math
import os
import re
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from docx import Document
from fastembed import TextEmbedding
from pypdf import PdfReader
from qdrant_client import QdrantClient, models

from .schemas import RagIndexMetadata, RagScope, RagSourceType


COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "resume_knowledge")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-zh-v1.5")
EMBEDDING_BACKEND = os.getenv("EMBEDDING_BACKEND", "fastembed").lower()
HASH_VECTOR_SIZE = 384
MIN_SEARCH_SCORE = float(os.getenv("RAG_MIN_SCORE", "0.35"))
RETRIEVAL_CANDIDATE_LIMIT = max(20, int(os.getenv("RAG_CANDIDATE_LIMIT", "120")))
DENSE_WEIGHT = float(os.getenv("RAG_DENSE_WEIGHT", "0.68"))
LEXICAL_WEIGHT = float(os.getenv("RAG_LEXICAL_WEIGHT", "0.27"))
COVERAGE_WEIGHT = max(0.0, 1.0 - DENSE_WEIGHT - LEXICAL_WEIGHT)


@dataclass
class ParsedChunk:
    index: int
    text: str


_embedding_model: TextEmbedding | None = None
_qdrant_client: QdrantClient | None = None
_metrics: dict[str, float | int | str] = {
    "indexed_documents": 0,
    "indexed_chunks": 0,
    "searches": 0,
    "search_hits": 0,
    "failures": 0,
    "last_search_ms": 0.0,
    "last_error": "",
}


def index_document(
    *,
    document_id: int,
    name: str,
    category: str,
    file_name: str,
    content_type: str,
    data: bytes,
    source_type: RagSourceType = "standard",
    scope: RagScope = "global",
    owner_user_id: int | None = None,
    resume_id: str | None = None,
    licensed: bool = False,
    pii_reviewed: bool = False,
    expires_at: datetime | str | None = None,
    enabled: bool | None = None,
) -> dict[str, Any]:
    metadata = RagIndexMetadata.model_validate(
        {
            "source_type": source_type,
            "scope": scope,
            "owner_user_id": owner_user_id,
            "resume_id": resume_id,
            "licensed": licensed,
            "pii_reviewed": pii_reviewed,
            "expires_at": expires_at,
        }
    )
    text = extract_text(file_name, content_type, data)
    chunks = split_text(text)
    if not chunks:
        raise ValueError("文档中没有可索引的有效文本。")

    vectors = embed_texts([chunk.text for chunk in chunks])
    client = get_qdrant_client()
    ensure_collection(client, len(vectors[0]))

    # Embedding and point construction happen before touching the active index. During
    # a rebuild, old points are snapshotted and restored on any Qdrant mutation error.
    # Stable point ids also mean an interrupted upsert never starts by deleting the
    # only searchable copy of a document.
    previous_points = _snapshot_document_points(client, document_id)
    expires_at_datetime = metadata.expires_at
    if expires_at_datetime and expires_at_datetime.tzinfo is None:
        expires_at_datetime = expires_at_datetime.replace(tzinfo=timezone.utc)
    expires_at_value = (
        expires_at_datetime.astimezone(timezone.utc).isoformat()
        if expires_at_datetime
        else None
    )

    # Reindexing must not silently reactivate a document that an administrator
    # disabled. Older callers do not send the enabled flag, so preserve the
    # fail-closed state already stored in Qdrant. New documents remain enabled by
    # default, while an explicit value always wins.
    effective_enabled = _resolve_document_enabled(previous_points, enabled)
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
                "enabled": effective_enabled,
                "source_type": metadata.source_type,
                "scope": metadata.scope,
                "owner_user_id": metadata.owner_user_id,
                "resume_id": metadata.resume_id,
                "licensed": metadata.licensed,
                "pii_reviewed": metadata.pii_reviewed,
                "expires_at": expires_at_value,
            },
        )
        for chunk, vector in zip(chunks, vectors)
    ]
    try:
        client.upsert(collection_name=COLLECTION_NAME, points=points, wait=True)
        current_ids = {str(point.id) for point in points}
        stale_ids = [point.id for point in previous_points if str(point.id) not in current_ids]
        if stale_ids:
            client.delete(
                collection_name=COLLECTION_NAME,
                points_selector=models.PointIdsList(points=stale_ids),
                wait=True,
            )
        _metrics["indexed_documents"] = int(_metrics["indexed_documents"]) + 1
        _metrics["indexed_chunks"] = int(_metrics["indexed_chunks"]) + len(chunks)
    except Exception as error:
        rollback_error = _restore_document_points(
            client=client,
            document_id=document_id,
            previous_points=previous_points,
            attempted_points=points,
        )
        _record_failure(error)
        if rollback_error:
            raise RuntimeError(
                f"索引更新失败，且旧索引回滚失败：{rollback_error}"
            ) from error
        raise
    return {
        "document_id": document_id,
        "chunk_count": len(chunks),
        "embedding_backend": EMBEDDING_BACKEND,
        "embedding_model": EMBEDDING_MODEL if EMBEDDING_BACKEND == "fastembed" else "hash-384",
        "source_type": metadata.source_type,
        "scope": metadata.scope,
        "owner_user_id": metadata.owner_user_id,
        "resume_id": metadata.resume_id,
        "licensed": metadata.licensed,
        "pii_reviewed": metadata.pii_reviewed,
        "expires_at": expires_at_value,
        "enabled": effective_enabled,
    }


def search_documents(
    query: str,
    limit: int = 5,
    category: str | None = None,
    *,
    source_types: list[RagSourceType] | None = None,
    scope: RagScope | None = None,
    owner_user_id: int | None = None,
    resume_id: str | None = None,
) -> list[dict[str, Any]]:
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
    if source_types:
        must.append(
            models.FieldCondition(
                key="source_type",
                match=models.MatchAny(any=list(dict.fromkeys(source_types))),
            )
        )
    must.append(
        _build_access_filter(
            scope=scope,
            owner_user_id=owner_user_id,
            resume_id=resume_id,
        )
    )

    started = time.perf_counter()
    _metrics["searches"] = int(_metrics["searches"]) + 1
    try:
        dense_results = client.query_points(
            collection_name=COLLECTION_NAME,
            query=embed_texts([query])[0],
            query_filter=models.Filter(must=must),
            limit=min(RETRIEVAL_CANDIDATE_LIMIT, max(limit * 8, 20)),
            with_payload=True,
        ).points
        lexical_results, _ = client.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter=models.Filter(must=must),
            limit=RETRIEVAL_CANDIDATE_LIMIT,
            with_payload=True,
            with_vectors=False,
        )
    except Exception as error:
        _record_failure(error)
        raise
    finally:
        _metrics["last_search_ms"] = round((time.perf_counter() - started) * 1000, 2)

    candidates: dict[str, dict[str, Any]] = {}
    for item in lexical_results:
        candidates[str(item.id)] = {"point": item, "dense_score": 0.0}
    for item in dense_results:
        candidates.setdefault(str(item.id), {"point": item, "dense_score": 0.0})
        candidates[str(item.id)]["dense_score"] = max(0.0, float(item.score or 0))

    candidate_values = list(candidates.values())
    texts = [str(value["point"].payload.get("text", "")) for value in candidate_values]
    lexical_scores = _bm25_scores(query, texts)
    query_tokens = set(_lexical_tokens(query))
    ranked: list[dict[str, Any]] = []
    for value, lexical_score, text in zip(candidate_values, lexical_scores, texts):
        item = value["point"]
        dense_score = float(value["dense_score"])
        text_tokens = set(_lexical_tokens(text))
        coverage = len(query_tokens & text_tokens) / max(1, min(len(query_tokens), 12))
        score = DENSE_WEIGHT * dense_score + LEXICAL_WEIGHT * lexical_score + COVERAGE_WEIGHT * coverage
        if score < MIN_SEARCH_SCORE:
            continue
        ranked.append({
            "sourceId": f"{int(item.payload.get('document_id', 0))}:{int(item.payload.get('chunk_index', 0))}",
            "documentId": int(item.payload.get("document_id", 0)),
            "documentName": str(item.payload.get("document_name", "")),
            "category": str(item.payload.get("category", "")),
            "sourceType": str(item.payload.get("source_type", "standard")),
            "scope": str(item.payload.get("scope", "global")),
            "ownerUserId": item.payload.get("owner_user_id"),
            "resumeId": item.payload.get("resume_id"),
            "licensed": bool(item.payload.get("licensed", False)),
            "piiReviewed": bool(item.payload.get("pii_reviewed", False)),
            "expiresAt": item.payload.get("expires_at"),
            "factType": _fact_source_type(str(item.payload.get("source_type", "standard"))),
            "chunkIndex": int(item.payload.get("chunk_index", 0)),
            "text": text,
            "excerpt": text[:800],
            "score": round(score, 6),
            "denseScore": round(dense_score, 6),
            "lexicalScore": round(lexical_score, 6),
            "retrievalMethod": "hybrid-dense-bm25",
        })
    matched = sorted(ranked, key=lambda value: value["score"], reverse=True)[:max(1, min(limit, 20))]
    _metrics["search_hits"] = int(_metrics["search_hits"]) + len(matched)
    return matched


def get_rag_status() -> dict[str, Any]:
    status: dict[str, Any] = {
        "enabled": str(os.getenv("RAG_ENABLED", "true")).lower() in {"1", "true", "yes"},
        "embedding_backend": EMBEDDING_BACKEND,
        "embedding_model": EMBEDDING_MODEL if EMBEDDING_BACKEND == "fastembed" else "hash-384-char-ngram",
        "collection": COLLECTION_NAME,
        "qdrant_reachable": False,
        "collection_ready": False,
    }
    try:
        client = get_qdrant_client()
        # Constructing QdrantClient performs no I/O. Only report the dependency as
        # reachable after a real request succeeds; otherwise a network failure
        # would leave qdrant_reachable stuck at a misleading true value.
        collection_ready = bool(client.collection_exists(COLLECTION_NAME))
        status["qdrant_reachable"] = True
        status["collection_ready"] = collection_ready
    except Exception as error:
        status["error"] = str(error)[:200]
    return status


def get_rag_metrics() -> dict[str, float | int | str]:
    result = dict(_metrics)
    result["retrieval_method"] = "hybrid-dense-bm25"
    result["strict_sources"] = str(os.getenv("RAG_STRICT_SOURCES", "false")).lower()
    result["collection_points"] = 0
    try:
        client = get_qdrant_client()
        if client.collection_exists(COLLECTION_NAME):
            result["collection_points"] = int(client.get_collection(COLLECTION_NAME).points_count or 0)
    except Exception as error:
        result["metrics_warning"] = str(error)[:120]
    return result


def _build_access_filter(
    *,
    scope: RagScope | None,
    owner_user_id: int | None,
    resume_id: str | None,
) -> models.Filter:
    """Build the tenant boundary that is sent to both Qdrant retrieval calls.

    A caller without an owner identity can only see global points. Supplying an
    owner permits global points plus that owner's private points; a resume id narrows
    the private branch without hiding global standards. Private-only searches fail
    closed if the owner identity is missing.
    """

    if scope == "global":
        if resume_id:
            raise ValueError("resume_id cannot be used with global scope")
        return models.Filter(
            must=[
                models.FieldCondition(
                    key="scope", match=models.MatchValue(value="global")
                )
            ]
        )

    if (scope == "private" or resume_id) and not owner_user_id:
        raise ValueError("Private RAG searches require owner_user_id")

    if scope == "private":
        return _private_scope_filter(owner_user_id, resume_id)

    if not owner_user_id:
        return models.Filter(
            must=[
                models.FieldCondition(
                    key="scope", match=models.MatchValue(value="global")
                )
            ]
        )

    return models.Filter(
        should=[
            models.FieldCondition(
                key="scope", match=models.MatchValue(value="global")
            ),
            _private_scope_filter(owner_user_id, resume_id),
        ]
    )


def _private_scope_filter(
    owner_user_id: int | None,
    resume_id: str | None,
) -> models.Filter:
    private_must: list[Any] = [
        models.FieldCondition(key="scope", match=models.MatchValue(value="private")),
        models.FieldCondition(
            key="owner_user_id", match=models.MatchValue(value=owner_user_id)
        ),
        # Missing expiration is valid; otherwise the timestamp must still be in
        # the future. This lifecycle condition is evaluated by Qdrant, not after
        # private points have left the vector store.
        models.Filter(
            should=[
                models.IsEmptyCondition(
                    is_empty=models.PayloadField(key="expires_at")
                ),
                models.IsNullCondition(
                    is_null=models.PayloadField(key="expires_at")
                ),
                models.FieldCondition(
                    key="expires_at",
                    range=models.DatetimeRange(gt=datetime.now(timezone.utc)),
                ),
            ]
        ),
    ]
    if resume_id:
        private_must.append(
            models.FieldCondition(
                key="resume_id", match=models.MatchValue(value=resume_id)
            )
        )
    return models.Filter(must=private_must)


def _fact_source_type(source_type: str) -> str:
    if source_type == "resume-exemplar":
        return "example"
    if source_type == "job-description":
        return "job_context"
    return "standard"


def _snapshot_document_points(
    client: QdrantClient,
    document_id: int,
) -> list[models.PointStruct]:
    if not client.collection_exists(COLLECTION_NAME):
        return []
    records: list[models.PointStruct] = []
    offset: Any = None
    while True:
        batch, next_offset = client.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter=_document_filter(document_id),
            limit=256,
            offset=offset,
            with_payload=True,
            with_vectors=True,
        )
        records.extend(
            models.PointStruct(
                id=record.id,
                vector=record.vector,
                payload=dict(record.payload or {}),
            )
            for record in batch
        )
        if next_offset is None:
            break
        offset = next_offset
    return records


def _restore_document_points(
    *,
    client: QdrantClient,
    document_id: int,
    previous_points: list[models.PointStruct],
    attempted_points: list[models.PointStruct],
) -> str | None:
    """Best-effort rollback used only after a failed document replacement."""

    try:
        if previous_points:
            client.upsert(
                collection_name=COLLECTION_NAME,
                points=previous_points,
                wait=True,
            )
        previous_ids = {str(point.id) for point in previous_points}
        added_ids = [
            point.id for point in attempted_points if str(point.id) not in previous_ids
        ]
        if added_ids:
            client.delete(
                collection_name=COLLECTION_NAME,
                points_selector=models.PointIdsList(points=added_ids),
                wait=True,
            )
        # If this was a first index rather than a rebuild, an implementation may
        # have partially written stable ids before raising. The attempted id list
        # above contains all such ids and removes them.
        return None
    except Exception as rollback_error:  # pragma: no cover - requires Qdrant outage
        return str(rollback_error)[:300]


def _document_filter(document_id: int) -> models.Filter:
    return models.Filter(
        must=[
            models.FieldCondition(
                key="document_id",
                match=models.MatchValue(value=document_id),
            )
        ]
    )


def _resolve_document_enabled(
    previous_points: list[models.PointStruct],
    requested_enabled: bool | None,
) -> bool:
    if requested_enabled is not None:
        return bool(requested_enabled)
    if not previous_points:
        return True
    # A mixed payload is inconsistent. Requiring every prior point to be enabled
    # prevents a partial administrative disable from being undone by reindexing.
    return all(bool((point.payload or {}).get("enabled", True)) for point in previous_points)


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
            filter=_document_filter(document_id)
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
        _embedding_model = TextEmbedding(
            model_name=EMBEDDING_MODEL,
            cache_dir=os.getenv("FASTEMBED_CACHE_PATH") or None,
        )
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
        collection = client.get_collection(COLLECTION_NAME)
        vectors = collection.config.params.vectors
        existing_size = getattr(vectors, "size", None)
        if existing_size and int(existing_size) != vector_size:
            raise ValueError(
                f"向量集合 {COLLECTION_NAME} 的维度为 {existing_size}，当前模型需要 {vector_size}。"
                "请切换新的集合名称并重新索引知识库。"
            )
    else:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=vector_size, distance=models.Distance.COSINE),
        )
    # Calling create_payload_index is idempotent in Qdrant. Keeping all routing
    # fields indexed ensures tenant and source filters execute in the vector store.
    payload_indexes = {
        "document_id": models.PayloadSchemaType.INTEGER,
        "category": models.PayloadSchemaType.KEYWORD,
        "enabled": models.PayloadSchemaType.BOOL,
        "source_type": models.PayloadSchemaType.KEYWORD,
        "scope": models.PayloadSchemaType.KEYWORD,
        "owner_user_id": models.PayloadSchemaType.INTEGER,
        "resume_id": models.PayloadSchemaType.KEYWORD,
        "licensed": models.PayloadSchemaType.BOOL,
        "pii_reviewed": models.PayloadSchemaType.BOOL,
        "expires_at": models.PayloadSchemaType.DATETIME,
    }
    for field_name, field_schema in payload_indexes.items():
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name=field_name,
            field_schema=field_schema,
        )


def _point_id(document_id: int, chunk_index: int) -> str:
    digest = hashlib.sha256(f"{document_id}:{chunk_index}".encode()).hexdigest()[:32]
    return str(uuid.UUID(digest))


def _hash_embedding(text: str) -> list[float]:
    vector = [0.0] * HASH_VECTOR_SIZE
    tokens = _hash_tokens(text)
    for token in tokens:
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "big") % HASH_VECTOR_SIZE
        vector[index] += -1.0 if digest[4] & 1 else 1.0
    norm = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [value / norm for value in vector]


def _hash_tokens(text: str) -> list[str]:
    normalized = text.lower()
    tokens = re.findall(r"[a-z0-9][a-z0-9_+.#-]*", normalized)
    for sequence in re.findall(r"[\u4e00-\u9fff]+", normalized):
        tokens.extend(sequence[index : index + 2] for index in range(max(0, len(sequence) - 1)))
        tokens.extend(sequence[index : index + 3] for index in range(max(0, len(sequence) - 2)))
    return tokens


def _lexical_tokens(text: str) -> list[str]:
    normalized = str(text or "").lower()
    tokens = re.findall(r"[a-z0-9][a-z0-9_+.#-]*", normalized)
    for sequence in re.findall(r"[\u4e00-\u9fff]+", normalized):
        if len(sequence) == 1:
            tokens.append(sequence)
            continue
        tokens.extend(sequence[index : index + 2] for index in range(len(sequence) - 1))
    return tokens


def _bm25_scores(query: str, documents: list[str]) -> list[float]:
    if not documents:
        return []
    query_tokens = _lexical_tokens(query)
    document_tokens = [_lexical_tokens(document) for document in documents]
    if not query_tokens or not any(document_tokens):
        return [0.0] * len(documents)
    average_length = sum(len(tokens) for tokens in document_tokens) / max(1, len(document_tokens))
    document_frequency = {
        token: sum(1 for tokens in document_tokens if token in set(tokens))
        for token in set(query_tokens)
    }
    raw_scores: list[float] = []
    k1, b = 1.5, 0.75
    for tokens in document_tokens:
        frequencies = {token: tokens.count(token) for token in set(query_tokens)}
        score = 0.0
        for token in set(query_tokens):
            frequency = frequencies.get(token, 0)
            if not frequency:
                continue
            df = document_frequency.get(token, 0)
            inverse_frequency = math.log(1 + (len(documents) - df + 0.5) / (df + 0.5))
            denominator = frequency + k1 * (1 - b + b * len(tokens) / max(1.0, average_length))
            score += inverse_frequency * frequency * (k1 + 1) / denominator
        raw_scores.append(score)
    maximum = max(raw_scores, default=0.0)
    return [score / maximum if maximum > 0 else 0.0 for score in raw_scores]


def _record_failure(error: Exception) -> None:
    _metrics["failures"] = int(_metrics["failures"]) + 1
    _metrics["last_error"] = str(error)[:200]
