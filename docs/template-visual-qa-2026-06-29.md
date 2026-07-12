# ResumeSystem Template Visual QA - 2026-06-29

## Scope

This QA pass verifies the current template library against the product goal discussed in this thread:

- template cards should communicate the photo/layout effect before use;
- preview, editor, and exported PDF should render the same structural layout;
- every template should show an avatar placeholder when the user has not uploaded a real photo;
- PDF export should complete without browser console errors.

The 全民简历 site was used only as a structural reference source: https://www.qmjianli.com/cv/jianlimoban/
No third-party template assets or exact copyrighted layout files were copied into the project.

## Environment

- Project: `D:\Projects\Web_Dev\ResumeSystem`
- Web: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Admin: `http://localhost:3030`
- Browser automation: Playwright with local Chrome executable
- Test user: `testuser / 123456`
- Output folder: `runtime-logs/template-qa-2026-06-29`

## Summary

| Check | Result |
| --- | --- |
| Templates tested | 8 |
| Template card screenshots | 8/8 |
| Preview dialog screenshots | 8/8 |
| Editor screenshots | 8/8 |
| PDF downloads | 8/8 |
| PDF first-page PNG renders | 8/8 |
| Browser console errors | 0 |
| Placeholder avatar visible in editor | 8/8 |

## Key Finding

The critical functional path now works: every enabled template can be previewed, opened in the editor, and exported to PDF, and every flow shows a visible placeholder avatar when no real photo has been uploaded.

The main remaining quality gap is visual fidelity between the template card promise and the actual editor/PDF layout. Several cards look closer to 全民简历-style structures, but the editor/PDF still maps them to generic `variant` renderers such as `ats`, `compact`, `classic`, and `editorial`. This means the system is stable enough for MVP testing, but not yet visually competitive with a mature resume-template marketplace.

## Per-Template Results

| ID | Template | Variant | Structural reference | Result | Notes |
| --- | --- | --- | --- | --- | --- |
| 9 | 全民简历 · 蓝色右上证件照 | `ats` | top identity + right photo + blue section rules | Pass with gap | PDF exports and avatar is visible, but actual PDF uses the generic ATS centered header rather than the stronger card layout. |
| 10 | 全民简历 · 左栏头像信息版 | `sidebar` | left sidebar portrait + contact blocks + right content | Pass | This is the closest match among the current set. PDF preserves sidebar, portrait slot, contact area, and timeline-like main column. |
| 11 | 全民简历 · 居中标题头像版 | `classic` | centered title + right photo | Pass with gap | Stable export, but still feels like a generic classic template instead of the richer reference structure. |
| 12 | 全民简历 · 深蓝横条标题版 | `compact` | dark horizontal header + right photo | Pass with gap | PDF shows a dark header and right photo, but section styling and spacing need more polish. |
| 13 | 全民简历 · 图标时间轴版 | `timeline` | large header + right photo + vertical timeline | Pass | Strong structure match, but the decorative timeline can consume too much vertical space with sparse content. |
| 14 | 全民简历 · 极简 ATS 投递版 | `ats` | plain ATS single-column resume | Pass | Good for delivery/ATS use. Photo placeholder is visible, but ATS templates may need a user option to hide photo entirely. |
| 15 | 全民简历 · 商务高管深色版 | `executive` | dark executive header + right photo | Pass | Stable export. Needs richer executive section hierarchy before launch. |
| 16 | 全民简历 · 清爽教育经历版 | `editorial` | light blue education/student layout | Pass with gap | Stable export, but the PDF currently looks closer to the compact dark header style than a student/education layout. Needs dedicated renderer or better template data mapping. |

## Evidence

Primary QA result JSON:

- `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\template-qa-2026-06-29\template-qa-results.json`

Library screenshot:

- `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\template-qa-2026-06-29\00-template-library.png`

Representative PDF renders:

- `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\template-qa-2026-06-29\9-全民简历-·-蓝色右上证件照-pdf-page-1.png`
- `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\template-qa-2026-06-29\10-全民简历-·-左栏头像信息版-pdf-page-1.png`
- `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\template-qa-2026-06-29\13-全民简历-·-图标时间轴版-pdf-page-1.png`
- `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\template-qa-2026-06-29\16-全民简历-·-清爽教育经历版-pdf-page-1.png`

## SMTP Verification

The registration-code issue was caused by the admin SMTP host being set to an email address instead of the SMTP server host.

- Incorrect value: email address in the SMTP host field
- Correct value for 163 mail: `smtp.163.com`
- Local DB was updated to `smtp.163.com`
- Verification request succeeded:

```powershell
Invoke-RestMethod -Method Post `
  -Uri 'http://localhost:3000/api/auth/email/send-code' `
  -ContentType 'application/json' `
  -Body '{"email":"maomao0001010@163.com","purpose":"register"}'
