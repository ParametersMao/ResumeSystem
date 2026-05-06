# Docker 一键部署指南

这个 Docker 方案会启动 4 个核心服务：

- `mysql`：MySQL 8.0 数据库。
- `backend`：NestJS 后端，内置 Chromium 用于 Puppeteer PDF 导出。
- `web`：C 端 Web，Nginx 静态托管，默认端口 `5173`。
- `admin`：中台管理端，Nginx 静态托管，默认端口 `3030`。

## 1. 首次启动

```bash
cp .env.docker.example .env
docker compose up -d --build
```

Windows PowerShell 可以手动复制：

```powershell
Copy-Item .env.docker.example .env
docker compose up -d --build
```

启动后访问：

- C 端 Web：`http://localhost:5173`
- 中台管理端：`http://localhost:3030`
- 后端健康检查：`http://localhost:3000/api/health`

默认测试账号：

- 中台：`admin / admin123`
- C 端：`testuser / 123456`

## 2. 填写生产密钥

`.env` 必须至少修改：

```env
MYSQL_ROOT_PASSWORD=replace-me
DB_PASSWORD=replace-me
JWT_ACCESS_SECRET=replace-with-a-long-random-string
JWT_REFRESH_SECRET=replace-with-another-long-random-string
```

R2 和 AI 可以后续再填，但真实密钥只放 `.env`，不要提交到 Git。

默认数据库名是 `resume_system`。如果要修改 `.env` 里的 `DB_DATABASE`，需要同步调整
`docker/mysql/init/001_schema.sql` 中的建库语句；测试阶段建议先保持默认值，减少初始化误差。

## 3. 初始化模板数据

第一次启动后，如果数据库里模板为空，可以执行一次模板种子任务：

```bash
docker compose --profile seed run --rm seed-templates
```

这个命令会写入几套风格不同的模板，方便测试模板中心和编辑器。

## 4. 常用命令

```bash
docker compose ps
docker compose logs -f backend
docker compose restart backend
docker compose down
```

如果要清空数据库从零开始：

```bash
docker compose down -v
docker compose up -d --build
```

## 5. 上线服务器注意事项

- 服务器需要先安装 Docker 和 Docker Compose。
- 如果前端仍通过 Nginx 容器反代后端，前端环境变量保持 `/api` 即可。
- 生产域名上线时，需要把 `.env` 的 `FRONTEND_URL` 改成真实前端和中台域名，用英文逗号分隔。
- 如果使用 Cloudflare R2，`R2_ENDPOINT` 填账号级 endpoint，`R2_BUCKET` 单独填 bucket 名称。
- 已经在聊天、截图或日志出现过的 R2 密钥，正式上线前建议轮换。

## 6. Docker Hub 拉取失败排查

如果 `docker compose up -d --build` 卡在 `failed to fetch anonymous token` 或
`auth.docker.io`，说明当前机器无法连接 Docker Hub，不是项目代码构建失败。可以按顺序处理：

```bash
docker pull node:22-alpine
docker pull node:22-bookworm-slim
docker pull nginx:1.27-alpine
docker pull mysql:8.0
```

如果手动拉取也失败，需要先检查服务器网络、防火墙、代理或 Docker 镜像加速配置；基础镜像能拉取后，
再重新执行 `docker compose up -d --build`。
