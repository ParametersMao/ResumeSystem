from typing import Any, Literal

from pydantic import BaseModel, Field


class ResumeContext(BaseModel):
    resume_id: str | None = None
    user_id: int | None = None
    section_type: str | None = None
    job_title: str | None = None
    template_variant: str | None = None
    content: dict[str, Any] | str | None = None
    selected_text: str | None = None
    user_instruction: str | None = None


class AgentRequest(BaseModel):
    task_type: Literal["diagnose", "polish", "generate"] = "diagnose"
    context: ResumeContext
    options: dict[str, Any] = Field(default_factory=dict)


class AgentStep(BaseModel):
    name: str
    title: str
    summary: str
    output: dict[str, Any] = Field(default_factory=dict)


class AgentSuggestion(BaseModel):
    reason: str
    text: str
    html: str | None = None


class AgentResponse(BaseModel):
    task_type: str
    execution_mode: Literal["mock", "live"] = "mock"
    provider: str = "langgraph-agent"
    model: str = "mock-agent"
    steps: list[AgentStep]
    suggestions: list[AgentSuggestion] = Field(default_factory=list)
    diagnostics: list[str] = Field(default_factory=list)
    patch: dict[str, Any] = Field(default_factory=dict)
    sources: list[dict[str, Any]] = Field(default_factory=list)
    token_used: int = 0


class RagSearchRequest(BaseModel):
    query: str
    limit: int = Field(default=5, ge=1, le=20)
    category: str | None = None


class RagEnabledRequest(BaseModel):
    enabled: bool
