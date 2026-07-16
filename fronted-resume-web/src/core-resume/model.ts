import {
  isCoreTemplateLayoutKey,
  normalizeVisibleResumeAvatarLayout,
  resolveResumeProfilePhoto,
} from './photo'

export type CoreSectionType =
  | 'intention'
  | 'education'
  | 'experience'
  | 'projects'
  | 'internship'
  | 'campus'
  | 'skills'
  | 'awards'
  | 'summary'
  | 'hobbies'
  | 'custom'

export type CoreFieldType = 'text' | 'textarea' | 'dateRange'
export type CoreTemplateVariant =
  | 'classic'
  | 'sidebar'
  | 'timeline'
  | 'spotlight'
  | 'ats'
  | 'executive'
  | 'compact'
  | 'editorial'
export type CoreAvatarPlacement = 'default' | 'hidden' | 'header-right' | 'sidebar-top' | 'meta-card'
export type CoreAvatarShape = 'rounded' | 'circle' | 'square'
export type CoreTemplateLayoutKey =
  | 'qm-blue-top-photo'
  | 'qm-sidebar-profile'
  | 'qm-classic-centered'
  | 'qm-ribbon-compact'
  | 'qm-timeline-icons'
  | 'qm-minimal-ats'
  | 'qm-executive-business'
  | 'qm-student-editorial'
  | 'qm-spotlight-featured'
  | 'qm-table-formal'
  | 'qm-asymmetric-profile'

export interface CoreDateRange {
  start: string
  end: string
}

export interface CoreSectionField {
  key: string
  label: string
  type: CoreFieldType
  placeholder?: string
}

export interface CoreSectionItem {
  [key: string]: string | CoreDateRange
}

export type CoreResumeItem = CoreSectionItem
export type CoreResumeSectionItem = CoreSectionItem

export interface CoreSectionDefinition {
  type: CoreSectionType
  title: string
  allowMultiple: boolean
  defaultVisible: boolean
  fields: CoreSectionField[]
}

export interface CoreResumeProfile {
  name: string
  title: string
  avatar: string
  phone: string
  email: string
  gender: string
  age: string
  yearsOfExperience: string
  site: string
}

export interface CoreResumeSection {
  id: string
  type: CoreSectionType
  title: string
  visible: boolean
  items: CoreSectionItem[]
}

export interface CoreResumeTheme {
  primaryColor: string
  fontFamily: string
  headingFontFamily: string
  sectionSpacing: number
  itemSpacing: number
  fontSize: number
  lineHeight: number
  pageMargin: number
}

export type CoreResumeThemePatch = Partial<CoreResumeTheme>

export interface CoreAvatarLayout {
  enabled?: boolean
  placement?: CoreAvatarPlacement
  shape?: CoreAvatarShape
  width?: number
  height?: number
  objectPosition?: string
}

export interface CoreTemplateLayout {
  key?: CoreTemplateLayoutKey
  avatar?: CoreAvatarLayout
}

export interface CoreResumeTargeting {
  jobTitle: string
  company?: string
  jdText: string
  keywords: string[]
  analyzedAt?: number
}

export interface CoreResumeDocument {
  schema: 'core-resume/v1'
  documentTitle: string
  slogan: string
  profile: CoreResumeProfile
  sections: CoreResumeSection[]
  theme: CoreResumeTheme
  templateTheme?: CoreResumeThemePatch
  templateLayout?: CoreTemplateLayout
  themeOverrides?: CoreResumeThemePatch
  templateId?: string
  templateName?: string
  templateVariant?: CoreTemplateVariant
  targeting?: CoreResumeTargeting
}

