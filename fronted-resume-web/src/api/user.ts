import request, { ApiResponse } from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  access_token: string
  refresh_token: string
  user: {
    id: number
    username: string
    email?: string
    phone?: string
  }
}

export interface UserInfo {
  id: number
  username: string
  email?: string
  phone?: string
  status: number
  createTime: string
  updateTime: string
  aiOperationCount: number
}

export interface EntitlementSummary {
  planCode: string
  usagePeriodStart?: string
  resume: { used: number; total: number; remaining: number }
  versionPerResume: { total: number }
  ai: { used: number; total: number; remaining: number }
  pdf: { used: number; total: number; remaining: number }
  storage: { usedBytes: number; totalBytes: number; remainingBytes: number }
}

export type EmailCodePurpose = 'register' | 'login' | 'reset-password'

export function login(params: LoginParams): Promise<ApiResponse<LoginResult>> {
  return request.post('/api/auth/cuser/login', params).then(res => res.data)
}

export function sendEmailCode(params: {
  email: string
  purpose: EmailCodePurpose
}): Promise<ApiResponse<{ expiresIn: number; developmentCode?: string }>> {
  return request.post('/api/auth/email/send-code', params).then(res => res.data)
}

export function registerByEmail(params: {
  email: string
  code: string
  password: string
  username?: string
}): Promise<ApiResponse<LoginResult>> {
  return request.post('/api/auth/email/register', params).then(res => res.data)
}

export function loginByEmailCode(params: {
  email: string
  code: string
}): Promise<ApiResponse<LoginResult>> {
  return request.post('/api/auth/email/login', params).then(res => res.data)
}

export function resetPasswordByEmail(params: {
  email: string
  code: string
  newPassword: string
}): Promise<ApiResponse<{ success: boolean }>> {
  return request.post('/api/auth/email/reset-password', params).then(res => res.data)
}

export function getUserInfo(): Promise<ApiResponse<UserInfo>> {
  return request.get('/api/auth/cuser/profile').then(res => res.data)
}

export function getUserCenter(): Promise<
  ApiResponse<{ user: UserInfo; entitlements: EntitlementSummary }>
> {
  return request.get('/api/auth/cuser/center').then(res => res.data)
}

export function logout() {
  return request.post('/api/auth/cuser/logout').then(res => res.data)
}
