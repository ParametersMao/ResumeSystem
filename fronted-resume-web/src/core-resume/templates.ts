import type { CoreTemplateLayoutKey, CoreTemplateVariant } from './model'

export interface CoreTemplatePreset {
  key: string
  label: string
  layoutKey: CoreTemplateLayoutKey
  variant: CoreTemplateVariant
  description: string
  keywords: string[]
}

export interface TemplateResolutionSource {
  templateVariant?: unknown
  templateName?: unknown
  templateLayout?: { key?: unknown }
}

const TEMPLATE_PRESETS: CoreTemplatePreset[] = [
  {
    key: 'qm-blue-top-photo',
    layoutKey: 'qm-blue-top-photo',
    label: '蓝色右上证件照',
    variant: 'ats',
    description: '姓名、求职意向和基础信息在顶部展开，证件照固定右上，适合正式投递和通用岗位。',
    keywords: ['ats', 'minimal', 'clean', '右上照片', '证件照', '蓝色', '单栏', '全民简历', '行政', '校招', '社招'],
  },
  {
    key: 'qm-sidebar-profile',
    layoutKey: 'qm-sidebar-profile',
    label: '左栏头像信息版',
    variant: 'sidebar',
    description: '左侧栏集中头像、联系方式和技能，右侧放教育、工作和项目经历，适合信息较多的简历。',
    keywords: ['sidebar', 'split', 'double', '侧栏', '双栏', '左栏', '头像', '联系方式', '技能'],
  },
  {
    key: 'qm-classic-centered',
    layoutKey: 'qm-classic-centered',
    label: '居中标题正式版',
    variant: 'classic',
    description: '传统中文简历结构，标题更正式，照片位于右上，正文模块以横线和标题分隔。',
    keywords: ['classic', 'standard', '经典', '居中标题', '正式', '传统', '职能'],
  },
  {
    key: 'qm-ribbon-compact',
    layoutKey: 'qm-ribbon-compact',
    label: '深蓝横条标题版',
    variant: 'compact',
    description: '用深蓝标题条强化模块分区，信息密度高，适合一页简历和职能岗位。',
    keywords: ['compact', 'dense', 'onepage', '横条', '深蓝', '一页', '财务', '法务', '行政'],
  },
  {
    key: 'qm-timeline-icons',
    layoutKey: 'qm-timeline-icons',
    label: '图标时间轴版',
    variant: 'timeline',
    description: '按时间轴组织教育、工作和项目经历，适合技术、产品、数据等项目经历较强的候选人。',
    keywords: ['timeline', 'story', 'journey', '时间轴', '图标', '项目', '技术', '产品', '数据'],
  },
  {
    key: 'qm-minimal-ats',
    layoutKey: 'qm-minimal-ats',
    label: '技术开发 ATS 单栏',
    variant: 'ats',
    description: '无照片、单一阅读顺序，个人优势和技术技能前置，职位、公司与时间层级清晰，适合技术岗位和 ATS 系统投递。',
    keywords: ['ats', 'minimal', 'plain', '极简', '投递', '技术开发', '前端', '后端', '测试', '数据'],
  },
  {
    key: 'qm-executive-business',
    layoutKey: 'qm-executive-business',
    label: '商务高管深色版',
    variant: 'executive',
    description: '稳重商务风格，强调核心优势、管理经历和可信度，适合管理、咨询和运营负责人。',
    keywords: ['executive', 'premium', 'manager', '高管', '管理', '商务', '咨询', '深色'],
  },
  {
    key: 'qm-student-editorial',
    layoutKey: 'qm-student-editorial',
    label: '应届校招 · 项目实习优先',
    variant: 'editorial',
    description: '教育信息压缩为顶部摘要，项目和实习进入正文主线，再补充校园成果、技能与荣誉，适合经历较少但有可证明实践的应届生。',
    keywords: ['editorial', 'student', 'campus', '校招', '应届生', '项目经历', '实习经历', '校园经历', '证书'],
  },
  {
    key: 'qm-spotlight-featured',
    layoutKey: 'qm-spotlight-featured',
    label: '产品/运营 · 成果导向',
    variant: 'spotlight',
    description: '以业务问题、个人行动和指标结果组织项目与经历，侧栏承载能力、教育和补充信息，适合产品、运营、增长和市场岗位。',
    keywords: ['spotlight', 'featured', 'outcome', '成果', '产品', '运营', '增长', '市场', '指标', '转化率'],
  },
  {
    key: 'qm-table-formal',
    layoutKey: 'qm-table-formal',
    label: '正式表格信息版',
    variant: 'classic',
    description: '以清晰表格承载个人信息和经历，适合国企、事业单位、教师、医护及重视规范信息字段的岗位。',
    keywords: ['table', 'formal', '表格', '国企', '事业单位', '教师', '医护', '正式'],
  },
  {
    key: 'qm-asymmetric-profile',
    layoutKey: 'qm-asymmetric-profile',
    label: '非对称能力叙事版',
    variant: 'editorial',
    description: '左栏组织身份、基础信息、教育和能力，右栏以照片和自我评价起笔，再展开工作与项目主线。',
    keywords: ['asymmetric', 'profile', '非对称', '能力叙事', '技能进度', '资深职能'],
  },
]

