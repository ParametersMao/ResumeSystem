/**
 * 模块类型映射工具
 * 用于统一处理不同版本模板中的模块类型命名差异
 */

/**
 * 模块类型别名映射表
 * 将旧版或不同命名的模块类型映射到标准类型
 */
export const MODULE_TYPE_ALIASES: Record<string, string> = {
  // 个人信息模块的各种别名
  'personal': 'basic',
  'personalInfo': 'basic',
  'personal-info': 'basic',
  'profile': 'basic',
  
  // 求职意向
  'intention': 'intention',
  'job-intention': 'intention',
  'career-objective': 'intention',
  
  // 教育经历
  'education': 'education',
  'edu': 'education',
  'educational': 'education',
  
  // 工作经验
  'experience': 'experience',
  'work': 'experience',
  'work-experience': 'experience',
  'employment': 'experience',
  
  // 项目经验
  'projects': 'projects',
  'project': 'projects',
  'project-experience': 'projects',
  
  // 技能特长
  'skills': 'skills',
  'skill': 'skills',
  'abilities': 'skills',
  
  // 实习经历
  'internship': 'internship',
  'intern': 'internship',
  'internships': 'internship',
  
  // 校园经历
  'campus': 'campus',
  'campus-experience': 'campus',
  'school-activities': 'campus',
  
  // 荣誉奖项
  'awards': 'awards',
  'award': 'awards',
  'honors': 'awards',
  'certificates': 'awards',
  'certificate': 'awards',
  
  // 自我评价
  'summary': 'summary',
  'self-evaluation': 'summary',
  'about': 'summary',
  'introduction': 'summary',
  
  // 自定义模块
  'custom': 'custom'
}

/**
 * 标准化模块类型
 * @param type 原始模块类型
 * @returns 标准化后的模块类型
 */
export function normalizeModuleType(type: string): string {
  if (!type) return 'custom'
  
  const lowerType = type.toLowerCase().trim()
  const normalized = MODULE_TYPE_ALIASES[lowerType]
  
  if (normalized) {
    console.log(`模块类型映射: "${type}" -> "${normalized}"`)
    return normalized
  }
  
  // 如果没有找到映射，返回原类型
  console.warn(`未知的模块类型: "${type}"，将作为自定义模块处理`)
  return lowerType
}

/**
 * 获取模块渲染器名称
 * @param type 模块类型
 * @returns 渲染器组件名称
 */
export function getRendererName(type: string): string {
  const normalizedType = normalizeModuleType(type)
  return `${normalizedType}-renderer`
}

/**
 * 检查是否为基础信息模块
 * @param type 模块类型
 * @returns 是否为基础信息模块
 */
export function isBasicInfoModule(type: string): boolean {
  const normalizedType = normalizeModuleType(type)
  return normalizedType === 'basic'
}

/**
 * 获取模块的默认配置
 * @param type 模块类型
 * @returns 默认配置对象
 */
export function getDefaultModuleConfig(type: string): Record<string, any> {
  const normalizedType = normalizeModuleType(type)
  
  const defaults: Record<string, Record<string, any>> = {
    basic: {
      layout: 'flexible',
      showTitle: false
    },
    intention: {
      layout: 'simple'
    },
    education: {
      layout: 'timeline'
    },
    experience: {
      layout: 'timeline'
    },
    projects: {
      layout: 'timeline'
    },
    skills: {
      layout: 'mixed'
    },
    internship: {
      layout: 'timeline'
    },
    campus: {
      layout: 'timeline'
    },
    awards: {
      layout: 'simple'
    },
    summary: {
      layout: 'simple'
    },
    custom: {
      layout: 'simple'
    }
  }
  
  return defaults[normalizedType] || defaults.custom
}

/**
 * 可用的标准模块类型列表
 */
export const STANDARD_MODULE_TYPES = [
  'basic',
  'intention',
  'education',
  'experience',
  'projects',
  'skills',
  'internship',
  'campus',
  'awards',
  'summary'
]

/**
 * 判断模块类型是否需要特殊处理
 * @param type 模块类型
 * @returns 是否需要特殊处理
 */
export function needsSpecialHandling(type: string): boolean {
  const normalizedType = normalizeModuleType(type)
  
  // 基础信息模块需要特殊处理
  return normalizedType === 'basic'
}

