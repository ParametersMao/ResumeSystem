'use strict'

const assert = require('node:assert/strict')
const { existsSync } = require('node:fs')
const path = require('node:path')
const puppeteer = require('puppeteer')
const pdfjs = require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js')

const serviceModule = path.resolve(__dirname, '../dist/modules/resumes/resumes.service.js')
if (!existsSync(serviceModule)) {
  throw new Error('Build the backend before running qa:pdf-upload')
}

if (!process.env.PUPPETEER_EXECUTABLE_PATH && !process.env.CHROME_PATH) {
  process.env.PUPPETEER_EXECUTABLE_PATH = puppeteer.executablePath()
}

const { ResumesService } = require(serviceModule)

const portraitPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAoCAYAAACfKfiZAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACISURBVFhH7c6tFYAwDEbRLoZnMwQLMQ0ToFA48I+/NA0t4hPP9DTJTcu67S1LfKidACdA342fxnsCuADzNNzGv4z3sgE8eBVnwgA89BRniwE8YIk7BHADuNga97gBXgR3CFAEyEVwNgRgRXAmFPCG4F/Gey5ASbwngAACCCCAAAL8D1A7AZoDDsYzcT2HcbGIAAAAAElFTkSuQmCC',
  'base64',
)

async function main() {
  let exportedPdf
  const downloadedKeys = []
  const storage = {
    async downloadObject(key) {
      downloadedKeys.push(key)
      return portraitPng
    },
    async uploadObject(input) {
      exportedPdf = Buffer.from(input.body)
      return { key: input.key, url: `/uploads/${input.key}` }
    },
  }
  const entitlements = {
    async consumePdf() {},
    async consumeStorage() {},
    async refundPdf() {},
    async refundStorage() {},
  }
  const service = new ResumesService({}, {}, {}, storage, entitlements, {})

  const result = await service.exportPdf(
    `<!doctype html>
    <html>
      <head><meta charset="utf-8"><style>@page{size:A4;margin:0}body{margin:0}.resume-sheet{padding:40px}img{width:96px;height:120px;object-fit:cover}</style></head>
      <body><main class="resume-sheet"><h1>上传照片导出验收</h1><img src="/uploads/resume-photos/user-7/photo-integration.png" alt="职业照片"><p>PDF_UPLOAD_PHOTO_E2E</p></main></body>
    </html>`,
    7,
  )

  assert.equal(result.pageCount, 1, 'export must produce exactly one page')
  assert.deepEqual(downloadedKeys, ['resume-photos/user-7/photo-integration.png'])
  assert.ok(Buffer.isBuffer(exportedPdf) && exportedPdf.length > 1_000, 'exported PDF was not captured')

  const document = await pdfjs.getDocument({ data: new Uint8Array(exportedPdf) }).promise
  try {
    const firstPage = await document.getPage(1)
    const operators = await firstPage.getOperatorList()
    const imageOperators = new Set(
      Object.entries(pdfjs.OPS)
        .filter(([name]) => /paint(?:Jpeg|Image|InlineImage)/.test(name))
        .map(([, value]) => value),
    )
    assert.ok(
      operators.fnArray.some((operator) => imageOperators.has(operator)),
      'the uploaded raster was loaded but not embedded in the exported PDF',
    )
  } finally {
    await document.destroy()
  }

  console.log(JSON.stringify({
    status: 'passed',
    pageCount: result.pageCount,
    uploadedPhotoKey: downloadedKeys[0],
    pdfBytes: exportedPdf.length,
  }))
}

main().catch((error) => {
  console.error(`[pdf-export-upload-qa] failed: ${error.stack || error.message}`)
  process.exitCode = 1
})
