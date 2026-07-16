import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'
import { chromium } from 'playwright'
import { createServer } from 'vite'

import { buildCoreResumePrintHtml } from '../src/core-resume/print.ts'
import { RESUME_AVATAR_CONTRACT } from '../src/core-resume/photo.ts'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')
const artifactDirectory = path.resolve(
  process.env.QA_PDF_ARTIFACT_DIR
    || path.join(projectRoot, 'runtime-logs', 'template-pdf-layout-qa'),
)
const defaultAvatarPath = path.resolve(
  projectRoot,
  '..',
  'backed-resume',
  'public',
  'mock',
  'avatar',
  'default.svg',
)

// Match the browser layout stress fixture: one native item plus six repeats.
const LONG_REPEAT_COUNT = Number(process.env.QA_PDF_REPEAT_COUNT || 6)
const A4_POINTS = { width: 595.28, height: 841.89 }
const UPLOAD_OWNER_ID = 7
const UPLOAD_PATH_PREFIX = `/uploads/resume-photos/user-${UPLOAD_OWNER_ID}`
const RASTER_PORTRAIT_DIMENSIONS = { width: 160, height: 200 }
const RASTER_PORTRAIT = createRasterPortraitPng()

const TEMPLATE_CONTRACTS = [
  contract({
    code: 'BL',
    layoutKey: 'qm-blue-top-photo',
    variant: 'ats',
    sectionSelector: '.qm-blue-section',
    itemSelector: '.qm-blue-section .section-item',
    titleSelector: '.section-heading h2',
    startSelector: '.qm-blue-item-main h3',
    secondarySelector: '.qm-blue-item-main span',
    dateSelector: '.qm-blue-date',
    endSelector: '.item-description',
  }),
  contract({
    code: 'SB',
    layoutKey: 'qm-sidebar-profile',
    variant: 'sidebar',
    primaryRoot: '.sidebar-main',
    sectionSelector: '.resume-section',
    itemSelector: '.resume-section .section-item',
    titleSelector: '.section-heading h2',
    startSelector: '.item-heading h3',
    secondarySelector: '.item-heading > span',
    dateSelector: '.item-subheading span',
    endSelector: '.item-description',
  }),
  contract({
    code: 'CC',
    layoutKey: 'qm-classic-centered',
    variant: 'classic',
    sectionSelector: '.classic-centered-section',
    itemSelector: '.classic-centered-section .section-item',
    titleSelector: '.section-heading h2',
    startSelector: '.classic-centered-item-main h3',
    secondarySelector: '.classic-centered-item-main > span',
    dateSelector: '.classic-centered-date',
    endSelector: '.item-description',
  }),
  contract({
    code: 'RC',
    layoutKey: 'qm-ribbon-compact',
    variant: 'compact',
    sectionSelector: '.resume-section',
    itemSelector: '.resume-section .section-item',
    titleSelector: '.section-heading h2',
    startSelector: '.item-heading h3',
    secondarySelector: '.item-heading > span',
    dateSelector: '.item-subheading span',
    endSelector: '.item-description',
  }),
  contract({
    code: 'TI',
    layoutKey: 'qm-timeline-icons',
    variant: 'timeline',
    sectionSelector: '.timeline-section',
    itemSelector: '.timeline-section .timeline-card',
    titleSelector: '.timeline-marker h2',
    startSelector: '.timeline-card-top h3',
    secondarySelector: '.timeline-card-top p',
    dateSelector: '.timeline-date',
    endSelector: '.item-description',
  }),
  contract({
    code: 'MA',
    layoutKey: 'qm-minimal-ats',
    variant: 'ats',
    sectionSelector: '.ats-section',
    itemSelector: '.ats-section .ats-item',
    titleSelector: '.ats-section-title h2',
    startSelector: '.ats-item-header h3',
    secondarySelector: '.ats-item-header p',
    dateSelector: '.ats-item-header time',
    endSelector: '.ats-description',
  }),
  contract({
    code: 'EB',
    layoutKey: 'qm-executive-business',
    variant: 'executive',
    sectionSelector: '.resume-section',
    itemSelector: '.resume-section .section-item',
    titleSelector: '.section-heading h2',
    startSelector: '.item-heading h3',
    secondarySelector: '.item-heading > span',
    dateSelector: '.item-subheading span',
    endSelector: '.item-description',
  }),
  contract({
    code: 'ST',
    layoutKey: 'qm-student-editorial',
    variant: 'editorial',
    sectionSelector: '.student-section',
    itemSelector: '.student-section .student-item',
    titleSelector: '.student-section-heading h2',
    startSelector: '.student-item-header h3',
    secondarySelector: '.student-item-header p',
    dateSelector: '.student-item-header time',
    endSelector: '.student-description',
  }),
  contract({
    code: 'SP',
    layoutKey: 'qm-spotlight-featured',
    variant: 'spotlight',
    primaryRoot: '.spotlight-main',
    sectionSelector: '.spotlight-section',
    itemSelector: '.spotlight-section .spotlight-card',
    titleSelector: '.section-heading h2',
    startSelector: '.spotlight-card-head h3',
    secondarySelector: '.spotlight-card-head p',
    dateSelector: '.spotlight-date',
    endSelector: '.item-description',
  }),
  contract({
    code: 'FO',
    layoutKey: 'qm-table-formal',
    variant: 'classic',
    sectionSelector: '.formal-table-section',
    itemSelector: '.formal-table-items > article',
    titleSelector: ':scope > header',
    startSelector: '.formal-item-meta strong',
    secondarySelector: '.formal-item-meta span',
    dateSelector: '.formal-item-meta time',
    endSelector: ':scope > p',
  }),
  contract({
    code: 'AS',
    layoutKey: 'qm-asymmetric-profile',
    variant: 'editorial',
    primaryRoot: '.asymmetric-right',
    sectionSelector: '.asymmetric-story-section',
    itemSelector: '.asymmetric-story-section > article',
    titleSelector: ':scope > header h2',
    startSelector: '.asymmetric-story-head h3',
    secondarySelector: '.asymmetric-story-head div > p',
    dateSelector: '.asymmetric-story-head time',
    endSelector: '.asymmetric-description',
  }),
]