const DEFAULT_TEMPLATE_PRESET = TEMPLATE_PRESETS[0]

export function getTemplatePresets() {
  return TEMPLATE_PRESETS
}

export function resolveTemplateVariant(
  source?: TemplateResolutionSource,
  templateData?: any,
): CoreTemplateVariant {
  return resolveTemplatePreset(source, templateData).variant
}

export function resolveTemplateLayoutKey(
  source?: TemplateResolutionSource,
  templateData?: any,
): CoreTemplateLayoutKey {
  return resolveTemplatePreset(source, templateData).layoutKey
}

export function resolveTemplatePreset(
  source?: TemplateResolutionSource,
  templateData?: any,
): CoreTemplatePreset {
  const inlineLayoutKey = [
    source?.templateLayout?.key,
    templateData?.layout?.key,
    templateData?.layoutKey,
    templateData?.key,
  ].find((value) => typeof value === 'string')

  const matchedByLayoutKey = TEMPLATE_PRESETS.find((preset) => preset.layoutKey === inlineLayoutKey)
  if (matchedByLayoutKey) {
    return matchedByLayoutKey
  }

  const templateName = typeof source?.templateName === 'string' ? source.templateName : ''
  const normalized = templateName.toLowerCase()
  const matched = TEMPLATE_PRESETS
    .map((preset) => {
      const keywords = preset.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase()))
      return {
        preset,
        matchCount: keywords.length,
        specificity: keywords.reduce((total, keyword) => total + keyword.length, 0),
      }
    })
    .filter((candidate) => candidate.matchCount > 0)
    .sort((left, right) =>
      right.matchCount - left.matchCount || right.specificity - left.specificity,
    )[0]?.preset

  if (matched) {
    return matched
  }

  const inlineVariant = [
    source?.templateVariant,
    templateData?.layout?.variant,
    templateData?.theme?.variant,
    templateData?.variant,
  ].find((value) => typeof value === 'string')

  if (isTemplateVariant(inlineVariant)) {
    return findPresetByVariant(inlineVariant)
  }

  return DEFAULT_TEMPLATE_PRESET
}

export function getTemplateVariantLabel(variant: CoreTemplateVariant) {
  return findPresetByVariant(variant).label
}

function findPresetByVariant(variant: CoreTemplateVariant) {
  return TEMPLATE_PRESETS.find((preset) => preset.variant === variant) || DEFAULT_TEMPLATE_PRESET
}

function isTemplateVariant(value: unknown): value is CoreTemplateVariant {
  return TEMPLATE_PRESETS.some((preset) => preset.variant === value)
}
