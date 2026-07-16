import type { CoreAvatarLayout, CoreResumeDocument, CoreTemplateLayoutKey } from './model'

export interface ResumePhotoAsset {
  url: string
  key: string
}

export interface VisibleResumeAvatarLayout {
  enabled: true
  placement: 'default' | 'header-right' | 'sidebar-top' | 'meta-card'
  shape: 'rounded' | 'circle' | 'square'
  width: number
  height: number
  objectPosition: 'center 20%'
}

interface PhotoUrlContext {
  origin?: string
  protocol?: string
}

const PHOTO_URL_FIELDS = ['url', 'assetUrl', 'photoUrl', 'avatarUrl', 'path'] as const
const PROFILE_PHOTO_FIELDS = ['avatar', 'photo', 'avatarUrl', 'photoUrl', 'url'] as const
const PHOTO_KEY_FIELDS = ['key', 'objectKey', 'storageKey'] as const
const SAME_ORIGIN_ASSET_PREFIXES = ['/uploads/', '/mock/']

/**
 * Canonical professional-photo contract for every production resume layout.
 *
 * Template payloads used to carry their own, often contradictory avatar
 * values. Rendering now resolves from this matrix so template cards, the
 * editor and exported markup all use the same visible 4:5-ish photo slot.
 */
export const RESUME_AVATAR_CONTRACT: Readonly<Record<CoreTemplateLayoutKey, Readonly<VisibleResumeAvatarLayout>>> = {
  'qm-blue-top-photo': {
    enabled: true,
    placement: 'header-right',
    shape: 'square',
    width: 96,
    height: 120,
    objectPosition: 'center 20%',
  },
  'qm-sidebar-profile': {
    enabled: true,
    placement: 'sidebar-top',
    shape: 'square',
    width: 104,
    height: 130,
    objectPosition: 'center 20%',
  },
  'qm-classic-centered': {
    enabled: true,
    placement: 'header-right',
    shape: 'square',
    width: 88,
    height: 110,
    objectPosition: 'center 20%',
  },
  'qm-ribbon-compact': {
    enabled: true,
    placement: 'default',
    shape: 'square',
    width: 96,
    height: 120,
    objectPosition: 'center 20%',
  },
  'qm-timeline-icons': {
    enabled: true,
    placement: 'meta-card',
    shape: 'square',
    width: 88,
    height: 110,
    objectPosition: 'center 20%',
  },
  'qm-minimal-ats': {
    enabled: true,
    placement: 'header-right',
    shape: 'square',
    width: 72,
    height: 90,
    objectPosition: 'center 20%',
  },
  'qm-executive-business': {
    enabled: true,
    placement: 'header-right',
    shape: 'square',
    width: 96,
    height: 120,
    objectPosition: 'center 20%',
  },
  'qm-student-editorial': {
    enabled: true,
    placement: 'header-right',
    shape: 'square',
    width: 88,
    height: 110,
    objectPosition: 'center 20%',
  },
  'qm-spotlight-featured': {
    enabled: true,
    placement: 'meta-card',
    shape: 'rounded',
    width: 96,
    height: 120,
    objectPosition: 'center 20%',
  },
  'qm-table-formal': {
    enabled: true,
    placement: 'header-right',
    shape: 'square',
    width: 78,
    height: 98,
    objectPosition: 'center 20%',
  },
  'qm-asymmetric-profile': {
    enabled: true,
    placement: 'header-right',
    shape: 'square',
    width: 104,
    height: 130,
    objectPosition: 'center 20%',
  },
}

/**
 * Accept both the current API envelope and older/direct upload responses.
 * A successful HTTP response without a usable photo URL is treated as a
 * failed upload instead of persisting `undefined` into the resume document.
 */
export function parseResumePhotoUploadResponse(payload: unknown, context?: PhotoUrlContext): ResumePhotoAsset {
  const candidates = unwrapResponseCandidates(payload)
  const rawUrl = findStringField(candidates, PHOTO_URL_FIELDS)
  const url = normalizeResumePhotoUrl(rawUrl, context)

  if (!url) {
    throw new Error('Photo upload response did not contain a usable image URL')
  }

  return {
    url,
    key: findStringField(candidates, PHOTO_KEY_FIELDS),
  }
}

/**
 * Keep local assets origin-independent so a resume created through the domain
 * still works through the public IP (and vice versa). External object-storage
 * URLs remain absolute. In an HTTPS page, insecure absolute URLs are upgraded
 * to avoid browser mixed-content blocking.
 */
