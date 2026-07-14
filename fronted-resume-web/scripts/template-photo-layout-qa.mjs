import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')
const artifactDirectory = path.resolve(
  process.env.QA_ARTIFACT_DIR || path.join(projectRoot, 'runtime-logs', 'template-photo-layout-qa'),
)
const defaultAvatarPath = path.resolve(projectRoot, '..', 'backed-resume', 'public', 'mock', 'avatar', 'default.svg')
const defaultAvatarDimensions = { width: 400, height: 500 }

const TEMPLATE_CONTRACTS = [
  contract('qm-blue-top-photo', 'ats', 'header-right', 'square', 96, 120, '.qm-blue-avatar', 'right', {
    primaryRoot: '.qm-blue-section:has(.section-item)', itemSelector: '.section-item',
    companySelector: '.qm-blue-item-main h3', titleSelector: '.qm-blue-item-main > span',
    dateSelector: '.qm-blue-date', descriptionSelector: '.item-description',
  }),
  contract('qm-sidebar-profile', 'sidebar', 'sidebar-top', 'square', 104, 130, '.sidebar-avatar', 'left', {
    primaryRoot: '.sidebar-main .resume-section:has(.section-item)', auxiliaryRoot: '.sidebar-column',
    itemSelector: '.section-item', companySelector: '.item-heading h3', titleSelector: '.item-heading > span',
    dateSelector: '.item-subheading span', descriptionSelector: '.item-description',
  }),
  contract('qm-classic-centered', 'classic', 'header-right', 'square', 88, 110, '.classic-centered-avatar', 'right', {
    primaryRoot: '.classic-centered-section:has(.section-item)', itemSelector: '.section-item',
    companySelector: '.classic-centered-item-main h3', titleSelector: '.classic-centered-item-main > span',
    dateSelector: '.classic-centered-date', descriptionSelector: '.item-description',
  }),
  contract('qm-ribbon-compact', 'compact', 'default', 'square', 96, 120, '.resume-header .resume-avatar', 'left', {
    primaryRoot: '.resume-section:has(.section-item)', itemSelector: '.section-item',
    companySelector: '.item-heading h3', titleSelector: '.item-heading > span',
    dateSelector: '.item-subheading span', descriptionSelector: '.item-description',
  }),
  contract('qm-timeline-icons', 'timeline', 'meta-card', 'square', 88, 110, '.timeline-avatar', 'middle', {
    primaryRoot: '.timeline-section:has(.timeline-card)', itemSelector: '.timeline-card',
    companySelector: '.timeline-card-top h3', titleSelector: '.timeline-card-top p',
    dateSelector: '.timeline-date', descriptionSelector: '.item-description',
  }),
  contract('qm-minimal-ats', 'ats', 'header-right', 'square', 72, 90, '.ats-avatar', 'right', {
    primaryRoot: '.ats-section:has(.ats-item)', itemSelector: '.ats-item',
    companySelector: '.ats-item-header h3', titleSelector: '.ats-item-header p',
    dateSelector: '.ats-item-header time', descriptionSelector: '.ats-description',
  }),
  contract('qm-executive-business', 'executive', 'header-right', 'square', 96, 120, '.resume-header .resume-avatar', 'right', {
    primaryRoot: '.resume-section:has(.section-item)', itemSelector: '.section-item',
    companySelector: '.item-heading h3', titleSelector: '.item-heading > span',
    dateSelector: '.item-subheading span', descriptionSelector: '.item-description',
  }),
  contract('qm-student-editorial', 'editorial', 'header-right', 'square', 88, 110, '.student-avatar', 'right', {
    primaryRoot: '.student-section:has(.student-item)', itemSelector: '.student-item',
    companySelector: '.student-item-header h3', titleSelector: '.student-item-header p',
    dateSelector: '.student-item-header time', descriptionSelector: '.student-description',
  }),
  contract('qm-spotlight-featured', 'spotlight', 'meta-card', 'rounded', 96, 120, '.spotlight-avatar', 'right', {
    primaryRoot: '.spotlight-main .spotlight-section:has(.spotlight-card)', auxiliaryRoot: '.spotlight-side',
    itemSelector: '.spotlight-card', companySelector: '.spotlight-card-head h3', titleSelector: '.spotlight-card-head p',
    dateSelector: '.spotlight-date', descriptionSelector: '.item-description',
  }),
  contract('qm-table-formal', 'classic', 'header-right', 'square', 78, 98, '.formal-profile-photo .resume-avatar', 'right', {
    primaryRoot: '.formal-table-section:has(.formal-table-items)', itemSelector: '.formal-table-items > article',
    companySelector: '.formal-item-meta strong', titleSelector: '.formal-item-meta span',
    dateSelector: '.formal-item-meta time', descriptionSelector: ':scope > p',
  }),
  contract('qm-asymmetric-profile', 'editorial', 'header-right', 'square', 104, 130, '.asymmetric-anchor .asymmetric-avatar', 'middle', {
    primaryRoot: '.asymmetric-right .asymmetric-story-section:has(article)', auxiliaryRoot: '.asymmetric-left',
    itemSelector: ':scope > article', companySelector: '.asymmetric-story-head h3', titleSelector: '.asymmetric-story-head p',
    dateSelector: '.asymmetric-story-head time', descriptionSelector: '.asymmetric-description',
  }),
]

