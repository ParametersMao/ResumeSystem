# 2026-06-30 模板库真实渲染卡片 QA

## 目标

按对抗式审查推进模板库入口，消除“模板卡片看起来像优秀模板，但实际编辑器/PDF 是另一套结构”的风险。

## 改动

- 模板库卡片不再把 `coverUrl` 静态图作为主要预览，而是在卡片内直接复用 `CoreResumePreview` 生成小尺寸真实预览。
- `TemplateMeta` 增加 `layoutKey`，模板列表页可在不额外拉取详情的情况下命中正确布局。
- 修正 `resolveTemplatePreset` 的优先级：`layoutKey` > 模板名关键词 > `templateVariant` 兜底。
- 针对当前上线种子模板 17-24 增加 ID 到 `layoutKey` 的显式映射。
- 安装 `playwright` 作为前端 devDependency；Chromium 下载在当前网络下超时，验证阶段临时使用本机 Chrome 可执行文件。

## 对抗式发现

第一次浏览器验证发现：8 张卡虽然都由 renderer 输出，但全部命中 `layout-qm-blue-top-photo`。

原因：

- 后端 `/api/templates` 列表没有返回 `templateData/layoutKey`。
- 前端原先依赖 `templateVariant` 或中文模板名关键词推断 layout。
- 多个模板同为 `ats` 时，`templateVariant` 只能表达类别，不能表达具体结构。

修复：

- 调整 `resolveTemplatePreset` 推断顺序。
- 在 `fronted-resume-web/src/api/template.ts` 中增加当前种子模板 ID 到 `layoutKey` 的明确映射。

长期建议：

- 后端列表接口应直接返回 `layoutKey`，前端不应长期维护种子 ID 映射。

## 验证结果

命令：

- `npm run build` in `fronted-resume-web`
- `docker compose up -d --build web`
- Playwright + 本机 Chrome 访问 `http://localhost:5173/templates`

结果：

- `cardCount`: 8
- `rendererPreviewCount`: 8
- `resumeSheetCount`: 8
- `uniqueLayoutCount`: 8
- `consoleMessages`: []

命中的布局：

- `layout-qm-blue-top-photo`
- `layout-qm-sidebar-profile`
- `layout-qm-classic-centered`
- `layout-qm-ribbon-compact`
- `layout-qm-timeline-icons`
- `layout-qm-minimal-ats`
- `layout-qm-executive-business`
- `layout-qm-student-editorial`

产物：

- `runtime-logs/template-rendered-card-qa-2026-06-30/rendered-card-results-fixed.json`
- `runtime-logs/template-rendered-card-qa-2026-06-30/templates-rendered-cards-fixed.png`

## 剩余风险

- 当前缩略图是真实 A4 缩放，因此在卡片里偏小；优点是一致，缺点是商业展示冲击力还不够。后续可以做“真实 renderer 生成截图 + 居中裁切/放大”的二级缩略图策略。
- `npm install -D playwright` 暴露出当前前端依赖树仍有 1 moderate + 1 high audit 风险，需要单独审计，不能用 `npm audit fix --force` 盲目升级。

## 2026-06-30 后续推进：后端 layoutKey 契约 + 卡片放大裁切

### 后端 layoutKey 契约

目标：去掉前端靠模板 ID 猜 layout 的临时方案，让 `/api/templates` 列表直接返回轻量 `layoutKey`。

改动：

- `backed-resume/dto/template.dto.ts`
  - 新增 `TemplateVariant` 和 `TemplateLayoutKey` 类型。
  - `TemplateListResponseDto`、`TemplateDetailResponseDto`、`TemplateResponseDto` 增加 `layoutKey`。
- `backed-resume/modules/templates/templates.service.ts`
  - 从 `templateData.layout.key`、`templateData.layoutKey` 或 `templateData.key` 解析 `layoutKey`。
  - 增加白名单校验，避免脏 JSON 任意字符串进入响应。
  - 列表、详情、创建/更新响应都返回 `layoutKey`。
- `fronted-resume-web/src/api/template.ts`
  - 消费后端 `layoutKey`。
  - 移除种子模板 ID 到 layoutKey 的前端硬编码映射。

验证：

- `npm run build` in `backed-resume`：通过。
- `npm run build` in `fronted-resume-web`：通过。
- `npm test -- --runInBand modules/templates/templates.service.spec.ts`：通过，14/14。
- 运行时 API：
  - `GET http://localhost:3000/api/templates?page=1&limit=20&sortBy=recommended`
  - 17-24 全部返回正确 `layoutKey`。
- 浏览器验证：
  - `runtime-logs/template-layoutkey-api-qa-2026-06-30/layoutkey-api-results.json`
  - `apiLayoutKeys` 与页面 8 个 `layout-*` class 一致。

### 卡片放大裁切

目标：保留真实 renderer 一致性，同时提升模板库卡片的商业展示感。

改动：

- `fronted-resume-web/src/views/Templates.vue`
  - 卡片内 A4 renderer 缩放从 `0.17` 调整到 `0.23`。
  - 保留卡片固定高度和 overflow 裁切，优先展示模板头部、照片、第一屏结构。

验证：

- `npm run build` in `fronted-resume-web`：通过。
- `docker compose up -d --build web`：通过。
- Playwright + 本机 Chrome：
  - `cardCount`: 8
  - `uniqueLayoutCount`: 8
  - `legacyVisible`: false
  - `consoleMessages`: []
- 产物：
  - `runtime-logs/template-card-crop-qa-2026-06-30/card-crop-results.json`
  - `runtime-logs/template-card-crop-qa-2026-06-30/templates-card-crop.png`

剩余风险：

- 卡片现在是“真实 renderer 放大裁切”，不是预生成图片。优点是改模板时卡片自动同步；风险是模板库页渲染成本比纯图片高。当前只展示 8 张卡可接受，后续模板数量上去后要做分页限制、虚拟列表或后端预生成缩略图。
