import type {
  TemplateAvatarLayout,
  TemplateLayoutKey,
  TemplateVariant,
} from '../../dto/template.dto';

export const TEMPLATE_LAYOUT_KEYS = [
  'qm-blue-top-photo',
  'qm-sidebar-profile',
  'qm-classic-centered',
  'qm-ribbon-compact',
  'qm-timeline-icons',
  'qm-table-formal',
  'qm-minimal-ats',
  'qm-executive-business',
  'qm-asymmetric-profile',
  'qm-student-editorial',
  'qm-spotlight-featured',
] as const satisfies readonly TemplateLayoutKey[];

export const TEMPLATE_AVATAR_PRESETS: Readonly<Record<TemplateLayoutKey, Readonly<TemplateAvatarLayout>>> = {
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
};

export const DEFAULT_LAYOUT_BY_VARIANT: Readonly<Record<TemplateVariant, TemplateLayoutKey>> = {
  classic: 'qm-classic-centered',
  sidebar: 'qm-sidebar-profile',
  timeline: 'qm-timeline-icons',
  spotlight: 'qm-spotlight-featured',
  ats: 'qm-minimal-ats',
  executive: 'qm-executive-business',
  compact: 'qm-ribbon-compact',
  editorial: 'qm-student-editorial',
};

export const TEMPLATE_VARIANT_BY_LAYOUT: Readonly<Record<TemplateLayoutKey, TemplateVariant>> = {
  'qm-blue-top-photo': 'ats',
  'qm-sidebar-profile': 'sidebar',
  'qm-classic-centered': 'classic',
  'qm-ribbon-compact': 'compact',
  'qm-timeline-icons': 'timeline',
  'qm-table-formal': 'classic',
  'qm-minimal-ats': 'ats',
  'qm-executive-business': 'executive',
  'qm-asymmetric-profile': 'editorial',
  'qm-student-editorial': 'editorial',
  'qm-spotlight-featured': 'spotlight',
};

export function isTemplateLayoutKey(value: unknown): value is TemplateLayoutKey {
  return typeof value === 'string' && (TEMPLATE_LAYOUT_KEYS as readonly string[]).includes(value);
}

export function getTemplateAvatarPreset(layoutKey: TemplateLayoutKey): TemplateAvatarLayout {
  return { ...TEMPLATE_AVATAR_PRESETS[layoutKey] };
}

function avatar(
  placement: TemplateAvatarLayout['placement'],
  shape: TemplateAvatarLayout['shape'],
  width: number,
  height: number,
): Readonly<TemplateAvatarLayout> {
  return Object.freeze({
    enabled: true as const,
    placement,
    shape,
    width,
    height,
    objectPosition: 'center 20%' as const,
  });
}
