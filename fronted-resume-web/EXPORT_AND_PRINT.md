导出与打印实现策略

## 1. 客户端导出（快速）

- 方案：`html2canvas + jsPDF`
- 适用：快速预览、自助下载，弱依赖环境（无服务端渲染）
- 关键点：
  - 字体：提前加载所需字体（ttf/woff2），避免回退导致换行差异
  - DPI：推荐 144~192 dpi，平衡清晰度与体积
  - 分页：按 A4 比例计算分页点，避免孤行/寡行；必要时收紧段距
  - 图片：canvas 降采样压缩，控制导出 PDF 体积 < 2MB（可选）

## 2. 服务端导出（稳定）

- 方案：Puppeteer/Playwright 渲染无头浏览器导出 PDF
- 适用：企业简历、统一风格、字体一致性要求高
- 关键点：
  - 字体嵌入：在服务端渲染环境安装并注册字体，避免替换
  - 打印 CSS：`@page` 控制边距、页眉页脚；`break-inside: avoid` 防止模块拆分
  - 超时与重试：渲染超时（>15s）重试一次；失败则提供客户端备选
  - 水印：按需添加公司 Logo 或用户标识

## 3. 打印样式规范

- `@media print`：
  - 统一字体与字号，确保换行稳定
  - 标题与段落的分页规则：避免标题孤行；区块作为不可分片的最小单元
  - 页边距：默认 18mm，支持 UI 可调
  - 颜色：深色文本与中度强调色（主题色）

## 4. 前端实现示例（伪代码）

```ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

async function exportPdf(element: HTMLElement, filename = "resume.pdf") {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const pageHeight = 297;
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  pdf.save(filename);
}
```

## 5. 质量保障

- 视觉回归：关键模板使用截图对比（像素阈值）
- 真实打印测试：Windows/Mac 浏览器 + 常见打印机驱动
- 监控：导出成功率、耗时分布、失败原因 TopN