export function normalizeResumePhotoUrl(value: unknown, context?: PhotoUrlContext): string {
  if (typeof value !== 'string') return ''

  const raw = value.trim().replace(/\\/g, '/')
  if (!raw) return ''
  if (/^data:image\//i.test(raw) || /^blob:/i.test(raw)) return raw
  if (/^(javascript|file|vbscript):/i.test(raw)) return ''

  const runtime = resolvePhotoUrlContext(context)

  if (raw.startsWith('/')) {
    return raw.startsWith('//')
      ? normalizeAbsolutePhotoUrl(`${runtime.protocol}${raw}`, runtime)
      : raw
  }

  if (/^(uploads|mock)\//i.test(raw)) {
    return `/${raw}`
  }

  if (/^https?:\/\//i.test(raw)) {
    return normalizeAbsolutePhotoUrl(raw, runtime)
  }

  try {
    const resolved = new URL(raw, `${runtime.origin}/`)
    return toPortableAssetUrl(resolved)
  } catch {
    return ''
  }
}

/** Read all supported persisted field names and return the canonical URL. */
export function resolveResumeProfilePhoto(profile: unknown, context?: PhotoUrlContext): string {
  if (!isRecord(profile)) return ''
  const rawUrl = PROFILE_PHOTO_FIELDS
    .map((field) => profile[field])
    .find((value) => typeof value === 'string' && value.trim())
  return normalizeResumePhotoUrl(rawUrl, context)
}

/** Return a detached copy so documents cannot mutate the global contract. */
export function createVisibleResumeAvatarLayout(layoutKey: unknown): VisibleResumeAvatarLayout {
  const resolvedKey = isCoreTemplateLayoutKey(layoutKey) ? layoutKey : 'qm-blue-top-photo'
  return { ...RESUME_AVATAR_CONTRACT[resolvedKey] }
}

/**
 * Canonicalize template/resume avatar data. Legacy `hidden`/disabled/zero-size
 * payloads are deliberately upgraded instead of being allowed to suppress the
 * default professional-photo slot.
 */
export function normalizeVisibleResumeAvatarLayout(
  layoutKey: unknown,
  _avatar?: CoreAvatarLayout,
): VisibleResumeAvatarLayout {
  return createVisibleResumeAvatarLayout(layoutKey)
}

/** Apply the complete upload state transition used by the editor and reloads. */
export function applyResumePhotoToDocument(document: CoreResumeDocument, uploadedUrl: unknown): CoreResumeDocument {
  const photoUrl = normalizeResumePhotoUrl(uploadedUrl)
  if (!photoUrl) {
    throw new Error('Uploaded photo URL is invalid')
  }

  const layoutKey = isCoreTemplateLayoutKey(document.templateLayout?.key)
    ? document.templateLayout.key
    : 'qm-blue-top-photo'

  document.profile.avatar = photoUrl
  document.templateLayout = {
    ...(document.templateLayout || {}),
    key: layoutKey,
    avatar: normalizeVisibleResumeAvatarLayout(layoutKey, document.templateLayout?.avatar),
  }
  return document
}

export function isCoreTemplateLayoutKey(value: unknown): value is CoreTemplateLayoutKey {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(RESUME_AVATAR_CONTRACT, value)
}

function normalizeAbsolutePhotoUrl(raw: string, context: Required<PhotoUrlContext>): string {
  try {
    const url = new URL(raw)
    if (!['http:', 'https:'].includes(url.protocol)) return ''

    const portable = toPortableAssetUrl(url)
    if (portable !== url.href) return portable

    if (context.protocol === 'https:' && url.protocol === 'http:') {
      url.protocol = 'https:'
    }
    return url.href
  } catch {
    return ''
  }
}

function toPortableAssetUrl(url: URL): string {
  if (SAME_ORIGIN_ASSET_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return `${url.pathname}${url.search}${url.hash}`
  }
  return url.href
}

function resolvePhotoUrlContext(context?: PhotoUrlContext): Required<PhotoUrlContext> {
  const browserLocation = typeof window !== 'undefined' ? window.location : undefined
  const origin = (context?.origin || browserLocation?.origin || 'http://localhost').replace(/\/+$/, '')
  const protocol = context?.protocol || browserLocation?.protocol || new URL(origin).protocol
  return { origin, protocol: protocol.endsWith(':') ? protocol : `${protocol}:` }
}

function unwrapResponseCandidates(payload: unknown): Record<string, unknown>[] {
  const candidates: Record<string, unknown>[] = []
  let current = payload

  for (let depth = 0; depth < 4 && isRecord(current); depth += 1) {
    candidates.push(current)
    current = current.data
  }

  return candidates.reverse()
}

function findStringField(
  candidates: Record<string, unknown>[],
  fields: readonly string[],
): string {
  for (const candidate of candidates) {
    for (const field of fields) {
      const value = candidate[field]
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
  }
  return ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