async function main() {
  await mkdir(artifactDirectory, { recursive: true })

  const failures = []
  const runtimeErrors = []
  const generatedCases = []
  const uploadRequests = new Map()
  let viteServer
  let browser

  try {
    const local = process.env.QA_BASE_URL
      ? { url: process.env.QA_BASE_URL, server: null, uploadRequests }
      : await startLocalViteServer(uploadRequests)
    viteServer = local.server
    browser = await launchBrowser()

    const appPage = await browser.newPage({
      viewport: { width: 1440, height: 1200 },
      deviceScaleFactor: 1,
    })
    captureRuntimeErrors(appPage, runtimeErrors, 'app')
    await installDeterministicApi(appPage)

    await appPage.goto(`${local.url}/templates?qa=template-pdf-layout`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })
    await appPage.addStyleTag({
      content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}',
    })
    await appPage.waitForSelector('.template-card .resume-sheet', { timeout: 15_000 })

    const { markupByLayout: sourceMarkupByLayout, previewEvidenceByLayout } = await collectTemplateMarkup(appPage, failures)
    for (const template of TEMPLATE_CONTRACTS) {
      const sourceMarkup = sourceMarkupByLayout.get(template.layoutKey)
      check(Boolean(sourceMarkup), `${template.layoutKey}: template card was not rendered`, failures)
      if (!sourceMarkup) continue

      for (const mode of ['short', 'long']) {
        const photoPath = `${UPLOAD_PATH_PREFIX}/${template.layoutKey}-${mode}.png`
        const fixture = await buildPrintFixture(appPage, sourceMarkup, template, mode, photoPath)
        const caseId = `${template.layoutKey}-${mode}`
        const pdfPath = path.join(artifactDirectory, `${caseId}.pdf`)
        const renderDirectory = path.join(artifactDirectory, `${caseId}-pages`)
        await mkdir(renderDirectory, { recursive: true })

        const html = buildCoreResumePrintHtml(
          fixture.markup,
          `PDF layout QA - ${template.layoutKey} - ${mode}`,
        )
        check(!html.includes('data:image'), `${caseId}: print HTML must not contain a data URL portrait`, failures)
        const printEvidence = await printPdf(
          browser,
          withBaseHref(html, local.url),
          pdfPath,
          runtimeErrors,
          caseId,
          photoPath,
          local.url,
          template.layoutKey,
        )
        generatedCases.push({
          caseId,
          layoutKey: template.layoutKey,
          mode,
          pdfPath,
          renderDirectory,
          markers: fixture.markers,
          expectedItemCount: fixture.markers.items.length,
          photoPath,
          printEvidence,
          previewEvidence: previewEvidenceByLayout.get(template.layoutKey) || null,
        })
      }
    }

    const inspection = inspectPdfsWithPyMuPdf(generatedCases)
    for (const result of inspection.results) {
      result.photoPath = generatedCases.find((item) => item.caseId === result.caseId)?.photoPath
      result.uploadRequestCount = uploadRequests.get(result.photoPath) || 0
      result.printEvidence = generatedCases.find((item) => item.caseId === result.caseId)?.printEvidence
      result.previewEvidence = generatedCases.find((item) => item.caseId === result.caseId)?.previewEvidence
      validateInspection(result, failures)
    }
    failures.push(...inspection.failures)
    failures.push(...runtimeErrors.map((error) => `runtime: ${error}`))

    const report = {
      generatedAt: new Date().toISOString(),
      expectedCaseCount: TEMPLATE_CONTRACTS.length * 2,
      generatedCaseCount: generatedCases.length,
      a4Points: A4_POINTS,
      longRepeatCount: LONG_REPEAT_COUNT,
      exportChain: 'CoreResumePreview DOM -> buildCoreResumePrintHtml -> same-origin /uploads HTTP -> Chromium PDF',
      backendExportGate: 'backed-resume: npm run qa:pdf-upload exercises ResumesService.exportPdf storage interception and PDF image operators',
      photoTransport: {
        origin: local.url,
        pathPattern: `${UPLOAD_PATH_PREFIX}/{layoutKey}-{mode}.png`,
        contentType: 'image/png',
        width: RASTER_PORTRAIT_DIMENSIONS.width,
        height: RASTER_PORTRAIT_DIMENSIONS.height,
      },
      failures,
      runtimeErrors,
      results: inspection.results,
    }
    await writeFile(
      path.join(artifactDirectory, 'results.json'),
      `${JSON.stringify(report, null, 2)}\n`,
      'utf8',
    )
    console.log(JSON.stringify({
      generatedCaseCount: report.generatedCaseCount,
      passedCaseCount: report.results.filter((item) => item.failures.length === 0).length,
      failures: report.failures,
      artifactDirectory,
    }, null, 2))
  } finally {
    await browser?.close()
    await viteServer?.close()
  }

  if (failures.length) {
    throw new Error(`template PDF layout QA failed with ${failures.length} issue(s)`)
  }
}

