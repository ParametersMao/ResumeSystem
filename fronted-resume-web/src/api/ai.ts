import request, { ApiResponse } from './request'

export interface PolishSuggestion {
  reason: string
  html: string
}

export interface AiRuntimeMeta {
  provider: string
  model: string
  executionMode: 'mock' | 'prepared' | 'live'
  promptPreview?: string
}

export interface AiPolishResponse extends AiRuntimeMeta {
  sectionType?: string | null
  suggestions: PolishSuggestion[]
  tokenUsed: number
}

export interface AiGenerateResponse extends AiRuntimeMeta {
  sectionType?: string | null
  intention?: string
  summary: string
  skills: string[]
  experiences?: any[]
  projects: any[]
  tokenUsed: number
}

export function aiPolish(payload: { inputText: string; sectionType?: string; jobTitle?: string }): Promise<ApiResponse<AiPolishResponse>> {
  return request.post('/api/ai/polish', payload).then((res) => res.data)
}

export function aiGenerate(payload: { jobTitle: string; sectionType?: string; contextText?: string }): Promise<ApiResponse<AiGenerateResponse>> {
  return request.post('/api/ai/generate', payload).then((res) => res.data)
}

