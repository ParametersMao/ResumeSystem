import hmac
import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from .graph import RagSourceUnavailableError, run_agent
from .llm import LlmError
from .rag import (
    DocumentMutationConflict,
    delete_document,
    get_rag_metrics,
    get_rag_status,
    initialize_rag_runtime,
    index_document,
    is_rag_enabled,
    search_documents,
    set_document_enabled,
    verify_document_searchable,
)
from .schemas import (
    AgentRequest,
    AgentResponse,
    RagEnabledRequest,
    RagHealthProbeRequest,
    RagScope,
    RagSearchRequest,
    RagSourceType,
)


SERVICE_VERSION = "1.3.4"
MAX_RAG_FILE_BYTES = 10 * 1024 * 1024


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if is_rag_enabled():
        # Block startup, not request workers. Besides loading the actual ONNX
        # model, initialize the dimension-checked Qdrant collection so a fresh
        # installation can satisfy strict Docker health before any upload.
        initialize_rag_runtime()
    yield


app = FastAPI(
    title="Resume Agent Service",
    version=SERVICE_VERSION,
    lifespan=lifespan,
)


def require_internal_secret(
    x_agent_secret: str | None = Header(default=None),
) -> None:
    expected = os.getenv("AGENT_INTERNAL_SECRET", "").strip()
    if not expected:
        raise HTTPException(status_code=503, detail="Agent internal secret is not configured")
    if not x_agent_secret or not hmac.compare_digest(x_agent_secret, expected):
        raise HTTPException(status_code=401, detail="Invalid agent credentials")


@app.get("/health")
def health() -> dict:
    rag = get_rag_status()
    rag_ready = (
        rag.get("enabled") is True
        and rag.get("embedding_backend") == "fastembed"
        and rag.get("qdrant_reachable") is True
        and rag.get("collection_ready") is True
    )
    return {
        "status": "ok" if rag_ready else "degraded",
        "service": "resume-agent",
        "version": SERVICE_VERSION,
        "rag": rag,
    }


@app.get("/metrics", dependencies=[Depends(require_internal_secret)])
def metrics() -> dict:
    return {"service": "resume-agent", "rag": get_rag_metrics()}


@app.post(
    "/agent/diagnose",
    response_model=AgentResponse,
    dependencies=[Depends(require_internal_secret)],
)
def diagnose(request: AgentRequest) -> AgentResponse:
    return run_agent_safely(request.model_copy(update={"task_type": "diagnose"}))


@app.post(
    "/agent/polish",
    response_model=AgentResponse,
    dependencies=[Depends(require_internal_secret)],
)
def polish(request: AgentRequest) -> AgentResponse:
    return run_agent_safely(request.model_copy(update={"task_type": "polish"}))


@app.post(
    "/agent/generate",
    response_model=AgentResponse,
    dependencies=[Depends(require_internal_secret)],
)
def generate(request: AgentRequest) -> AgentResponse:
    return run_agent_safely(request.model_copy(update={"task_type": "generate"}))


def run_agent_safely(request: AgentRequest) -> AgentResponse:
    try:
        return run_agent(request)
    except RagSourceUnavailableError as error:
        raise HTTPException(status_code=424, detail=str(error)[:500]) from error
    except LlmError as error:
        raise HTTPException(status_code=502, detail=str(error)[:500]) from error


@app.post("/rag/index", dependencies=[Depends(require_internal_secret)])
async def rag_index(
    document_id: int = Form(...),
    name: str = Form(...),
    category: str = Form("general"),
    source_type: RagSourceType = Form("standard"),
    scope: RagScope = Form("global"),
    owner_user_id: int | None = Form(None),
    resume_id: str | None = Form(None),
    licensed: bool = Form(False),
    pii_reviewed: bool = Form(False),
    expires_at: str | None = Form(None),
    enabled: bool | None = Form(None),
    file: UploadFile = File(...),
) -> dict:
    data = await file.read(MAX_RAG_FILE_BYTES + 1)
    if len(data) > MAX_RAG_FILE_BYTES:
        raise HTTPException(status_code=413, detail="Knowledge document must not exceed 10MB")
    try:
        return await run_in_threadpool(
            index_document,
            document_id=document_id,
            name=name,
            category=category,
            file_name=file.filename or "document.txt",
            content_type=file.content_type or "application/octet-stream",
            data=data,
            source_type=source_type,
            scope=scope,
            owner_user_id=owner_user_id,
            resume_id=resume_id,
            licensed=licensed,
            pii_reviewed=pii_reviewed,
            expires_at=expires_at,
            enabled=enabled,
        )
    except DocumentMutationConflict as error:
        raise HTTPException(status_code=409, detail=str(error)[:500]) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)[:500]) from error


@app.post("/rag/search", dependencies=[Depends(require_internal_secret)])
def rag_search(request: RagSearchRequest) -> dict:
    return {
        "results": search_documents(
            request.query,
            request.limit,
            request.category,
            source_types=request.source_types,
            scope=request.scope,
            owner_user_id=request.owner_user_id,
            resume_id=request.resume_id,
        )
    }


@app.post("/rag/health-probe", dependencies=[Depends(require_internal_secret)])
def rag_health_probe(request: RagHealthProbeRequest) -> dict:
    return verify_document_searchable(
        request.document_id,
        request.expected_chunk_count,
    )


@app.delete(
    "/rag/documents/{document_id}",
    dependencies=[Depends(require_internal_secret)],
)
def rag_delete(document_id: int) -> dict:
    try:
        delete_document(document_id)
    except DocumentMutationConflict as error:
        raise HTTPException(status_code=409, detail=str(error)[:500]) from error
    return {"success": True}


@app.put(
    "/rag/documents/{document_id}/enabled",
    dependencies=[Depends(require_internal_secret)],
)
def rag_enabled(document_id: int, request: RagEnabledRequest) -> dict:
    try:
        set_document_enabled(document_id, request.enabled)
    except DocumentMutationConflict as error:
        raise HTTPException(status_code=409, detail=str(error)[:500]) from error
    return {"success": True, "enabled": request.enabled}
