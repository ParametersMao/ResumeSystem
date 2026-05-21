import http, { ApiResponse, PageResult } from './request'
import type { Resume } from '@/store/resume'

export async function createResume(templateId: string | undefined, title: string, userId: number, content: string) {
  const payload: Record<string, unknown> = {
    title,
    userId,
    content,
  }

  if (templateId) {
    const parsedTemplateId = parseInt(templateId, 10)
    if (!Number.isNaN(parsedTemplateId)) {
      payload.templateId = parsedTemplateId
    }
  }

  const { data } = await http.post<ApiResponse<{ id: number }>>('/api/resumes', payload)
  return { resumeId: data.data.id.toString() }
}

export async function getResume(resumeId: string, userId?: number) {
  const params = userId ? { userId } : {}
  const { data } = await http.get<ApiResponse<any>>(`/api/resumes/${resumeId}`, { params })
  return data.data
}

export async function updateResume(resumeId: string, payload: any, userId?: number) {
  const params = userId ? { userId } : {}
  const { data } = await http.put<ApiResponse<any>>(`/api/resumes/${resumeId}`, payload, { params })
  return data.data
}

export async function listMyResumes(userId: number, page = 1, limit = 10) {
  const { data } = await http.get<ApiResponse<PageResult<any>>>('/api/resumes', { 
    params: { userId, page, limit } 
  })
  return data.data
}

export async function exportResumePdfByHtml(html: string) {
  const { data } = await http.post<ApiResponse<{ url: string }>>('/api/resumes/export', { html })
  return data.data
}

export async function uploadResumePhoto(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post<ApiResponse<{ url: string; key: string }>>('/api/resumes/assets/photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function listResumeVersions(resumeId: string, userId?: number) {
  const params = userId ? { userId } : {}
  const { data } = await http.get<ApiResponse<any[]>>(`/api/resumes/${resumeId}/versions`, { params })
  return data.data
}

export async function createResumeVersionSnapshot(resumeId: string, userId?: number, remark?: string) {
  const params = userId ? { userId } : {}
  const { data } = await http.post<ApiResponse<any>>(`/api/resumes/${resumeId}/versions`, { remark }, { params })
  return data.data
}

export async function rollbackResumeVersion(resumeId: string, versionId: number, userId?: number) {
  const params = userId ? { userId } : {}
  const { data } = await http.post<ApiResponse<any>>(`/api/resumes/${resumeId}/rollback`, { versionId }, { params })
  return data.data
}


