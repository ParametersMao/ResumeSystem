编辑器架构与交互细节方案

## 1. 页面与布局

- 三栏布局：
  - 左侧：区块树（Sections Tree）与模板区块库（Presets）
  - 中间：预览画布（Renderer Canvas），所见即所得
  - 右侧：样式面板（Style Panel）与区块配置（Config Panel）

## 2. 关键组件

- `EditorShell`：编辑器壳组件，负责布局、路由守卫、状态注入、快捷键分发。
- `SectionTree`：左侧区块树，提供新增/隐藏/克隆/拖拽排序；拖拽基于 `SortableJS`。
- `Renderer`：中间画布，读取 `resume.sections` 与 `resume.style`，将区块映射到具体渲染器（WorkRenderer/ProjectRenderer/...）。
- `StylePanel`：右侧样式控制（主题色、字体、字号、行距、边距、分栏）。
- `BlockConfigPanel`：选中区块的字段配置（必填校验、富文本条目、标签/星级等）。
- `Topbar`：标题、保存状态（正在保存/已保存/冲突）、导出/预览按钮、模板切换入口。

## 3. 状态管理（Pinia）

- `useUserStore`：用户信息与鉴权 Token。
- `useTemplateStore`：模板列表与当前模板元数据。
- `useResumeStore`：核心简历状态：
  - `resume`：内容 + 样式 + 元数据
  - `lastSavedSnapshot`：上次保存成功的快照
  - `saveState`：'idle' | 'saving' | 'saved' | 'conflict' | 'error'
  - actions：`applyPatch`, `saveDebounced`, `rollback`, `resolveConflict`
- `useExportStore`：导出任务队列与状态。

## 4. 数据流与保存

1. 表单/富文本变化 → `applyPatch`（不可变更新）
2. `saveDebounced(800ms)`：对比 `lastSavedSnapshot` 生成 delta
3. 发送 PUT `/resumes/:id`（携带版本或 ETag）
4. 成功：更新 `lastSavedSnapshot` 与 `meta.version`，展示“已保存”
5. 冲突：置为 `conflict` 并弹出合并对话框

## 5. 模板切换

- 模板包含默认 `style/layout` 与渲染映射，不改变 `sections/items` 的结构。
- 切换时：
  - 备份当前 `style` 到历史
  - 合并新模板默认样式（未覆盖的字段保留原值）
  - 触发重新渲染与保存（可去抖）

## 6. 区块库（Presets）

- 常用区块预设：典型工作经历、典型项目描述、技能矩阵、教育模板
- 拖入区块树自动生成 `section` 与默认 `items`

## 7. 富文本策略

- 受控富文本：限制为加粗、斜体、下划线、链接、项目符号
- 粘贴清洗：移除外来样式，仅保留行内基础格式；超过上限字符截断并提示

## 8. 交互与快捷键

- Enter：在条目尾部创建新条目；Shift+Enter：换行
- Cmd/Ctrl+S：立即保存；Cmd/Ctrl+Z/Y：撤销/重做（编辑域内）
- 上下箭头：在条目间移动焦点

## 9. 预览与打印样式

- `@media print` 专用 CSS：页边距、分页符、字体嵌入、图片压缩
- 画布宽度按 A4 比例渲染（缩放预览）

## 10. 冲突合并（简化）

- 展示本地版本与服务器版本差异：按 section 维度对比标题、条目数组与 highlights
- 用户选择“以本地为准”或“以服务器为准”，或逐项合并

## 11. 错误恢复

- 离线：保存到本地队列，恢复后重放
- 崩溃恢复：持久化草稿到 IndexedDB；下次打开时提示恢复

## 12. 可扩展点

- AI 助手：条目润色、要点提炼、指标量化
- 多人协作：基于 CRDT/OT 的实时协作（后续迭代）
