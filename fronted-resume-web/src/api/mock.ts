import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { Resume } from '@/store/resume'

interface MockDB {
  templates: Array<{ id: number; templateName: string; previewImage?: string; templateData?: any; description?: string; status?: boolean; useCount?: number; downloadCount?: number }>
  resumes: Record<string, Resume>
}

const sampleCover =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACe+1KqAAAACXBIWXMAAAsSAAALEgHS3X78AAAAJElEQVR4nO3BMQEAAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAwKkG3AEAAn6gqZQAAAAASUVORK5CYII='

const sampleTemplateData = {
  styles: {
    colors: { primary: '#2A3B8F', text: '#E5EAF3' },
    fonts: { body: 'Arial' }
  },
  sections: { header: { enabled: true } }
}

const db: MockDB = {
  templates: Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    templateName: `测试模板${i + 1}`,
    previewImage: sampleCover,
    templateData: sampleTemplateData,
    status: true,
    useCount: Math.floor(Math.random() * 200),
    downloadCount: Math.floor(Math.random() * 100)
  })),
  resumes: {}
}

function createInitialResume(resumeId: string, templateId: string): Resume {
  return {
    resumeId,
    userId: 'u_1',
    templateId,
    meta: { title: '我的简历', updatedAt: Date.now(), version: 1 },
    style: { themeColor: '#2e6cff', fontFamily: 'Source Han Sans', fontSize: 12, lineHeight: 1.4, page: { margin: [48,48,48,48], columns: 1 } },
    sections: [
      { id: crypto.randomUUID(), type: 'summary', title: '个人简介', visible: true, items: [ { type: 'summary', content: '三年+前端开发经验，熟悉 Vue3/TypeScript。' } as any ] },
      { id: crypto.randomUUID(), type: 'work', title: '工作经历', visible: true, items: [ { type: 'work', company: '示例公司', role: '前端工程师', start: '2022-01', end: '2023-12', highlights: ['负责在线简历编辑器重构','引入 Vite 构建，性能提升'] } as any ] }
    ]
  }
}

function paginate<T>(arr: T[], page = 1, limit = 10) {
  const start = (page - 1) * limit
  const list = arr.slice(start, start + limit)
  return { list, total: arr.length, page, limit }
}

export function setupMock(instance: AxiosInstance) {
  const handler = async (config: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
    const rawUrl = (config.url || '')
    const method = (config.method || 'get').toLowerCase()
    const params = (config.params || {}) as Record<string, any>
    const body = (config.data ? JSON.parse(config.data as any) : {}) as Record<string, any>
    // 归一化：去掉域名与 /api 前缀
    const url = rawUrl
      .replace(/^https?:\/\/[^/]+/, '')
      .replace(/^\/api\b/, '')
      .split('?')[0]

    // Templates list (backend兼容：按 templateName 模糊查询)
    if (method === 'get' && url.startsWith('/templates')) {
      const page = Number(params.page || 1)
      const limit = Number(params.limit || 20)
      const keyword = String(params.templateName || params.keyword || '')
      const filtered = keyword ? db.templates.filter(t => t.templateName.includes(keyword)) : db.templates
      const data = paginate(filtered, page, limit)
      return { data: { code: 200, message: 'success', data }, status: 200, statusText: 'OK', headers: {}, config }
    }

    // Template detail
    if (method === 'get' && /^\/templates\//.test(url)) {
      const id = url.split('/').pop()!
      const item = db.templates.find(t => String(t.id) === id)
      if (!item) return { data: { code: 404, message: 'not found', data: null }, status: 404, statusText: 'NOT_FOUND', headers: {}, config }
      return { data: { code: 200, message: 'success', data: item }, status: 200, statusText: 'OK', headers: {}, config }
    }

    // Create resume
    if (method === 'post' && url === '/resumes') {
      const resumeId = crypto.randomUUID()
      const resume = createInitialResume(resumeId, String(body.templateId))
      resume.meta.title = String(body.title || '我的简历')
      db.resumes[resumeId] = resume
      return { data: { code: 200, message: 'success', data: { resumeId } }, status: 200, statusText: 'OK', headers: {}, config }
    }

    // Get resume detail
    if (method === 'get' && /^\/resumes\//.test(url)) {
      const id = url.split('/').pop()!
      const item = db.resumes[id]
      if (!item) return { data: { code: 404, message: 'not found', data: null }, status: 404, statusText: 'NOT_FOUND', headers: {}, config }
      return { data: { code: 200, message: 'success', data: item }, status: 200, statusText: 'OK', headers: {}, config }
    }

    // List resumes
    if (method === 'get' && url === '/resumes') {
      const values = Object.values(db.resumes)
      const page = Number(params.page || 1)
      const limit = Number(params.limit || 10)
      const data = paginate(values, page, limit)
      return { data: { code: 200, message: 'success', data }, status: 200, statusText: 'OK', headers: {}, config }
    }

    // Update resume (diff not enforced in mock)
    if (method === 'put' && /^\/resumes\//.test(url)) {
      const id = url.split('/').pop()!
      const origin = db.resumes[id]
      if (!origin) return { data: { code: 404, message: 'not found', data: null }, status: 404, statusText: 'NOT_FOUND', headers: {}, config }
      const merged = { ...origin, ...body, meta: { ...origin.meta, ...(body.meta||{}), version: origin.meta.version + 1, updatedAt: Date.now() } }
      db.resumes[id] = merged
      return { data: { code: 200, message: 'success', data: merged }, status: 200, statusText: 'OK', headers: {}, config }
    }

    // Auth login
    if (method === 'post' && url === '/auth/login') {
      return { data: { code: 200, message: '登录成功', data: { access_token: 'mock-token', user: { id: 1, username: 'mock' } } }, status: 200, statusText: 'OK', headers: {}, config }
    }

    // Export PDF
    if (method === 'post' && url === '/resumes/export') {
      return { data: { code: 200, message: '导出成功', data: { url: 'https://example.com/mock-resume.pdf' } }, status: 200, statusText: 'OK', headers: {}, config }
    }

    // Default passthrough
    return Promise.reject({ response: { status: 501, data: { code: 501, message: 'mock not implemented', data: null } } })
  }

  instance.interceptors.request.use((config) => {
    // mark as mock-handled to avoid duplicate
    ;(config as any)._mock = true
    return config
  })

  instance.interceptors.response.use(undefined, (error) => {
    const config = error?.config as AxiosRequestConfig
    if ((config as any)?._mock) {
      return handler(config)
    }
    return Promise.reject(error)
  })
}


