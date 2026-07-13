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

export interface AiAgentStep {
  name: string
  title: string
  summary: string
  output?: Record<string, any>
}

export interface AiDiagnoseResponse extends AiRuntimeMeta {
  taskType: 'diagnose'
  steps: AiAgentStep[]
  suggestions: Array<Record<string, any>>
  diagnostics: string[]
  strategy?: string[]
  warnings?: string[]
  patch: Record<string, any>
  sources: Array<{
    documentId: number
    documentName: string
    category: string
    sourceType?: 'standard' | 'role-framework' | 'resume-exemplar' | 'job-description'
    scope?: 'global' | 'private'
    ownerUserId?: number | null
    resumeId?: string | null
    factType?: 'standard' | 'example' | 'job_context'
    chunkIndex: number
    text: string
    score: number
  }>
  tokenUsed: number
}

export function aiPolish(payload: { inputText: string; sectionType?: string; jobTitle?: string; resumeId?: string; includeExemplars?: boolean }): Promise<ApiResponse<AiPolishResponse>> {
  return request.post('/api/ai/polish', payload).then((res) => res.data)
}

export function aiGenerate(payload: { jobTitle: string; sectionType?: string; contextText?: string; resumeId?: string; includeExemplars?: boolean }): Promise<ApiResponse<AiGenerateResponse>> {
  return request.post('/api/ai/generate', payload).then((res) => res.data)
}

export function aiDiagnose(payload: {
  resumeId?: string
  sectionType?: string
  jobTitle?: string
  templateVariant?: string
  selectedText?: string
  contentText?: string
  content?: Record<string, any>
  userInstruction?: string
}): Promise<ApiResponse<AiDiagnoseResponse>> {
  return request.post('/api/ai/diagnose', payload).then((res) => res.data)
}

