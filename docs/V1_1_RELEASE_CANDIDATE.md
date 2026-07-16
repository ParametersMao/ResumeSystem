# ResumeSystem v1.3.4 Release Candidate

日期：2026-07-15
状态：本地候选版；只有服务器制品校验、真实 RAG/LLM、公网浏览器与观察期全部通过后才可标记上线

## 本版范围

- 11 套独立简历模板及 A4 默认样例质量门禁。
- 一页可读性下限、自然分页、标题孤行控制、条目整体换页、PDF 页数断言。
- FastEmbed BGE 真实 Embedding、Qdrant、DeepSeek V4 Pro Agent。
- Dense + BM25 Hybrid Retrieval、融合重排、来源分数拆解。
- 生产严格来源模式：无有效知识来源时禁止 LLM 无依据生成。
- 知识库上传、索引、重建、启停、删除和检索测试。
- 无服务器构建的七镜像不可变制品、format-2 全量备份、维护模式恢复验收与按精确镜像 ID 回滚。

## 发布门禁

发布前必须全部满足：

- [ ] `npm run build`：backend、web、admin 全部通过。
- [ ] Python RAG 单元和质量测试全部通过。
- [ ] 11/11 模板宽度、横向溢出、A4 默认高度门禁通过。
- [ ] 真实 RAG E2E 返回 `hybrid-dense-bm25`、live LLM、sources 与 tokenUsed。
- [ ] 多页 PDF 实际页数断言通过。
- [ ] 登录、保存、刷新恢复、导出产品流程通过。
- [ ] `.\deploy\release-preflight.ps1` 通过。
- [ ] `INCLUDE_IMAGES=true ./deploy/backup.sh` 生成跨存储一致备份、镜像包及 SHA-256。
- [ ] 公网 Web/Admin 静态资源、MIME、允许/拒绝 CORS、无效登录数据库链路全部通过。
- [ ] Agent 用真实 FastEmbed 维度幂等初始化 collection；canonical fixture 在维护态完成 uploads/MySQL/Qdrant 三方写入和精确文档检索。
- [ ] 约 2GB 主机具有发布所需 Swap/可用内存预算，15 分钟内无 OOM、无非预期容器重启。
- [ ] 工作区整理为单一 release commit，并创建语义化 tag。
- [ ] 测试 API key 已轮换，生产密钥仅存在服务器 `.env` 或秘密管理系统。

## 部署顺序

1. 在外部 linux/amd64 构建器从干净 release commit 生成七镜像制品、精确源码包、manifest 和 SHA-256；生产机禁止构建。
2. 读取生产机当前 MySQL/Qdrant/Nginx 精确 digest 或 image ID，执行资源和发布预检。
3. 在维护规则内对当前不可变版本执行 `INCLUDE_IMAGES=true ./deploy/backup.sh`，并验证 format-2 备份可恢复。
4. 服务器只执行 `docker load`，再以 `VERIFIED_BACKUP_DIR=... ./deploy/deploy-loaded-release.sh --confirm` 原地顺序切换，禁止 `--build` 和数据服务隐式升级。
5. Agent lifespan 先用真实 FastEmbed 维度创建/验证 collection；Backend 建表后自动写入或复用受制品校验的 canonical fixture。新建 fixture 失败会补偿删除 DB、向量和文件；随后才验证 Web/Admin、CORS、认证数据库、精确文档 Hybrid 与真实 DeepSeek。
6. 首次变更前写 durable rollout marker；开机 guard 在 rollout/pending/backup-freeze 未完成时保持 80/443 关闭。普通备份冻结前也写独立 marker，由 service `ExecStopPost` 和开机 recovery unit 自动恢复；marker 的完整目录、备份、timer 与 phase 上下文保留到 finalization，最终提交先删 pending、最后删 rollout，禁止形成 pending-only 死锁。内部门禁全部通过后只把状态更新为 pending，才开放公网，timers 仍保持停止。
7. 从外部浏览器完成登录、知识库、编辑保存、照片、AI 诊断/生成、两页 PDF 与跨用户隔离 E2E。
8. 并发执行 PDF + live RAG，观察至少 15 分钟，确认无 OOM、无非预期重启、错误率与延迟可接受。
9. 运行 `./deploy/finalize-release.sh --confirm <full-commit>`，再次验收、创建当前版本全镜像备份并恢复健康/备份 timers；任何一步失败立即关流量并保留 pending，禁止无监控继续服务。

## 回滚原则

- 应用回滚使用已验证备份中的镜像 ID 和 `deploy/rollback-images.sh`，全程 `--no-build`。
- 数据库或向量数据发生不兼容变化时，先停止写入，再使用同一时间戳的 MySQL、Qdrant 和 uploads 三件套恢复。
- 历史数据 restore 必须先生成不可淘汰的 safety backup，并在 `data-mutation` 前持久化其路径；异常掉电或 SIGKILL 后执行 `deploy/recover-interrupted-rollout.sh --confirm /opt/resumesystem-rollout-in-progress.env`，由 phase 决定恢复原栈、镜像，或用 safety backup 完整重放 MySQL/Qdrant/uploads/FastEmbed。中断恢复验收通过后仍须保持维护规则，先恢复可精确回放的 timer 状态，再持久清除恢复 marker，最后才开放公网；任何中间失败都保持 fail-closed。
- 禁止在脏工作区运行自动回滚，禁止仅恢复数据库而不恢复对应知识文件和向量集合。

## 当前已知非阻断项

- 前端 Element Plus 主包仍较大，后续可继续拆包，但不影响功能正确性。
- Hybrid 重排目前是可解释的本地轻量算法，大知识库阶段可替换 Cross-Encoder。
- 单条内容如果自身高于一整页，Chromium 必须拆分；编辑器后续可增加超长条目提示。

## 2026-07-15 本地验收记录

- 11/11 模板独立布局，宽度 820，横向与默认 A4 垂直溢出均为 0；视觉抽查无重叠或断裂。
- Python Agent/RAG 测试 40/40 通过；全新 Qdrant 的断网冷启动、稳定模型链接、canonical fixture、dense-only 证明、私有 JD 与 live DeepSeek 已通过。
- Hybrid RAG E2E、DeepSeek live、严格来源阻断通过。
- 登录、编辑器打开、保存刷新恢复、单页 PDF 通过；运行错误 0。
- 多页自然分页 PDF 返回 2 页，页数断言通过。
- NestJS 23 suites / 203 tests 与 build 通过；生产 Compose 当前版及服务器 v1.25 兼容解析通过。
- 后端候选镜像已验证 Chromium、中文字体和生产依赖；最终七镜像制品必须在 release commit 后重新构建并校验 manifest。
- 公网部署、live DeepSeek、浏览器产品流和 15 分钟稳定性仍是上线门禁，不能由本地测试代替。
