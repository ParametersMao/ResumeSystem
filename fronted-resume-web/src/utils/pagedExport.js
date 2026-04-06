import { Previewer } from 'pagedjs';
export function buildExportHtmlDocument(options) {
    const styles = collectStyles();
    const baseHref = options.baseHref || `${location.origin}/`;
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <base href="${escapeHtml(baseHref)}" />
  <title>${escapeHtml(options.title)}</title>
  ${styles}
  <style>
    ${getDefaultPrintCss()}
    ${options.extraCss || ''}
  </style>
</head>
<body>
  ${options.bodyHtml}
</body>
</html>`;
}
export function buildResumeBodyHtml(container) {
    const resumeRoot = container.querySelector('.resume-renderer');
    const source = resumeRoot ? resumeRoot.cloneNode(true) : container.cloneNode(true);
    if (source instanceof HTMLElement)
        return source.outerHTML;
    return container.outerHTML;
}
export function getDefaultPrintCss() {
    return `
    @page { size: A4; margin: 12mm; }
    html, body { margin: 0; padding: 0; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    /* 预览样式清理：去掉阴影、固定宽度等 */
    .resume-renderer { width: 100%; min-height: auto !important; box-shadow: none !important; }

    /* pagedjs 生成的页面容器：避免额外内边距影响版心 */
    .pagedjs_pages { padding: 0 !important; }
    .pagedjs_page { box-shadow: none !important; }

    /* 尽量避免标题/模块在页首页尾被硬切 */
    h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }
    .resume-section, .section-wrapper, .section-content, .section-item {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    img, svg, canvas { break-inside: avoid; page-break-inside: avoid; }
  `;
}
export async function exportResumeWithPagedjs(options) {
    const { container, title, extraCss } = options;
    const resumeRoot = container.querySelector('.resume-renderer');
    const source = resumeRoot ? resumeRoot.cloneNode(true) : container.cloneNode(true);
    const previewHost = document.createElement('div');
    previewHost.style.position = 'fixed';
    previewHost.style.left = '-9999px';
    previewHost.style.top = '0';
    previewHost.style.width = '794px';
    previewHost.style.background = '#fff';
    previewHost.setAttribute('aria-hidden', 'true');
    document.body.appendChild(previewHost);
    try {
        const previewer = new Previewer();
        await previewer.preview(source, [], previewHost);
        const pagedHtml = previewHost.innerHTML;
        const printWindow = window.open('', '_blank', 'width=1024,height=768');
        if (!printWindow) {
            throw new Error('无法打开打印窗口');
        }
        const html = buildExportHtmlDocument({
            title: title || '简历',
            bodyHtml: pagedHtml,
            extraCss: extraCss?.trim() || undefined,
        });
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        await new Promise((resolve) => {
            if (printWindow.document.readyState === 'complete') {
                resolve();
            }
            else {
                printWindow.addEventListener('load', () => resolve(), { once: true });
            }
        });
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
            printWindow.close();
        }, 500);
    }
    finally {
        previewHost.remove();
    }
}
function collectStyles() {
    const elements = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    return elements
        .map((el) => {
        if (el.tagName === 'STYLE') {
            return `<style>${el.textContent || ''}</style>`;
        }
        const link = el;
        return `<link rel="stylesheet" href="${link.href}">`;
    })
        .join('\n');
}
function escapeHtml(input) {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