function contract(input) {
  return {
    primaryRoot: null,
    ...input,
    avatar: RESUME_AVATAR_CONTRACT[input.layoutKey],
  }
}

async function startLocalViteServer(uploadRequests) {
  const serveRasterUpload = (request, response, next) => {
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1')
    if (!new RegExp(`^${UPLOAD_PATH_PREFIX}/[a-z0-9-]+-(?:short|long)\\.png$`, 'i').test(requestUrl.pathname)) {
      next()
      return
    }

    uploadRequests.set(requestUrl.pathname, (uploadRequests.get(requestUrl.pathname) || 0) + 1)
    response.statusCode = 200
    response.setHeader('Content-Type', 'image/png')
    response.setHeader('Content-Length', String(RASTER_PORTRAIT.length))
    response.setHeader('Cache-Control', 'no-store')
    response.end(RASTER_PORTRAIT)
  }
  const server = await createServer({
    root: projectRoot,
    logLevel: 'error',
    server: { host: '127.0.0.1', port: 0, strictPort: false },
    plugins: [{
      name: 'template-pdf-qa-raster-upload',
      configureServer(viteServer) {
        viteServer.middlewares.use(serveRasterUpload)
      },
    }],
  })
  await server.listen()
  const address = server.httpServer?.address()
  if (!address || typeof address === 'string') {
    throw new Error('Vite did not expose a local QA port')
  }
  return { server, url: `http://127.0.0.1:${address.port}` }
}

function withBaseHref(html, baseUrl) {
  // Production ResumesService.injectPdfSafeMargins() adds a localhost <base>
  // before Puppeteer setContent(). Use this run's HTTP origin here so the
  // exact same root-relative /uploads URL resolves through the QA server.
  const baseHref = new URL('/', baseUrl).href
  if (!/<head(?:\s[^>]*)?>/i.test(html)) {
    throw new Error('Production print HTML has no <head> for the QA origin')
  }
  return html.replace(/<head(\s[^>]*)?>/i, (match) => `${match}\n    <base href="${baseHref}" />`)
}

function createRasterPortraitPng() {
  const { width, height } = RASTER_PORTRAIT_DIMENSIONS
  const stride = 1 + width * 4
  const raw = Buffer.alloc(stride * height)

  const setPixel = (x, y, red, green, blue, alpha = 255) => {
    const offset = y * stride + 1 + x * 4
    raw[offset] = red
    raw[offset + 1] = green
    raw[offset + 2] = blue
    raw[offset + 3] = alpha
  }

  for (let y = 0; y < height; y += 1) {
    raw[y * stride] = 0
    for (let x = 0; x < width; x += 1) {
      const shade = Math.round(246 - y * 0.12 - x * 0.035)
      setPixel(x, y, shade - 8, shade, Math.min(255, shade + 8))

      const head = ((x - 80) / 31) ** 2 + ((y - 76) / 39) ** 2 <= 1
      const hair = ((x - 80) / 36) ** 2 + ((y - 58) / 32) ** 2 <= 1 && y < 71
      const shoulders = ((x - 80) / 69) ** 2 + ((y - 204) / 83) ** 2 <= 1 && y >= 122
      const shirt = ((x - 80) / 25) ** 2 + ((y - 164) / 52) ** 2 <= 1 && y >= 121

      if (shoulders) setPixel(x, y, 40, 72, 101)
      if (shirt) setPixel(x, y, 245, 248, 251)
      if (head) setPixel(x, y, 229, 181, 148)
      if (hair) setPixel(x, y, 36, 52, 68)
      if (y >= 76 && y <= 79 && ((x >= 65 && x <= 71) || (x >= 89 && x <= 95))) {
        setPixel(x, y, 50, 56, 61)
      }
      if (y >= 96 && y <= 98 && x >= 73 && x <= 87) setPixel(x, y, 164, 87, 80)
    }
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 6
  header[10] = 0
  header[11] = 0
  header[12] = 0

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii')
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0)
  return Buffer.concat([length, typeBuffer, data, checksum])
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

async function launchBrowser() {
  const executablePath = [
    process.env.QA_BROWSER_PATH,
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean).find((candidate) => existsSync(candidate))

  return chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    args: typeof process.getuid === 'function' && process.getuid() === 0
      ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      : [],
  })
}

