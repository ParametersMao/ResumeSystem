import hmac
import os

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile

from .graph import run_agent
from .rag import (
    delete_document,
    get_rag_metrics,
    get_rag_status,
    index_document,
    search_documents,
    set_document_enabled,
)
from .schemas import AgentRequest, AgentResponse, RagEnabledRequest, RagSearchRequest


app = FastAPI(title="Resume Agent Service", version="1.0.0")
MAX_RAG_FILE_BYTES = 10 * 1024 * 1024


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
    return {
        "status": "ok" if rag.get("qdrant_reachable") else "degraded",
        "service": "resume-agent",
        "version": "1.0.0",
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
    except RuntimeError as error:
        message = str(error)[:500]
        if "严格来源模式" in message:
            raise HTTPException(status_code=424, detail=message) from error
        raise


@app.post("/rag/index", dependencies=[Depends(require_internal_secret)])
async def rag_index(
    document_id: int = Form(...),
    name: str = Form(...),
    category: str = Form("general"),
    file: UploadFile = File(...),
) -> dict:
    data = await file.read(MAX_RAG_FILE_BYTES + 1)
    if len(data) > MAX_RAG_FILE_BYTES:
        raise HTTPException(status_code=413, detail="Knowledge document must not exceed 10MB")
    return index_document(
        document_id=document_id,
        name=name,
        category=category,
        file_name=file.filename or "document.txt",
        content_type=file.content_type or "application/octet-stream",
        data=data,
    )


@app.post("/rag/search", dependencies=[Depends(require_internal_secret)])
def rag_search(request: RagSearchRequest) -> dict:
    return {"results": search_documents(request.query, request.limit, request.category)}


@app.delete(
    "/rag/documents/{document_id}",
    dependencies=[Depends(require_internal_secret)],
)
def rag_delete(document_id: int) -> dict:
    delete_document(document_id)
    return {"success": True}


@app.put(
    "/rag/documents/{document_id}/enabled",
    dependencies=[Depends(require_internal_secret)],
)
def rag_enabled(document_id: int, request: RagEnabledRequest) -> dict:
    set_document_enabled(document_id, request.enabled)
    return {"success": True, "enabled": request.enabled}
