# ResumeSystem

ResumeSystem 是一个简历制作与管理项目，当前目录已经整理为一个根项目，包含后端、C 端 Web、管理端、Python Agent 和 Docker 配置。

## 项目结构

```text
backed-resume         NestJS 后端服务，默认端口 3000
fronted-resume-web    C 端简历 Web，默认端口 5173
middle-resume         管理端 Web，默认端口 3030
python-agent          AI/RAG Agent 服务
docker/mysql/init     Docker MySQL 初始化 SQL
scripts               本地启动、检查和运维脚本
```

## Docker 启动

1. 复制 `.env.docker.example` 为 `.env`。
2. 填写 `JWT_ACCESS_SECRET`、`JWT_REFRESH_SECRET`、`AGENT_INTERNAL_SECRET`，如需真实 AI 能力再填写 `OPENAI_API_URL`、`OPENAI_API_KEY`、`OPENAI_MODEL`。
3. 启动服务：

```powershell
.\scripts\docker-up.ps1
```

访问地址：

```text
C 端 Web: http://localhost:5173
管理端:   http://localhost:3030
后端健康: http://localhost:3000/api/health
```

## 本地开发

分别安装依赖后可以直接启动各服务：

```powershell
.\scripts\start-backend.ps1
.\scripts\start-frontend.ps1
.\scripts\start-middle.ps1
```

也可以一次启动：

```powershell
.\scripts\start-all.ps1
```

## 验证

```powershell
.\scripts\check.ps1
```

该脚本会依次执行后端构建与单元测试、C 端 Web 构建、管理端构建、生产依赖审计。

## 数据备份与恢复

Docker MySQL 启动后，可以备份本地数据库：

```powershell
.\scripts\backup-db.ps1
```

恢复指定 SQL 文件：

```powershell
.\scripts\restore-db.ps1 .\backups\resume-system-YYYYMMDD-HHMMSS.sql
```

备份文件默认写入 `backups/`，该目录不会提交到 Git。

## 默认测试账号

Docker 初始化数据会创建本地测试账号：

```text
管理端和 C 端均不提供固定生产凭据。首次管理员通过一次性
`BOOTSTRAP_ADMIN_USERNAME` / `BOOTSTRAP_ADMIN_PASSWORD` 创建；QA 凭据只通过运行时环境变量传入。
```

这些账号只用于本地验证，生产环境需要替换。
