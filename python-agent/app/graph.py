from __future__ import annotations

import os
from typing import Any, TypedDict

from .llm import call_structured_llm
from .rag import search_documents
from .schemas import AgentRequest, AgentResponse, AgentStep, AgentSuggestion

try:
    from langgraph.graph import END, StateGraph
except Exception:  # pragma: no cover - local fallback when dependency is absent
    END = None
    StateGraph = None


class AgentState(TypedDict, total=False):
    request: AgentRequest
    steps: list[AgentStep]
    perception: AgentStep
    retrieval: AgentStep
    analysis: AgentStep
    planning: AgentStep
    execution: AgentStep
    validation: AgentStep
    live_result: dict[str, Any]
    live_token_used: int


def run_agent(request: AgentRequest) -> AgentResponse:
    if StateGraph is not None:
        return _run_langgraph_agent(request)
    return _run_local_agent(request)


def _run_local_agent(request: AgentRequest) -> AgentResponse:
    perception = perception_node(request)
    retrieval = retrieval_node(request, perception)
    sources = retrieval.output.get("sources", [])
    live_result, live_token_used = _load_live_result(request, sources)
    analysis = analysis_node(request, perception, live_result, live_token_used)
    planning = planning_node(request, analysis, live_result)
    execution = execution_node(request, planning, live_result)
    validation = validation_node(request, execution, live_result)
    return _build_response(request, [perception, retrieval, analysis, planning, execution, validation])


def _run_langgraph_agent(request: AgentRequest) -> AgentResponse:
    workflow = StateGraph(AgentState)
    workflow.add_node("perception_node", _perception_graph_node)
    workflow.add_node("retrieval_node", _retrieval_graph_node)
    workflow.add_node("analysis_node", _analysis_graph_node)
    workflow.add_node("planning_node", _planning_graph_node)
    workflow.add_node("execution_node", _execution_graph_node)
    workflow.add_node("validation_node", _validation_graph_node)
    workflow.set_entry_point("perception_node")
    workflow.add_edge("perception_node", "retrieval_node")
    workflow.add_edge("retrieval_node", "analysis_node")
    workflow.add_edge("analysis_node", "planning_node")
    workflow.add_edge("planning_node", "execution_node")
    workflow.add_edge("execution_node", "validation_node")
    workflow.add_edge("validation_node", END)
    state = workflow.compile().invoke({"request": request, "steps": []})
    return _build_response(request, state.get("steps", []))


def _perception_graph_node(state: AgentState) -> AgentState:
    step = perception_node(state["request"])
    return {"perception": step, "steps": state.get("steps", []) + [step]}


def _analysis_graph_node(state: AgentState) -> AgentState:
    live_result, token_used = _load_live_result(
        state["request"],
        state.get("retrieval", AgentStep(name="", title="", summary="", output={})).output.get("sources", []),
    )
    step = analysis_node(state["request"], state["perception"], live_result, token_used)
    return {
        "analysis": step,
        "live_result": live_result,
        "live_token_used": token_used,
        "steps": state.get("steps", []) + [step],
    }


def _retrieval_graph_node(state: AgentState) -> AgentState:
    step = retrieval_node(state["request"], state["perception"])
    return {"retrieval": step, "steps": state.get("steps", []) + [step]}


def _planning_graph_node(state: AgentState) -> AgentState:
    step = planning_node(state["request"], state["analysis"], state.get("live_result", {}))
    return {"planning": step, "steps": state.get("steps", []) + [step]}


def _execution_graph_node(state: AgentState) -> AgentState:
    step = execution_node(state["request"], state["planning"], state.get("live_result", {}))
    return {"execution": step, "steps": state.get("steps", []) + [step]}


def _validation_graph_node(state: AgentState) -> AgentState:
    step = validation_node(state["request"], state["execution"], state.get("live_result", {}))
    return {"validation": step, "steps": state.get("steps", []) + [step]}


def perception_node(request: AgentRequest) -> AgentStep:
    context = request.context
    source_text = context.selected_text or _content_to_text(context.content)
    return AgentStep(
        name="perception",
        title="上下文感知",
        summary="已读取简历内容、目标岗位、模块类型和模板版式。",
        output={
            "section_type": context.section_type or "general",
            "job_title": context.job_title or "目标岗位",
            "template_variant": context.template_variant or "classic",
            "text_length": len(source_text),
        },
    )


def retrieval_node(request: AgentRequest, perception: AgentStep) -> AgentStep:
    if str(os.getenv("RAG_ENABLED", "true")).lower() not in {"1", "true", "yes"}:
        return AgentStep(
            name="retrieval",
            title="知识检索",
            summary="RAG 当前已关闭，本次未检索知识库。",
            output={"sources": [], "enabled": False},
        )

    query = " ".join(
        part
        for part in [
            str(perception.output.get("job_title") or ""),
            request.context.section_type or "",
            request.context.selected_text or _content_to_text(request.context.content),
            request.context.user_instruction or "",
        ]
        if part
    )[:3000]
    try:
        sources = search_documents(query, limit=5)
        return AgentStep(
            name="retrieval",
            title="知识检索",
            summary=f"已从知识库检索到 {len(sources)} 条相关依据。",
            output={"sources": sources, "enabled": True},
        )
    except Exception as error:
        return AgentStep(
            name="retrieval",
            title="知识检索",
            summary="知识库暂不可用，本次继续使用基础 Agent 流程。",
            output={"sources": [], "enabled": True, "warning": str(error)[:300]},
        )


