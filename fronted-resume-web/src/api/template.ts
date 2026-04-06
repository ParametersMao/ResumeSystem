import http, { ApiResponse, PageResult } from './request'

export interface TemplateMeta {
  templateId: string;
  name: string;
  coverUrl: string;
  themeColor: string;
  fontFamily: string;
  status?: 'online' | 'offline';
}

export interface TemplateDetail extends TemplateMeta {
  templateData?: any
}

// 后端字段为 id/templateName/previewImage/...，此处做一层映射到前端 TemplateMeta
type BackendTemplateList = { id: number; templateName: string; previewImage?: string; description?: string; status?: boolean; createTime?: string; updateTime?: string; useCount?: number; downloadCount?: number }
type BackendTemplateDetail = { id: number; templateName: string; templateData: string; previewImage?: string; description?: string; status?: boolean; createTime?: string; updateTime?: string; useCount?: number; downloadCount?: number }

export async function fetchTemplates(page = 1, limit = 20, keyword = '', industryTags: string[] = []) {
  const tagParam = industryTags.length ? industryTags.join(',') : undefined
  const { data } = await http.get<ApiResponse<PageResult<BackendTemplateList>>>('/api/templates', { params: { page, limit, templateName: keyword, status: true, industryTags: tagParam } })
  const mapped: PageResult<TemplateMeta> = {
    list: data.data.list.map((t) => ({
      templateId: String(t.id),
      name: t.templateName,
      coverUrl: t.previewImage || '',
      themeColor: '#2e6cff',
      fontFamily: 'Source Han Sans',
      status: t.status ? 'online' : 'offline'
    })),
    total: data.data.total,
    page: data.data.page,
    limit: data.data.limit
  }
  return mapped
}

export async function getTemplate(templateId: string) {
  const { data } = await http.get<ApiResponse<BackendTemplateList>>(`/api/templates`, { params: { id: templateId } })
  const t = Array.isArray((data as any).data?.list) ? (data as any).data.list.find((x: any) => String(x.id) === templateId) : (data as any).data
  const mapped: TemplateMeta = {
    templateId: String(t.id),
    name: t.templateName,
    coverUrl: t.previewImage || '',
    themeColor: '#2e6cff',
    fontFamily: 'Source Han Sans',
    status: t.status ? 'online' : 'offline'
  }
  return mapped
}

// 获取模板详情（包含 templateData），优先走 /api/templates/:id
export async function getTemplateDetail(templateId: string): Promise<TemplateDetail & { templateData?: any }> {
  const { data } = await http.get<ApiResponse<BackendTemplateDetail>>(`/api/templates/${templateId}`)
  const t: any = (data as any).data
  const mapped: TemplateDetail = {
    templateId: String(t.id),
    name: t.templateName,
    coverUrl: t.previewImage || '',
    themeColor: '#2e6cff',
    fontFamily: 'Source Han Sans',
    status: t.status ? 'online' : 'offline',
    templateData: t.templateData
  }
  return mapped
}


