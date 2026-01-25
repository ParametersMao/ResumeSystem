import { Previewer } from 'pagedjs'

interface ExportOptions {
  container: HTMLElement
  title?: string
}

export async function exportResumeWithPagedjs(options: ExportOptions): Promise<void> {
  const { container, title } = options
  const resumeRoot = container.querySelector('.resume-renderer') as HTMLElement | null
  const source = resumeRoot ? resumeRoot.cloneNode(true) : container.cloneNode(true)

  const previewHost = document.createElement('div')
  previewHost.style.position = 'fixed'
  previewHost.style.left = '-9999px'
  previewHost.style.top = '0'
  previewHost.style.width = '794px'
  previewHost.style.background = '#fff'
  previewHost.setAttribute('aria-hidden', 'true')
  document.body.appendChild(previewHost)

  try {
    const previewer = new Previewer()
    await previewer.preview(source as HTMLElement, [], previewHost)
    const pagedHtml = previewHost.innerHTML

    const printWindow = window.open('', '_blank', 'width=1024,height=768')
    if (!printWindow) {
      throw new Error('无法打开打印窗口')
    }

    const styles = collectStyles()
    printWindow.document.open()
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title || '简历')}</title>
  ${styles}
  <style>
    @page { size: A4; margin: 12mm; }
    html, body { margin: 0; padding: 0; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .resume-renderer { width: 100%; min-height: auto !important; box-shadow: none !important; }
    .pagedjs_pages { padding: 0; }
  </style>
</head>
<body>
  ${pagedHtml}
</body>
</html>`)
    printWindow.document.close()

    await new Promise<void>((resolve) => {
      if (printWindow.document.readyState === 'complete') {
        resolve()
      } else {
        printWindow.addEventListener('load', () => resolve(), { once: true })
      }
    })

    printWindow.focus()
    printWindow.print()
    setTimeout(() => {
      printWindow.close()
    }, 500)
  } finally {
    previewHost.remove()
  }
}

function collectStyles(): string {
  const elements = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]')
  )
  return elements
    .map((el) => {
      if (el.tagName === 'STYLE') {
        return `<style>${el.textContent || ''}</style>`
      }
      const link = el as HTMLLinkElement
      return `<link rel="stylesheet" href="${link.href}">`
    })
    .join('\n')
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
