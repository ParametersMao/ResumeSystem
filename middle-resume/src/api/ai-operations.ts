import { request } from '@/utils/request'
import type { PaginationParams } from '@/types'

/**
 * 获取AI操作记录列表
 * GET /api/ai-operations
 */
export const getAiOperationList = (params: PaginationParams & { userId?: number; operationType?: string }) => {
  return request.get('/ai-operations', { params })
}

/**
 * 查看AI操作详情
 * GET /api/ai-operations/{id}
 */
export const getAiOperationDetail = (id: number) => {
  return request.get(`/ai-operations/${id}`)
}

/**
 * 创建AI操作记录
 * POST /api/ai-operations
 */
export const createAiOperation = (data: { userId: number; operationType: string; prompt: string; response: string; tokenUsed: number }) => {
  return request.post('/ai-operations', data)
}

/**
 * 删除AI操作记录
 * DELETE /api/ai-operations/{id}
 */
export const deleteAiOperation = (id: number) => {
  return request.delete(`/ai-operations/${id}`)
}

/**
 * 获取AI操作统计
 * GET /api/ai-operations/statistics/overview
 */
export const getAiOperationStatistics = () => {
  return request.get('/ai-operations/statistics/overview')
} 