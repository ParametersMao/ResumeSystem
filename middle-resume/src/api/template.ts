import { request } from '@/utils/request'
import type { PaginationParams, TemplateDetail } from '@/types'

export type TemplateVariant = 'classic' | 'sidebar' | 'timeline' | 'spotlight' | 'ats' | 'executive' | 'compact' | 'editorial'

/**
 * 获取模板列表
 * GET /api/templates
 */
export const getTemplateList = (params: PaginationParams & { templateName?: string; description?: string; status?: boolean | null; industryTags?: string; templateVariant?: TemplateVariant | '' }) => {
  return request.get('/templates/admin/list', { params })
}

/**
 * 获取模板详情
 * GET /api/templates/{id}
 */
export const getTemplateDetail = (id: number) => {
  return request.get<TemplateDetail>(`/templates/admin/${id}`)
}

/**
 * 新增模板
 * POST /api/templates
 */
export const createTemplate = (data: {
  templateName: string
  description?: string
  templateData: string
  previewImage?: string
  industryTags?: string
  status?: boolean
  templateVariant?: TemplateVariant
  recommendWeight?: number
}) => {
  return request.post<TemplateDetail>('/templates', data)
}

/**
 * 编辑模板
 * PUT /api/templates/{id}
 */
export const updateTemplate = (id: number, data: {
  templateName?: string
  description?: string
  templateData?: string
  previewImage?: string
  industryTags?: string
  status?: boolean
  templateVariant?: TemplateVariant
  recommendWeight?: number
}) => {
  return request.put<TemplateDetail>(`/templates/${id}`, data)
}

/**
 * 删除模板
 * DELETE /api/templates/{id}
 */
export const deleteTemplate = (id: number) => {
  return request.delete(`/templates/${id}`)
}

/**
 * 导出PDF
 * POST /api/resumes/export
 */
export const exportResumePdf = (html: string) => {
  return request.post('/resumes/export', { html })
} 