const CONTRACT_BY_KEY = new Map(TEMPLATE_CONTRACTS.map((item) => [item.layoutKey, item]))
async function main() {
  await mkdir(artifactDirectory, { recursive: true })

  let viteServer
  let browser
  const results = []
  const failures = []
  const runtimeErrors = []

  try {
    const baseUrl = process.env.QA_BASE_URL || await startLocalViteServer()
    viteServer = baseUrl.server
    const resolvedBaseUrl = baseUrl.url || baseUrl

    browser = await launchBrowser()
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 })
    installRuntimeErrorCapture(page, runtimeErrors)
    await installDeterministicApi(page)

    await page.goto(`${resolvedBaseUrl}/templates?qa=template-photo-layout`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })
    await page.addStyleTag({
      content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}',
    })
    await page.waitForSelector('.template-card .resume-sheet', { timeout: 15_000 })

    const seenLayouts = new Set()
    for (let pageIndex = 0; pageIndex < 5 && seenLayouts.size < TEMPLATE_CONTRACTS.length; pageIndex += 1) {
      const cards = page.locator('.template-card')
      const cardCount = await cards.count()

      for (let cardIndex = 0; cardIndex < cardCount; cardIndex += 1) {
        const card = cards.nth(cardIndex)
        const layoutKey = await card.locator('.resume-sheet').evaluate((sheet) =>
          [...sheet.classList].find((value) => value.startsWith('layout-'))?.slice('layout-'.length) || '',
        )
        if (!layoutKey || seenLayouts.has(layoutKey)) continue
        seenLayouts.add(layoutKey)

        const expected = CONTRACT_BY_KEY.get(layoutKey)
        check(Boolean(expected), `${layoutKey || '<missing>'}: unexpected or missing layout key`, failures)
        if (!expected) continue

        const cardPhoto = card.locator('.resume-sheet img[alt="个人照片"]')
        check(await cardPhoto.count() === 1, `${layoutKey}: card must render exactly one default photo`, failures)
        if (await cardPhoto.count()) {
          const cardPhotoMetrics = await cardPhoto.first().evaluate((image) => ({
            decoded: image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
          }))
          check(cardPhotoMetrics.decoded, `${layoutKey}: card photo did not decode`, failures)
          check(
            cardPhotoMetrics.naturalWidth === defaultAvatarDimensions.width
              && cardPhotoMetrics.naturalHeight === defaultAvatarDimensions.height,
            `${layoutKey}: card did not decode the real ${defaultAvatarDimensions.width}x${defaultAvatarDimensions.height} default portrait`,
            failures,
          )
        }

        await card.locator('.template-actions button').nth(1).click()
        const dialogSheet = page.locator(`.el-dialog:visible .resume-sheet.layout-${layoutKey}`)
        await dialogSheet.waitFor({ state: 'visible', timeout: 10_000 })
        await page.waitForFunction(
          (selector) => {
            const dialog = [...document.querySelectorAll('.el-dialog')]
              .find((item) => item.getBoundingClientRect().width > 0 && item.getBoundingClientRect().height > 0)
            const image = dialog?.querySelector(selector)
            return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0
          },
          expected.photoSelector,
          { timeout: 10_000 },
        )

        const photoMetrics = await dialogSheet.evaluate((sheet, contractData) => {
          const image = sheet.querySelector(contractData.photoSelector)
          if (!(image instanceof HTMLImageElement)) return null
          const sheetRect = sheet.getBoundingClientRect()
          const imageRect = image.getBoundingClientRect()
          const computed = getComputedStyle(image)
          const textRects = [...sheet.querySelectorAll('h1,.resume-name,.resume-role')]
            .map((item) => item.getBoundingClientRect())
            .filter((rect) => rect.width > 0 && rect.height > 0)
          const overlapArea = textRects.reduce((total, rect) => {
            const width = Math.max(0, Math.min(rect.right, imageRect.right) - Math.max(rect.left, imageRect.left))
            const height = Math.max(0, Math.min(rect.bottom, imageRect.bottom) - Math.max(rect.top, imageRect.top))
            return total + width * height
          }, 0)

          return {
            count: sheet.querySelectorAll('img[alt="个人照片"]').length,
            decoded: image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
            width: imageRect.width,
            height: imageRect.height,
            xRatio: (imageRect.left + imageRect.width / 2 - sheetRect.left) / sheetRect.width,
            yRatio: (imageRect.top + imageRect.height / 2 - sheetRect.top) / sheetRect.height,
            withinSheet:
              imageRect.left >= sheetRect.left - 1 && imageRect.right <= sheetRect.right + 1
              && imageRect.top >= sheetRect.top - 1 && imageRect.bottom <= sheetRect.bottom + 1,
            overflowX: Math.max(sheet.scrollWidth - sheet.clientWidth, 0),
            objectFit: computed.objectFit,
            objectPosition: computed.objectPosition,
            overlapArea,
          }
        }, expected)

        check(Boolean(photoMetrics), `${layoutKey}: expected photo selector ${expected.photoSelector} was not rendered`, failures)
        if (photoMetrics) {
          check(photoMetrics.count === 1, `${layoutKey}: preview must render exactly one photo`, failures)
          check(photoMetrics.decoded, `${layoutKey}: preview photo did not decode`, failures)
          check(
            photoMetrics.naturalWidth === defaultAvatarDimensions.width
              && photoMetrics.naturalHeight === defaultAvatarDimensions.height,
            `${layoutKey}: preview did not decode the real ${defaultAvatarDimensions.width}x${defaultAvatarDimensions.height} default portrait`,
            failures,
          )
          check(
            Math.abs(photoMetrics.naturalWidth / photoMetrics.naturalHeight - 0.8) <= 0.01,
            `${layoutKey}: default photo asset must retain a 4:5 portrait ratio`,
            failures,
          )
          check(Math.abs(photoMetrics.width - expected.width) <= 2, `${layoutKey}: photo width ${photoMetrics.width} != ${expected.width}`, failures)
          check(Math.abs(photoMetrics.height - expected.height) <= 2, `${layoutKey}: photo height ${photoMetrics.height} != ${expected.height}`, failures)
          check(photoMetrics.withinSheet, `${layoutKey}: photo escapes the resume sheet`, failures)
          check(photoMetrics.overflowX <= 1, `${layoutKey}: preview has ${photoMetrics.overflowX}px horizontal overflow`, failures)
          check(photoMetrics.objectFit === 'cover', `${layoutKey}: photo object-fit must be cover`, failures)
          check(photoMetrics.objectPosition === '50% 20%', `${layoutKey}: photo object-position must be center 20%`, failures)
          check(photoMetrics.overlapArea <= 1, `${layoutKey}: photo overlaps identity text`, failures)
          check(photoMetrics.yRatio < 0.34, `${layoutKey}: photo is not positioned in the top identity region`, failures)
          checkPhotoRegion(layoutKey, expected.region, photoMetrics.xRatio, failures)
        }

        const stress = await buildStressArtifacts(page, expected)
        check(stress.short.overflowX <= 1, `${layoutKey}: deterministic short resume overflows horizontally`, failures)
        check(stress.short.horizontalOverflow.length === 0, `${layoutKey}: short fixture contains element-level horizontal overflow`, failures)
        check(stress.short.estimatedPages === 1, `${layoutKey}: deterministic short resume must fit exactly one page`, failures)
        check(stress.long.overflowX <= 1, `${layoutKey}: deterministic long resume overflows horizontally`, failures)
        check(stress.long.horizontalOverflow.length === 0, `${layoutKey}: long fixture contains element-level horizontal overflow`, failures)
        check(
          stress.long.scrollHeight >= stress.short.scrollHeight + 400,
          `${layoutKey}: long stress fixture did not expand naturally (${stress.short.scrollHeight} -> ${stress.long.scrollHeight})`,
          failures,
        )
        check(stress.long.estimatedPages >= 2 && stress.long.estimatedPages <= 4, `${layoutKey}: long fixture must paginate naturally within 2-4 pages (got ${stress.long.estimatedPages})`, failures)
        check(stress.long.markers.contact === 1, `${layoutKey}: long fixture must exercise exactly one contact value`, failures)
        check(stress.long.markers.company === 7, `${layoutKey}: long fixture must exercise exactly seven company values`, failures)
        check(stress.long.markers.title === 7, `${layoutKey}: long fixture must exercise exactly seven role/title values`, failures)
        check(stress.long.markers.date === 7, `${layoutKey}: long fixture must exercise exactly seven date values`, failures)
        check(stress.long.stressMarkerCount === 22, `${layoutKey}: long fixture marker count must be exactly 22`, failures)
        check(stress.long.primaryStressItems === 7, `${layoutKey}: all seven native stress items must remain in the primary content root`, failures)
        check(stress.long.auxiliaryStressItems === 0, `${layoutKey}: stress items leaked into an auxiliary/sidebar root`, failures)
        check(stress.short.primaryItemCount >= 1, `${layoutKey}: short fixture lost its native primary content`, failures)
        check(stress.short.primaryTextLength >= 15, `${layoutKey}: short fixture primary content is unexpectedly empty`, failures)
        check(stress.short.verticalTextIssues.length === 0, `${layoutKey}: short fixture contains collapsed or character-stacked text`, failures)
        check(stress.long.verticalTextIssues.length === 0, `${layoutKey}: long fixture contains collapsed or character-stacked text`, failures)
        check(stress.long.email?.validBreaks === true, `${layoutKey}: long email wrapped outside semantic punctuation boundaries`, failures)
        check(stress.long.email?.overflow === 0, `${layoutKey}: long email overflows its contact value container`, failures)
        check(stress.long.email?.wordBreak !== 'break-all', `${layoutKey}: contact value uses break-all`, failures)
        check(stress.long.itemHeightRatio < 1.35, `${layoutKey}: repeated native items have unstable heights (ratio ${stress.long.itemHeightRatio})`, failures)
        check(stress.long.maxItemPageRatio < 0.45, `${layoutKey}: one native item consumes too much of a physical page`, failures)
        if (stress.short.columnAlignment) {
          check(stress.short.columnAlignment.topDelta <= 2, `${layoutKey}: short column tops are misaligned`, failures)
          check(stress.short.columnAlignment.bottomDelta <= 2, `${layoutKey}: short columns do not share a stable visual height`, failures)
        }
        if (stress.long.columnAlignment) {
          check(stress.long.columnAlignment.topDelta <= 2, `${layoutKey}: long column tops are misaligned`, failures)
          check(stress.long.columnAlignment.bottomDelta <= 2, `${layoutKey}: long columns do not extend together`, failures)
        }
        if (layoutKey === 'qm-table-formal') {
          const formal = stress.long.formalDescription
          check(Boolean(formal?.parentIsNativeArticle), `${layoutKey}: stressed description escaped the native formal article`, failures)
          check(formal?.paddingLeft >= 11 && formal?.paddingLeft <= 13, `${layoutKey}: formal description left padding regressed`, failures)
          check(formal?.paddingRight >= 11 && formal?.paddingRight <= 13, `${layoutKey}: formal description right padding regressed`, failures)
          check(formal?.paddingTop >= 8 && formal?.paddingTop <= 10, `${layoutKey}: formal description top padding regressed`, failures)
          check(formal?.paddingBottom >= 10 && formal?.paddingBottom <= 12, `${layoutKey}: formal description bottom padding regressed`, failures)
        }
        check(Boolean(stress.long.date), `${layoutKey}: long fixture did not expose a date field`, failures)
        if (stress.long.date) {
          check(stress.long.date.lineCount === 1, `${layoutKey}: date must remain on one line (got ${stress.long.date.lineCount})`, failures)
          check(stress.long.date.wordBreak !== 'break-all', `${layoutKey}: date uses break-all and may split character-by-character`, failures)
        }

        results.push({ layoutKey, photo: photoMetrics, stress })
        await page.locator('.el-dialog:visible .el-dialog__headerbtn').click()
        await page.locator('.el-dialog').waitFor({ state: 'hidden', timeout: 5_000 })
      }

      const next = page.locator('.el-pagination .btn-next')
      if (!await next.count() || await next.isDisabled()) break
      await next.click()
      await page.waitForTimeout(150)
      await page.waitForSelector('.template-card .resume-sheet', { timeout: 5_000 })
    }

    check(seenLayouts.size === TEMPLATE_CONTRACTS.length, `rendered ${seenLayouts.size}/11 unique layouts`, failures)
    for (const expected of TEMPLATE_CONTRACTS) {
      check(seenLayouts.has(expected.layoutKey), `${expected.layoutKey}: layout was not rendered`, failures)
    }
    const longPageCounts = results.map((item) => item.stress.long.estimatedPages).sort((a, b) => a - b)
    const medianLongPages = longPageCounts[Math.floor(longPageCounts.length / 2)] || 0
    for (const item of results) {
      check(
        item.stress.long.estimatedPages <= medianLongPages + 1,
        `${item.layoutKey}: page count ${item.stress.long.estimatedPages} is anomalous against median ${medianLongPages}`,
        failures,
      )
    }
    failures.push(...runtimeErrors.map((error) => `runtime: ${error}`))
  } finally {
    const report = {
      expectedLayoutCount: TEMPLATE_CONTRACTS.length,
      renderedLayoutCount: results.length,
      failures,
      runtimeErrors,
      results,
    }
    await writeFile(path.join(artifactDirectory, 'results.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    console.log(JSON.stringify({
      expectedLayoutCount: report.expectedLayoutCount,
      renderedLayoutCount: report.renderedLayoutCount,
      failures: report.failures,
      runtimeErrors: report.runtimeErrors,
      shortLayoutChecks: results.filter((item) => item.stress.short.estimatedPages === 1).length,
      naturalMultiPageChecks: results.filter((item) => item.stress.long.estimatedPages >= 2).length,
      artifactDirectory,
    }, null, 2))
    await browser?.close()
    await viteServer?.close()
  }

  if (failures.length) {
    throw new Error(`template photo/layout QA failed with ${failures.length} issue(s)`)
  }
}

