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

/** Build an explicit per-resume override without changing template defaults. */
export function createVisibleResumeAvatarLayout(layoutKey: unknown): VisibleResumeAvatarLayout {
  if (layoutKey === 'qm-minimal-ats') {
    return {
      enabled: true,
      placement: 'header-right',
      shape: 'square',
      width: 72,
      height: 88,
    }
  }

  if (layoutKey === 'qm-spotlight-featured') {
    return {
      enabled: true,
      placement: 'meta-card',
      shape: 'rounded',
      width: 96,
      height: 120,
    }
  }

  return {
    enabled: true,
    placement: 'header-right',
    shape: 'rounded',
    width: 88,
    height: 112,
  }
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
