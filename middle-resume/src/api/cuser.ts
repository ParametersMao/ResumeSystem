import { request } from '@/utils/request'
import type { PaginationParams } from '@/types'

/**
 * 获取C端用户列表
 * GET /api/cusers
 */
export const getCUserList = (params: PaginationParams & { search?: string; status?: number }) => {
  return request.get('/cusers', { params })
}

/**
 * 新增C端用户
 * POST /api/cusers
 */
export const createCUser = (data: { username: string; phone: string; email: string; password: string }) => {
  return request.post('/cusers', data)
}

/**
 * 编辑C端用户
 * PUT /api/cusers/{id}
 */
export const updateCUser = (id: number, data: { username?: string; phone?: string; email?: string }) => {
  return request.put(`/cusers/${id}`, data)
}

/**
 * 启用/禁用C端用户
 * PATCH /api/cusers/{id}/status
 */
export const updateCUserStatus = (id: number, status: number) => {
  return request.patch(`/cusers/${id}/status`, { status })
}

/**
 * 删除C端用户
 * DELETE /api/cusers/{id}
 */
export const deleteCUser = (id: number) => {
  return request.delete(`/cusers/${id}`)
}

export const resetCUserPassword = (id: number, password: string) => {
  return request.patch(`/cusers/${id}/reset-password`, { password })
}
