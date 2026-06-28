# C 端简历 Web

用户侧简历系统前端，包含登录、我的简历、模板中心、核心简历编辑器、PDF 导出、多版本管理和 AI 辅助入口。

## 本地启动

```bash
npm install
npm run dev
```

默认访问地址：

```text
http://localhost:5173
```

本地开发时，`vite.config.ts` 会把 `/api`、`/uploads`、`/mock`、`/resumes` 代理到后端：

```text
http://localhost:3000
```

## 常用命令

```bash
npm run build
npm run preview
```

## 关键说明

- 模板中心默认展示所有模板，可按版式、收藏、最近使用筛选。
- 编辑器采用左侧模块化编辑、右侧实时预览、右侧样式参数配置的三栏结构。
- PDF 导出走后端 Puppeteer 渲染，前端负责提交当前预览 HTML。
- 模板 JSON 规范保留在 `src/TEMPLATE_JSON_SPEC.md`，中台也提供可视化规范入口。
