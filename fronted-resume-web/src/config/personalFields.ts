/**
 * 基本信息模块字段定义
 * 这些字段是固定的，但显示和样式由模板配置控制
 */

export interface PersonalField {
  key: string
  label: string
  type: 'text' | 'contact' | 'avatar' | 'summary'
  path: string // 数据路径，如 'basic.name', 'basic.contacts.email'
  defaultLabel?: string // 默认标签文本
}

// 预定义的字段列表
export const PERSONAL_FIELDS: PersonalField[] = [
  {
    key: 'name',
    label: '姓名',
    type: 'text',
    path: 'basic.name',
    defaultLabel: '姓名'
  },
  {
    key: 'title',
    label: '职位',
    type: 'text',
    path: 'basic.title',
    defaultLabel: '职位'
  },
  {
    key: 'gender',
    label: '性别',
    type: 'text',
    path: 'basic.gender',
    defaultLabel: '性别'
  },
  {
    key: 'age',
    label: '年龄',
    type: 'text',
    path: 'basic.age',
    defaultLabel: '年龄'
  },
  {
    key: 'yearsOfExperience',
    label: '工作经验',
    type: 'text',
    path: 'basic.yearsOfExperience',
    defaultLabel: '工作经验'
  },
  {
    key: 'phone',
    label: '电话',
    type: 'contact',
    path: 'basic.contacts.phone',
    defaultLabel: '电话'
  },
  {
    key: 'email',
    label: '邮箱',
    type: 'contact',
    path: 'basic.contacts.email',
    defaultLabel: '邮箱'
  },
  {
    key: 'site',
    label: '主页',
    type: 'contact',
    path: 'basic.contacts.site',
    defaultLabel: '主页'
  },
  {
    key: 'avatar',
    label: '头像',
    type: 'avatar',
    path: 'basic.avatar',
    defaultLabel: '头像'
  },
  {
    key: 'summary',
    label: '自我概述',
    type: 'summary',
    path: 'summary',
    defaultLabel: '自我概述'
  }
]

/**
 * 根据字段key获取字段定义
 */
export function getFieldByKey(key: string): PersonalField | undefined {
  return PERSONAL_FIELDS.find(field => field.key === key)
}

/**
 * 根据路径获取字段值
 */
export function getFieldValue(data: any, path: string): any {
  const keys = path.split('.')
  let value = data
  for (const key of keys) {
    if (value == null) return undefined
    value = value[key]
  }
  return value
}

/**
 * 获取字段的显示值
 */
export function getFieldDisplayValue(data: any, field: PersonalField): string {
  const value = getFieldValue(data, field.path)
  if (value == null || value === '') return ''
  return String(value)
}

