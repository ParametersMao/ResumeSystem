import http, { ApiResponse, PageResult } from './request'
import type { Resume } from '@/store/resume'
import { parseResumePhotoUploadResponse } from '@/core-resume/photo'

export type ImportedSectionType =
  | 'education'
  | 'experience'
  | 'projects'
  | 'internship'
  | 'campus'
  | 'skills'
  | 'awards'
  | 'summary'
  | 'custom'

export interface ResumeImportResult {
  filename: string
  fileType: 'txt' | 'pdf' | 'docx'
  characterCount: number
  pageCount?: number
  rawText: string
  profile: { name: string; phone: string; email: string }
  sections: Array<{
    type: ImportedSectionType
    title: string
    text: string
    confidence: 'high' | 'medium' | 'low'
  }>
  warnings: string[]
}

export interface JobDescriptionMetadata {
  id: number
  name: string
  category: 'job-description'
  sourceType: 'job-description'
  scope: 'private'
  ownerUserId: number
  resumeId: number
  fileName: string
  mimeType: string
  fileSize: number
  status: 'pending' | 'indexing' | 'ready' | 'failed' | 'disabled'
  chunkCount: number
  errorMessage: string
  enabled: boolean
  createTime: string
  updateTime: string
  expiresAt?: string | null
}

export async function createResume(templateId: string | undefined, title: string, userId: number, content: string) {
  const payload: Record<string, unknown> = {
    title,
    content,
  }

  if (templateId) {
    const parsedTemplateId = parseInt(templateId, 10)
    if (!Number.isNaN(parsedTemplateId)) {
      payload.templateId = parsedTemplateId
    }
  }

  const { data } = await http.post<ApiResponse<any>>('/api/resumes', payload)
  return data.data
}

export async function getResume(resumeId: string, userId?: number) {
  const { data } = await http.get<ApiResponse<any>>(`/api/resumes/${resumeId}`)
  return data.data
}

export async function updateResume(resumeId: string, payload: any, userId?: number) {
  const { data } = await http.put<ApiResponse<any>>(`/api/resumes/${resumeId}`, payload)
  return data.data
}

export async function listMyResumes(userId: number, page = 1, limit = 10) {
  const { data } = await http.get<ApiResponse<PageResult<any>>>('/api/resumes', { 
    params: { page, limit }
  })
  return data.data
}

export async function exportResumePdfByHtml(
  html: string,
  context: { resumeId?: number; templateId?: number } = {},
) {
  const { data } = await http.post<ApiResponse<{ url: string; pageCount: number }>>('/api/resumes/export', {
    html,
    ...context,
  })
  return data.data
}

export async function uploadResumePhoto(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post<ApiResponse<{ url: string; key: string }>>('/api/resumes/assets/photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return parseResumePhotoUploadResponse(data)
}

export async function parseResumeImport(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post<ApiResponse<ResumeImportResult>>('/api/resumes/import/parse', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function saveResumeJobDescription(
  resumeId: string | number,
  input: { text?: string; file?: File; expiresAt?: string },
) {
  const form = new FormData()
  if (input.file) form.append('file', input.file)
  if (input.text) form.append('text', input.text)
  if (input.expiresAt) form.append('expiresAt', input.expiresAt)
  const { data } = await http.post<ApiResponse<JobDescriptionMetadata>>(
    `/api/resumes/${resumeId}/job-description`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 },
  )
  return data.data
}

export async function getResumeJobDescription(resumeId: string | number) {
  const { data } = await http.get<ApiResponse<JobDescriptionMetadata | null>>(
    `/api/resumes/${resumeId}/job-description`,
  )
  return data.data
}

export async function deleteResumeJobDescription(resumeId: string | number) {
  const { data } = await http.delete<ApiResponse<null>>(
    `/api/resumes/${resumeId}/job-description`,
  )
  return data
}

export async function listResumeVersions(resumeId: string, userId?: number) {
  const { data } = await http.get<ApiResponse<any[]>>(`/api/resumes/${resumeId}/versions`)
  return data.data
}

export async function createResumeVersionSnapshot(resumeId: string, userId?: number, remark?: string) {
  const { data } = await http.post<ApiResponse<any>>(`/api/resumes/${resumeId}/versions`, { remark })
  return data.data
}

export async function rollbackResumeVersion(resumeId: string, versionId: number, userId?: number) {
  const { data } = await http.post<ApiResponse<any>>(`/api/resumes/${resumeId}/rollback`, { versionId })
  return data.data
}


