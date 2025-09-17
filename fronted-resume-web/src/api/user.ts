import request, { ApiResponse } from './request'

// 用户登录
export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  access_token: string
  user: {
    id: number
    username: string
    email?: string
    phone?: string
  }
}

// 用户注册
export interface RegisterParams {
  username: string
  password: string
  email?: string
  phone?: string
}

// 用户信息
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

// C端用户登录
export function login(params: LoginParams): Promise<ApiResponse<LoginResult>> {
  return request.post('/api/auth/cuser/login', params).then(res => res.data)
}

// C端用户注册
export function register(params: RegisterParams): Promise<ApiResponse<LoginResult>> {
  return request.post('/api/auth/register', params).then(res => res.data)
}

// 获取用户信息
export function getUserInfo(): Promise<ApiResponse<UserInfo>> {
  return request.get('/api/auth/cuser/profile').then(res => res.data)
}

// 退出登录（前端操作，清除token）
export function logout() {
  // 这里可以调用后端接口使token失效，目前只做前端清理
  return Promise.resolve()
}