function captureRuntimeErrors(page, errors, scope) {
  page.on('pageerror', (error) => errors.push(`${scope}: ${String(error)}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${scope}: ${message.text()}`)
  })
  page.on('response', (response) => {
    if (response.status() >= 500) {
      errors.push(`${scope}: ${response.status()} ${response.url()}`)
    }
  })
}

async function installDeterministicApi(page) {
  const portraitSvg = await readFile(defaultAvatarPath, 'utf8')
  const list = TEMPLATE_CONTRACTS.map((item, index) => ({
    id: index + 1,
    templateName: `PDF QA ${item.layoutKey}`,
    templateVariant: item.variant,
    layoutKey: item.layoutKey,
    previewImage: '',
    industryTags: 'QA,PDF,layout',
    status: true,
    useCount: TEMPLATE_CONTRACTS.length - index,
    recommendWeight: 1_000 - index,
  }))

  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === '/mock/avatar/default.svg') {
      await route.fulfill({ status: 200, contentType: 'image/svg+xml', body: portraitSvg })
      return
    }

    if (url.pathname === '/api/templates') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: { list, total: list.length, page: 1, limit: 100 },
        }),
      })
      return
    }

    const detailMatch = url.pathname.match(/^\/api\/templates\/(\d+)$/)
    if (detailMatch) {
      const id = Number(detailMatch[1])
      const item = TEMPLATE_CONTRACTS[id - 1]
      if (!item) {
        await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: {
            ...list[id - 1],
            templateData: JSON.stringify({
              variant: item.variant,
              layoutKey: item.layoutKey,
              layout: {
                key: item.layoutKey,
                variant: item.variant,
                avatar: item.avatar,
              },
              profile: { avatar: item.avatar },
              theme: {
                variant: item.variant,
                colors: { primary: '#31577b', accent: '#e8eff5' },
                typography: {
                  fontFamily: {
                    body: 'Arial, Microsoft YaHei, sans-serif',
                    heading: 'Arial, Microsoft YaHei, sans-serif',
                  },
                },
              },
            }),
          },
        }),
      })
      return
    }

    await route.continue()
  })
}

async function collectTemplateMarkup(page, failures) {
  const markupByLayout = new Map()
  const previewEvidenceByLayout = new Map()

  for (let pageIndex = 0; pageIndex < 5 && markupByLayout.size < TEMPLATE_CONTRACTS.length; pageIndex += 1) {
    const cards = page.locator('.template-card')
    const count = await cards.count()
    for (let index = 0; index < count; index += 1) {
      const card = cards.nth(index)
      const layoutKey = await card.locator('.resume-sheet').evaluate((sheet) =>
        [...sheet.classList].find((value) => value.startsWith('layout-'))?.slice('layout-'.length) || '',
      )
      if (!layoutKey || markupByLayout.has(layoutKey)) continue

      await card.locator('.template-actions button').nth(1).click()
      const dialogSheet = page.locator(`.el-dialog:visible .resume-sheet.layout-${layoutKey}`)
      await dialogSheet.waitFor({ state: 'visible', timeout: 10_000 })
      await waitForImages(dialogSheet)
      markupByLayout.set(layoutKey, await dialogSheet.evaluate((sheet) => sheet.outerHTML))
      if (layoutKey === 'qm-classic-centered') {
        previewEvidenceByLayout.set(layoutKey, await readClassicAlignmentEvidence(dialogSheet))
      }
      await page.locator('.el-dialog:visible .el-dialog__headerbtn').click()
      await page.locator('.el-dialog').waitFor({ state: 'hidden', timeout: 5_000 })
    }

    const next = page.locator('.el-pagination .btn-next')
    if (!await next.count() || await next.isDisabled()) break
    await next.click()
    await page.waitForTimeout(150)
    await page.waitForSelector('.template-card .resume-sheet', { timeout: 5_000 })
  }

  const expectedLayouts = new Set(TEMPLATE_CONTRACTS.map((item) => item.layoutKey))
  for (const layoutKey of markupByLayout.keys()) {
    check(expectedLayouts.has(layoutKey), `${layoutKey}: unexpected PDF QA template`, failures)
  }
  return { markupByLayout, previewEvidenceByLayout }
}

