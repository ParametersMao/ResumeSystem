import http, { ApiResponse, PageResult } from './request'
import type { Resume } from '@/store/resume'

export async function createResume(templateId: string, title: string, userId: number, content: string) {
  const { data } = await http.post<ApiResponse<{ id: number }>>('/api/resumes', { 
    templateId: parseInt(templateId), 
    title, 
    userId,
    content 
  })
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