export const CORE_SECTION_DEFINITIONS: CoreSectionDefinition[] = [
  {
    type: 'intention',
    title: '求职意向',
    allowMultiple: false,
    defaultVisible: true,
    fields: [{ key: 'intention', label: '补充求职意向', type: 'text', placeholder: '可选，例如：ToB SaaS / 北京 / 远程' }],
  },
  {
    type: 'education',
    title: '教育背景',
    allowMultiple: true,
    defaultVisible: true,
    fields: [
      { key: 'school', label: '学校名称', type: 'text' },
      { key: 'degree', label: '学历/专业', type: 'text' },
      { key: 'duration', label: '时间区间', type: 'dateRange' },
      { key: 'desc', label: '补充说明', type: 'textarea', placeholder: '可填写主修课程、成绩、研究方向等' },
    ],
  },
  {
    type: 'experience',
    title: '工作经验',
    allowMultiple: true,
    defaultVisible: true,
    fields: [
      { key: 'company', label: '公司名称', type: 'text' },
      { key: 'role', label: '职位', type: 'text' },
      { key: 'duration', label: '时间区间', type: 'dateRange' },
      { key: 'desc', label: '工作描述', type: 'textarea' },
    ],
  },
  {
    type: 'projects',
    title: '项目经历',
    allowMultiple: true,
    defaultVisible: true,
    fields: [
      { key: 'name', label: '项目名称', type: 'text' },
      { key: 'role', label: '担任角色', type: 'text' },
      { key: 'duration', label: '项目时间', type: 'dateRange' },
      { key: 'desc', label: '项目描述', type: 'textarea' },
    ],
  },
  {
    type: 'internship',
    title: '实习经历',
    allowMultiple: true,
    defaultVisible: false,
    fields: [
      { key: 'company', label: '公司/机构', type: 'text' },
      { key: 'role', label: '岗位', type: 'text' },
      { key: 'duration', label: '时间区间', type: 'dateRange' },
      { key: 'desc', label: '实习描述', type: 'textarea' },
    ],
  },
  {
    type: 'campus',
    title: '校园经历',
    allowMultiple: true,
    defaultVisible: false,
    fields: [
      { key: 'org', label: '组织/比赛', type: 'text' },
      { key: 'role', label: '职责', type: 'text' },
      { key: 'duration', label: '时间区间', type: 'dateRange' },
      { key: 'desc', label: '经历描述', type: 'textarea' },
    ],
  },
  {
    type: 'skills',
    title: '技能特长',
    allowMultiple: true,
    defaultVisible: true,
    fields: [
      { key: 'name', label: '技能名称', type: 'text', placeholder: '例如：Vue 3 / TypeScript / 数据分析' },
      { key: 'proficiency', label: '熟练度（0-100）', type: 'text', placeholder: '例如：85' },
      { key: 'level', label: '熟练程度', type: 'text', placeholder: '例如：熟练 / 精通' },
    ],
  },
  {
    type: 'awards',
    title: '荣誉证书',
    allowMultiple: true,
    defaultVisible: false,
    fields: [
      { key: 'name', label: '奖项/证书名称', type: 'text' },
      { key: 'org', label: '颁发机构', type: 'text' },
      { key: 'date', label: '获奖时间', type: 'text', placeholder: '例如：2025-06' },
    ],
  },
  {
    type: 'summary',
    title: '自我评价',
    allowMultiple: false,
    defaultVisible: true,
    fields: [{ key: 'text', label: '自我评价', type: 'textarea' }],
  },
  {
    type: 'hobbies',
    title: '兴趣爱好',
    allowMultiple: true,
    defaultVisible: false,
    fields: [{ key: 'text', label: '兴趣爱好', type: 'text' }],
  },
  {
    type: 'custom',
    title: '自定义模块',
    allowMultiple: true,
    defaultVisible: false,
    fields: [
      { key: 'name', label: '条目标题', type: 'text' },
      { key: 'text', label: '条目内容', type: 'textarea' },
    ],
  },
]

export const DEFAULT_CORE_THEME: CoreResumeTheme = {
  primaryColor: '#2563eb',
  fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
  headingFontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
  sectionSpacing: 24,
  itemSpacing: 14,
  fontSize: 14,
  lineHeight: 1.7,
  pageMargin: 42,
}

export const DEFAULT_AVATAR_PLACEHOLDER = '/mock/avatar/default.svg'