def analysis_node(
    request: AgentRequest,
    perception: AgentStep,
    live_result: dict[str, Any],
    live_token_used: int,
) -> AgentStep:
    diagnostics = _string_list(live_result.get("diagnostics"))
    if not diagnostics:
        diagnostics = [
            f"{perception.output['section_type']} 模块需要更贴合 {perception.output['job_title']} 的岗位关键词。",
            "建议强化行动、结果和可验证贡献，减少泛泛而谈的描述。",
        ]
    return AgentStep(
        name="analysis",
        title="问题诊断",
        summary="已完成内容质量和岗位匹配度诊断。",
        output={"diagnostics": diagnostics, "token_used": live_token_used},
    )


def planning_node(
    request: AgentRequest,
    analysis: AgentStep,
    live_result: dict[str, Any],
) -> AgentStep:
    strategy = _string_list(live_result.get("strategy"))
    if not strategy:
        strategy = [
            "保留用户已填写的事实信息，不编造公司、时间、学历和证书。",
            "优先使用结果导向表达，必要时拆分为要点式描述。",
            "输出结构化建议，由主系统决定是否应用到简历。",
        ]
    return AgentStep(
        name="planning",
        title="策略规划",
        summary="已生成可执行的优化策略。",
        output={"strategy": strategy},
    )


def execution_node(
    request: AgentRequest,
    planning: AgentStep,
    live_result: dict[str, Any],
) -> AgentStep:
    suggestions = _normalize_suggestions(live_result.get("suggestions"))
    patch = live_result.get("patch") if isinstance(live_result.get("patch"), dict) else {}

    if request.task_type == "diagnose":
        suggestions = []
        patch = {}

    if _resolve_execution_mode(request) == "mock" and request.task_type != "diagnose":
        text = request.context.selected_text or _content_to_text(request.context.content) or "请补充具体经历内容"
        job_title = request.context.job_title or "目标岗位"
        polished = f"面向{job_title}岗位，{text}。通过更清晰的行动和结果表达，突出与岗位相关的核心贡献。"
        suggestions = [
            AgentSuggestion(
                reason="强化岗位匹配和结果导向",
                text=polished,
                html=f"<p>{polished}</p>",
            )
        ]
        patch = {
            "sectionType": request.context.section_type or "general",
            "suggestedText": polished,
        }

    return AgentStep(
        name="execution",
        title="执行生成",
        summary="已生成结构化建议，等待主系统审核或应用。",
        output={
            "suggestions": [item.model_dump() for item in suggestions],
            "patch": patch,
        },
    )


def validation_node(
    request: AgentRequest,
    execution: AgentStep,
    live_result: dict[str, Any],
) -> AgentStep:
    warnings = _string_list(live_result.get("warnings"))
    if request.task_type != "diagnose" and not execution.output.get("suggestions"):
        warnings.append("当前任务未生成可应用建议。")
    return AgentStep(
        name="validation",
        title="结果校验",
        summary="已校验输出结构和基本事实风险。",
        output={"warnings": warnings, "safe_to_apply": not warnings},
    )


def _load_live_result(
    request: AgentRequest,
    knowledge_context: list[dict[str, Any]] | None = None,
) -> tuple[dict[str, Any], int]:
    if _resolve_execution_mode(request) != "live":
        return {}, 0
    return call_structured_llm(request, knowledge_context)


def _build_response(request: AgentRequest, steps: list[AgentStep]) -> AgentResponse:
    analysis = next((step for step in steps if step.name == "analysis"), None)
    execution = next((step for step in steps if step.name == "execution"), None)
    retrieval = next((step for step in steps if step.name == "retrieval"), None)
    return AgentResponse(
        task_type=request.task_type,
        steps=steps,
        suggestions=(execution.output.get("suggestions", []) if execution else []),
        diagnostics=(analysis.output.get("diagnostics", []) if analysis else []),
        patch=(execution.output.get("patch", {}) if execution else {}),
        sources=(retrieval.output.get("sources", []) if retrieval else []),
        token_used=sum(int(step.output.get("token_used", 0)) for step in steps),
        execution_mode=_resolve_execution_mode(request),
        provider=_resolve_provider(request),
        model=_resolve_model(request),
    )


def _normalize_suggestions(value: Any) -> list[AgentSuggestion]:
    if not isinstance(value, list):
        return []
    result: list[AgentSuggestion] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        reason = str(item.get("reason") or "").strip()
        text = str(item.get("text") or "").strip()
        if reason and text:
            result.append(
                AgentSuggestion(
                    reason=reason,
                    text=text,
                    html=str(item.get("html") or f"<p>{text}</p>").strip(),
                )
            )
    return result


def _string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]


def _content_to_text(content: dict | str | None) -> str:
    if not content:
        return ""
    if isinstance(content, str):
        return content.strip()
    return " ".join(str(value) for value in content.values() if value).strip()


def _resolve_execution_mode(request: AgentRequest) -> str:
    configured = str(
        request.options.get("execution_mode")
        or os.getenv("AGENT_EXECUTION_MODE")
        or "mock"
    ).strip()
    return "live" if configured == "live" else "mock"


def _resolve_provider(request: AgentRequest) -> str:
    return _resolve_option(request, "provider", "AI_PROVIDER", "mock")


def _resolve_model(request: AgentRequest) -> str:
    return _resolve_option(request, "model", "OPENAI_MODEL", "mock-agent")


def _resolve_option(request: AgentRequest, option_key: str, env_key: str, fallback: str) -> str:
    value: Any = request.options.get(option_key) or os.getenv(env_key) or fallback
    return str(value).strip() or fallback
