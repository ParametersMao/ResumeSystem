// 新的简历数据结构类型定义

export interface BasicProfile {
  name: string
  title: string
  gender?: string
  age?: string
  yearsOfExperience?: string
  avatar?: string
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

export interface RichTextValue {
  html: string
  text: string
  json?: any[]
}

export type SectionItem = ExperienceItem | EducationItem | ProjectItem | string | CustomItem | RichTextValue

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
  data?: Record<string, any>
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

// 旧版模板数据（兼容保留）
export interface TemplateData {
  templateName?: string
  styles: TemplateStyles
  sections: Record<string, any>
}

export type TemplateLayoutType = 'single-column' | 'two-column' | 'three-column' | 'custom' | string

export interface TemplateTheme {
  colors?: Record<string, any>
  typography?: Record<string, any>
  spacing?: Record<string, any>
  borders?: Record<string, any>
  [key: string]: any
}

export interface TemplateGlobalStyles {
  backgroundColor?: string
  fontFamily?: string
  fontSize?: string
  lineHeight?: string
  color?: string
  css?: string
  elements?: Record<string, Record<string, string>>
  [key: string]: any
}

export interface TemplateResponsiveConfig {
  breakpoints?: Record<string, string>
  styles?: Record<string, Record<string, Record<string, string>>>
}

export interface TemplateLayoutColumnsConfig {
  widths?: string[]
  gap?: string
  leftStyle?: Record<string, string>
  middleStyle?: Record<string, string>
  rightStyle?: Record<string, string>
  [key: string]: any
}

export interface TemplateLayoutConfig {
  type: TemplateLayoutType
  container?: Record<string, string>
  content?: Record<string, string>
  columns?: TemplateLayoutColumnsConfig
  custom?: Record<string, any>
}

export interface TemplateSectionStyleConfig {
  container?: Record<string, any>
  title?: Record<string, any>
  content?: Record<string, any>
  items?: Record<string, any>
  custom?: Record<string, Record<string, any>>
}

export type TemplateSectionStyles = Record<string, TemplateSectionStyleConfig>

export interface TemplateSectionDefinition {
  id: string
  type: string
  title?: string
  visible?: boolean
  order?: number
  items?: any[]
  config?: Record<string, any>
  style?: Record<string, any>
  data?: Record<string, any>
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
  templateName?: string
  templateType?: TemplateLayoutType
  templateVersion?: number | string
  description?: string
  theme?: TemplateTheme
  globalStyles?: TemplateGlobalStyles
  layout?: TemplateLayoutConfig | TemplateLayout[]
  sectionStyles?: TemplateSectionStyles
  sections?: TemplateSectionDefinition[]
  profile?: Record<string, any>
  customCss?: string
  responsive?: TemplateResponsiveConfig
  [key: string]: any
}