```

Result:

```json
{"code":200,"message":"验证码已发送","data":{"expiresIn":600}}
```

Additional guard added:

- backend rejects SMTP hosts containing `@` with a clear configuration error;
- admin config page marks SMTP incomplete when host looks like an email address;
- admin save blocks invalid SMTP host before submitting.

## Next Priority

1. Add a real template-layout key instead of relying only on `templateVariant`.
2. Make each template card, preview, editor, and PDF use the same layout renderer.
3. Start with the 4 high-value renderers:
   - right-top portrait with blue section rules;
   - left sidebar portrait/contact layout;
   - dark horizontal executive/header layout;
   - clean education/student layout.
4. Add a small automated visual QA script to the repo after the current throwaway script stabilizes.
5. Add a production setting for photo behavior: require photo, optional photo, or hide photo slot.

## 2026-06-29 LayoutKey Implementation Pass

Implemented the first pass of the template-layout-key architecture.

Changes:

- Added `CoreTemplateLayoutKey` and `templateLayout.key`.
- Template data now stores `layout.key`, with the seeded templates mapped as:
  - `qm-blue-top-photo`
  - `qm-sidebar-profile`
  - `qm-classic-centered`
  - `qm-ribbon-compact`
  - `qm-timeline-icons`
  - `qm-minimal-ats`
  - `qm-executive-business`
  - `qm-student-editorial`
- Template preview now reads `extractLayoutFromTemplate`, so preview and editor use the same layout metadata.
- `CoreResumePreview` now prioritizes `layoutKey` over generic variant rendering.
- Implemented a dedicated renderer and print CSS for `qm-blue-top-photo`.
- Verified `qm-sidebar-profile` carries its own layout key and still uses the left-sidebar renderer.

Verification:

- User web build passed.
- Database reseeded; current template IDs are `17-24`.
- Browser QA output:
  - `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\layoutkey-qa-2026-06-29\layoutkey-qa-results.json`
- Editor screenshots:
  - `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\layoutkey-qa-2026-06-29\17-blue-editor.png`
  - `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\layoutkey-qa-2026-06-29\18-sidebar-editor.png`
- Exported PDFs:
  - `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\layoutkey-qa-2026-06-29\17-blue.pdf`
  - `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\layoutkey-qa-2026-06-29\18-sidebar.pdf`
- PDF first-page renders:
  - `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\layoutkey-qa-2026-06-29\17-blue-page-1.png`
  - `D:\Projects\Web_Dev\ResumeSystem\runtime-logs\layoutkey-qa-2026-06-29\18-sidebar-page-1.png`

Result:

- Template 17 now exports with the blue title bar, left identity, top-right avatar, and section-rule layout instead of falling back to the generic centered ATS renderer.
- Template 18 still exports successfully with the left-sidebar avatar/contact structure.
- Remaining work: implement dedicated renderers for `qm-ribbon-compact`, `qm-student-editorial`, and `qm-executive-business`; then rerun all 8 templates through card/preview/editor/PDF QA.

## 2026-06-29 第二批 LayoutKey 模板推进

本轮继续把模板从通用 variant 收敛到更明确的模板级 layoutKey 表达，重点验证 3 个模板：

- Template 20 `qm-ribbon-compact`
  - 页面类名：`resume-sheet variant-compact layout-qm-ribbon-compact`
  - PDF 导出成功：`runtime-logs/layoutkey-qa-2026-06-29/20-ribbon.pdf`
  - 首页渲染：`runtime-logs/layoutkey-qa-2026-06-29/20-ribbon-page-1.png`
  - 结论：头像占位、深蓝丝带标题、横线结构正常，接近参考模板中的横条标题类结构。

- Template 23 `qm-executive-business`
  - 页面类名：`resume-sheet variant-executive layout-qm-executive-business`
  - PDF 导出成功：`runtime-logs/layoutkey-qa-2026-06-29/23-executive-final2.pdf`
  - 首页渲染：`runtime-logs/layoutkey-qa-2026-06-29/23-executive-final2-page-1.png`
  - 发现并修复：深色头部里联系方式和职位文本被通用 variant 样式覆盖为深色，导致可读性差；已在预览 CSS 和打印 CSS 中加入 layout 级颜色规则。
  - 验证：Playwright 读取 `.resume-role` 计算色为 `rgb(247, 228, 177)`，PDF 视觉确认无黑字残留。

- Template 24 `qm-student-editorial`
  - 页面类名：`resume-sheet variant-editorial layout-qm-student-editorial`
  - PDF 导出成功：`runtime-logs/layoutkey-qa-2026-06-29/24-student.pdf`
  - 首页渲染：`runtime-logs/layoutkey-qa-2026-06-29/24-student-page-1.png`
  - 结论：浅蓝头部、右侧照片占位、分节标题线条结构正常，预览与 PDF 基本一致。

验证命令/证据：

- `npm run build` in `fronted-resume-web`：通过。仍存在 Element Plus PURE 注释和 chunk size 常规警告。
- `docker compose up -d --build web`：通过，web/backend/mysql 均能启动。
- Playwright 批量结果：`runtime-logs/layoutkey-qa-2026-06-29/layoutkey-qa-second-batch.json`
- 23 修复后结果：`runtime-logs/layoutkey-qa-2026-06-29/layoutkey-qa-23-final2.json`

剩余模板侧重点：

- 21 `qm-timeline-icons` 还需要下一批做独立时间轴结构验证。
- 22 `qm-minimal-ats` 需要保持 ATS 清爽，不应过度装饰。
- 当前 20/23/24 仍主要通过 layoutKey + CSS 重塑结构；如后续要达到更高复刻度，应继续把 20/23/24 拆成独立 markup 分支，而不是只依赖 CSS 覆盖。

## 2026-06-29 第三批 LayoutKey 模板推进

本轮处理剩余两个重点模板：21 时间轴结构、22 极简 ATS 投递结构。

- Template 21 `qm-timeline-icons`
  - 页面类名：`resume-sheet variant-timeline layout-qm-timeline-icons`
  - PDF 导出成功：`runtime-logs/layoutkey-qa-2026-06-29/21-timeline-final.pdf`
  - 首页渲染：`runtime-logs/layoutkey-qa-2026-06-29/21-timeline-final-page-1.png`
  - 改动：将时间轴从原来的卡片感 UI 调整为更像简历的左侧履历线结构；顶部加入分区感、照片占位和右侧联系信息。
  - 发现并修复：长邮箱在顶部信息区可能被裁切；已改为允许换行和 `overflow-wrap:anywhere`，真实邮箱不会被截断。

- Template 22 `qm-minimal-ats`
  - 页面类名：`resume-sheet variant-ats layout-qm-minimal-ats`
  - PDF 导出成功：`runtime-logs/layoutkey-qa-2026-06-29/22-minimal-ats-final.pdf`
  - 首页渲染：`runtime-logs/layoutkey-qa-2026-06-29/22-minimal-ats-final-page-1.png`
  - 改动：从通用 ATS 样式改成低装饰投递版：右上照片占位、两列联系信息、简单横线分节、无卡片背景。
  - 发现并修复：三列联系信息会挤压邮箱标签和值；已改为两列信息栏，并固定标签宽度。

验证命令/证据：

- `npm run build` in `fronted-resume-web`：通过。仍存在 Element Plus PURE 注释和 chunk size 常规警告。
- `docker compose up -d --build web`：通过。
- Playwright 最终结果：`runtime-logs/layoutkey-qa-2026-06-29/layoutkey-qa-third-batch-final.json`
- 最终首图：
  - `runtime-logs/layoutkey-qa-2026-06-29/21-timeline-final-page-1.png`
  - `runtime-logs/layoutkey-qa-2026-06-29/22-minimal-ats-final-page-1.png`

当前模板库状态：

- 17/18/20/21/22/23/24 已完成 layoutKey 级预览 + PDF 验证。
- 下一轮建议补齐 19 `qm-classic-centered`，再回归模板列表卡片预览和实际编辑器/PDF 的一致性。

## 2026-06-30 第四批：19 居中标题头像版 + 总一致性回归

本轮补齐 Template 19 `qm-classic-centered`，并做模板库卡片、编辑器、PDF 的一致性总回归。

### Template 19 `qm-classic-centered`

- 页面类名：`resume-sheet variant-classic layout-qm-classic-centered`
- PDF 导出成功：`runtime-logs/layoutkey-qa-2026-06-30/19-classic-centered.pdf`
- 首页渲染：`runtime-logs/layoutkey-qa-2026-06-30/19-classic-centered-page-1.png`
- 改动：新增独立 markup 分支，不再只复用通用 `variant-classic`。
- 当前结构：姓名/岗位居中、照片右上、联系方式居中分行、模块横线分节。
- 验证：Playwright 检查 layout class 命中、头像存在、联系信息存在、PDF 导出成功、无控制台核心错误。

### 模板库卡片 vs 编辑器 vs PDF 总回归

验证范围：17-24 共 8 个启用模板。

- 模板接口返回数量：8。
- 模板库页面卡片数量：8。
- 8 个模板均能进入编辑器。
- 8 个模板均命中预期 `layout-*` class。
- 8 个模板均有头像/占位头像。
- 8 个模板均能导出 PDF。
- Playwright 控制台无核心错误。

验证产物：

- 总结果 JSON：`runtime-logs/template-consistency-qa-2026-06-30/consistency-results.json`
- 模板库整页截图：`runtime-logs/template-consistency-qa-2026-06-30/templates-page-full.png`
- 三列总览图：`runtime-logs/template-consistency-qa-2026-06-30/template-card-editor-pdf-contact-sheet.png`
- 每个模板都有：
  - `{id}-card.png`
  - `{id}-editor-sheet.png`
  - `{id}.pdf`
  - `{id}-pdf-page-1.png`

结论：

- 卡片预览、编辑器实际渲染、PDF 首页已经具备结构一致性。
- 当前剩余差距主要是精细视觉质量：模板卡片还是简化缩略图，不能完全表达编辑器/PDF 的细节；后续如要进一步提升商业质感，应把卡片缩略图改为直接复用同一份 renderer 小尺寸截图，减少手写 SVG 缩略图与真实模板偏差。