export const DEFAULT_CORE_PROFILE: CoreResumeProfile = {
  name: '张三',
  title: '前端工程师',
  avatar: '',
  phone: '13800138000',
  email: 'zhangsan@example.com',
  gender: '',
  age: '',
  yearsOfExperience: '3年',
  site: '',
}

export function createSectionItem(type: CoreSectionType): CoreSectionItem {
  switch (type) {
    case 'intention':
      return { intention: '' }
    case 'education':
      return { school: '', degree: '', duration: { start: '', end: '' }, desc: '' }
    case 'experience':
    case 'internship':
      return { company: '', role: '', duration: { start: '', end: '' }, desc: '' }
    case 'projects':
      return { name: '', role: '', duration: { start: '', end: '' }, desc: '' }
    case 'campus':
      return { org: '', role: '', duration: { start: '', end: '' }, desc: '' }
    case 'skills':
      return { name: '', proficiency: '', level: '' }
    case 'awards':
      return { name: '', org: '', date: '' }
    case 'summary':
      return { text: '' }
    case 'hobbies':
      return { text: '' }
    case 'custom':
      return { name: '', text: '' }
    default:
      return {}
  }
}

export function createSection(type: CoreSectionType, index: number): CoreResumeSection {
  const definition = getSectionDefinition(type)
  return {
    id: `${type}-${index}`,
    type,
    title: definition.title,
    visible: definition.defaultVisible,
    items: definition.allowMultiple || type === 'summary' || type === 'intention'
      ? [createSectionItem(type)]
      : [createSectionItem(type)],
  }
}

export function createEmptyDocument(): CoreResumeDocument {
  return {
    schema: 'core-resume/v1',
    documentTitle: '',
    slogan: '',
    profile: { ...DEFAULT_CORE_PROFILE },
    theme: { ...DEFAULT_CORE_THEME },
    sections: CORE_SECTION_DEFINITIONS.map((definition, index) => createSection(definition.type, index)),
    templateName: '默认模板',
  }
}

export function createDemoDocument(themeOverrides?: Partial<CoreResumeTheme>): CoreResumeDocument {
  const document = createEmptyDocument()
  document.theme = { ...document.theme, ...themeOverrides }
  document.profile = {
    name: '王小明',
    title: '产品经理',
    avatar: DEFAULT_AVATAR_PLACEHOLDER,
    phone: '13900000000',
    email: 'wang@example.com',
    gender: '男',
    age: '27',
    yearsOfExperience: '4年',
    site: 'github.com/example',
  }
  document.sections = [
    { id: 'intention-demo', type: 'intention', title: '求职意向', visible: true, items: [{ intention: '产品经理 / ToB SaaS' }] },
    {
      id: 'education-demo',
      type: 'education',
      title: '教育背景',
      visible: true,
      items: [{ school: '浙江大学', degree: '软件工程 本科', duration: { start: '2015-09', end: '2019-06' }, desc: '主修软件工程、交互设计与数据分析。' }],
    },
    {
      id: 'experience-demo',
      type: 'experience',
      title: '工作经验',
      visible: true,
      items: [
        {
          company: '某互联网公司',
          role: '产品经理',
          duration: { start: '2022-03', end: '至今' },
          desc: '负责 B 端产品需求分析、原型设计与项目推进，推动核心流程转化率提升。',
        },
      ],
    },
    {
      id: 'projects-demo',
      type: 'projects',
      title: '项目经历',
      visible: true,
      items: [
        {
          name: '智能简历系统',
          role: '项目负责人',
          duration: { start: '2024-01', end: '2024-09' },
          desc: '主导从 0 到 1 搭建在线简历编辑器，完成模板系统、导出链路和用户增长闭环。',
        },
      ],
    },
    {
      id: 'skills-demo',
      type: 'skills',
      title: '技能特长',
      visible: true,
      items: [
        { name: '产品规划', proficiency: '92', level: '精通' },
        { name: 'Axure / Figma', proficiency: '88', level: '熟练' },
        { name: '数据分析', proficiency: '82', level: '熟练' },
        { name: '跨团队协作', proficiency: '90', level: '精通' },
      ],
    },
    {
      id: 'summary-demo',
      type: 'summary',
      title: '自我评价',
      visible: true,
      items: [{ text: '有较强的结构化思维和推动力，善于把复杂需求拆解为可执行方案，兼顾业务目标与用户体验。' }],
    },
  ]
  return document
}

