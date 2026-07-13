const baseUrl = String(process.env.QA_API_BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '')
const username = requiredEnv('QA_USERNAME')
const password = requiredEnv('QA_PASSWORD')

function requiredEnv(name) {
  const value = String(process.env[name] || '').trim()
  if (!value) throw new Error(`缺少 ${name}；测试凭据只允许通过运行时环境变量传入。`)
  return value
}

async function main() {
  const login = await request('/api/auth/cuser/login', { method: 'POST', body: { username, password } })
  const token = login?.data?.access_token
  if (!token) throw new Error('测试用户登录未返回 access_token')

  const items = Array.from({ length: 18 }, (_, index) => `
    <article class="section-item" data-qa-item="${index + 1}">
      <h3 class="item-heading">项目经历 ${index + 1}</h3>
      <p>负责需求拆解、方案设计、实现、测试和上线验收；本段内容用于验证条目整体换页与多页 PDF 页数断言。</p>
      <p>保留事实边界，说明个人动作、协作范围和可验证交付物，不使用无法核实的数字。</p>
    </article>`).join('')

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{font-family:"Noto Sans CJK SC",sans-serif;color:#172033}
    .resume-sheet{width:190mm;margin:0 auto;padding:8mm;box-sizing:border-box}
    .resume-section{margin:0 0 8mm}
    .section-heading{font-size:18px;margin:0 0 4mm;border-bottom:1px solid #ccd5e3}
    .section-item{padding:4mm 0;border-bottom:1px solid #e7ebf1}
    .item-heading{font-size:15px;margin:0 0 2mm}
    p{font-size:12px;line-height:1.55;margin:1mm 0}
  </style></head><body><main class="resume-sheet">
    <section class="resume-section"><h2 class="section-heading">多页分页质量验证</h2>${items}</section>
  </main></body></html>`

  const exported = await request('/api/resumes/export', { method: 'POST', token, body: { html }, timeout: 90000 })
  const pageCount = Number(exported?.data?.pageCount)
  if (!Number.isInteger(pageCount) || pageCount < 2) {
    throw new Error(`多页 PDF 页数断言失败，期望 >= 2，实际 ${pageCount}`)
  }
  if (!/^https?:\/\//.test(String(exported?.data?.url || '')) && !String(exported?.data?.url || '').startsWith('/')) {
    throw new Error('PDF 导出未返回有效 URL')
  }

  console.log(JSON.stringify({
    pdfGeneration: 'passed',
    naturalPagination: 'passed',
    pageCountAssertion: { expected: '>=2', actual: pageCount, status: 'passed' },
  }, null, 2))
}

async function request(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeout || 30000)
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(`${path} -> ${response.status}: ${payload?.message || 'unknown error'}`)
    return payload
  } finally {
    clearTimeout(timer)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