async function readClassicAlignmentEvidence(sheetLocator) {
  return sheetLocator.evaluate((sheet) => {
    const date = sheet.querySelector('.classic-centered-date')
    const secondary = sheet.querySelector('.classic-centered-item-main > span')
    if (!(date instanceof HTMLElement) || !(secondary instanceof HTMLElement)) {
      throw new Error('Classic alignment evidence elements are missing')
    }
    const rawSeparator = getComputedStyle(secondary, '::before').content
    const separator = rawSeparator.replace(/^['"]|['"]$/g, '')
    return {
      dateTextAlign: getComputedStyle(date).textAlign,
      separator,
      separatorCodePoints: [...separator].map((character) =>
        `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
      ),
    }
  })
}

async function waitForImages(locator) {
  await locator.evaluate(async (root) => {
    const images = [...root.querySelectorAll('img')]
    await Promise.all(images.map(async (image) => {
      if (!image.complete) {
        await new Promise((resolve, reject) => {
          image.addEventListener('load', resolve, { once: true })
          image.addEventListener('error', reject, { once: true })
        })
      }
      await image.decode?.()
      if (!image.naturalWidth || !image.naturalHeight) {
        throw new Error(`Image did not decode: ${image.currentSrc || image.src}`)
      }
    }))
  })
}

async function buildPrintFixture(page, sourceMarkup, template, mode, photoPath) {
  return page.evaluate(({ markup, contractData, fixtureMode, uploadedPhotoPath, repeatCount }) => {
    const parsed = new DOMParser().parseFromString(markup, 'text/html')
    const sheet = parsed.body.firstElementChild
    if (!(sheet instanceof HTMLElement)) throw new Error('Resume sheet markup is invalid')

    const avatar = sheet.querySelector('img.resume-avatar')
    if (!(avatar instanceof HTMLImageElement)) {
      throw new Error(`${contractData.layoutKey}: rendered sheet has no portrait image`)
    }
    avatar.setAttribute('src', uploadedPhotoPath)
    avatar.removeAttribute('srcset')

    const root = contractData.primaryRoot
      ? sheet.querySelector(contractData.primaryRoot)
      : sheet
    if (!(root instanceof HTMLElement)) {
      throw new Error(`${contractData.layoutKey}: primary root is missing`)
    }

    const candidates = [...root.querySelectorAll(contractData.itemSelector)]
      .filter((item) =>
        item.querySelector(contractData.startSelector)
        && item.querySelector(contractData.endSelector)
        && (!contractData.dateSelector || item.querySelector(contractData.dateSelector))
        && (!contractData.secondarySelector || item.querySelector(contractData.secondarySelector)),
      )
    const baseItem = candidates[0]
    if (!(baseItem instanceof HTMLElement) || !(baseItem.parentElement instanceof HTMLElement)) {
      throw new Error(`${contractData.layoutKey}: no complete native item is available`)
    }
    const section = baseItem.closest(contractData.sectionSelector)
    if (!(section instanceof HTMLElement)) {
      throw new Error(`${contractData.layoutKey}: native item has no owning section`)
    }
    const title = section.querySelector(contractData.titleSelector)
    if (!(title instanceof HTMLElement)) {
      throw new Error(`${contractData.layoutKey}: owning section has no title`)
    }

    // The short case is intentionally a one-module resume. Keeping unrelated
    // demo sections would make the page count depend on marketing fixture copy
    // instead of the template's minimum viable PDF layout.
    if (fixtureMode === 'short') {
      for (const otherSection of sheet.querySelectorAll(contractData.sectionSelector)) {
        if (otherSection !== section) otherSection.remove()
      }
    }

    const modeCode = fixtureMode === 'long' ? 'L' : 'S'
    const titleMarker = `T${contractData.code}${modeCode}`
    title.textContent = `${titleMarker} ${title.textContent?.trim() || 'EXPERIENCE'}`
    title.setAttribute('data-pdf-qa-title', titleMarker)

    const itemTemplate = baseItem.cloneNode(true)
    const items = [baseItem]
    if (fixtureMode === 'long') {
      for (let index = 0; index < repeatCount; index += 1) {
        const clone = itemTemplate.cloneNode(true)
        baseItem.parentElement.append(clone)
        items.push(clone)
      }
    }

    const markerItems = []
    items.forEach((item, index) => {
      if (!(item instanceof HTMLElement)) return
      const sequence = String(index + 1).padStart(2, '0')
      const startMarker = `I${contractData.code}${modeCode}${sequence}`
      const endMarker = `E${contractData.code}${modeCode}${sequence}`
      const start = item.querySelector(contractData.startSelector)
      const end = item.querySelector(contractData.endSelector)
      if (!(start instanceof HTMLElement) || !(end instanceof HTMLElement)) {
        throw new Error(`${contractData.layoutKey}: native item fields disappeared during cloning`)
      }

      start.textContent = `${startMarker} Global Product Engineering Center ${index + 1}`
      const secondary = contractData.secondarySelector
        ? item.querySelector(contractData.secondarySelector)
        : null
      if (secondary instanceof HTMLElement) {
        secondary.textContent = 'Senior Product Engineering and Delivery Lead'
      }
      const date = contractData.dateSelector
        ? item.querySelector(contractData.dateSelector)
        : null
      if (date instanceof HTMLElement) date.textContent = '2021.09 - 2026.07'

      const stressCopy = fixtureMode === 'long'
        ? '负责跨团队需求拆解、方案设计、质量验证与上线验收，保留可核实的行动和交付边界。Deterministic PDF evidence validates natural pagination, stable item boundaries, portrait embedding, and readable spacing. '.repeat(2)
        : end.textContent?.trim() || '负责需求拆解、方案实施和结果复盘。'
      end.textContent = `${stressCopy} ${endMarker}`
      item.setAttribute('data-pdf-qa-item', startMarker)
      markerItems.push({ start: startMarker, end: endMarker })
    })

    return {
      markup: sheet.outerHTML,
      markers: { title: titleMarker, items: markerItems },
    }
  }, {
    markup: sourceMarkup,
    contractData: template,
    fixtureMode: mode,
    uploadedPhotoPath: photoPath,
    repeatCount: LONG_REPEAT_COUNT,
  })
}

async function printPdf(browser, html, pdfPath, runtimeErrors, caseId, photoPath, baseUrl, layoutKey) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  captureRuntimeErrors(page, runtimeErrors, `print:${caseId}`)
  try {
    await page.setContent(html, { waitUntil: 'load', timeout: 30_000 })
    await page.emulateMedia({ media: 'print' })
    const imageEvidence = await page.evaluate(async ({ expectedPath, expectedOrigin, expectedLayoutKey }) => {
      await document.fonts?.ready
      const images = [...document.images]
      await Promise.all(images.map(async (image) => {
        if (!image.complete) {
          await new Promise((resolve, reject) => {
            image.addEventListener('load', resolve, { once: true })
            image.addEventListener('error', reject, { once: true })
          })
        }
        await image.decode?.()
        if (!image.naturalWidth || !image.naturalHeight) {
          throw new Error(`PDF image is not drawable: ${image.currentSrc || image.src}`)
        }
      }))
      const portrait = document.querySelector('img.resume-avatar')
      if (!(portrait instanceof HTMLImageElement)) {
        throw new Error('PDF portrait element is missing')
      }
      let classic = null
      if (expectedLayoutKey === 'qm-classic-centered') {
        const date = document.querySelector('[data-pdf-qa-item] .classic-centered-date')
          || document.querySelector('.classic-centered-date')
        const secondary = document.querySelector('.classic-centered-item-main > span')
        if (!(date instanceof HTMLElement) || !(secondary instanceof HTMLElement)) {
          throw new Error('Classic print alignment evidence elements are missing')
        }
        const rawSeparator = getComputedStyle(secondary, '::before').content
        const separator = rawSeparator.replace(/^['"]|['"]$/g, '')
        classic = {
          dateTextAlign: getComputedStyle(date).textAlign,
          dateText: date.textContent,
          separator,
          separatorCodePoints: [...separator].map((character) =>
            `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
          ),
        }
      }
      return {
        imageCount: images.length,
        srcAttribute: portrait.getAttribute('src'),
        currentSrc: portrait.currentSrc,
        expectedCurrentSrc: new URL(expectedPath, expectedOrigin).href,
        naturalWidth: portrait.naturalWidth,
        naturalHeight: portrait.naturalHeight,
        contentTypePath: new URL(portrait.currentSrc).pathname,
        classic,
      }
    }, { expectedPath: photoPath, expectedOrigin: baseUrl, expectedLayoutKey: layoutKey })
    if (imageEvidence.srcAttribute !== photoPath) {
      throw new Error(`${caseId}: portrait source was not preserved as ${photoPath}`)
    }
    if (imageEvidence.currentSrc !== imageEvidence.expectedCurrentSrc) {
      throw new Error(`${caseId}: portrait did not resolve against the QA origin`)
    }
    if (
      imageEvidence.naturalWidth !== RASTER_PORTRAIT_DIMENSIONS.width
      || imageEvidence.naturalHeight !== RASTER_PORTRAIT_DIMENSIONS.height
    ) {
      throw new Error(`${caseId}: HTTP portrait decoded with unexpected dimensions`)
    }
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    return imageEvidence
  } finally {
    await page.close()
  }
}

