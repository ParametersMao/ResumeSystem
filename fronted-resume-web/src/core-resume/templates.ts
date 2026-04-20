import type { CoreTemplateVariant } from './model'

export interface CoreTemplatePreset {
  key: string
  label: string
  variant: CoreTemplateVariant
  description: string
  keywords: string[]
}

export interface TemplateResolutionSource {
  templateVariant?: unknown
  templateName?: unknown
}

const TEMPLATE_PRESETS: CoreTemplatePreset[] = [
  {
    key: 'classic-balanced',
    label: '经典单栏',
    variant: 'classic',
    description: '适合大多数岗位，重点突出经历内容和时间线。',
    keywords: ['classic', 'default', 'basic', 'single', 'standard', '经典', '单栏', '默认'],
  },
  {
    key: 'sidebar-modern',
    label: '侧栏双栏',
    variant: 'sidebar',
    description: '适合信息较多的简历，把技能和联系方式放到侧栏。',
    keywords: ['sidebar', 'split', 'modern', 'double', '侧栏', '双栏', '现代'],
  },
  {
    key: 'timeline-editorial',
    label: '时间轴版',
    variant: 'timeline',
    description: '强化项目与工作经历的节奏感，适合强调成长路径和代表成果。',
    keywords: ['timeline', 'story', 'journey', '时间轴', '编年', '成长'],
  },
  {
    key: 'spotlight-featured',
    label: '聚焦封面',
    variant: 'spotlight',
    description: '用封面式头图区强化个人品牌，适合求职方向明确、想突出代表能力与关键信息的人选。',
    keywords: ['spotlight', 'featured', 'hero', 'cover', 'brand', '聚焦', '封面', '主视觉'],
  },
  {
    key: 'ats-minimal',
    label: 'ATS 极简',
    variant: 'ats',
    description: '面向投递系统和正式打印场景，弱化装饰，强调清晰层级和关键词可读性。',
    keywords: ['ats', 'minimal', 'clean', 'plain', '极简', '投递', '系统筛选'],
  },
  {
    key: 'executive-premium',
    label: '高管黑金',
    variant: 'executive',
    description: '更稳重的商务风格，适合管理岗、咨询、运营负责人等需要突出可信度的场景。',
    keywords: ['executive', 'premium', 'gold', 'manager', '高管', '黑金', '管理', '咨询'],
  },
  {
    key: 'compact-ats',
    label: '紧凑信息流',
    variant: 'compact',
    description: '在一页内承载更多经历信息，适合项目较多、需要压缩篇幅的候选人。',
    keywords: ['compact', 'dense', 'onepage', '紧凑', '一页', '信息密集'],
  },
  {
    key: 'editorial-creative',
    label: '编辑创意',
    variant: 'editorial',
    description: '偏内容策展和创意表达，适合市场、品牌、内容、设计运营等岗位。',
    keywords: ['editorial', 'creative', 'magazine', '编辑', '创意', '品牌', '内容'],
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

export function resolveTemplatePreset(
  source?: TemplateResolutionSource,
  templateData?: any,
): CoreTemplatePreset {
  const inlineVariant = [
    source?.templateVariant,
    templateData?.layout?.variant,
    templateData?.theme?.variant,
    templateData?.variant,
  ].find((value) => typeof value === 'string')

  if (isTemplateVariant(inlineVariant)) {
    return findPresetByVariant(inlineVariant)
  }

  const templateName = typeof source?.templateName === 'string' ? source.templateName : ''
  const normalized = templateName.toLowerCase()
  const matched = TEMPLATE_PRESETS.find((preset) =>
    preset.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())),
  )

  return matched || DEFAULT_TEMPLATE_PRESET
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
