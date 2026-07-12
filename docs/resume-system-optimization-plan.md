# ResumeSystem 上线前优化记录

更新时间：2026-06-29

## 目标

把当前项目从“本地可跑的 Beta”收敛到“可上线试运行的 MVP”。本轮优先处理注册、PDF 导出、照片上传、模板公开状态、简历数据契约和 Docker 部署可复现性；支付、RAG、复杂统计暂缓。

## 当前基线

- 项目目录：`D:\Projects\Web_Dev\ResumeSystem`
- 主要服务：`backed-resume`、`fronted-resume-web`、`middle-resume`、`python-agent`、`mysql`、`qdrant`
- Docker 入口：`docker-compose.yml`
- 用户端默认端口：`5173`
- 管理端默认端口：`3030`
- 后端默认端口：`3000`
- MySQL 默认端口：`3306`
- 测试账号：`testuser / 123456`
- 管理员账号：`admin / admin123`
- AI：当前保留 DeepSeek/OpenAI-compatible 直连能力；MVP 阶段 RAG 与 Qdrant 可延后启用
- 邮箱：生产注册依赖 SMTP；未配置 SMTP 时应明确提示，不应表现为未知失败

## 本轮执行项

| 状态 | 项目 | 验收标准 |
| --- | --- | --- |
| 已完成 | 计划和基线记录 | 本文件持续记录改动、验证命令和结果 |
| 已完成 | 生产注册闭环 | SMTP 未配置时用户端展示后端明确错误；后台配置页展示 SMTP 配置状态；生产默认不返回开发验证码 |
| 已完成 | PDF 导出加固 | 限制 HTML 大小；Puppeteer 阻断外部资源；保留预览和 PDF 样式一致性修复 |
| 已完成 | 照片上传 | 继续支持 JPEG、PNG、WebP，5MB 上限，上传失败优先展示后端具体原因 |
| 已完成 | 简历数据契约 | 后端保存前校验 content 是合法 JSON 并限制大小 |
| 已完成 | 模板公开状态 | 用户端只能看到启用模板；后台通过管理员接口管理全部模板 |
| 已完成 | Docker/部署说明 | 记录 2C2G MVP 启动建议，RAG/Qdrant 默认延后 |

## 风险记录

- PDF 当前仍是短期加固版：接口仍接收 HTML，后续应升级为按 `resumeId` 服务端渲染。
- `/uploads` 当前仍是静态资源入口，PDF 最终应改为鉴权下载或签名 URL。
- 部分服务仍存在运行时补表逻辑，后续应统一迁移链。
- 项目存在历史编码异常的中文提示，本轮不做全量重编码，避免扩大改动范围。

## 验证记录

已执行：

```powershell
cd D:\Projects\Web_Dev\ResumeSystem\backed-resume
npm test -- --runInBand
npm run build

cd D:\Projects\Web_Dev\ResumeSystem\fronted-resume-web
npm run build

cd D:\Projects\Web_Dev\ResumeSystem\middle-resume
npm run build
```

结果：

- 后端测试通过：6 个 test suite，72 个测试。
- 后端构建通过。
- 用户端构建通过。
- 管理端构建通过。
- Docker 重建并启动通过：`mysql`、`backend` healthy，`web`、`admin`、`agent`、`qdrant` 正常运行。
- HTTP 探测通过：`http://localhost:5173`、`http://localhost:3030`、`http://localhost:3000/api/health` 均返回 200。
- 用户端和管理端构建仍有 Vite 大 chunk 警告，属于既有体积优化项，不阻塞本轮 MVP 稳定性。

Docker 验证建议：

```powershell
cd D:\Projects\Web_Dev\ResumeSystem
docker compose up -d --build
docker compose ps
```

手工主流程：

1. 登录 `testuser / 123456`。
2. 创建或打开简历。
3. 上传证件照。
4. 保存并刷新确认数据仍在。
5. 导出 PDF，对比预览和 PDF 中照片、边距、颜色、字体、模块位置。
6. 后台禁用一个模板，确认用户端不再展示，后台仍能看到。

## 2C2G 阿里云 MVP 部署建议

- MVP 阶段建议只启用 `mysql`、`backend`、`web`、`admin`。
- `python-agent`、`qdrant`、RAG 索引适合后续作为可选 profile 或迁移到更高配置服务器。
- Cloudflare 负责 DNS、HTTPS 和基础防护，阿里云 VPS 跑 Docker 服务。
- 生产环境必须替换 `.env` 中所有默认密码和 JWT/Agent secret。
- SMTP、DeepSeek API Key、R2 Key 等敏感配置只放服务器 `.env` 或后台配置，不提交到 Git。
## 2026-06-29 Template QA Update

