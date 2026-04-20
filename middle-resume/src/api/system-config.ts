import { request } from '@/utils/request'
import type { SystemConfigData, PaginationParams } from '@/types'

/**
 * 获取系统配置
 * GET /api/admin/system-config
 */
export const getSystemConfig = () => {
  return request.get<SystemConfigData>('/admin/system-config')
}

/**
 * 更新系统配置
 * PUT /api/admin/system-config
 */
export const updateSystemConfig = (data: Partial<SystemConfigData>) => {
  return request.put('/admin/system-config', data)
}

export const previewAiPrompt = (data: {
  taskType: 'polish' | 'generate'
  inputText?: string
  sectionType?: string
  jobTitle?: string
}) => {
  return request.put('/admin/system-config/ai/preview', data)
}

export const testAiConnection = (data: Partial<SystemConfigData['ai']>) => {
  return request.put('/admin/system-config/ai/test-connection', data)
}

/**
 * 获取用户行为分析数据
 * GET /api/statistics/user-analytics
 */
export const getUserAnalytics = (params?: { period?: 'day' | 'week' | 'month' }) => {
  return request.get('/statistics/user-analytics', { params })
}

/**
 * 导出用户列表 (CSV)
 * GET /api/admin/export/users
 */
export const exportUsers = (params: PaginationParams & { search?: string; startDate?: string; endDate?: string }) => {
  return request.get('/admin/export/users', { params, responseType: 'blob' } as any)
}

/**
 * 导出AI操作记录 (CSV)
 * GET /api/admin/export/ai-operations
 */
export const exportAiOperations = (params: PaginationParams & { userId?: number; startDate?: string; endDate?: string }) => {
  return request.get('/admin/export/ai-operations', { params, responseType: 'blob' } as any)
}
