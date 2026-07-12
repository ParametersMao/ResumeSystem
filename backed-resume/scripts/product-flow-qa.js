const puppeteer = require('puppeteer')
const { existsSync } = require('fs')

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:5173'
const username = process.env.QA_USERNAME || 'testuser'
const password = process.env.QA_PASSWORD || '123456'

async function main() {
  const browser = await puppeteer.launch({ headless: true, executablePath: resolveBrowserPath() })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 1000 })
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('response', (response) => {
    if (response.status() >= 500) errors.push(`${response.status()} ${response.url()}`)
  })

  let original = null
  let changed = false
  try {
    await page.goto(`${baseUrl}/login?qa=flow`, { waitUntil: 'networkidle2', timeout: 30000 })
    await page.waitForSelector("input[placeholder='用户名或邮箱']", { timeout: 10000 })
    await page.waitForSelector("input[placeholder='密码']", { timeout: 10000 })
    await page.type("input[placeholder='用户名或邮箱']", username)
    await page.type("input[placeholder='密码']", password)
    await Promise.all([
      page.waitForFunction(() => location.pathname === '/resumes', { timeout: 15000 }),
      page.click('.submit-btn'),
    ])

    await page.waitForFunction(() =>
      [...document.querySelectorAll('button')].some((item) => item.textContent.trim() === '继续编辑'),
      { timeout: 15000 },
    )
    const resumeLoadPromise = page.waitForResponse((response) =>
      response.request().method() === 'GET' && /\/api\/resumes\/\d+$/.test(response.url()) && response.status() === 200,
      { timeout: 15000 },
    )
    const opened = await page.evaluate(() => {
      const button = [...document.querySelectorAll('button')].find((item) => item.textContent.trim() === '继续编辑')
      button?.click()
      return Boolean(button)
    })
    if (!opened) throw new Error('没有找到可用于 QA 的简历。')
    await page.waitForFunction(() => location.pathname === '/resume-editor', { timeout: 15000 })
    await resumeLoadPromise
    await page.waitForSelector("input[placeholder='留空则使用模板默认标题']", { timeout: 15000 })
    await page.waitForFunction(
      () => !document.querySelector('.core-editor-page > .el-loading-mask'),
      { timeout: 15000 },
    )

    original = await page.evaluate(() => ({
      title: document.querySelector("input[placeholder='留空则使用模板默认标题']")?.value || '',
      slogan: document.querySelector("input[placeholder='可选，例如：用数据驱动产品增长']")?.value || '',
    }))
    const marker = `QA-${Date.now()}`
    await setInput(page, "input[placeholder='留空则使用模板默认标题']", marker)
    await setInput(page, "input[placeholder='可选，例如：用数据驱动产品增长']", '端到端保存与导出验证')
    changed = true
    await clickToolbarAndWait(page, '保存', (response) =>
      response.request().method() === 'PUT' && /\/api\/resumes\/\d+/.test(response.url()) && response.status() === 200,
    )
    await page.waitForFunction(() => {
      const status = document.querySelector('.preview-toolbar p')?.textContent.trim() || ''
      return status !== '正在保存...'
    }, { timeout: 10000 })
    const saveState = await page.$eval('.preview-toolbar p', (item) => item.textContent.trim())
    if (saveState !== '已保存') throw new Error(`保存请求结束后状态异常：${saveState}`)

    await page.reload({ waitUntil: 'networkidle2', timeout: 30000 })
    await page.waitForSelector("input[placeholder='留空则使用模板默认标题']", { timeout: 15000 })
    const persisted = await page.$eval("input[placeholder='留空则使用模板默认标题']", (input) => input.value)
    if (persisted !== marker) throw new Error(`保存后字段未恢复，期望 ${marker}，实际 ${persisted}`)

    const exportResponse = await clickToolbarAndWait(page, '导出为 PDF', (response) =>
      response.request().method() === 'POST' && response.url().includes('/api/resumes/export'),
      60000,
    )
    if (exportResponse.status() < 200 || exportResponse.status() >= 300) {
      throw new Error(`PDF 导出返回 ${exportResponse.status()}: ${(await exportResponse.text()).slice(0, 300)}`)
    }
    const exportPayload = await exportResponse.json()
    const exportedPageCount = Number(exportPayload?.data?.pageCount)
    if (!Number.isInteger(exportedPageCount) || exportedPageCount < 1) {
      throw new Error(`PDF 页数断言失败: ${JSON.stringify(exportPayload).slice(0, 300)}`)
    }

    console.log(JSON.stringify({
      login: 'passed',
      editorOpen: 'passed',
      savePersistence: 'passed',
      pdfExport: { status: 'passed', pageCount: exportedPageCount },
      runtimeErrors: errors,
    }, null, 2))
  } finally {
    if (changed && original && !page.isClosed()) {
      try {
        await setInput(page, "input[placeholder='留空则使用模板默认标题']", original.title)
        await setInput(page, "input[placeholder='可选，例如：用数据驱动产品增长']", original.slogan)
        await clickToolbarAndWait(page, '保存', (response) =>
          response.request().method() === 'PUT' && /\/api\/resumes\/\d+/.test(response.url()) && response.status() === 200,
        )
      } catch (restoreError) {
        errors.push(`restore failed: ${restoreError}`)
      }
    }
    await browser.close()
  }

  if (errors.length) process.exitCode = 1
}

async function setInput(page, selector, value) {
  await page.$eval(selector, (input, nextValue) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(input, nextValue)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

async function clickToolbarAndWait(page, label, predicate, timeout = 20000) {
  const responsePromise = page.waitForResponse(predicate, { timeout })
  const clicked = await page.evaluate((buttonLabel) => {
    const button = [...document.querySelectorAll('.toolbar-actions button')]
      .find((item) => item.textContent.includes(buttonLabel))
    button?.click()
    return Boolean(button)
  }, label)
  if (!clicked) throw new Error(`没有找到“${label}”按钮。`)
  return responsePromise
}

function resolveBrowserPath() {
  const candidates = [
    process.env.QA_BROWSER_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/chromium-headless-shell',
    '/usr/bin/chromium',
  ].filter(Boolean)
  const resolved = candidates.find((candidate) => existsSync(candidate))
  if (!resolved) throw new Error('未找到 Chrome/Edge/Chromium，请通过 QA_BROWSER_PATH 指定。')
  return resolved
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