- Added visible default avatar placeholder for template preview, editor, and PDF export when the user has not uploaded a real photo.
- Added export confirmation when the resume still uses the placeholder avatar.
- Verified SMTP registration-code path after correcting the local SMTP host to `smtp.163.com`.
- Added backend/admin validation so SMTP host cannot be an email address.
- Ran Playwright QA for all 8 enabled templates:
  - card screenshot: 8/8
  - preview screenshot: 8/8
  - editor screenshot: 8/8
  - PDF export: 8/8
  - PDF first-page render: 8/8
  - browser console errors: 0
- QA evidence and per-template notes: `D:\Projects\Web_Dev\ResumeSystem\docs\template-visual-qa-2026-06-29.md`
- Main remaining gap: template card visuals are more polished than actual editor/PDF renderer output. Next round should make cards, preview, editor, and PDF share the same template-level layout key instead of relying only on generic variants.

## 2026-07-05 上线前 AI / 部署收口

### 决策

- 生产 MVP 默认不启用 RAG / Agent / Qdrant。
- 生产 AI 走 NestJS 后端直连 DeepSeek/OpenAI-compatible API。
- 本地或后续高配服务器仍可通过 `docker compose --profile rag up -d` 启用 Agent 与 Qdrant。
- 后台 AI 开关作为总开关：关闭后用户端润色、生成、诊断直接返回明确的服务不可用提示。

### 已完成

- `docker-compose.yml`：`agent`、`qdrant` 移入 `rag` profile；默认启动只包含 `mysql`、`backend`、`admin`、`web`。
- `.env.docker.example`：MVP 默认 `AI_EXECUTION_ENGINE=direct`，DeepSeek 兼容接口默认 `https://api.deepseek.com/v1`。
- 后端 AI 配置：新增 `AI_ENABLED` 环境默认值；后台配置仍可覆盖。
- 后端 AI 运行时：AI 关闭时测试连接返回 `disabled`；外部 provider 配置不完整时不再进入假成功调用。
- 用户端编辑器：AI 503、429、401、网络失败展示更具体错误。
- 管理端配置页：测试连接能区分 `AI 已停用`、`Mock 模式`、`待补配置`、`连接失败`。

### 本轮验证

```powershell
cd D:\Projects\Web_Dev\ResumeSystem\backed-resume
npm run build
npm test -- --runInBand

cd D:\Projects\Web_Dev\ResumeSystem\fronted-resume-web
npm run build

cd D:\Projects\Web_Dev\ResumeSystem\middle-resume
npm run build

cd D:\Projects\Web_Dev\ResumeSystem
docker compose config --services
docker compose --profile rag config --services
docker compose up -d --build mysql backend admin web
docker compose stop agent qdrant
docker compose ps
```

结果：

- 后端构建通过。
- 后端测试通过：6 个 test suite，72 个测试。
- 用户端构建通过。
- 管理端构建通过。
- 默认 compose 服务：`mysql`、`backend`、`admin`、`web`。
- RAG profile 服务：`mysql`、`backend`、`admin`、`qdrant`、`agent`、`web`。
- Docker MVP 运行态通过：当前只运行 `mysql`、`backend`、`admin`、`web`，`backend` 和 `mysql` healthy。
- HTTP 探测通过：
  - `http://localhost:3000/api/health` 返回 200。
  - `http://localhost:5173` 返回 200。
  - `http://localhost:3030` 返回 200。
- 浏览器冒烟通过：
  - 用户端进入 `http://localhost:5173/home`，`#app` 正常挂载，页面控制台错误 0。
  - 后台进入 `http://localhost:3030/login`，`#app` 正常挂载，页面控制台错误 0。
- 后台 AI 测试连接：
  - `enabled=false` 返回 `status=disabled`，提示“AI 功能已停用”。
  - 当前本地后台保存的 DeepSeek 配置可连通，测试连接返回 success。
- 用户端 AI 三主入口真实调用通过：
  - `/api/ai/generate`：`provider=deepseek`，`model=deepseek-v4-pro`，`executionMode=live`，返回 summary 和 promptPreview。
  - `/api/ai/polish`：`executionMode=live`，返回 2 条 suggestions。
  - `/api/ai/diagnose`：`executionMode=live`，返回 diagnostics / strategy / warnings。
- `git diff --check` 通过，仅有 Windows 行尾提示，无空白错误。

### 对抗性风险

