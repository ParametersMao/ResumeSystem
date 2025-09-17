// 新的简历数据结构类型定义

export interface BasicProfile {
  name: string
  title: string
  contacts: {
    email: string
    phone: string
    site: string
  }
}

export interface ResumeProfile {
  basic: BasicProfile
  summary: string
}

// 各种模块项类型
export interface ExperienceItem {
  company: string
  role: string
  duration: { start: string; end: string }
  desc: string
}

export interface EducationItem {
  school: string
  degree: string
  duration: { start: string; end: string }
}

export interface ProjectItem {
  name: string
  role: string
  duration: { start: string; end: string }
  desc: string
}

export interface CustomItem {
  [key: string]: any
}

export type SectionItem = ExperienceItem | EducationItem | ProjectItem | string | CustomItem

// 模块配置
export interface SectionConfig {
  fields?: FieldConfig[]
  itemType?: 'list' | 'array' | 'object'
  allowMultiple?: boolean
}

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'select' | 'dateRange'
  required?: boolean
  richText?: boolean // 是否使用富文本编辑器（仅对textarea有效）
  options?: string[]
}

// 简历模块
export interface ResumeSection {
  id: string
  type: ModuleType
  title: string
  visible: boolean
  order: number
  items: SectionItem[]
  config?: SectionConfig
  style?: Record<string, any>
}

// 完整的简历数据结构
export interface ResumeData {
  profile: ResumeProfile
  sections: ResumeSection[]
  globalStyles?: {
    themeColor?: string
    paragraphSpacing?: string
    elementSpacing?: string
    fontFamily?: string
    [key: string]: any
  }
}

// 模板样式
export interface TemplateStyles {
  colors: {
    primary: string
    secondary: string
    text: string
    background: string
  }
  fonts: {
    heading: string
    body: string
  }
  spacing: {
    sectionMargin: string
    elementMargin: string
  }
}

// 模板数据
export interface TemplateData {
  templateName?: string
  styles: TemplateStyles
  sections: {
    [key: string]: any
  }
}

// ========== 新增：分层控制状态管理 ==========

// 模块类型枚举
export type ModuleType = 
  | 'basic'           // 基本信息（必需）
  | 'intention'       // 求职意向
  | 'education'       // 教育背景
  | 'experience'      // 工作经验
  | 'projects'        // 项目经历
  | 'internship'      // 实习经历
  | 'campus'          // 校园经历
  | 'skills'          // 技能特长
  | 'awards'          // 荣誉证书
  | 'summary'         // 自我评价
  | 'hobbies'         // 兴趣爱好
  | 'custom'          // 自定义模块

// 模块状态管理
export interface ModuleState {
  type: ModuleType
  visible: boolean        // 模板默认显示状态
  userVisible: boolean    // 用户当前显示状态
  collapsed: boolean      // 编辑区域是否收起
  allowHide: boolean      // 是否允许隐藏
  allowCollapse: boolean  // 是否允许收起
  order: number          // 模块顺序
  config: {
    title: string
    layout?: string
    titleStyle?: string
    [key: string]: any
  }
}

// 用户模块设置（本地存储）
export interface UserModuleSettings {
  [moduleType: string]: {
    visible: boolean
    collapsed: boolean
    order: number
  }
}

// 模板布局配置
export interface TemplateLayout {
  type: ModuleType
  visible: boolean
  collapsed: boolean
  order: number
  config: {
    title: string
    layout?: string
    titleStyle?: string
    allowHide?: boolean
    allowCollapse?: boolean
    [key: string]: any
  }
}

// 完整的模板数据结构
export interface TemplateDataV2 {
  templateName: string
  templateVersion: number
  styles: TemplateStyles
  globalConfig?: {
    maxWidth?: string
    padding?: string
    borderRadius?: string
    boxShadow?: string
    contentBackground?: string
    layout?: string
  }
  layout: TemplateLayout[]
}