export function getSectionDefinition(type: CoreSectionType): CoreSectionDefinition {
  return CORE_SECTION_DEFINITIONS.find((definition) => definition.type === type) || CORE_SECTION_DEFINITIONS[0]
}

export function ensureAllSections(document: Partial<CoreResumeDocument>): CoreResumeDocument {
  const base = createEmptyDocument()
  const incomingSections = Array.isArray(document.sections) ? document.sections : []
  const sectionMap = new Map(incomingSections.map((section) => [section.type, section]))

  base.sections = CORE_SECTION_DEFINITIONS.map((definition, index) => {
    const existing = sectionMap.get(definition.type)
    if (!existing) {
      return createSection(definition.type, index)
    }
    return {
      id: existing.id || `${definition.type}-${index}`,
      type: definition.type,
      title: existing.title || definition.title,
      visible: existing.visible ?? definition.defaultVisible,
      items: normalizeItems(definition.type, existing.items),
    }
  })

  const incomingProfile = document.profile || {}
  base.profile = {
    ...base.profile,
    ...incomingProfile,
    avatar: resolveResumeProfilePhoto(incomingProfile),
  }
  base.documentTitle = typeof document.documentTitle === 'string' ? document.documentTitle : ''
  base.slogan = typeof document.slogan === 'string' ? document.slogan : ''
  base.templateTheme = normalizeThemePatch(document.templateTheme)
  base.templateLayout = normalizeTemplateLayout(document.templateLayout)
  base.themeOverrides = normalizeThemePatch(document.themeOverrides)
  base.theme = mergeResumeTheme(base.templateTheme, base.themeOverrides, document.theme)
  base.templateId = document.templateId
  base.templateName = document.templateName || base.templateName
  base.templateVariant = document.templateVariant || base.templateVariant
  base.targeting = normalizeTargeting(document.targeting)
  return base
}

export function extractThemeFromTemplate(templateData: any): Partial<CoreResumeTheme> {
  if (!templateData || typeof templateData !== 'object') {
    return {}
  }

  const oldStyles = templateData.styles || {}
  const newTheme = templateData.theme || {}
  const colors = oldStyles.colors || newTheme.colors || {}
  const fonts = oldStyles.fonts || newTheme.typography?.fontFamily || {}
  const spacing = oldStyles.spacing || newTheme.spacing || {}

  return {
    primaryColor: colors.primary || colors.secondary,
    fontFamily: fonts.body,
    headingFontFamily: fonts.heading || fonts.body,
    sectionSpacing: toNumber(spacing.sectionMargin),
    itemSpacing: toNumber(spacing.elementMargin),
    pageMargin: toNumber(spacing.pageMargin),
  }
}

export function extractLayoutFromTemplate(templateData: any): CoreTemplateLayout | undefined {
  if (!templateData || typeof templateData !== 'object') {
    return undefined
  }

  return normalizeTemplateLayout({
    key: templateData.layout?.key || templateData.layoutKey || templateData.key,
    avatar: templateData.profile?.avatar || templateData.layout?.avatar || templateData.avatar,
  })
}

export function buildResumeTitle(profile: CoreResumeProfile): string {
  const name = profile.name?.trim() || '未命名简历'
  const title = profile.title?.trim()
  return title ? `${name} - ${title}` : name
}

