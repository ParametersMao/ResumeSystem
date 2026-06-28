// 应用常量
export const APP_NAME = '简历中台系统'
export const APP_VERSION = '1.0.0'

// 用户角色
export const USER_ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
} as const

// 用户状态
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const

// 模板状态
export const TEMPLATE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const

// AI操作类型
export const AI_OPERATION_TYPES = {
  POLISH: 'polish',
  GENERATE: 'generate',
  DIAGNOSE: 'diagnose',
  AGENT_POLISH: 'agent-polish',
  AGENT_GENERATE: 'agent-generate'
} as const

// AI操作状态
export const AI_OPERATION_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PROCESSING: 'processing'
} as const

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
} as const

// 文件上传配置
export const UPLOAD = {
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  MAX_FILES: 1
} as const

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
} as const

// 主题配置
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const

// 语言配置
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US'
} as const

// 路由名称
export const ROUTE_NAMES = {
  LOGIN: 'Login',
  DASHBOARD: 'Dashboard',
  USER_MANAGEMENT: 'UserManagement',
  TEMPLATE_MANAGEMENT: 'TemplateManagement',
  DATA_STATISTICS: 'DataStatistics',
  AI_OPERATIONS: 'AiOperations'
} as const

// API 响应码
export const API_CODES = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
} as const

// 时间格式
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss'
} as const

// 图表配置
export const CHART_COLORS = {
  PRIMARY: '#409EFF',
  SUCCESS: '#67C23A',
  WARNING: '#E6A23C',
  DANGER: '#F56C6C',
  INFO: '#909399'
} as const
