from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


RagSourceType = Literal[
    "standard",
    "role-framework",
    "resume-exemplar",
    "job-description",
]
RagScope = Literal["global", "private"]


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
    model_config = ConfigDict(populate_by_name=True)

    query: str
    limit: int = Field(default=5, ge=1, le=20)
    category: str | None = None
    source_types: list[RagSourceType] | None = Field(
        default=None,
        min_length=1,
        max_length=4,
        alias="sourceTypes",
    )
    scope: RagScope | None = None
    owner_user_id: int | None = Field(default=None, ge=1, alias="ownerUserId")
    resume_id: str | None = Field(default=None, min_length=1, max_length=128, alias="resumeId")

    @model_validator(mode="after")
    def validate_private_filter(self) -> "RagSearchRequest":
        if (self.scope == "private" or self.resume_id) and not self.owner_user_id:
            raise ValueError("Private RAG searches require ownerUserId")
        return self


class RagIndexMetadata(BaseModel):
    """Validated metadata copied to every chunk in a document index."""

    model_config = ConfigDict(populate_by_name=True)

    source_type: RagSourceType = Field(default="standard", alias="sourceType")
    scope: RagScope = "global"
    owner_user_id: int | None = Field(default=None, ge=1, alias="ownerUserId")
    resume_id: str | None = Field(default=None, min_length=1, max_length=128, alias="resumeId")
    licensed: bool = False
    pii_reviewed: bool = Field(default=False, alias="piiReviewed")
    expires_at: datetime | None = Field(default=None, alias="expiresAt")

    @model_validator(mode="after")
    def validate_knowledge_boundary(self) -> "RagIndexMetadata":
        if self.scope == "private" and not self.owner_user_id:
            raise ValueError("Private knowledge requires ownerUserId")
        if self.scope == "global" and (
            self.owner_user_id or self.resume_id or self.expires_at
        ):
            raise ValueError(
                "Global knowledge cannot carry ownerUserId, resumeId or expiresAt"
            )
        if self.source_type == "job-description":
            if self.scope != "private" or not self.owner_user_id or not self.resume_id:
                raise ValueError(
                    "Job descriptions require private scope, ownerUserId and resumeId"
                )
        if self.source_type == "resume-exemplar" and not (
            self.licensed and self.pii_reviewed
        ):
            raise ValueError(
                "Resume exemplars require licensed=true and piiReviewed=true"
            )
        return self


class RagEnabledRequest(BaseModel):
    enabled: bool


class RagHealthProbeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    document_id: int = Field(ge=1, alias="documentId")
    expected_chunk_count: int = Field(ge=1, alias="expectedChunkCount")
