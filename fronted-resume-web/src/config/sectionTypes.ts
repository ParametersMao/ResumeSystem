import type { SectionConfig } from '@/types/resume'

// 预定义的模块类型配置
export const SECTION_TYPES: Record<string, SectionConfig> = {

  intention: {
    itemType: 'object',
    allowMultiple: false,
    fields: [
      { name: 'intention', label: '求职意向', type: 'text', required: true }
    ]
  },
  experience: {
    itemType: 'list',
    allowMultiple: true,
    fields: [
      { name: 'company', label: '公司名称', type: 'text', required: true },
      { name: 'role', label: '职位', type: 'text', required: true },
      { name: 'duration', label: '时间区间', type: 'dateRange', required: true },
      { name: 'desc', label: '工作描述', type: 'textarea', required: false, richText: true }
    ]
  },
  education: {
    itemType: 'list',
    allowMultiple: true,
    fields: [
      { name: 'school', label: '学校名称', type: 'text', required: true },
      { name: 'degree', label: '专业学历', type: 'text', required: true },
      { name: 'duration', label: '时间区间', type: 'dateRange', required: true }
    ]
  },
  internship: {
    itemType: 'list',
    allowMultiple: true,
    fields: [
      { name: 'company', label: '公司/机构', type: 'text', required: true },
      { name: 'role', label: '岗位', type: 'text', required: true },
      { name: 'duration', label: '时间区间', type: 'dateRange', required: true },
      { name: 'desc', label: '实习描述', type: 'textarea', required: false, richText: true }
    ]
  },
  campus: {
    itemType: 'list',
    allowMultiple: true,
    fields: [
      { name: 'org', label: '组织/社团/比赛', type: 'text', required: true },
      { name: 'role', label: '职责', type: 'text', required: true },
      { name: 'duration', label: '时间区间', type: 'dateRange', required: true },
      { name: 'desc', label: '经历描述', type: 'textarea', required: false, richText: true }
    ]
  },
  projects: {
    itemType: 'list',
    allowMultiple: true,
    fields: [
      { name: 'name', label: '项目名称', type: 'text', required: true },
      { name: 'role', label: '担任角色', type: 'text', required: true },
      { name: 'duration', label: '项目时间', type: 'dateRange', required: true },
      { name: 'desc', label: '项目描述', type: 'textarea', required: false, richText: true }
    ]
  },
  skills: {
    itemType: 'array',
    allowMultiple: false,
    fields: [
      { name: 'skill', label: '技能名称', type: 'text', required: true }
    ]
  },
  awards: {
    itemType: 'list',
    allowMultiple: true,
    fields: [
      { name: 'name', label: '奖项/证书名称', type: 'text', required: true },
      { name: 'org', label: '颁发机构', type: 'text', required: false },
      { name: 'date', label: '获得日期', type: 'date', required: false }
    ]
  },
  summary: {
    itemType: 'object',
    allowMultiple: false,
    fields: [
      { name: 'text', label: '自我评价', type: 'textarea', required: false, richText: true }
    ]
  },
  hobbies: {
    itemType: 'list',
    allowMultiple: true,
    fields: [
      { name: 'text', label: '兴趣爱好', type: 'text', required: false }
    ]
  },
  custom: {
    itemType: 'list',
    allowMultiple: true,
    fields: [] // 自定义模块的字段将动态生成
  }
}

// 默认模块标题
export const DEFAULT_SECTION_TITLES: Record<string, string> = {
  intention: '求职意向',
  experience: '工作经验',
  education: '教育背景',
  projects: '项目经历',
  skills: '专业技能',
  internship: '实习经历',
  campus: '校园经历',
  awards: '荣誉证书',
  summary: '自我评价',
  hobbies: '兴趣爱好',
  custom: '自定义模块'
}

// 模块类型选项（用于下拉选择）
export const SECTION_TYPE_OPTIONS = [
  { value: 'intention', label: '求职意向' },
  { value: 'experience', label: '工作经验' },
  { value: 'education', label: '教育背景' },
  { value: 'projects', label: '项目经历' },
  { value: 'skills', label: '专业技能' },
  { value: 'internship', label: '实习经历' },
  { value: 'campus', label: '校园经历' },
  { value: 'awards', label: '荣誉证书' },
  { value: 'summary', label: '自我评价' },
  { value: 'hobbies', label: '兴趣爱好' },
  { value: 'custom', label: '自定义模块' }
]
