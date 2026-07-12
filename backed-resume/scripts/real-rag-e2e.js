const { readFileSync } = require('fs')
const { resolve } = require('path')

const baseUrl = String(process.env.QA_API_BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '')
const adminUsername = process.env.QA_ADMIN_USERNAME || 'admin'
const adminPassword = process.env.QA_ADMIN_PASSWORD || 'admin123'
const userUsername = process.env.QA_USERNAME || 'testuser'
const userPassword = process.env.QA_PASSWORD || '123456'
const apiKey = String(process.env.QA_LLM_API_KEY || '').trim()
const documentName = '标准简历知识库 v1'
const documentPath = resolve(__dirname, '../../docs/knowledge-base/resume-writing-standard-v1.md')

async function main() {
  if (!apiKey) throw new Error('缺少 QA_LLM_API_KEY；密钥只允许通过运行时环境变量传入。')

  const adminToken = await login('/api/auth/login', adminUsername, adminPassword)
  const userToken = await login('/api/auth/cuser/login', userUsername, userPassword)

  await api('/api/admin/system-config', {
    method: 'PUT',
    token: adminToken,
    body: {
      ai: {
        enabled: true,
        executionEngine: 'agent',
        agentBaseUrl: 'http://agent:8000',
        provider: 'deepseek',
        apiBaseUrl: 'https://api.deepseek.com',
        apiKey,
        apiModel: 'deepseek-v4-pro',
        temperature: 0.3,
      },
    },
  })

  const listed = await api(`/api/admin/knowledge-documents?page=1&limit=20&search=${encodeURIComponent(documentName)}`, {
    token: adminToken,
  })
  let document = listed?.data?.list?.find((item) => item.name === documentName)

  if (!document) {
    const form = new FormData()
    const source = readFileSync(documentPath)
    form.append('file', new Blob([source], { type: 'text/markdown' }), 'resume-writing-standard-v1.md')
    form.append('name', documentName)
    form.append('category', 'resume-standard')
    form.append('description', '简历事实边界、岗位匹配、条目写法与分页标准')
    const uploaded = await api('/api/admin/knowledge-documents/upload', {
      method: 'POST',
      token: adminToken,
      body: form,
      timeout: 240000,
    })
    document = uploaded.data
  } else if (document.status !== 'ready' || Number(document.chunkCount) < 1) {
    const reindexed = await api(`/api/admin/knowledge-documents/${document.id}/reindex`, {
      method: 'POST',
      token: adminToken,
      timeout: 240000,
    })
    document = reindexed.data
  }

  if (document.status !== 'ready' || Number(document.chunkCount) < 1) {
    throw new Error(`知识库索引失败：status=${document.status}, chunks=${document.chunkCount}, error=${document.errorMessage || 'unknown'}`)
  }

  const search = await api('/api/admin/knowledge-documents/search', {
    method: 'POST',
    token: adminToken,
    body: { query: '证据边界四原则是什么，简历分页时如何避免标题孤行', category: 'resume-standard', limit: 5 },
  })
  const searchSources = Array.isArray(search.data) ? search.data : search.data?.results || search.data?.sources || []
  if (!searchSources.length || !searchSources.some((item) => Number(item.score) > 0)) {
    throw new Error('真实向量检索未返回有效命中。')
  }
  if (searchSources[0]?.retrievalMethod !== 'hybrid-dense-bm25') {
    throw new Error(`检索未进入 Hybrid 模式：${searchSources[0]?.retrievalMethod || 'unknown'}`)
  }

  const diagnosis = await api('/api/ai/diagnose', {
    method: 'POST',
    token: userToken,
    timeout: 90000,
    body: {
      jobTitle: '高级前端工程师',
      sectionType: 'experience',
      templateVariant: 'classic',
      contentText: '负责公司管理后台开发，使用 Vue 完成功能，与团队合作优化性能。',
      userInstruction: '依据知识库检查事实边界、岗位匹配和分页可读性，不要虚构数字。',
    },
  })

  const result = diagnosis.data || {}
  if (result.executionMode !== 'live') throw new Error(`LLM 未进入 live 模式：${result.executionMode}`)
  if (result.model !== 'deepseek-v4-pro') throw new Error(`模型不符合预期：${result.model}`)
  if (!Array.isArray(result.sources) || result.sources.length < 1) throw new Error('Agent 响应未携带 RAG 来源。')
  if (!Number.isFinite(Number(result.tokenUsed)) || Number(result.tokenUsed) < 1) throw new Error('真实 LLM 调用未返回 token 用量。')

  console.log(JSON.stringify({
    knowledgeUpload: { status: document.status, chunkCount: Number(document.chunkCount) },
    vectorSearch: {
      status: 'passed',
      method: searchSources[0]?.retrievalMethod,
      hits: searchSources.length,
      topScore: Number(searchSources[0]?.score || 0),
      denseScore: Number(searchSources[0]?.denseScore || 0),
      lexicalScore: Number(searchSources[0]?.lexicalScore || 0),
    },
    llm: { status: 'passed', executionMode: result.executionMode, model: result.model, tokenUsed: Number(result.tokenUsed) },
    ragAgent: { status: 'passed', sources: result.sources.length, diagnostics: result.diagnostics?.length || 0 },
  }, null, 2))
}

async function login(path, username, password) {
  const payload = await api(path, { method: 'POST', body: { username, password } })
  const token = payload?.data?.access_token
  if (!token) throw new Error(`${path} 未返回 access_token`)
  return token
}

async function api(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeout || 30000)
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        ...(isForm ? {} : options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? (isForm ? options.body : JSON.stringify(options.body)) : undefined,
      signal: controller.signal,
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || payload?.code >= 400) {
      throw new Error(`${options.method || 'GET'} ${path} -> ${response.status}: ${payload?.message || payload?.detail || 'unknown error'}`)
    }
    return payload
  } finally {
    clearTimeout(timer)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
