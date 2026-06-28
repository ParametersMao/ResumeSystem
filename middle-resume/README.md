# 简历中台管理端

运营/管理侧前端，包含用户管理、模板管理、数据统计、AI 操作监控、AI 配置等页面。

## 本地启动

```bash
npm install
npm run dev
```

默认访问地址：

```text
http://localhost:3030
```

本地开发时，`vite.config.ts` 会把 `/api` 代理到后端：

```text
http://localhost:3000
```

## 常用命令

```bash
npm run build
npm run type-check
```

## 关键说明

- 模板管理支持模板上传、启停、推荐权重、收藏/使用数据查看。
- 新建模板时可在页面查看默认 JSON 规范，不需要再翻旧文档。
- AI 配置用于管理 mock/openai-compatible 等 Provider 配置和提示词配置。
- 数据统计中的热门模板图表展示 Top 5 模板使用情况。
