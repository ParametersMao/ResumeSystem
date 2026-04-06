import request, { ApiResponse } from './request'

export interface PolishSuggestion {
  reason: string
  html: string
}

export function aiPolish(payload: { inputText: string; sectionType?: string }): Promise<ApiResponse<{ suggestions: PolishSuggestion[]; tokenUsed: number }>> {
  return request.post('/api/ai/polish', payload).then((res) => res.data)
}

export function aiGenerate(payload: { jobTitle: string }): Promise<ApiResponse<{ summary: string; skills: string[]; projects: any[]; tokenUsed: number }>> {
  return request.post('/api/ai/generate', payload).then((res) => res.data)
}