function contract(layoutKey, variant, placement, shape, width, height, photoSelector, region, structure) {
  return {
    layoutKey,
    variant,
    avatar: { enabled: true, placement, shape, width, height, objectPosition: 'center 20%' },
    width,
    height,
    photoSelector,
    region,
    ...structure,
  }
}

async function startLocalViteServer() {
  const server = await createServer({
    root: projectRoot,
    logLevel: 'error',
    server: { host: '127.0.0.1', port: 0, strictPort: false },
  })
  await server.listen()
  const address = server.httpServer?.address()
  if (!address || typeof address === 'string') throw new Error('Vite did not expose a local QA port')
  return { server, url: `http://127.0.0.1:${address.port}` }
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

function installRuntimeErrorCapture(page, errors) {
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('response', (response) => {
    if (response.status() >= 500) errors.push(`${response.status()} ${response.url()}`)
  })
}

async function installDeterministicApi(page) {
  const portraitSvg = await readFile(defaultAvatarPath, 'utf8')
  const list = TEMPLATE_CONTRACTS.map((item, index) => ({
    id: index + 1,
    templateName: `QA ${item.layoutKey}`,
    templateVariant: item.variant,
    layoutKey: item.layoutKey,
    previewImage: '',
    industryTags: 'QA,photo,layout',
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
      const pageNumber = Number(url.searchParams.get('page') || 1)
      const limit = Number(url.searchParams.get('limit') || 100)
      const start = Math.max(0, (pageNumber - 1) * limit)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: { list: list.slice(start, start + limit), total: list.length, page: pageNumber, limit },
        }),
      })
      return
    }

    const detailMatch = url.pathname.match(/^\/api\/templates\/(\d+)$/)
    if (detailMatch) {
      const id = Number(detailMatch[1])
      const item = TEMPLATE_CONTRACTS[id - 1]
      if (!item) {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ code: 404 }) })
        return
      }
      const metadata = list[id - 1]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: {
            ...metadata,
            templateData: JSON.stringify({
              variant: item.variant,
              layoutKey: item.layoutKey,
              layout: { key: item.layoutKey, variant: item.variant, avatar: item.avatar },
              profile: { avatar: item.avatar },
              theme: {
                variant: item.variant,
                colors: { primary: '#31577b', accent: '#e8eff5' },
                typography: { fontFamily: { body: 'Arial, sans-serif', heading: 'Arial, sans-serif' } },
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

async function buildLegacyStressArtifacts(page, dialogSheet, layoutKey) {
  await page.evaluate(({ key }) => {
    document.getElementById('qa-layout-artifact-host')?.remove()
    const dialog = [...document.querySelectorAll('.el-dialog')]
      .find((item) => item.getBoundingClientRect().width > 0 && item.getBoundingClientRect().height > 0)
    const source = dialog?.querySelector(`.resume-sheet.layout-${key}`)
    if (!(source instanceof HTMLElement)) throw new Error(`${key}: source sheet missing for stress fixture`)

    const host = document.createElement('div')
    host.id = 'qa-layout-artifact-host'
    host.style.cssText = 'position:absolute;inset:0 auto auto 0;z-index:2147483647;width:900px;padding:20px;background:#f8fafc;'

    const makeSheet = (mode) => {
      const clone = source.cloneNode(true)
      clone.id = `qa-${mode}-sheet`
      clone.style.transform = 'none'
      clone.style.margin = '0'
      clone.style.width = `${source.getBoundingClientRect().width}px`

      const sections = [...clone.querySelectorAll('section')]
      if (mode === 'short') {
        sections.slice(1).forEach((section) => section.remove())
      } else {
        const longEmail = 'candidate.with.long.contact.address@international-platform.example.com'
        const emailCandidates = [...clone.querySelectorAll('strong,a,span,em,td,p,div')]
          .filter((item) => item.textContent?.includes('@'))
        const emailTarget = emailCandidates.find((item) =>
          ![...item.children].some((child) => child.textContent?.includes('@')),
        ) || emailCandidates.at(-1)
        if (emailTarget) {
          emailTarget.textContent = longEmail
          emailTarget.setAttribute('data-qa-long-email', 'true')
        }

        const seed = sections.find((section) => section.querySelector('article,h3,time,[class*="date"]'))
          || sections.find((section) => section.textContent?.trim())
          || sections[0]
        if (!seed?.parentElement) throw new Error(`${key}: no native section available for long stress fixture`)
        const parent = seed.parentElement

        const enrichSection = (section, index) => {
          let company = section.querySelector('article h3,h3,h4,.item-title,article strong,strong')
          if (!company) {
            company = document.createElement('h3')
            company.className = 'item-title qa-stress-company'
            section.prepend(company)
          }
          company.textContent = `Global Digital Transformation and Applied Intelligence Center ${index}`
          company.setAttribute('data-qa-long-company', 'true')

          const role = document.createElement('p')
          role.className = 'item-description qa-stress-role'
          role.setAttribute('data-qa-long-role', 'true')
          role.textContent = 'Senior Cross-Functional Product Engineering and Delivery Lead'
          section.append(role)

          const date = section.querySelector('[class*="date"],time,.item-subheading span')
          if (date) {
            date.textContent = '2021.09 – 2026.07'
            date.setAttribute('data-qa-long-date', 'true')
            date.textContent = '2021.09 - 2026.07'
          }
        }

        enrichSection(seed, 0)
        for (let index = 0; index < 6; index += 1) {
          const repeated = seed.cloneNode(true)
          repeated.setAttribute('data-qa-stress-section', String(index + 1))
          enrichSection(repeated, index + 1)
          const paragraph = document.createElement('p')
          paragraph.className = 'item-description qa-stress-copy'
          paragraph.textContent = `QA_STRESS_${String(index + 1).padStart(2, '0')} deterministic resume content validates natural multi-page growth, wrapping, spacing, and stable portrait placement. `.repeat(3)
          repeated.append(paragraph)
          parent.append(repeated)
        }
      }
      return clone
    }

    host.append(makeSheet('short'), makeSheet('long'))
    document.body.append(host)
  }, { key: layoutKey })

  const shortSheet = page.locator('#qa-short-sheet')
  const longSheet = page.locator('#qa-long-sheet')
  const shortPath = path.join(artifactDirectory, `${layoutKey}-short.png`)
  const longPath = path.join(artifactDirectory, `${layoutKey}-long.png`)
  await shortSheet.screenshot({ path: shortPath, animations: 'disabled' })
  await longSheet.screenshot({ path: longPath, animations: 'disabled' })

  const metrics = await page.evaluate(() => {
    const describeHorizontalOverflow = (sheet) => {
      const sheetRect = sheet.getBoundingClientRect()
      return [...sheet.querySelectorAll('*')]
        .map((element) => {
          const rect = element.getBoundingClientRect()
          const computed = getComputedStyle(element)
          const overflowLeft = Math.max(sheetRect.left - rect.left, 0)
          const overflowRight = Math.max(rect.right - sheetRect.right, 0)
          return {
            element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${[...element.classList].map((name) => `.${name}`).join('')}`,
            overflowLeft: Math.round(overflowLeft * 100) / 100,
            overflowRight: Math.round(overflowRight * 100) / 100,
            width: Math.round(rect.width * 100) / 100,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            display: computed.display,
            minWidth: computed.minWidth,
            overflowWrap: computed.overflowWrap,
            wordBreak: computed.wordBreak,
            whiteSpace: computed.whiteSpace,
            text: element.children.length === 0 ? element.textContent?.trim().slice(0, 160) : undefined,
          }
        })
        .filter((item) => item.overflowLeft > 1 || item.overflowRight > 1 || item.scrollWidth > item.clientWidth + 1)
        .sort((a, b) => Math.max(b.overflowLeft, b.overflowRight, b.scrollWidth - b.clientWidth)
          - Math.max(a.overflowLeft, a.overflowRight, a.scrollWidth - a.clientWidth))
        .slice(0, 12)
    }

    const readDateMetrics = (date) => {
      if (!(date instanceof HTMLElement)) return null
      const range = document.createRange()
      range.selectNodeContents(date)
      const lineTops = new Set(
        [...range.getClientRects()]
          .filter((rect) => rect.width > 0 && rect.height > 0)
          .map((rect) => Math.round(rect.top)),
      )
      const computed = getComputedStyle(date)
      return {
        text: date.textContent,
        lineCount: lineTops.size,
        wordBreak: computed.wordBreak,
        whiteSpace: computed.whiteSpace,
      }
    }

    const read = (id) => {
      const sheet = document.getElementById(id)
      if (!(sheet instanceof HTMLElement)) throw new Error(`${id} missing`)
      return {
        width: sheet.getBoundingClientRect().width,
        height: sheet.getBoundingClientRect().height,
        scrollHeight: sheet.scrollHeight,
        overflowX: Math.max(sheet.scrollWidth - sheet.clientWidth, 0),
        estimatedPages: Math.max(1, Math.ceil(sheet.scrollHeight / 1120)),
        stressMarkerCount: sheet.querySelectorAll(
          '[data-qa-long-email],[data-qa-long-company],[data-qa-long-role],[data-qa-long-date]',
        ).length,
        markers: {
          contact: sheet.querySelectorAll('[data-qa-long-email]').length,
          company: sheet.querySelectorAll('[data-qa-long-company]').length,
          title: sheet.querySelectorAll('[data-qa-long-role]').length,
          date: sheet.querySelectorAll('[data-qa-long-date]').length,
        },
        date: readDateMetrics(sheet.querySelector('[data-qa-long-date]')),
        horizontalOverflow: describeHorizontalOverflow(sheet),
      }
    }
    return { short: read('qa-short-sheet'), long: read('qa-long-sheet') }
  })

  metrics.short.screenshotSha256 = await sha256(shortPath)
  metrics.long.screenshotSha256 = await sha256(longPath)
  await page.evaluate(() => document.getElementById('qa-layout-artifact-host')?.remove())
  return metrics
}

async function buildStressArtifacts(page, contractData) {
  await page.evaluate((contract) => {
    document.getElementById('qa-layout-artifact-host')?.remove()
    const dialog = [...document.querySelectorAll('.el-dialog')]
      .find((item) => item.getBoundingClientRect().width > 0 && item.getBoundingClientRect().height > 0)
    const source = dialog?.querySelector(`.resume-sheet.layout-${contract.layoutKey}`)
    if (!(source instanceof HTMLElement)) throw new Error(`${contract.layoutKey}: source sheet missing`)

    const host = document.createElement('div')
    host.id = 'qa-layout-artifact-host'
    host.style.cssText = 'position:absolute;inset:0 auto auto 0;z-index:2147483647;width:900px;padding:20px;background:#f8fafc;'

    const makeSheet = (mode) => {
      const clone = source.cloneNode(true)
      clone.id = `qa-${mode}-sheet`
      clone.style.transform = 'none'
      clone.style.margin = '0'
      clone.style.width = `${source.getBoundingClientRect().width}px`

      if (mode === 'long') {
        const longEmail = 'candidate.with.long.contact.address@international-platform.example.com'
        const emailCandidates = [...clone.querySelectorAll(
          '[data-contact-kind="email"] .contact-value,[data-contact-kind="email"],strong,a,span,em,td,p,div',
        )].filter((item) => item.textContent?.includes('@'))
        const emailTarget = emailCandidates.find((item) => item.classList.contains('contact-value'))
          || emailCandidates.find((item) => ![...item.children].some((child) => child.textContent?.includes('@')))
        if (!(emailTarget instanceof HTMLElement)) {
          throw new Error(`${contract.layoutKey}: semantic email value is missing`)
        }
        emailTarget.textContent = longEmail.replace(/([@._/\\-])/g, '$1\u200B')
        emailTarget.setAttribute('data-qa-long-email', 'true')

        const rootCandidates = [...clone.querySelectorAll(contract.primaryRoot)]
        let primaryRoot = null
        let seed = null
        for (const root of rootCandidates) {
          const items = [...root.querySelectorAll(contract.itemSelector)]
          const completeItem = items.find((item) => [
            contract.companySelector,
            contract.titleSelector,
            contract.dateSelector,
            contract.descriptionSelector,
          ].every((selector) => item.querySelector(selector)))
          if (completeItem) {
            primaryRoot = root
            seed = completeItem
            break
          }
        }
        if (!(primaryRoot instanceof HTMLElement)) {
          throw new Error(`${contract.layoutKey}: primary root ${contract.primaryRoot} is missing`)
        }
        primaryRoot.setAttribute('data-qa-primary-root', 'true')
        if (!(seed instanceof HTMLElement) || !seed.parentElement) {
          throw new Error(`${contract.layoutKey}: no native item exposes company, title, date and description fields`)
        }
        const parent = seed.parentElement
        const itemTemplate = seed.cloneNode(true)

        const enrichItem = (item, index) => {
          const fields = {
            company: item.querySelector(contract.companySelector),
            title: item.querySelector(contract.titleSelector),
            date: item.querySelector(contract.dateSelector),
            description: item.querySelector(contract.descriptionSelector),
          }
          for (const [name, field] of Object.entries(fields)) {
            if (!(field instanceof HTMLElement)) {
              throw new Error(`${contract.layoutKey}: native ${name} field is missing in ${contract.itemSelector}`)
            }
          }
          fields.company.textContent = `Global Digital Transformation and Applied Intelligence Center ${index}`
          fields.company.setAttribute('data-qa-long-company', 'true')
          fields.title.textContent = 'Senior Cross-Functional Product Engineering and Delivery Lead'
          fields.title.setAttribute('data-qa-long-role', 'true')
          fields.date.textContent = '2021.09 - 2026.07'
          fields.date.setAttribute('data-qa-long-date', 'true')
          fields.description.textContent = `QA_STRESS_${String(index + 1).padStart(2, '0')} deterministic resume content validates natural multi-page growth, semantic wrapping, balanced spacing, stable portrait placement, and reliable PDF pagination. `.repeat(4)
          item.setAttribute('data-qa-stress-item', String(index + 1))
        }

        enrichItem(seed, 0)
        for (let index = 0; index < 6; index += 1) {
          const repeated = itemTemplate.cloneNode(true)
          enrichItem(repeated, index + 1)
          parent.append(repeated)
        }
      }
      return clone
    }

    host.append(makeSheet('short'), makeSheet('long'))
    document.body.append(host)
  }, contractData)

  const shortSheet = page.locator('#qa-short-sheet')
  const longSheet = page.locator('#qa-long-sheet')
  const shortPath = path.join(artifactDirectory, `${contractData.layoutKey}-short.png`)
  const longPath = path.join(artifactDirectory, `${contractData.layoutKey}-long.png`)
  await shortSheet.screenshot({ path: shortPath, animations: 'disabled' })
  await longSheet.screenshot({ path: longPath, animations: 'disabled' })

  const metrics = await page.evaluate((contract) => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.height > 0
    }

    const describeHorizontalOverflow = (sheet) => {
      const sheetRect = sheet.getBoundingClientRect()
      return [...sheet.querySelectorAll('*')]
        .filter(visible)
        .map((element) => {
          const rect = element.getBoundingClientRect()
          const computed = getComputedStyle(element)
          return {
            element: `${element.tagName.toLowerCase()}${[...element.classList].map((name) => `.${name}`).join('')}`,
            overflowLeft: Math.round(Math.max(sheetRect.left - rect.left, 0) * 100) / 100,
            overflowRight: Math.round(Math.max(rect.right - sheetRect.right, 0) * 100) / 100,
            width: Math.round(rect.width * 100) / 100,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            overflowWrap: computed.overflowWrap,
            wordBreak: computed.wordBreak,
            whiteSpace: computed.whiteSpace,
            text: element.children.length === 0 ? element.textContent?.trim().slice(0, 120) : undefined,
          }
        })
        .filter((item) => item.overflowLeft > 1 || item.overflowRight > 1 || item.scrollWidth > item.clientWidth + 1)
        .sort((a, b) => Math.max(b.overflowLeft, b.overflowRight, b.scrollWidth - b.clientWidth)
          - Math.max(a.overflowLeft, a.overflowRight, a.scrollWidth - a.clientWidth))
        .slice(0, 12)
    }

    const readDateMetrics = (date) => {
      if (!(date instanceof HTMLElement)) return null
      const range = document.createRange()
      range.selectNodeContents(date)
      const lines = new Set([...range.getClientRects()].filter((rect) => rect.width > 0).map((rect) => Math.round(rect.top)))
      const computed = getComputedStyle(date)
      return { text: date.textContent, lineCount: lines.size, wordBreak: computed.wordBreak, whiteSpace: computed.whiteSpace }
    }

    const readEmailMetrics = (sheet) => {
      const email = sheet.querySelector('[data-qa-long-email]')
      if (!(email instanceof HTMLElement)) return null
      const textNode = [...email.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)
      const computed = getComputedStyle(email)
      if (!textNode) return { validBreaks: false, lineCount: 0, overflow: 0, wordBreak: computed.wordBreak }
      const text = textNode.textContent || ''
      const lines = new Map()
      for (let index = 0; index < text.length; index += 1) {
        const range = document.createRange()
        range.setStart(textNode, index)
        range.setEnd(textNode, index + 1)
        const rect = range.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) continue
        const top = Math.round(rect.top)
        lines.set(top, `${lines.get(top) || ''}${text[index]}`)
      }
      const normalizedLines = [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, value]) => value.replace(/\u200B/g, ''))
      return {
        validBreaks: normalizedLines.slice(0, -1).every((line) => /[@._/\\-]$/.test(line)),
        lines: normalizedLines,
        lineCount: normalizedLines.length,
        overflow: Math.max(email.scrollWidth - email.clientWidth, 0),
        wordBreak: computed.wordBreak,
        overflowWrap: computed.overflowWrap,
      }
    }

    const readVerticalTextIssues = (sheet) => [...sheet.querySelectorAll('*')]
      .filter((element) => element.children.length === 0 && visible(element)
        && (element.textContent || '').replace(/[\s\u200B]/g, '').length >= 4)
      .map((element) => {
        const rect = element.getBoundingClientRect()
        const textNode = element.firstChild
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return null
        const text = textNode.textContent || ''
        const lines = new Map()
        for (let index = 0; index < text.length; index += 1) {
          if (/[\s\u200B]/.test(text[index])) continue
          const range = document.createRange()
          range.setStart(textNode, index)
          range.setEnd(textNode, index + 1)
          const charRect = range.getBoundingClientRect()
          if (charRect.width === 0 && charRect.height === 0) continue
          const top = Math.round(charRect.top)
          lines.set(top, (lines.get(top) || 0) + 1)
        }
        const counts = [...lines.values()]
        const ratio = counts.length ? counts.filter((count) => count === 1).length / counts.length : 0
        const fontSize = Number.parseFloat(getComputedStyle(element).fontSize) || 12
        const collapsed = rect.width < 1 && element.scrollWidth > 1
        const stacked = counts.length >= 4 && ratio >= 0.75 && rect.width <= fontSize * 2.2
        return collapsed || stacked ? {
          element: `${element.tagName.toLowerCase()}.${[...element.classList].join('.')}`,
          text: text.replace(/\u200B/g, '').slice(0, 80),
          width: Math.round(rect.width * 100) / 100,
          lineCount: counts.length,
        } : null
      })
      .filter(Boolean)
      .slice(0, 12)

    const readColumnAlignment = (sheet) => {
      if (!contract.auxiliaryRoot) return null
      const root = sheet.querySelector(contract.primaryRoot)
      const primary = root?.closest('main') || root
      const auxiliary = sheet.querySelector(contract.auxiliaryRoot)
      if (!(primary instanceof HTMLElement) || !(auxiliary instanceof HTMLElement)) return null
      const a = primary.getBoundingClientRect()
      const b = auxiliary.getBoundingClientRect()
      return {
        topDelta: Math.abs(a.top - b.top),
        bottomDelta: Math.abs(a.bottom - b.bottom),
        heightDelta: Math.abs(a.height - b.height),
      }
    }

    const read = (id) => {
      const sheet = document.getElementById(id)
      if (!(sheet instanceof HTMLElement)) throw new Error(`${id} missing`)
      const primaryRoot = sheet.querySelector('[data-qa-primary-root]') || sheet.querySelector(contract.primaryRoot)
      const stressItems = [...sheet.querySelectorAll('[data-qa-stress-item]')]
      const heights = stressItems.map((item) => item.getBoundingClientRect().height).filter((height) => height > 0).sort((a, b) => a - b)
      const medianHeight = heights[Math.floor(heights.length / 2)] || 1
      const formalDescription = contract.layoutKey === 'qm-table-formal'
        ? sheet.querySelector('[data-qa-stress-item] > p')
        : null
      const formalStyle = formalDescription instanceof HTMLElement ? getComputedStyle(formalDescription) : null
      return {
        width: sheet.getBoundingClientRect().width,
        height: sheet.getBoundingClientRect().height,
        scrollHeight: sheet.scrollHeight,
        overflowX: Math.max(sheet.scrollWidth - sheet.clientWidth, 0),
        estimatedPages: Math.max(1, Math.ceil(sheet.scrollHeight / 1120)),
        stressMarkerCount: sheet.querySelectorAll('[data-qa-long-email],[data-qa-long-company],[data-qa-long-role],[data-qa-long-date]').length,
        markers: {
          contact: sheet.querySelectorAll('[data-qa-long-email]').length,
          company: sheet.querySelectorAll('[data-qa-long-company]').length,
          title: sheet.querySelectorAll('[data-qa-long-role]').length,
          date: sheet.querySelectorAll('[data-qa-long-date]').length,
        },
        primaryItemCount: primaryRoot?.querySelectorAll(contract.itemSelector).length || 0,
        primaryTextLength: primaryRoot?.textContent?.trim().length || 0,
        primaryStressItems: primaryRoot?.querySelectorAll('[data-qa-stress-item]').length || 0,
        auxiliaryStressItems: contract.auxiliaryRoot
          ? sheet.querySelector(contract.auxiliaryRoot)?.querySelectorAll('[data-qa-stress-item]').length || 0
          : 0,
        itemHeightRatio: heights.length ? Math.max(...heights) / medianHeight : 1,
        maxItemPageRatio: heights.length ? Math.max(...heights) / 1120 : 0,
        date: readDateMetrics(sheet.querySelector('[data-qa-long-date]')),
        email: readEmailMetrics(sheet),
        verticalTextIssues: readVerticalTextIssues(sheet),
        columnAlignment: readColumnAlignment(sheet),
        formalDescription: formalStyle ? {
          parentIsNativeArticle: formalDescription.parentElement?.matches('.formal-table-items > article') || false,
          paddingTop: Number.parseFloat(formalStyle.paddingTop),
          paddingRight: Number.parseFloat(formalStyle.paddingRight),
          paddingBottom: Number.parseFloat(formalStyle.paddingBottom),
          paddingLeft: Number.parseFloat(formalStyle.paddingLeft),
        } : null,
        horizontalOverflow: describeHorizontalOverflow(sheet),
      }
    }
    return { short: read('qa-short-sheet'), long: read('qa-long-sheet') }
  }, contractData)

  metrics.short.screenshotSha256 = await sha256(shortPath)
  metrics.long.screenshotSha256 = await sha256(longPath)
  await page.evaluate(() => document.getElementById('qa-layout-artifact-host')?.remove())
  return metrics
}

function checkPhotoRegion(layoutKey, region, xRatio, failures) {
  if (region === 'left') {
    check(xRatio < 0.36, `${layoutKey}: expected left photo region, x=${xRatio.toFixed(3)}`, failures)
  } else if (region === 'right') {
    check(xRatio > 0.64, `${layoutKey}: expected right photo region, x=${xRatio.toFixed(3)}`, failures)
  } else {
    check(xRatio >= 0.30 && xRatio <= 0.68, `${layoutKey}: expected middle anchor photo region, x=${xRatio.toFixed(3)}`, failures)
  }
}

function check(condition, message, failures) {
  if (!condition) failures.push(message)
}

async function sha256(filePath) {
  return createHash('sha256').update(await readFile(filePath)).digest('hex')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
