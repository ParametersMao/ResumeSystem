import { request } from '@/utils/request'
import type { ApiResponse, PaginationParams } from '@/types'

/**
 * 管理员登录
 * POST /api/auth/login
 */
export const login = (data: { username: string; password: string }) => {
  return request.post<{ access_token: string; user: any }>('/auth/login', data)
}

/**
 * 获取当前用户信息
 * GET /api/auth/profile
 */
export const getProfile = () => {
  return request.get('/auth/profile')
}

/**
 * 获取用户列表
 * GET /api/admin/users
 */
export const getUserList = (params: PaginationParams & { search?: string; status?: number }) => {
  return request.get('/admin/users', { params })
}

/**
 * 新增用户
 * POST /api/admin/users
 */
export const createUser = (data: { username: string; password: string; email: string; user_type: string }) => {
  return request.post('/admin/users', data)
}

/**
 * 编辑用户
 * PUT /api/admin/users/{id}
 */
export const updateUser = (id: number, data: { username?: string; email?: string; user_type?: string }) => {
  return request.put(`/admin/users/${id}`, data)
}

/**
 * 启用/禁用用户
 * PATCH /api/admin/users/{id}/status
 */
export const updateUserStatus = (id: number, status: number) => {
  return request.patch(`/admin/users/${id}/status`, { status })
}

/**
 * 删除用户
 * DELETE /api/admin/users/{id}
 */
export const deleteUser = (id: number) => {
  return request.delete(`/admin/users/${id}`)
} 