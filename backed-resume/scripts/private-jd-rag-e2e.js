const baseUrl = String(process.env.QA_API_BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '')
const agentBaseUrl = String(process.env.QA_AGENT_BASE_URL || 'http://agent:8000').replace(/\/+$/, '')
const agentSecret = String(process.env.QA_AGENT_SECRET || process.env.AGENT_INTERNAL_SECRET || '').trim()
const adminUsername = requiredEnv('QA_ADMIN_USERNAME')
const adminPassword = requiredEnv('QA_ADMIN_PASSWORD')

const marker = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
const password = `Qa-${marker}-Aa9!`
const users = []

async function main() {
  if (!agentSecret) throw new Error('缺少 QA_AGENT_SECRET/AGENT_INTERNAL_SECRET，无法验证向量层租户隔离。')
  const adminToken = await login('/api/auth/login', adminUsername, adminPassword)

  try {
    const userA = await createUser(adminToken, `ragqa_a_${marker}`, password)
    const userB = await createUser(adminToken, `ragqa_b_${marker}`, password)
    users.push(userA.id, userB.id)
    const tokenA = await login('/api/auth/cuser/login', userA.username, password)
    const tokenB = await login('/api/auth/cuser/login', userB.username, password)

    const resumeA = await createResume(tokenA, `RAG tenant A ${marker}`)
    const resumeB = await createResume(tokenB, `RAG tenant B ${marker}`)
    const uniqueFact = `TenantAOnly-${marker}`
    const jdText = [
      '高级前端工程师岗位职责：负责 Vue、TypeScript 组件体系与性能优化。',
      `私有租户校验标记：${uniqueFact}。`,
      '任职要求：具备工程化、可访问性、跨团队协作和指标复盘经验。',
    ].join('\n')

    const indexed = await api(`/api/resumes/${resumeA.id}/job-description`, {
      method: 'POST',
      token: tokenA,
      form: { text: jdText },
      timeout: 360000,
    })
    assert(indexed.data?.status === 'ready' && Number(indexed.data?.chunkCount) >= 1,
      `私有 JD 索引失败：${indexed.data?.errorMessage || indexed.data?.status}`)

    const diagnosis = await api('/api/ai/diagnose', {
      method: 'POST',
      token: tokenA,
      timeout: 180000,
      body: {
        resumeId: String(resumeA.id),
        jobTitle: '高级前端工程师',
        sectionType: 'experience',
        contentText: '负责 Vue 与 TypeScript 管理后台开发，推进组件复用和性能优化。',
        userInstruction: '必须使用当前简历绑定的私有 JD 逐项诊断，不得编造事实。',
      },
    })
    const result = diagnosis.data || {}
    const jdSources = (result.sources || []).filter((source) =>
      source.sourceType === 'job-description' &&
      source.factType === 'job_context' &&
      String(source.resumeId) === String(resumeA.id) &&
      Number(source.ownerUserId) === Number(userA.id))
    assert(result.executionMode === 'live', `私有 JD 诊断未进入 live：${result.executionMode}`)
    assert(jdSources.length >= 1, '诊断成功但未使用当前 owner + resume 的 job_context。')

    await expectFailure(() => api(`/api/resumes/${resumeA.id}/job-description`, { token: tokenB }), 404)
    await expectFailure(() => api('/api/ai/diagnose', {
      method: 'POST',
      token: tokenB,
      body: { resumeId: String(resumeA.id), jobTitle: '前端工程师', contentText: 'Vue' },
    }), 404)

    const [ownerHits, otherTenantHits, globalHits] = await Promise.all([
      agentSearch(uniqueFact, userA.id, resumeA.id),
      agentSearch(uniqueFact, userB.id, resumeB.id),
      api('/api/admin/knowledge-documents/search', {
        method: 'POST',
        token: adminToken,
        body: { query: uniqueFact, limit: 10 },
      }),
    ])
    assert(ownerHits.some((source) => Number(source.documentId) === Number(indexed.data.id)),
      'owner 在向量层无法检索自己的私有 JD。')
    assert(!otherTenantHits.some((source) => Number(source.documentId) === Number(indexed.data.id)),
      '向量层发生跨用户/跨简历私有 JD 泄漏。')
    const adminGlobalSources = globalHits.data?.results || globalHits.data || []
    assert(!adminGlobalSources.some((source) => Number(source.documentId) === Number(indexed.data.id)),
      '后台全局检索越权返回了私有 JD。')

    await api(`/api/resumes/${resumeA.id}`, { method: 'DELETE', token: tokenA })
    const afterDeleteHits = await agentSearch(uniqueFact, userA.id, resumeA.id)
    assert(!afterDeleteHits.some((source) => Number(source.documentId) === Number(indexed.data.id)),
      '删除简历后私有 JD 向量仍可检索。')

    console.log(JSON.stringify({
      privateJdIndex: { status: 'passed', chunks: Number(indexed.data.chunkCount) },
      liveDiagnosis: { status: 'passed', jobContextSources: jdSources.length },
      tenantIsolation: 'passed',
      adminGlobalIsolation: 'passed',
      resumeDeleteCleanup: 'passed',
    }, null, 2))
  } finally {
    if (users.length) {
      const adminToken = await login('/api/auth/login', adminUsername, adminPassword).catch(() => '')
      if (adminToken) {
        for (const userId of users.reverse()) {
          await api(`/api/cusers/${userId}`, { method: 'DELETE', token: adminToken }).catch(() => {})
        }
      }
    }
  }
}