export function parseResumeContent(rawContent: unknown): Partial<CoreResumeDocument> | null {
  const parsed = safeParse(rawContent)
  if (!parsed || typeof parsed !== 'object') {
    return null
  }

  const source = getSourceDocument(parsed)
  if (!source) {
    return null
  }

  return {
    schema: 'core-resume/v1',
    documentTitle: typeof source.documentTitle === 'string' ? source.documentTitle : '',
    slogan: typeof source.slogan === 'string' ? source.slogan : '',
    profile: {
      ...DEFAULT_CORE_PROFILE,
      ...normalizeProfile(source.profile),
    },
    sections: normalizeSections(source.sections),
    theme: mergeResumeTheme(source.templateTheme, source.themeOverrides, source.theme),
    templateTheme: normalizeThemePatch(source.templateTheme),
    templateLayout: normalizeTemplateLayout(source.templateLayout),
    themeOverrides: normalizeThemePatch(source.themeOverrides),
    templateId: typeof source.templateId === 'string' ? source.templateId : undefined,
    templateName: typeof source.templateName === 'string' ? source.templateName : undefined,
    templateVariant: isCoreTemplateVariant(source.templateVariant) ? source.templateVariant : undefined,
    targeting: normalizeTargeting(source.targeting),
  }
}

function normalizeTargeting(value: unknown): CoreResumeTargeting | undefined {
  if (!value || typeof value !== 'object') return undefined
  const source = value as Record<string, unknown>
  const jobTitle = typeof source.jobTitle === 'string' ? source.jobTitle.trim() : ''
  const jdText = typeof source.jdText === 'string' ? source.jdText.trim() : ''
  if (!jobTitle && !jdText) return undefined
  return {
    jobTitle,
    company: typeof source.company === 'string' ? source.company.trim() : undefined,
    jdText,
    keywords: Array.isArray(source.keywords)
      ? source.keywords.map((item) => String(item).trim()).filter(Boolean).slice(0, 30)
      : [],
    analyzedAt: Number.isFinite(Number(source.analyzedAt)) ? Number(source.analyzedAt) : undefined,
  }
}

function normalizeTemplateLayout(layout: unknown): CoreTemplateLayout | undefined {
  if (!layout || typeof layout !== 'object') {
    return undefined
  }

  const source = layout as Record<string, unknown>
  const key = normalizeTemplateLayoutKey(source.key)
  const avatar = normalizeAvatarLayout(source.avatar)
  const result: CoreTemplateLayout = {}
  if (key) {
    result.key = key
    result.avatar = normalizeVisibleResumeAvatarLayout(key, avatar)
  } else if (avatar) {
    result.avatar = avatar
  }
  return Object.keys(result).length ? result : undefined
}

function normalizeTemplateLayoutKey(value: unknown): CoreTemplateLayoutKey | undefined {
  return isCoreTemplateLayoutKey(value) ? value : undefined
}

function normalizeAvatarLayout(value: unknown): CoreAvatarLayout | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const source = value as Record<string, unknown>
  const avatar: CoreAvatarLayout = {}

  if (typeof source.enabled === 'boolean') {
    avatar.enabled = true
  }

  if (isAvatarPlacement(source.placement) && source.placement !== 'hidden') {
    avatar.placement = source.placement
  }

  if (isAvatarShape(source.shape)) {
    avatar.shape = source.shape
  }

  const width = toNumber(source.width)
  if (width !== undefined && width >= 40 && width <= 180) {
    avatar.width = width
  }

  const height = toNumber(source.height)
  if (height !== undefined && height >= 40 && height <= 220) {
    avatar.height = height
  }

  if (typeof source.objectPosition === 'string') {
    const objectPosition = source.objectPosition.trim()
    if (objectPosition && objectPosition.length <= 64) {
      avatar.objectPosition = objectPosition
    }
  }

  return Object.keys(avatar).length ? avatar : undefined
}

function isAvatarPlacement(value: unknown): value is CoreAvatarPlacement {
  return (
    value === 'default' ||
    value === 'hidden' ||
    value === 'header-right' ||
    value === 'sidebar-top' ||
    value === 'meta-card'
  )
}

