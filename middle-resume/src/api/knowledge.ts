import { request } from '@/utils/request'

export interface KnowledgeDocument {
  id: number
  name: string
  category: string
  description: string
  fileName: string
  mimeType: string
  fileSize: number
  status: 'pending' | 'indexing' | 'ready' | 'failed' | 'disabled'
  chunkCount: number
  errorMessage: string
  enabled: boolean
  createTime: string
  updateTime: string
}

export const getKnowledgeDocuments = (params: {
  page: number
  limit: number
  search?: string
  category?: string
  status?: string
}) => request.get('/admin/knowledge-documents', { params })

export const uploadKnowledgeDocument = (data: {
  file: File
  name?: string
  category?: string
  description?: string
}) => {
  const form = new FormData()
  form.append('file', data.file)
  if (data.name) form.append('name', data.name)
  if (data.category) form.append('category', data.category)
  if (data.description) form.append('description', data.description)
  return request.post('/admin/knowledge-documents/upload', form, {
    timeout: 120000,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const reindexKnowledgeDocument = (id: number) =>
  request.post(`/admin/knowledge-documents/${id}/reindex`, undefined, { timeout: 120000 })

export const toggleKnowledgeDocument = (id: number, enabled: boolean) =>
  request.put(`/admin/knowledge-documents/${id}/enabled`, { enabled })

export const deleteKnowledgeDocument = (id: number) =>
  request.delete(`/admin/knowledge-documents/${id}`)

export const searchKnowledge = (data: { query: string; category?: string; limit?: number }) =>
  request.post('/admin/knowledge-documents/search', data, { timeout: 60000 })

export const downloadKnowledgeDocument = (id: number) =>
  request.get(`/admin/knowledge-documents/${id}/file`, { responseType: 'blob' } as any)