function inspectPdfsWithPyMuPdf(cases) {
  const python = resolvePyMuPdfPython()
  const payload = JSON.stringify(cases)
  const result = spawnSync(python, ['-c', PYTHON_INSPECTOR, payload], {
    cwd: projectRoot,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  })
  if (result.status !== 0) {
    throw new Error(
      `PyMuPDF inspection failed (${python}): ${(result.stderr || result.stdout || '').trim()}`,
    )
  }
  return JSON.parse(result.stdout)
}

function resolvePyMuPdfPython() {
  const candidates = [process.env.QA_PYTHON, 'python', 'python3'].filter(Boolean)
  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ['-c', 'import fitz; print(fitz.__doc__.split()[1])'], {
      encoding: 'utf8',
      windowsHide: true,
    })
    if (probe.status === 0) return candidate
  }
  throw new Error(
    'PyMuPDF is required for PDF evidence extraction. Install it with `python -m pip install pymupdf` or set QA_PYTHON.',
  )
}

function validateInspection(result, failures) {
  const local = []
  check(result.pageCount === result.pages.length, `${result.caseId}: PDF page tree is inconsistent`, local)
  if (result.mode === 'short') {
    check(result.pageCount === 1, `${result.caseId}: short fixture must be exactly one page, got ${result.pageCount}`, local)
  } else {
    check(result.pageCount >= 2, `${result.caseId}: long fixture must span at least two pages`, local)
    check(result.pageCount <= 4, `${result.caseId}: long fixture expanded to abnormal ${result.pageCount} pages`, local)
  }

  for (const page of result.pages) {
    check(
      Math.abs(page.width - A4_POINTS.width) <= 2
        && Math.abs(page.height - A4_POINTS.height) <= 2,
      `${result.caseId}: page ${page.pageNumber} is not A4 (${page.width} x ${page.height})`,
      local,
    )
  }
  check(result.uploadRequestCount >= 1, `${result.caseId}: same-origin upload URL was never requested`, local)
  check(result.printEvidence?.srcAttribute === result.photoPath, `${result.caseId}: print DOM did not retain the /uploads photo path`, local)
  check(result.printEvidence?.currentSrc === result.printEvidence?.expectedCurrentSrc, `${result.caseId}: /uploads photo did not resolve against the print origin`, local)
  check(
    result.printEvidence?.naturalWidth === RASTER_PORTRAIT_DIMENSIONS.width
      && result.printEvidence?.naturalHeight === RASTER_PORTRAIT_DIMENSIONS.height,
    `${result.caseId}: HTTP raster did not decode at ${RASTER_PORTRAIT_DIMENSIONS.width}x${RASTER_PORTRAIT_DIMENSIONS.height}`,
    local,
  )
  check(result.imageCount >= 1, `${result.caseId}: raster portrait was not embedded in the PDF`, local)
  check(
    result.embeddedRasterCount >= 1,
    `${result.caseId}: PDF has no embedded 4:5 upload raster (Chromium may resample by a few pixels)`,
    local,
  )
  if (result.layoutKey === 'qm-classic-centered') {
    const previewClassic = result.previewEvidence
    const printClassic = result.printEvidence?.classic
    check(Boolean(previewClassic), `${result.caseId}: classic preview alignment evidence is missing`, local)
    check(Boolean(printClassic), `${result.caseId}: classic print alignment evidence is missing`, local)
    check(previewClassic?.dateTextAlign === 'right', `${result.caseId}: classic preview date is not right-aligned`, local)
    check(printClassic?.dateTextAlign === 'right', `${result.caseId}: classic PDF date is not right-aligned`, local)
    check(
      previewClassic?.dateTextAlign === printClassic?.dateTextAlign,
      `${result.caseId}: classic date alignment differs between preview and PDF`,
      local,
    )
    check(previewClassic?.separator === '\u2014', `${result.caseId}: classic preview separator is not U+2014`, local)
    check(printClassic?.separator === '\u2014', `${result.caseId}: classic PDF separator is not U+2014`, local)
    check(
      previewClassic?.separator === printClassic?.separator,
      `${result.caseId}: classic separator differs between preview and PDF`,
      local,
    )
    check(
      !String(printClassic?.dateText || '').includes('\u2014'),
      `${result.caseId}: classic date text must keep its ASCII hyphen instead of U+2014`,
      local,
    )
  }
  // Chinese text extraction often reports a whole sentence as one or two
  // words, so combine character, word and rendered-ink evidence instead of
  // relying on an English-centric word threshold.
  check(result.lastPage.textCharacters >= 30, `${result.caseId}: trailing page has too little text`, local)
  check(result.lastPage.wordCount >= 2, `${result.caseId}: trailing page has too few words`, local)
  check(result.lastPage.nonWhiteRatio >= 0.01, `${result.caseId}: trailing page is visually blank`, local)

  const title = uniqueMarker(result, result.markers.title, local)
  const firstStart = uniqueMarker(result, result.markers.items[0]?.start, local)
  if (title && firstStart) {
    check(title.page === firstStart.page, `${result.caseId}: section title is orphaned from its first item`, local)
    check(firstStart.y0 >= title.y0 - 2, `${result.caseId}: first item precedes its section title`, local)
    check(firstStart.y0 - title.y1 <= 180, `${result.caseId}: title-to-first-item gap is abnormally large`, local)
  }

  for (const item of result.markers.items) {
    const start = uniqueMarker(result, item.start, local)
    const end = uniqueMarker(result, item.end, local)
    if (!start || !end) continue
    check(start.page === end.page, `${result.caseId}: item ${item.start} crosses a PDF page`, local)
    if (start.page === end.page) {
      check(end.y1 >= start.y0 - 2, `${result.caseId}: item ${item.start} has inverted PDF coordinates`, local)
    }
  }

  result.failures = [...result.failures, ...local]
  failures.push(...local)
}