function isAvatarShape(value: unknown): value is CoreAvatarShape {
  return value === 'rounded' || value === 'circle' || value === 'square'
}

function isCoreTemplateVariant(value: unknown): value is CoreTemplateVariant {
  return (
    value === 'classic' ||
    value === 'sidebar' ||
    value === 'timeline' ||
    value === 'spotlight' ||
    value === 'ats' ||
    value === 'executive' ||
    value === 'compact' ||
    value === 'editorial'
  )
}

export function mergeResumeTheme(
  templateTheme?: unknown,
  themeOverrides?: unknown,
  fallbackTheme?: unknown,
): CoreResumeTheme {
  return {
    ...DEFAULT_CORE_THEME,
    ...normalizeThemePatch(fallbackTheme),
    ...normalizeThemePatch(templateTheme),
    ...normalizeThemePatch(themeOverrides),
  }
}

function normalizeThemePatch(theme: unknown): CoreResumeThemePatch | undefined {
  if (!theme || typeof theme !== 'object') {
    return undefined
  }

  const source = theme as Record<string, unknown>
  const patch: CoreResumeThemePatch = {}

  if (typeof source.primaryColor === 'string' && source.primaryColor.trim()) {
    patch.primaryColor = source.primaryColor
  }
  if (typeof source.fontFamily === 'string' && source.fontFamily.trim()) {
    patch.fontFamily = source.fontFamily
  }
  if (typeof source.headingFontFamily === 'string' && source.headingFontFamily.trim()) {
    patch.headingFontFamily = source.headingFontFamily
  }

  const sectionSpacing = toNumber(source.sectionSpacing)
  if (sectionSpacing !== undefined) {
    patch.sectionSpacing = sectionSpacing
  }
  const itemSpacing = toNumber(source.itemSpacing)
  if (itemSpacing !== undefined) {
    patch.itemSpacing = itemSpacing
  }
  const fontSize = toNumber(source.fontSize)
  if (fontSize !== undefined) {
    patch.fontSize = fontSize
  }
  const lineHeight = toNumber(source.lineHeight)
  if (lineHeight !== undefined) {
    patch.lineHeight = lineHeight
  }
  const pageMargin = toNumber(source.pageMargin)
  if (pageMargin !== undefined) {
    patch.pageMargin = pageMargin
  }

  return Object.keys(patch).length ? patch : undefined
}

function getSourceDocument(parsed: Record<string, unknown>) {
  if (parsed.schema === 'core-resume/v1' && parsed.profile && parsed.sections) {
    return parsed
  }
  if (parsed.profile && parsed.sections) {
    return parsed
  }
  if (typeof parsed.content === 'string') {
    const nested = safeParse(parsed.content)
    if (nested && typeof nested === 'object' && 'profile' in nested && 'sections' in nested) {
      return nested as Record<string, unknown>
    }
  }
  if (parsed.content && typeof parsed.content === 'object') {
    const nested = parsed.content as Record<string, unknown>
    if (nested.profile && nested.sections) {
      return nested
    }
  }
  return null
}

function normalizeProfile(profile: unknown): Partial<CoreResumeProfile> {
  if (!profile || typeof profile !== 'object') {
    return {}
  }
  const source = profile as Record<string, unknown>
  const basic = typeof source.basic === 'object' && source.basic ? (source.basic as Record<string, unknown>) : source
  const contacts = typeof basic.contacts === 'object' && basic.contacts ? (basic.contacts as Record<string, unknown>) : {}
  return {
    name: toText(basic.name),
    title: toText(basic.title),
    avatar: resolveResumeProfilePhoto(basic) || resolveResumeProfilePhoto(source),
    phone: toText(contacts.phone || basic.phone),
    email: toText(contacts.email || basic.email),
    gender: toText(basic.gender),
    age: toText(basic.age),
    yearsOfExperience: toText(basic.yearsOfExperience || basic.jobYears),
    site: toText(contacts.site || basic.site || basic.website),
  }
}

