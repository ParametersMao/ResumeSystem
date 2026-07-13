import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { Resume } from '@/store/resume'

interface MockDB {
  templates: Array<{ id: number; templateName: string; templateVariant?: string; layoutKey?: string; previewImage?: string; templateData?: any; description?: string; industryTags?: string; status?: boolean; useCount?: number; downloadCount?: number }>
  resumes: Record<string, any>
  resumeVersions: Record<string, any[]>
  favoriteTemplateIds: number[]
  nextResumeId: number
  nextVersionId: number
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

const atsDeveloperTemplateData = {
  variant: 'ats',
  layoutKey: 'qm-minimal-ats',
  layout: {
    key: 'qm-minimal-ats',
    variant: 'ats',
    avatar: { enabled: false, placement: 'hidden' }
  },
  theme: {
    variant: 'ats',
    colors: { primary: '#243B53', accent: '#E8EDF3' },
    typography: { fontFamily: { body: "'Microsoft YaHei', 'PingFang SC', sans-serif", heading: "'Microsoft YaHei', 'PingFang SC', sans-serif" } },
    spacing: { sectionSpacing: 18, itemSpacing: 10 }
  }
}

const campusStudentTemplateData = {
  variant: 'editorial',
  layoutKey: 'qm-student-editorial',
  layout: {
    key: 'qm-student-editorial',
    variant: 'editorial',
    avatar: { enabled: true, placement: 'header-right', shape: 'square', width: 88, height: 112 }
  },
  sectionDefaults: {
    order: ['education', 'projects', 'internship', 'campus', 'skills', 'awards', 'summary', 'experience', 'intention', 'custom', 'hobbies'],
    visible: ['education', 'projects', 'internship', 'campus', 'skills', 'awards', 'summary', 'intention'],
    hidden: ['experience']
  },
  theme: {
    variant: 'editorial',
    colors: { primary: '#2F80A7', accent: '#D9ECF5' },
    typography: { fontFamily: { body: "'Microsoft YaHei', 'PingFang SC', sans-serif", heading: "'Microsoft YaHei', 'PingFang SC', sans-serif" } },
    spacing: { sectionSpacing: 18, itemSpacing: 10 }
  }
}

const productOutcomeTemplateData = {
  variant: 'spotlight',
  layoutKey: 'qm-spotlight-featured',
  layout: {
    key: 'qm-spotlight-featured',
    variant: 'spotlight',
    avatar: { enabled: false, placement: 'hidden' }
  },
  sectionDefaults: {
    order: ['summary', 'projects', 'experience', 'internship', 'skills', 'education', 'awards', 'intention', 'campus', 'custom', 'hobbies'],
    visible: ['summary', 'projects', 'experience', 'skills', 'education', 'intention']
  },
  theme: {
    variant: 'spotlight',
    colors: { primary: '#3156D3', accent: '#E8EDFF' },
    typography: { fontFamily: { body: "'Microsoft YaHei', 'PingFang SC', sans-serif", heading: "'Microsoft YaHei', 'PingFang SC', sans-serif" } },
    spacing: { sectionSpacing: 20, itemSpacing: 12 }
  }
}

const formalTableTemplateData = {
  variant: 'classic',
  layoutKey: 'qm-table-formal',
  layout: {
    key: 'qm-table-formal',
    variant: 'classic',
    avatar: { enabled: true, placement: 'header-right', shape: 'square', width: 78, height: 98 }
  },
  theme: {
    variant: 'classic',
    colors: { primary: '#31577B', accent: '#EDF3F8' },
    typography: { fontFamily: { body: "'Microsoft YaHei', 'PingFang SC', sans-serif", heading: "'Microsoft YaHei', 'PingFang SC', sans-serif" } },
    spacing: { sectionSpacing: 0, itemSpacing: 0 }
  }
}

const db: MockDB = {
  templates: Array.from({ length: 12 }).map((_, i) => i === 0
    ? {
        id: 1,
        templateName: '技术开发 · ATS 单栏投递版',
        templateVariant: 'ats',
        layoutKey: 'qm-minimal-ats',
        previewImage: sampleCover,
        templateData: atsDeveloperTemplateData,
        industryTags: 'ATS,技术开发,前端,后端,测试,数据,无照片,单栏',
        status: true,
        useCount: 0,
        downloadCount: 0
      }
    : i === 1
      ? {
          id: 2,
          templateName: '应届校招 · 项目实习优先版',
          templateVariant: 'editorial',
          layoutKey: 'qm-student-editorial',
          previewImage: sampleCover,
          templateData: campusStudentTemplateData,
          description: '教育信息顶部摘要，项目、实习和校园成果构成正文主线。',
          industryTags: '校招,应届生,项目经历,实习经历,校园经历,教育背景',
          status: true,
          useCount: 0,
          downloadCount: 0
        }
      : i === 2
        ? {
            id: 3,
            templateName: '产品运营 · 成果导向版',
            templateVariant: 'spotlight',
            layoutKey: 'qm-spotlight-featured',
            previewImage: sampleCover,
            templateData: productOutcomeTemplateData,
            description: '用业务问题、个人行动与指标结果组织项目和经历。',
            industryTags: '产品,运营,增长,市场,成果导向,数据分析',
            status: true,
            useCount: 0,
            downloadCount: 0
          }
        : i === 3
          ? {
              id: 4,
              templateName: '正式表格 · 规范信息版',
              templateVariant: 'classic',
              layoutKey: 'qm-table-formal',
              previewImage: sampleCover,
              templateData: formalTableTemplateData,
              description: '规范表格承载个人信息与经历，适合国企、事业单位、教师和医护岗位。',
              industryTags: '表格,正式,国企,事业单位,教师,医护',
              status: true,
              useCount: 0,
              downloadCount: 0
            }
          : {
        id: i + 1,
        templateName: `测试模板${i + 1}`,
        previewImage: sampleCover,
        templateData: sampleTemplateData,
        status: true,
        useCount: 0,
        downloadCount: 0
      }),
  resumes: {},
  resumeVersions: {},
  favoriteTemplateIds: [],
  nextResumeId: 1,
  nextVersionId: 1
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
    const body = (typeof config.data === 'string'
      ? JSON.parse(config.data)
      : (config.data || {})) as Record<string, any>
    // 归一化：去掉域名与 /api 前缀
    const url = rawUrl
      .replace(/^https?:\/\/[^/]+/, '')
      .replace(/^\/api\b/, '')
      .split('?')[0]

    // Templates list (backend兼容：按 templateName 模糊查询)
    if (method === 'get' && url === '/templates') {
      const page = Number(params.page || 1)
      const limit = Number(params.limit || 20)
      const keyword = String(params.templateName || params.keyword || '')
      const filtered = keyword ? db.templates.filter(t => t.templateName.includes(keyword)) : db.templates
      const data = paginate(filtered, page, limit)
      return { data: { code: 200, message: 'success', data }, status: 200, statusText: 'OK', headers: {}, config }
    }

    if (method === 'get' && url === '/templates/favorites/list') {
      return {
        data: { code: 200, message: 'success', data: { templateIds: db.favoriteTemplateIds } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    }

    if (method === 'post' && /^\/templates\/\d+\/favorite$/.test(url)) {
      const id = Number(url.split('/')[2])
      if (!db.favoriteTemplateIds.includes(id)) db.favoriteTemplateIds.push(id)
      return { data: { code: 200, message: 'success', data: null }, status: 200, statusText: 'OK', headers: {}, config }
    }

    if (method === 'delete' && /^\/templates\/\d+\/favorite$/.test(url)) {
      const id = Number(url.split('/')[2])
      db.favoriteTemplateIds = db.favoriteTemplateIds.filter((item) => item !== id)
      return { data: { code: 200, message: 'success', data: null }, status: 200, statusText: 'OK', headers: {}, config }
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

    if (method === 'post' && url === '/resumes/import/parse') {
      const form = config.data instanceof FormData ? config.data : null
      const file = form?.get('file') as File | null
      const filename = file?.name || 'sample-resume.txt'
      return {
        data: {
          code: 200,
          message: '解析完成，请核对后再创建简历',
          data: {
            filename,
            fileType: filename.toLowerCase().endsWith('.pdf') ? 'pdf' : filename.toLowerCase().endsWith('.docx') ? 'docx' : 'txt',
            characterCount: 176,
            rawText: '李明\n产品经理\n13800138000\nliming@example.com\n\n项目经历\n智能简历系统\n负责需求分析、版本规划和交付推进。\n\n技能特长\n产品规划、数据分析、Figma',
            profile: { name: '李明', phone: '13800138000', email: 'liming@example.com' },
            sections: [
              { type: 'projects', title: '项目经历', text: '智能简历系统\n负责需求分析、版本规划和交付推进。', confidence: 'high' },
              { type: 'skills', title: '技能特长', text: '产品规划、数据分析、Figma', confidence: 'high' },
            ],
            warnings: ['导入结果由规则识别生成，请在保存前核对姓名、时间、公司与岗位字段。'],
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    }

    // Create resume
    if (method === 'post' && url === '/resumes') {
      const id = db.nextResumeId++
      const now = new Date().toISOString()
      const resume = {
        id,
        title: String(body.title || '我的简历'),
        content: String(body.content || ''),
        templateId: body.templateId ? Number(body.templateId) : undefined,
        version: 1,
        createTime: now,
        updateTime: now,
      }
      db.resumes[String(id)] = resume
      db.resumeVersions[String(id)] = []
      return { data: { code: 200, message: 'success', data: resume }, status: 200, statusText: 'OK', headers: {}, config }
    }

    if (method === 'get' && /^\/resumes\/\d+\/versions$/.test(url)) {
      const id = url.split('/')[2]
      const versions = [...(db.resumeVersions[id] || [])].sort((left, right) => right.id - left.id)
      return { data: { code: 200, message: 'success', data: versions }, status: 200, statusText: 'OK', headers: {}, config }
    }

    if (method === 'post' && /^\/resumes\/\d+\/versions$/.test(url)) {
      const id = url.split('/')[2]
      const resume = db.resumes[id]
      if (!resume) return { data: { code: 404, message: 'not found', data: null }, status: 404, statusText: 'NOT_FOUND', headers: {}, config }
      const version = {
        id: db.nextVersionId++,
        resumeId: Number(id),
        userId: 1,
        sourceVersion: resume.version,
        sourceType: 'manual',
        remark: body.remark || '',
        createTime: new Date().toISOString(),
        content: resume.content,
      }
      db.resumeVersions[id] = [version, ...(db.resumeVersions[id] || [])]
      return { data: { code: 200, message: 'success', data: version }, status: 200, statusText: 'OK', headers: {}, config }
    }

    if (method === 'post' && /^\/resumes\/\d+\/rollback$/.test(url)) {
      const id = url.split('/')[2]
      const resume = db.resumes[id]
      const version = (db.resumeVersions[id] || []).find((item) => item.id === Number(body.versionId))
      if (!resume || !version) return { data: { code: 404, message: 'not found', data: null }, status: 404, statusText: 'NOT_FOUND', headers: {}, config }
      const updated = { ...resume, content: version.content, version: resume.version + 1, updateTime: new Date().toISOString() }
      db.resumes[id] = updated
      return { data: { code: 200, message: 'success', data: updated }, status: 200, statusText: 'OK', headers: {}, config }
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
      const merged = { ...origin, ...body, version: origin.version + 1, updateTime: new Date().toISOString() }
      db.resumes[id] = merged
      return { data: { code: 200, message: 'success', data: merged }, status: 200, statusText: 'OK', headers: {}, config }
    }

    if (method === 'post' && url === '/ai/diagnose') {
      const contentText = String(body.contentText || '')
      const jobTitle = String(body.jobTitle || '目标岗位')
      return {
        data: {
          code: 200,
          message: 'success',
          data: {
            taskType: 'diagnose',
            executionMode: 'mock',
            provider: 'local-mock',
            model: 'evidence-review-v1',
            diagnostics: [
              `已按 ${jobTitle} 的 JD 与当前简历进行逐项证据检查。`,
              contentText.length > 300 ? '简历已有一定内容基础，下一步应优先补齐缺失要求的真实证据。' : '当前简历信息量偏少，建议先补充项目、行动和结果。',
            ],
            strategy: ['优先修改缺口对应模块，再压缩与目标岗位无关的泛化表述。', '每条经历采用“业务问题—个人行动—可验证结果”的顺序。'],
            warnings: ['不要为了覆盖 JD 关键词而补写未实际使用过的工具或不存在的量化结果。'],
            suggestions: [],
            patch: {},
            steps: [],
            sources: [],
            tokenUsed: Math.min(800, Math.max(80, contentText.length)),
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    }

    // Auth login
    if (method === 'post' && (url === '/auth/login' || url === '/auth/cuser/login')) {
      return { data: { code: 200, message: '登录成功', data: { access_token: 'mock-token', refresh_token: 'mock-refresh-token', user: { id: 1, username: 'mock' } } }, status: 200, statusText: 'OK', headers: {}, config }
    }

    if (method === 'get' && url === '/auth/cuser/profile') {
      const now = new Date().toISOString()
      return {
        data: {
          code: 200,
          message: 'success',
          data: { id: 1, username: 'mock', status: 1, createTime: now, updateTime: now, aiOperationCount: 0 },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    }

    if (method === 'post' && url === '/auth/cuser/logout') {
      return { data: { code: 200, message: 'success', data: null }, status: 200, statusText: 'OK', headers: {}, config }
    }

    // Export PDF
    if (method === 'post' && url === '/resumes/export') {
      return { data: { code: 200, message: '导出成功', data: { url: 'https://example.com/mock-resume.pdf' } }, status: 200, statusText: 'OK', headers: {}, config }
    }

    // Default passthrough
    return Promise.reject({ response: { status: 501, data: { code: 501, message: 'mock not implemented', data: null } } })
  }

  instance.interceptors.request.use((config) => {
    // Route mock requests through a local adapter instead of waiting for the
    // development proxy to fail first. This keeps editor initialization stable
    // when no backend service is running.
    ;(config as any)._mock = true
    ;(config as any).adapter = () => handler(config)
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