- 真实 DeepSeek 调用仍依赖生产环境后台配置或 `.env` 中的 API Key；本地构建测试不代表外部 API 一定连通。
- 当前 AI 接口仍是同步 HTTP 调用，长 prompt 或 DeepSeek 慢响应时用户会等待；上线后应观察超时和失败率。
- RAG/Agent 默认关闭后，后台如果误切到 `agent` 且未启动 profile，会返回服务不可用，这是预期保护。
- 用户端大 chunk 警告仍存在，不阻塞 MVP，但后续应做路由级拆包。
- 本轮浏览器验证是页面加载和控制台冒烟，不等价于每个模板逐个 PDF 视觉回归；模板视觉回归仍按 `docs/template-rendered-card-qa-2026-06-30.md` 继续推进。

## 2026-07-06 生产部署修复与全量冒烟

### 已修复

- 线上模板库为空：生产库补种 7 个已启用模板，并验证 `/api/templates` 返回 `total=7`。
- API 304 缓存导致用户端仍看到旧空列表：线上 Nginx `/api/` 增加 `no-store` 响应头，前端 Axios 增加 `Cache-Control: no-cache` 请求头。
- 保存后出现 `resumeId=undefined` / `/api/resumes/NaN`：前端创建简历后改用后端返回的 `id`，后端对所有 `:id` 参数增加正整数校验，非法 ID 返回 400。
- PDF 导出 503：后端 Docker 改用 `chromium-headless-shell`，并配置 `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-headless-shell`。
- PDF 导出安全边界：HTML 导出增加大小限制，Puppeteer 拦截外部资源，仅允许本地静态资源、上传资源和内联资源。
- 中文保存乱码风险：TypeORM MySQL 连接显式配置 `utf8mb4`，通过 Unicode 转义接口测试验证新建和更新中文标题、内容可正常保存。
- 测试账号演示额度：给 `testuser` 临时提高 `resume_limit` 和 `pdf_monthly_total`，用于上线演示与回归测试。

### 生产验证结果

- 线上服务状态：
  - `resume-mysql` healthy
  - `resume-backend` healthy
  - `resume-web` running
  - `resume-admin` running
  - `resume-proxy` running
- API 验证：
  - `GET /api/health`：200
  - `GET /api/templates?page=1&limit=100&status=true&sortBy=recommended`：200，`total=7`，响应头 `Cache-Control=no-store...`
  - `POST /api/auth/cuser/login`：`testuser / 123456` 登录成功
  - `POST /api/resumes`：创建成功，返回有效 `id`
  - `PUT /api/resumes/:id`：保存成功
  - `PUT /api/resumes/NaN`：400，阻断 SQL 层 NaN 错误
  - `POST /api/resumes/assets/photo`：用户证件照 JPEG 上传成功
  - `POST /api/resumes/export`：PDF 导出成功，下载文件头为 `%PDF-`
  - `POST /api/auth/email/send-code`：SMTP 验证码发送成功
  - `POST /api/ai/polish`：DeepSeek live 调用成功，返回 suggestions
- 浏览器验证：
  - `http://121.43.208.184/templates`：模板库显示 7 个模板
  - `http://121.43.208.184/login`：密码登录成功，前端写入 `auth_token`
  - `http://121.43.208.184/resume-editor?templateId=10`：编辑器正常渲染
  - 浏览器点击“保存”：成功创建 `resumeId=5`，无 `/NaN`、无 `/undefined`、无 500

### 剩余风险

- 域名 `aidana.top` 当前在阿里云大陆节点受备案限制，演示请优先使用 `http://121.43.208.184`。
- 生产仍是 HTTP 直连 IP，正式对外前需要完成备案或迁移到不受备案限制的入口，并补齐 HTTPS。
- `PDF 导出` 当前仍消耗免费额度；演示账号已临时提高额度，普通用户仍会受计划限制。
- 线上公网已出现常见扫描请求，后续需要加固 Nginx 安全响应头、隐藏无关路径、考虑 Cloudflare/WAF。
- 历史已保存的乱码简历无法自动恢复原中文，只能保证修复后新写入数据正常。

## 2026-07-06 中台公网 IP 入口

- 已将后台管理端挂载到公网 IP 子路径：
  - `http://121.43.208.184/admin/`
  - `http://121.43.208.184/admin/login`
- 实现方式：
  - 管理端 Vite 生产构建增加 `VITE_BASE=/admin/`。
  - 管理端 Vue Router 使用 `createWebHistory(import.meta.env.BASE_URL)`。
  - 生产 Nginx 在主站 server 中增加 `/admin/` 反向代理到 `resume-admin`。
- 验证结果：
  - `/admin` 自动跳转到 `/admin/`。
  - `/admin/` 和 `/admin/login` 返回后台 HTML。
  - `/admin/js/...` 与 `/admin/css/...` 静态资源返回 200。
  - Playwright 打开 `/admin/login`：页面标题为“简历中台系统”，`#app` 正常挂载，控制台错误 0。
  - `POST /api/auth/login` 使用 `admin / admin123` 返回 200。