async function createUser(adminToken, username, userPassword) {
  const response = await api('/api/cusers', {
    method: 'POST',
    token: adminToken,
    body: { username, password: userPassword, status: 1 },
  })
  return { ...response.data, username }
}

async function createResume(token, title) {
  const response = await api('/api/resumes', {
    method: 'POST',
    token,
    body: { title, content: JSON.stringify({ profile: { name: 'QA' }, sections: [] }) },
  })
  return response.data
}

async function agentSearch(query, ownerUserId, resumeId) {
  const response = await fetch(`${agentBaseUrl}/rag/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Agent-Secret': agentSecret },
    body: JSON.stringify({
      query,
      limit: 10,
      sourceTypes: ['job-description'],
      scope: 'private',
      ownerUserId,
      resumeId: String(resumeId),
    }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`Agent search -> ${response.status}: ${payload.detail || 'unknown'}`)
  return payload.results || []
}

async function login(path, username, loginPassword) {
  const response = await api(path, { method: 'POST', body: { username, password: loginPassword } })
  const token = response.data?.access_token
  if (!token) throw new Error(`${path} 未返回 access_token`)
  return token
}

async function expectFailure(operation, expectedStatus) {
  try {
    await operation()
  } catch (error) {
    if (Number(error.status) === expectedStatus) return
    throw error
  }
  throw new Error(`请求应返回 ${expectedStatus}，实际成功。`)
}

async function api(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeout || 30000)
  let body
  let contentType
  if (options.form) {
    body = new FormData()
    for (const [key, value] of Object.entries(options.form)) body.append(key, String(value))
  } else if (options.body !== undefined) {
    body = JSON.stringify(options.body)
    contentType = 'application/json'
  }
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        ...(contentType ? { 'Content-Type': contentType } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body,
      signal: controller.signal,
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || Number(payload.code) >= 400) {
      const error = new Error(`${options.method || 'GET'} ${path} -> ${response.status}: ${payload.message || payload.detail || 'unknown'}`)
      error.status = response.status
      throw error
    }
    return payload
  } finally {
    clearTimeout(timer)
  }
}

function requiredEnv(name) {
  const value = String(process.env[name] || '').trim()
  if (!value) throw new Error(`缺少 ${name}；测试凭据只允许通过运行时环境变量传入。`)
  return value
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
