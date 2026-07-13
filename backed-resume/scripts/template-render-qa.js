const puppeteer = require('puppeteer')
const { existsSync } = require('fs')

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
const expectedTemplateCount = Number(process.env.QA_TEMPLATE_COUNT || 11)

async function main() {
  const executablePath = resolveBrowserPath()
  const browser = await puppeteer.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    args: browserLaunchArgs(),
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 })

  const runtimeErrors = []
  page.on('pageerror', (error) => runtimeErrors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })
  page.on('response', (response) => {
    if (response.status() >= 500) runtimeErrors.push(`${response.status()} ${response.url()}`)
  })

  await page.goto(`${baseUrl}/templates?qa=render`, { waitUntil: 'networkidle2', timeout: 30000 })
  const results = []

  for (let pageIndex = 0; pageIndex < 2; pageIndex += 1) {
    await page.waitForSelector('.template-card .resume-sheet', { timeout: 10000 })
    const cardCount = await page.$$eval('.template-card', (cards) => cards.length)

    for (let cardIndex = 0; cardIndex < cardCount; cardIndex += 1) {
      const expected = await page.$eval(`.template-card:nth-of-type(${cardIndex + 1})`, (card) => ({
        name: card.querySelector('.template-title-row h3')?.textContent?.trim() || '',
        layoutClass: [...(card.querySelector('.resume-sheet')?.classList || [])].find((value) => value.startsWith('layout-')) || '',
      }))
      await page.evaluate((index) => {
        const card = document.querySelectorAll('.template-card')[index]
        const button = [...card.querySelectorAll('button')].find((item) => item.textContent.includes('预览'))
        button?.click()
      }, cardIndex)
      await page.waitForSelector('.el-dialog .resume-sheet', { visible: true, timeout: 10000 })
      await page.waitForFunction(
        (layoutClass) => document.querySelector('.el-dialog .resume-sheet')?.classList.contains(layoutClass),
        { timeout: 10000 },
        expected.layoutClass,
      )
      await new Promise((resolve) => setTimeout(resolve, 120))
      const metrics = await page.$eval('.el-dialog .resume-sheet', (sheet) => ({
        width: Math.round(sheet.getBoundingClientRect().width),
        overflowX: Math.max(sheet.scrollWidth - sheet.clientWidth, 0),
        scrollHeight: sheet.scrollHeight,
        verticalOverflow: Math.max(sheet.scrollHeight - 1120, 0),
        layoutClass: [...sheet.classList].find((value) => value.startsWith('layout-')) || '',
      }))
      results.push({ ...expected, ...metrics })
      await page.click('.el-dialog__headerbtn')
      await page.waitForFunction(() => !document.querySelector('.el-dialog')?.offsetParent, { timeout: 5000 })
    }

    const nextEnabled = await page.$eval('.el-pagination .btn-next', (button) => !button.disabled)
    if (!nextEnabled) break
    await page.click('.el-pagination .btn-next')
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  await browser.close()
  const uniqueLayouts = new Set(results.map((item) => item.layoutClass))
  const failures = results.filter((item) => item.width < 790 || item.overflowX > 0 || item.verticalOverflow > 0 || !item.layoutClass)
  const multiPageCandidates = results
    .filter((item) => item.scrollHeight > 1120)
    .map((item) => ({ name: item.name, scrollHeight: item.scrollHeight }))
  const report = {
    expectedTemplateCount,
    renderedTemplateCount: results.length,
    uniqueLayoutCount: uniqueLayouts.size,
    failures,
    multiPageCandidates,
    runtimeErrors,
    results,
  }
  console.log(JSON.stringify(report, null, 2))

  if (results.length !== expectedTemplateCount || failures.length || runtimeErrors.length) {
    process.exitCode = 1
  }
}

function resolveBrowserPath() {
  const candidates = [
    process.env.QA_BROWSER_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/chromium-headless-shell',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
  ].filter(Boolean)
  return candidates.find((candidate) => existsSync(candidate))
}

function browserLaunchArgs() {
  return typeof process.getuid === 'function' && process.getuid() === 0
    ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    : []
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
