# ResumeSystem Backend

NestJS 后端服务，负责认证、用户管理、模板管理、简历数据、PDF 导出、版本管理、AI 配置和 AI 操作记录。

## 本地启动

先确认 MySQL 已启动，并配置 `backed-resume/.env` 或通过运行环境注入变量。

```bash
npm install
npm run start:dev
```

默认服务地址：

```text
http://localhost:3000
```

## 常用命令

```bash
npm run build
npm run test
npm audit --omit=dev
```

## 关键环境变量

```text
DB_HOST
DB_PORT
DB_USERNAME
DB_PASSWORD
DB_DATABASE
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
PORT
FRONTEND_URL
OPENAI_API_KEY
OPENAI_API_URL
OPENAI_MODEL
AGENT_SERVICE_URL
AGENT_INTERNAL_SECRET
UPLOAD_PATH
MAX_FILE_SIZE
```

生产环境必须显式配置 `JWT_ACCESS_SECRET` 和 `JWT_REFRESH_SECRET`，不能依赖开发默认值。

## 说明

- PDF 导出使用 Puppeteer；Docker 环境使用系统 Chromium。
- AI 能力支持 mock 和 OpenAI-compatible Provider。
- 上传资源默认保存在 `uploads`，Docker 环境挂载到命名卷。
- 修改后至少运行 `npm run build` 和 `npm run test`。