function normalizeSections(sections: unknown): CoreResumeSection[] {
  if (!Array.isArray(sections)) {
    return []
  }
  return sections
    .map((section, index) => normalizeSection(section, index))
    .filter((section): section is CoreResumeSection => !!section)
}

function normalizeSection(section: unknown, index: number): CoreResumeSection | null {
  if (!section || typeof section !== 'object') {
    return null
  }
  const source = section as Record<string, unknown>
  const type = String(source.type || '').trim() as CoreSectionType
  const definition = CORE_SECTION_DEFINITIONS.find((item) => item.type === type)
  if (!definition) {
    return null
  }
  return {
    id: toText(source.id) || `${type}-${index}`,
    type,
    title: toText(source.title) || definition.title,
    visible: source.visible !== false,
    items: normalizeItems(type, source.items),
  }
}

function normalizeItems(type: CoreSectionType, items: unknown): CoreSectionItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    return [createSectionItem(type)]
  }
  return items.map((item) => normalizeItem(type, item))
}

function normalizeItem(type: CoreSectionType, item: unknown): CoreSectionItem {
  if (!item || typeof item !== 'object') {
    if (type === 'skills' || type === 'hobbies') {
      return { name: toText(item) }
    }
    return createSectionItem(type)
  }

  const source = item as Record<string, unknown>
  switch (type) {
    case 'intention':
      return { intention: toText(source.intention || source.text) }
    case 'education':
      return {
        school: toText(source.school || source.schoolName),
        degree: toText(source.degree || source.major),
        duration: normalizeDuration(source.duration, source.start, source.end),
        desc: toPlainText(source.desc || source.highlights),
      }
    case 'experience':
    case 'internship':
      return {
        company: toText(source.company),
        role: toText(source.role),
        duration: normalizeDuration(source.duration, source.start, source.end),
        desc: toPlainText(source.desc || source.content || source.highlights),
      }
    case 'projects':
      return {
        name: toText(source.name),
        role: toText(source.role),
        duration: normalizeDuration(source.duration, source.start, source.end || source.date),
        desc: toPlainText(source.desc || source.content || source.highlights),
      }
    case 'campus':
      return {
        org: toText(source.org || source.company || source.name),
        role: toText(source.role),
        duration: normalizeDuration(source.duration, source.start, source.end),
        desc: toPlainText(source.desc || source.content || source.highlights),
      }
    case 'skills':
      return {
        name: toText(source.name || source.skill || source.text),
        proficiency: toText(source.proficiency || source.percent || source.percentage),
        level: toText(source.level || source.mastery),
      }
    case 'awards':
      return {
        name: toText(source.name || source.title),
        org: toText(source.org || source.by),
        date: toText(source.date),
      }
    case 'summary':
      return { text: toPlainText(source.text || source.content || source.html) }
    case 'hobbies':
      return { text: toText(source.text || source.name) }
    case 'custom':
      return {
        name: toText(source.name || source.title),
        text: toPlainText(source.text || source.content),
      }
    default:
      return createSectionItem(type)
  }
}

function normalizeDuration(duration: unknown, start: unknown, end: unknown): CoreDateRange {
  if (duration && typeof duration === 'object') {
    const source = duration as Record<string, unknown>
    return { start: toText(source.start), end: toText(source.end) }
  }
  return { start: toText(start), end: toText(end) }
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  return undefined
}

function safeParse(value: unknown): Record<string, unknown> | null {
  if (!value) {
    return null
  }
  if (typeof value === 'object') {
    return value as Record<string, unknown>
  }
  if (typeof value !== 'string') {
    return null
  }
  try {
    return JSON.parse(value) as Record<string, unknown>
  } catch {
    return null
  }
}

function toText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number') {
    return String(value)
  }
  return ''
}

function toPlainText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => toPlainText(item)).filter(Boolean).join('\n')
  }
  if (typeof value === 'object' && value) {
    const record = value as Record<string, unknown>
    const html = toText(record.html)
    const text = toText(record.text)
    return stripHtml(text || html)
  }
  return stripHtml(toText(value))
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
