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
  // 列表接口有意省略完整 JSON；只有详情接口保证返回 templateData。
  templateData?: string | Record<string, any>
  templateVariant?: 'classic' | 'sidebar' | 'timeline' | 'spotlight' | 'ats' | 'executive' | 'compact' | 'editorial'
  layoutKey?: string
  avatarLayout?: Record<string, any>
  industryTags?: string
  recommendWeight?: number
  status: boolean
  createTime: string
  updateTime: string
  useCount: number
  downloadCount: number
}

export interface TemplateDetail extends Omit<Template, 'templateData'> {
  templateData: string
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
  operationType: 'polish' | 'generate' | 'diagnose' | 'agent-polish' | 'agent-generate' | 'agent-diagnose'
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
  roles?: Array<'admin' | 'operator' | 'viewer'>
}

// C端用户类型
export interface CUser {
  id: number
  username: string
  phone?: string
  email?: string
  status: number
  createTime: string
  updateTime: string
  aiOperationCount: number
}

// 统计概览数据
export interface StatisticsOverview {
  total_users: number
  total_templates: number
  total_ai_operations: number
  today_new_users: number
  today_resumes: number
  active_users_today: number
}

// 趋势数据项
export interface TrendItem {
  date: string
  count: number
}

// 趋势数据
export interface TrendData {
  user_trend: TrendItem[]
  resume_trend: TrendItem[]
  ai_trend: TrendItem[]
}

// 用户活跃度数据
export interface UserActivityItem {
  id: number
  username: string
  email?: string
  aiOperationCount?: number
  ai_operation_count?: number
  lastActiveAt?: string
  last_active_at?: string
}

// 模板使用分布
export interface TemplateUsageItem {
  templateName: string
  count: number
}

// AI操作统计
export interface AiOperationStat {
  operationType: string
  count: number
}

// 用户行为分析数据
export interface UserAnalyticsData {
  activity_trend: TrendItem[]
  registration_trend: TrendItem[]
  retention: {
    date: string
    rate: number
  }[]
}

// 系统配置类型
export interface SiteConfig {
  siteName: string
  siteLogo: string
  contactEmail: string
  contactPhone: string
  icp?: string
}

export interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  fromName: string
  fromEmail: string
  encryption: 'none' | 'ssl' | 'tls'
  smtpPassConfigured?: boolean
}

export interface AiConfig {
  executionEngine: 'direct' | 'agent'
  agentBaseUrl: string
  provider:
    | 'mock'
    | 'openai-compatible'
    | 'openai'
    | 'deepseek'
    | 'qwen'
    | 'glm'
    | 'moonshot'
    | 'doubao'
    | 'langgraph-agent'
    | 'custom'
    | string
  apiBaseUrl: string
  apiKey: string
  apiModel: string
  temperature: number
  dailyLimit: number
  perUserLimit: number
  enabled: boolean
  polishPromptTemplate: string
  generatePromptTemplate: string
  apiKeyConfigured?: boolean
}

export interface SystemConfigData {
  site: SiteConfig
  email: EmailConfig
  ai: AiConfig
}

// 数据导出筛选参数
export interface ExportParams {
  startDate: string
  endDate: string
  format: 'csv'
} 
