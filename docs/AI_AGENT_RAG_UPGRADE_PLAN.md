# AI Agent 与 RAG 升级计划

## 背景

当前系统已经具备简历编辑器、模板中心、多版本管理、Puppeteer PDF 导出、R2/OSS 存储、AI 润色/生成、后台配置、权益与操作日志等产品底座。现有 AI 模块以单次 OpenAI-compatible 调用为主，适合轻量润色，但还不足以支撑“深度诊断、岗位定向优化、整份简历重构、旧简历导入解析”等更复杂能力。

调研 `goflames/langchain-resume-agent` 后，确认它的工程成熟度较轻，但提供了有价值的 Agent Loop 思路：Perception -> Analysis -> Planning -> Execution -> Action。后续升级不建议直接把该项目作为生产依赖，而是吸收其 LangGraph 编排思想，并以 Python Agent 微服务形式接入 ResumeSystem。

## 总体架构

```text
Vue 3 前端
  -> NestJS 后端
     - 登录鉴权
     - AI 权益检查
     - 操作审计
     - 模板与简历数据
     - Puppeteer PDF
     - R2/OSS 存储
       -> Python FastAPI Agent 服务
          - LangGraph Agent Loop
          - 可选 RAG 检索节点
          - DeepSeek / OpenAI-compatible LLM
```

## 设计原则

- NestJS 继续作为产品主控层，不把用户、权益、日志、模板、PDF 逻辑迁移到 Python 服务。
- Python Agent 只负责复杂 AI 编排和模型推理，不直接写业务数据库。
- Agent 输出优先采用结构化 JSON patch 或建议列表，不生成不可控的整篇 Markdown。
- PDF 继续使用现有 Puppeteer 管道，不采用 xhtml2pdf/reportlab。
- RAG 作为可插拔节点接入，不在第一阶段强行引入。
- 模型厂商、Base URL、API Key、模型名称和提示词模板必须保留后台可配置能力，避免后续换模型服务时改代码。

## 阶段 0：现有 AI 模块稳定性收口

目标：先保证当前 AI 功能干净、可用、可观测。

任务：
- 修复 `ai-runtime.service.ts` 中的乱码提示词、错误提示和 mock 输出。
- 保持现有 `/api/ai/polish`、`/api/ai/generate` 响应结构不变。
- 确认后台 AI 配置预览、连接测试、操作日志仍可正常使用。
- 统一 AI 错误文案，避免乱码进入数据库和后台日志。
- 后台 AI 配置支持 Mock、DeepSeek、通义千问、智谱 GLM、Moonshot、豆包、OpenAI、OpenAI-compatible、LangGraph Agent、自定义 Provider。

验收：
- 后端构建通过。
- mock 模式下润色/生成返回正常中文。
- live 模式 prompt 指令为清晰中文。
- AI 操作日志不再新增乱码内容。

## 阶段 1：Agent 微服务骨架

目标：新增独立 Python Agent 服务，但暂不替换现有 AI 主流程。

建议目录：

```text
python-agent/
  app/
    main.py
    schemas.py
    graph.py
    nodes/
      perception.py
      analysis.py
      planning.py
      execution.py
      validation.py
    clients/
      llm.py
  requirements.txt
  Dockerfile
```

接口：
- `GET /health`
- `POST /agent/diagnose`
- `POST /agent/polish`
- `POST /agent/generate`

Agent 节点：
- `perceptionNode`：读取简历模块、岗位、模板变体、用户要求。
- `analysisNode`：诊断内容问题和匹配度。
- `planningNode`：制定润色或生成策略。
- `executionNode`：生成结构化建议或 JSON patch。
- `validationNode`：校验事实风险、输出格式、长度和模块适配度。

