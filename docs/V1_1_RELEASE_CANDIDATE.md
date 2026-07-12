# ResumeSystem V1.1 Release Candidate

日期：2026-07-12
状态：本地候选版，完成验收后方可部署服务器

## 本版范围

- 11 套独立简历模板及 A4 默认样例质量门禁。
- 一页可读性下限、自然分页、标题孤行控制、条目整体换页、PDF 页数断言。
- FastEmbed BGE 真实 Embedding、Qdrant、DeepSeek V4 Pro Agent。
- Dense + BM25 Hybrid Retrieval、融合重排、来源分数拆解。
- 生产严格来源模式：无有效知识来源时禁止 LLM 无依据生成。
- 知识库上传、索引、重建、启停、删除和检索测试。
- 生产预检、MySQL/Qdrant/上传文件备份与按版本标签回滚脚本。

## 发布门禁

发布前必须全部满足：

- [ ] `npm run build`：backend、web、admin 全部通过。
- [ ] Python RAG 单元和质量测试全部通过。
- [ ] 11/11 模板宽度、横向溢出、A4 默认高度门禁通过。
- [ ] 真实 RAG E2E 返回 `hybrid-dense-bm25`、live LLM、sources 与 tokenUsed。
- [ ] 多页 PDF 实际页数断言通过。
- [ ] 登录、保存、刷新恢复、导出产品流程通过。
- [ ] `.\deploy\release-preflight.ps1` 通过。
- [ ] `.\deploy\backup.ps1` 生成三份备份及 SHA-256。
- [ ] 工作区整理为单一 release commit，并创建语义化 tag。
- [ ] 测试 API key 已轮换，生产密钥仅存在服务器 `.env` 或秘密管理系统。

## 部署顺序

1. 冻结写入并执行 `deploy/backup.ps1`。
2. 执行生产预检，保存输出到发布记录。
3. 拉取明确的 release tag，不使用浮动分支 HEAD。
4. 执行 `docker compose --env-file .env -f docker-compose.prod.yml up -d --build`。
5. 等待 MySQL、Backend、Agent 健康；检查 Qdrant collection。
6. 上传标准知识文档并完成 Hybrid 检索验证。
7. 用测试用户完成登录、编辑、保存、AI 诊断和两页 PDF 导出。
8. 观察错误率、延迟和容器重启次数，再解除写入冻结。

## 回滚原则

- 应用回滚使用明确的上一个 release tag 和 `deploy/rollback.ps1`。
- 数据库或向量数据发生不兼容变化时，先停止写入，再使用同一时间戳的 MySQL、Qdrant 和 uploads 三件套恢复。
- 禁止在脏工作区运行自动回滚，禁止仅恢复数据库而不恢复对应知识文件和向量集合。

## 当前已知非阻断项

- 前端 Element Plus 主包仍较大，后续可继续拆包，但不影响功能正确性。
- Hybrid 重排目前是可解释的本地轻量算法，大知识库阶段可替换 Cross-Encoder。
- 单条内容如果自身高于一整页，Chromium 必须拆分；编辑器后续可增加超长条目提示。

## 2026-07-12 本地验收记录

- 11/11 模板独立布局，宽度 820，横向与默认 A4 垂直溢出均为 0；视觉抽查无重叠或断裂。
- Python RAG/质量测试 9/9 通过。
- Hybrid RAG E2E、DeepSeek live、严格来源阻断通过。
- 登录、编辑器打开、保存刷新恢复、单页 PDF 通过；运行错误 0。
- 多页自然分页 PDF 返回 2 页，页数断言通过。
- Backend、Web、Admin 构建通过；生产 Compose 配置校验通过。
- 发布预检按设计阻止了当前本地占位数据库密码；替换服务器真实秘密并创建 release commit/tag 后方可部署。
