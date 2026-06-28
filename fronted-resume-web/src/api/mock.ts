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

const userTemplateData = {
  templateName: "蓝色条带行政简历",
  templateType: "single-column",
  version: "1.0.0",
  description: "顶部蓝色名片、分节条带、技能进度条的行政简历模板。",
  theme: {
    colors: {
      primary: "#0F3D7A",
      secondary: "#1F4F99",
      accent: "#173F7F",
      muted: "#8BA1C1",
      text: { primary: "#1F2A44", secondary: "#44516A", muted: "#7A869B" },
      border: "#d4dde8",
      background: "#ffffff"
    },
    typography: {
      fontFamily: {
        body: "'Microsoft YaHei', 'PingFang SC', Arial, sans-serif",
        heading: "'Microsoft YaHei', 'PingFang SC', Arial, sans-serif"
      },
      lineHeight: { normal: "1.7" }
    }
  },
  globalStyles: {
    backgroundColor: "#ffffff",
    fontFamily: "var(--typography-fontFamily-body)",
    fontSize: "14px",
    lineHeight: "1.7",
    color: "#1F2A44"
  },
  layout: {
    type: "single-column",
    container: {
      maxWidth: "820px",
      margin: "0 auto",
      padding: "0 70px 60px",
      backgroundColor: "#ffffff",
      boxShadow: "0 18px 36px rgba(9, 31, 63, 0.08)"
    }
  },
  sectionStyles: {
    basic: {
      container: { marginBottom: "30px" },
      title: { display: "none" },
      custom: {
        ".basic-card": {
          display: "grid",
          gridTemplateColumns: "120px 1fr",
          gap: "20px",
          alignItems: "center",
          padding: "28px 32px",
          border: "1px solid #183B74",
          borderRadius: "6px",
          position: "relative"
        },
        ".basic-card::after": {
          content: "'个人简历'",
          position: "absolute",
          top: "12px",
          right: "18px",
          padding: "6px 18px",
          background: "#0F3D7A",
          color: "#fff",
          fontSize: "14px",
          borderRadius: "18px"
        },
        ".basic-avatar": {
          width: "100px",
          height: "110px",
          borderRadius: "6px",
          border: "3px solid rgba(15,61,122,0.1)",
          objectFit: "cover",
          justifySelf: "center"
        },
        ".basic-name": {
          fontSize: "22px",
          fontWeight: "700",
          letterSpacing: "2px",
          color: "#0F3D7A",
          marginBottom: "6px"
        },
        ".basic-intent": { fontSize: "13px", color: "#44516A", marginBottom: "12px" },
        ".basic-info-row": {
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(120px, 1fr))",
          gap: "8px 16px",
          fontSize: "13px",
          color: "#1F2A44",
          marginBottom: "8px"
        },
        ".info-item span": { color: "#44516A" },
        ".basic-summary": { fontSize: "13px", color: "#44516A", marginTop: "4px", lineHeight: "1.8" }
      }
    },
    education: {
      container: { marginBottom: "26px" },
      title: { fontSize: "16px", fontWeight: "700", color: "#ffffff", backgroundColor: "#0F3D7A", padding: "10px 18px", borderRadius: "4px 4px 0 0" },
      content: { border: "1px solid #dbe3ee", borderTop: "none", padding: "16px 18px", fontSize: "13px", color: "#1F2A44" },
      items: { separator: { type: "solid", width: "1px", color: "#dbe3ee", margin: "16px" } }
    },
    experience: {
      container: { marginBottom: "26px" },
      title: { fontSize: "16px", fontWeight: "700", color: "#ffffff", backgroundColor: "#0F3D7A", padding: "10px 18px", borderRadius: "4px 4px 0 0" },
      content: { border: "1px solid #dbe3ee", borderTop: "none", padding: "16px 18px", fontSize: "13px", color: "#1F2A44" },
      items: { separator: { type: "solid", width: "1px", color: "#dbe3ee", margin: "16px" } }
    },
    skills: {
      container: { marginBottom: "26px" },
      title: { fontSize: "16px", fontWeight: "700", color: "#ffffff", backgroundColor: "#0F3D7A", padding: "10px 18px", borderRadius: "4px 4px 0 0" },
      content: { border: "1px solid #dbe3ee", borderTop: "none", padding: "18px", fontSize: "13px", color: "#1F2A44" },
      custom: {
        ".skill-item": { marginBottom: "18px" },
        ".skill-name-row": { display: "flex", justifyContent: "space-between", marginBottom: "6px", color: "#1F2A44", fontWeight: "600" },
        ".skill-progress": { height: "8px", backgroundColor: "#e6ecf5", borderRadius: "4px", overflow: "hidden" },
        ".skill-progress-bar": { height: "100%", background: "linear-gradient(90deg,#0F3D7A,#1F5AAE)", transition: "width .3s ease" }
      }
    },
    awards: {
      container: { marginBottom: "26px" },
      title: { fontSize: "16px", fontWeight: "700", color: "#ffffff", backgroundColor: "#0F3D7A", padding: "10px 18px", borderRadius: "4px 4px 0 0" },
      content: { border: "1px solid #dbe3ee", borderTop: "none", padding: "16px 18px", fontSize: "13px", color: "#1F2A44" }
    },
    summary: {
      title: { fontSize: "16px", fontWeight: "700", color: "#ffffff", backgroundColor: "#0F3D7A", padding: "10px 18px", borderRadius: "4px 4px 0 0" },
      content: { border: "1px solid #dbe3ee", borderTop: "none", padding: "16px 18px", fontSize: "13px", color: "#1F2A44", lineHeight: "1.9" }
    }
  },
  sections: [
    {
      id: "basic-1",
      type: "basic",
      title: "基本信息",
      visible: true,
      order: 0,
      data: {
        basic: {
          name: "李晓华",
          title: "行政专员",
          gender: "男",
          age: "33岁",
          yearsOfExperience: "2年经验",
          contacts: { phone: "15888888888", email: "qmjianli@qq.com", site: "上海" },
          avatar: "https://cdn.jsdelivr.net/gh/ykdojo/avatars/peep-47.svg"
        },
        summary: "工作积极主动，擅长统筹、擅长办公室行政协调，能够独立完成大型会议筹备与执行；执行力强，注重细节。"
      }
    },
    {
      id: "education-1",
      type: "education",
      title: "教育背景",
      visible: true,
      order: 1,
      items: [
        { school: "全民简历师范大学", degree: "工商管理 · 本科", major: "主修课程：综合管理、行政管理、公共关系、心理学等", gpa: "GPA 3.66/4（专业前15%）", duration: { start: "2012-09", end: "2016-07" } }
      ]
    },
    {
      id: "experience-1",
      type: "experience",
      title: "工作经验",
      visible: true,
      order: 2,
      items: [
        { company: "全民简历网络有限公司", position: "行政专员", duration: { start: "2018-09", end: "至今" }, desc: { html: "<ul><li>负责总部行政/人事管理流程建设，协助制定内部制度与培训计划。</li><li>统筹办公环境、物资采购、固定资产管理，跟进月度行政预算。</li><li>组织策划大型会议、团建及福利活动，确保执行质量与反馈。</li><li>协调财务、法务、供应商资源，完成跨部门合作。</li></ul>" } },
        { company: "上海掌堂网络科技有限公司", position: "行政专员", duration: { start: "2016-09", end: "2018-08" }, desc: { html: "<ul><li>负责公司行政后勤工作，推进行政制度流程落地。</li><li>组织团建、文体活动，制定活动方案与预算。</li><li>推进企业文化宣传、内部刊物编制与资料档案管理。</li></ul>" } }
      ]
    },
    {
      id: "skills-1",
      type: "skills",
      title: "技能特长",
      visible: true,
      order: 3,
      items: [
        { name: "计算机", proficiency: 95, level: "精通" },
        { name: "沟通协调", proficiency: 92, level: "熟练" },
        { name: "文档写作", proficiency: 90, level: "熟练" }
      ]
    },
    {
      id: "awards-1",
      type: "awards",
      title: "荣誉证书",
      visible: true,
      order: 4,
      items: [
        { name: "优秀员工", description: "绩效考核优秀，连续两年获得公司嘉奖。" },
        { name: "服务明星", description: "组织大型活动表现突出，获“服务明星”称号。" }
      ]
    },
    {
      id: "summary-1",
      type: "summary",
      title: "自我评价",
      visible: true,
      order: 5,
      items: [
        { text: "工作踏实认真，具备较强的组织协调能力和沟通能力。在行政管理和后勤保障方面拥有丰富经验，注重细节，执行力强，能够快速融入团队并推动项目落地。" }
      ]
    }
  ],
  customCss: ".resume-renderer{position:relative;background:#ffffff;} .resume-renderer::before{content:'';position:absolute;top:0;left:0;right:0;height:100px;background:linear-gradient(90deg,#0F3D7A,#1E5CB8);} .resume-renderer::after{content:' ';display:block;height:100px;} .resume-renderer .basic-renderer .basic-content{padding:0;} .resume-renderer .basic-renderer .basic-content .basic-header{display:none;} .resume-renderer .basic-renderer .basic-content .basic-card{box-shadow:none;} .resume-renderer .basic-renderer .basic-content .basic-info-row .info-item{display:flex;align-items:center;gap:6px;} .resume-renderer .basic-renderer .basic-content .basic-info-row .info-item span:first-child{color:#0F3D7A;font-weight:600;} .resume-renderer .section-title{margin:0;} .resume-renderer .experience-item .description ul{margin:10px 0 0 20px;padding:0;list-style:disc;} .resume-renderer .experience-item .description li{margin-bottom:6px;} .resume-renderer .skills-section .skill-item:last-child{margin-bottom:0;} .resume-renderer .awards-section .section-content p{margin:6px 0;}"
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
  const handler = async (config: any): Promise<AxiosResponse<any>> => {
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
      if (id === '55') {
        const item = { id: 55, templateName: '蓝色条带行政简历', previewImage: sampleCover, templateData: userTemplateData, status: true }
        return { data: { code: 200, message: 'success', data: item }, status: 200, statusText: 'OK', headers: {}, config }
      }
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


