# 简历系统后端

NestJS 后端服务，负责认证、用户/简历数据、模板管理、PDF 导出、版本管理、AI 配置与 AI 操作记录。

## 本地启动

先确认数据库已启动，并配置 `backed-resume/.env`。

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
```

## 关键环境变量

```text
DB_HOST
DB_PORT
DB_USERNAME
DB_PASSWORD
DB_DATABASE
JWT_SECRET
JWT_EXPIRES_IN
PORT
FRONTEND_URL
OPENAI_API_KEY
OPENAI_API_URL
UPLOAD_PATH
MAX_FILE_SIZE
```

## 关键说明

- PDF 导出使用 Puppeteer，由后端渲染前端提交的简历 HTML。
- AI 能力当前支持 mock 与 openai-compatible Provider，真实 API 只需在配置中切换。
- 上传资源默认通过 `/uploads` 暴露，本地 mock 资源通过 `/mock` 暴露。
- 测试主要覆盖核心服务逻辑，清理文档后建议至少运行 `npm run build` 和 `npm run test`。
