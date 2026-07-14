'use strict'

const assert = require('node:assert/strict')
const { existsSync } = require('node:fs')
const path = require('node:path')
const puppeteer = require('puppeteer')

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

  // Chromium keeps image dictionaries outside compressed content streams.
  // Inspecting those dictionaries avoids pdf-parse's legacy PDF.js font loader,
  // which touches a browser-only `document` during teardown on Linux runners.
  const imageObjectCount = (
    exportedPdf.toString('latin1').match(/\/Subtype\s*\/Image\b/g) || []
  ).length
  assert.ok(
    imageObjectCount > 0,
    'the uploaded raster was loaded but not embedded as a PDF image object',
  )

  console.log(JSON.stringify({
    status: 'passed',
    pageCount: result.pageCount,
    uploadedPhotoKey: downloadedKeys[0],
    pdfBytes: exportedPdf.length,
    imageObjectCount,
  }))
}

main().catch((error) => {
  console.error(`[pdf-export-upload-qa] failed: ${error.stack || error.message}`)
  process.exitCode = 1
})
