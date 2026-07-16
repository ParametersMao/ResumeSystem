'use strict'

const OBJECT_POSITION = 'center 20%'

const TEMPLATE_AVATAR_PRESETS = Object.freeze({
  'qm-blue-top-photo': avatar('header-right', 'square', 96, 120),
  'qm-sidebar-profile': avatar('sidebar-top', 'square', 104, 130),
  'qm-classic-centered': avatar('header-right', 'square', 88, 110),
  'qm-ribbon-compact': avatar('default', 'square', 96, 120),
  'qm-timeline-icons': avatar('meta-card', 'square', 88, 110),
  'qm-table-formal': avatar('header-right', 'square', 78, 98),
  'qm-minimal-ats': avatar('header-right', 'square', 72, 90),
  'qm-executive-business': avatar('header-right', 'square', 96, 120),
  'qm-asymmetric-profile': avatar('header-right', 'square', 104, 130),
  'qm-student-editorial': avatar('header-right', 'square', 88, 110),
  'qm-spotlight-featured': avatar('meta-card', 'rounded', 96, 120),
})

const LEGACY_HIDDEN_LAYOUT_KEYS = Object.freeze([
  'qm-minimal-ats',
  'qm-spotlight-featured',
])

function getTemplateAvatarPreset(layoutKey) {
  const preset = TEMPLATE_AVATAR_PRESETS[layoutKey]
  if (!preset) {
    throw new Error(`Unknown template layout key: ${String(layoutKey)}`)
  }
  return { ...preset }
}

function isTemplateLayoutKey(value) {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TEMPLATE_AVATAR_PRESETS, value)
}

function isExactLegacyHiddenAvatar(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false

  const keys = Object.keys(value).sort()
  const expectedKeys = ['enabled', 'height', 'placement', 'shape', 'width']
  if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
    return false
  }

  return value.enabled === false
    && value.placement === 'hidden'
    && value.shape === 'square'
    && value.width === 0
    && value.height === 0
}

function avatar(placement, shape, width, height) {
  return Object.freeze({
    enabled: true,
    placement,
    shape,
    width,
    height,
    objectPosition: OBJECT_POSITION,
  })
}

module.exports = {
  LEGACY_HIDDEN_LAYOUT_KEYS,
  OBJECT_POSITION,
  TEMPLATE_AVATAR_PRESETS,
  getTemplateAvatarPreset,
  isExactLegacyHiddenAvatar,
  isTemplateLayoutKey,
}