验收：
- Agent 服务可独立启动。
- mock LLM 模式可返回完整工作流结果。
- Docker compose 可选择性启动 Agent 服务。
- NestJS 可通过 `AiAgentClientService` 调用 Agent 服务。
- `/api/ai/diagnose` 可返回 steps、diagnostics、suggestions、patch、tokenUsed。
- 当后台 provider 选择 `langgraph-agent` 时，`/api/ai/polish` 和 `/api/ai/generate` 可切换到 Agent 流程，并在日志中记录为 `agent-polish`、`agent-generate`。

## 阶段 2：NestJS 接入 Agent Provider

目标：在主系统中新增可配置的 Agent Provider。

任务：
- 后台 AI 配置新增 provider 类型：`mock`、`openai-compatible`、`langgraph-agent`。
- NestJS 新增 `AiAgentClientService`，通过 HTTP 调用 Python Agent。
- 新增接口 `POST /api/ai/diagnose`。
- `/api/ai/polish` 和 `/api/ai/generate` 根据 provider 决定走现有 runtime 或 Agent runtime。
- 调用前继续走用户鉴权和权益检查，调用后继续写入 `ai_operations`。

验收：
- 不配置 Agent 时，现有 AI 功能不受影响。
- 配置 Agent 后，诊断接口能返回分步骤结果。
- Agent 失败时返回可理解错误，不污染现有数据。
- 后台 AI 操作监控能筛选和展示 `diagnose`、`agent-polish`、`agent-generate`。

## 阶段 3：前端 AI 交互增强

目标：把 Agent 能力产品化，而不是只做接口。

任务：
- 编辑器新增“AI 深度诊断”入口。
- 支持展示 Agent 工作流轨迹、诊断结论和优化建议。
- 支持岗位定向优化：输入目标岗位/JD 后生成策略。
- 现有“一键润色”保留为轻量能力，Agent 作为重型能力区分展示。

验收：
- 用户能明确区分“轻量润色”和“深度诊断”。
- 诊断结果可追踪，并进入后台 AI 操作日志。
- 操作日志中能区分 `polish`、`generate`、`diagnose`、`agent-polish`、`agent-generate`。

## 当前已落地状态

- 已新增 Python FastAPI Agent 微服务骨架，支持 `GET /health`、`POST /agent/diagnose`、`POST /agent/polish`、`POST /agent/generate`。
- Agent 服务已使用 LangGraph `StateGraph` 编排五步工作流；如果本地缺少依赖，会自动降级为等价的本地 loop，便于开发调试。
- 已在 Docker Compose 中加入可选 `agent` 服务，使用 `profiles: [agent]` 控制是否启动。
- 已在 NestJS 中加入 `AiAgentClientService`，可通过 HTTP 调用 Python Agent。
- 已新增 `POST /api/ai/diagnose`，并复用现有鉴权、权益、操作日志链路。
- 已支持后台选择 `langgraph-agent` provider；选择后轻量润色/生成可切换到 Agent 流程。
- NestJS 调用 Agent 时会透传后台配置的 provider、Base URL、API Key、model 和执行模式，后续接真实模型不需要改接口契约。
- 已扩展后台 AI 配置的模型厂商选项和连接测试逻辑。
- 已扩展后台 AI 操作监控，支持 `diagnose`、`agent-polish`、`agent-generate`。
- 已在 C 端编辑器加入“AI 深度诊断”入口和结果弹窗。
- 已将“执行引擎”和“底层模型厂商”拆分配置：可选择直接调用或 LangGraph Agent，
  同时独立配置 DeepSeek、通义千问、OpenAI-compatible 等模型服务。
- Agent `live` 模式已支持真实调用 OpenAI-compatible `/chat/completions`，
  并把模型结果映射到诊断、规划、执行和校验步骤。
- 已完成 DeepSeek 真实冒烟测试：`diagnose`、`polish`、`generate` 与
  NestJS -> Agent HTTP 调用链路均成功。
- 阶段 4 RAG 与阶段 5 旧简历导入仍属于后续阶段，尚未在当前版本实现。

## 部署配置要点

Agent 服务默认可先以 mock 模式运行，等真实模型 Key 准备好后再切换。

核心环境变量：

