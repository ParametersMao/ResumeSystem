// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  phone: string
  avatar?: string
  status: 'active' | 'inactive'
  role: 'admin' | 'operator' | 'viewer'
  createdAt: string
  updatedAt: string
}

export interface LoginForm {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

// 模板相关类型
export interface Template {
  id: number
  templateName: string
  description?: string
  previewImage?: string
  templateData: Record<string, any>
  status: boolean
  createTime: string
  updateTime: string
  useCount: number
  downloadCount: number
}

// 统计数据相关类型
export interface ResumeStatistics {
  date: string
  count: number
}

export interface PopularTemplate {
  templateId: number
  templateName: string
  usageCount: number
  percentage: number
}

// AI操作相关类型
export interface AiOperation {
  id: number
  userId: number
  username: string
  operationType: 'polish' | 'generate'
  inputData: string
  outputData: string
  status: 'success' | 'failed' | 'processing'
  createdAt: string
  processingTime?: number
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: {
    code: number
    message: string
    data: {
      list: T[]
      total: number
      page: number | string
      limit: number
    }
  }
}

// 路由元信息类型
export interface RouteMeta {
  title?: string
  icon?: string
  requiresAuth?: boolean
  permissions?: string[]
}

// C端用户类型
export interface CUser {
  id: number
  nickname: string
  phone: string
  email: string
  avatar?: string
  gender?: 'male' | 'female' | 'other'
  status: 'active' | 'inactive'
  registerAt: string
  lastLoginAt: string
} 