function uniqueMarker(result, marker, failures) {
  if (!marker) {
    failures.push(`${result.caseId}: expected marker is missing from the fixture contract`)
    return null
  }
  const locations = result.markerLocations[marker] || []
  check(locations.length === 1, `${result.caseId}: marker ${marker} resolved ${locations.length} times`, failures)
  return locations.length === 1 ? locations[0] : null
}

function check(condition, message, failures) {
  if (!condition) failures.push(message)
}

const PYTHON_INSPECTOR = String.raw`
import json
import os
import sys

import fitz

cases = json.loads(sys.argv[1])
results = []
failures = []

def marker_locations(document, marker):
    found = []
    for page_index, page in enumerate(document):
        for rectangle in page.search_for(marker):
            found.append({
                "page": page_index + 1,
                "x0": round(rectangle.x0, 3),
                "y0": round(rectangle.y0, 3),
                "x1": round(rectangle.x1, 3),
                "y1": round(rectangle.y1, 3),
            })
    return found

def non_white_ratio(page):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(0.3, 0.3), alpha=False, colorspace=fitz.csRGB)
    channels = pixmap.n
    samples = pixmap.samples
    non_white = 0
    pixels = pixmap.width * pixmap.height
    for offset in range(0, len(samples), channels):
        if min(samples[offset:offset + 3]) < 245:
            non_white += 1
    return round(non_white / max(pixels, 1), 6)

for item in cases:
    result = {
        "caseId": item["caseId"],
        "layoutKey": item["layoutKey"],
        "mode": item["mode"],
        "pdfPath": item["pdfPath"],
        "renderDirectory": item["renderDirectory"],
        "markers": item["markers"],
        "markerLocations": {},
        "pages": [],
        "imageCount": 0,
        "embeddedImages": [],
        "embeddedRasterCount": 0,
        "failures": [],
    }
    try:
        document = fitz.open(item["pdfPath"])
        result["pageCount"] = document.page_count
        image_xrefs = {}
        os.makedirs(item["renderDirectory"], exist_ok=True)

        for page_index, page in enumerate(document):
            text = page.get_text("text")
            words = page.get_text("words")
            for image in page.get_images(full=True):
                if image and image[0] > 0:
                    image_xrefs[image[0]] = {
                        "xref": image[0],
                        "width": image[2],
                        "height": image[3],
                        "bitsPerComponent": image[4],
                        "colorSpace": image[5],
                    }
            rendered = page.get_pixmap(matrix=fitz.Matrix(1.2, 1.2), alpha=False, colorspace=fitz.csRGB)
            rendered.save(os.path.join(item["renderDirectory"], f"page-{page_index + 1}.png"))
            result["pages"].append({
                "pageNumber": page_index + 1,
                "width": round(page.rect.width, 3),
                "height": round(page.rect.height, 3),
                "textCharacters": len("".join(text.split())),
                "wordCount": len(words),
                "nonWhiteRatio": non_white_ratio(page),
            })

        result["imageCount"] = len(image_xrefs)
        result["embeddedImages"] = list(image_xrefs.values())
        result["embeddedRasterCount"] = sum(
            1 for image in result["embeddedImages"]
            if image["height"] == 200
            and abs((image["width"] / max(image["height"], 1)) - 0.8) <= 0.02
        )
        markers = [item["markers"]["title"]]
        for marker_pair in item["markers"]["items"]:
            markers.extend([marker_pair["start"], marker_pair["end"]])
        for marker in markers:
            result["markerLocations"][marker] = marker_locations(document, marker)
        result["lastPage"] = result["pages"][-1] if result["pages"] else {
            "textCharacters": 0,
            "wordCount": 0,
            "nonWhiteRatio": 0,
        }
        document.close()
    except Exception as error:
        message = f'{item["caseId"]}: {type(error).__name__}: {error}'
        result["failures"].append(message)
        failures.append(message)
        result.setdefault("pageCount", 0)
        result.setdefault("lastPage", {"textCharacters": 0, "wordCount": 0, "nonWhiteRatio": 0})
    results.append(result)

print(json.dumps({"results": results, "failures": failures}, ensure_ascii=False))
`

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exitCode = 1
})