```env
AI_PROVIDER=mock
AI_EXECUTION_ENGINE=direct
AGENT_SERVICE_URL=http://agent:8000
AGENT_EXECUTION_MODE=mock
AGENT_PORT=18000
OPENAI_API_URL=
OPENAI_API_KEY=
OPENAI_MODEL=
```

`AI_EXECUTION_ENGINE` 用于选择由 NestJS 直接调用模型，还是先进入 LangGraph Agent。
`AI_PROVIDER`、`OPENAI_API_URL`、`OPENAI_API_KEY` 和 `OPENAI_MODEL` 始终表示底层模型厂商。
两者已经解耦，启用 Agent 后仍可在中台切换 DeepSeek、通义千问或其他
OpenAI-compatible 服务。

如果后台 provider 选择 `langgraph-agent`，后台 AI 配置里的 Base URL 应指向 Agent 服务，例如 Docker 内部为 `http://agent:8000`，公网或服务器本机调试可用对应反向代理地址。

## 阶段 4：RAG 接入

目标：让 Agent 能从知识库中检索岗位、行业和优秀样例，而不是只依赖 prompt。

可选知识源：
- 岗位 JD 知识库。
- 行业关键词库。
- 优秀简历样例库。
- 公司/岗位能力模型。
- 用户历史版本与历史润色记录。
- 后台配置的风格规范和提示词模板。

推荐流程：

```text
perceptionNode
  -> retrievalNode
  -> analysisNode
  -> planningNode
  -> executionNode
  -> validationNode
```

验收：
- RAG 可开关。
- 检索结果能进入 Agent 上下文。
- 输出中能说明建议依据，但不暴露不必要的内部知识库原文。

### 当前落地状态

- 中台已新增“AI 知识库”页面，支持上传 PDF、DOCX、TXT、Markdown 原始文档。
- NestJS 已新增知识文档元数据、状态、分类、启停、删除、重建索引和检索测试接口。
- 原文件通过 R2/OSS/本地存储保存，下载与重建索引均通过管理员鉴权接口完成。
- Python Agent 已支持文档解析、自动切块和中文 `BAAI/bge-small-zh-v1.5` Embedding。
- Docker Compose 已加入 Qdrant 持久化向量库，Agent 默认随完整服务启动。
- LangGraph 已加入 `retrievalNode`，完整流程为
  `perception -> retrieval -> analysis -> planning -> execution -> validation`。
- Agent 输出已包含知识库来源，C 端深度诊断弹窗可展示检索依据。
- 已完成上传、检索、停用、启用、删除、真实中文向量检索与
  `deepseek-v4-pro` Agent RAG 冒烟测试。

## 阶段 5：旧简历导入解析

目标：支持用户上传 PDF/TXT/DOCX，自动解析成模块化简历。

任务：
- 新增上传解析入口。
- Python Agent 读取简历文本并抽取结构化字段。
- NestJS 校验结构并保存为标准 resume content。
- 用户进入编辑器后可继续人工调整。

验收：
- 上传旧简历后能生成可编辑的模块化内容。
- 解析失败时有清晰提示和手动兜底。
- 不影响现有在线编辑流程。

## 当前优先级

1. 阶段 0：修复现有 AI runtime 乱码与提示词质量。
2. 阶段 1：新增 Python Agent 服务骨架。
3. 阶段 2：NestJS 接入 Agent Provider 和 `/api/ai/diagnose`。
4. 阶段 3：前端展示深度诊断结果。
5. 阶段 4：接入 RAG。
6. 阶段 5：旧简历导入解析。

## 风险与注意事项

- 不要让 Python Agent 直接操作主数据库，避免权限和数据一致性失控。
- 不要用 Markdown 整篇覆盖当前简历，优先使用结构化 patch。
- 不要把 RAG 过早塞入所有请求，否则会增加成本和延迟。
- Agent 调用需要超时、重试、降级策略。
- 后续真实 API Key、R2 Key、数据库密码等都必须使用环境变量，不写入代码。
