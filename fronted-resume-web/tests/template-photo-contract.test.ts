import assert from 'node:assert/strict'
import test, { after } from 'node:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import * as photoModule from '../src/core-resume/photo.ts'

type CoreTemplateLayoutKey =
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

interface CoreResumeDocument {
  profile: { avatar: string }
  templateLayout?: { key?: CoreTemplateLayoutKey; avatar?: Record<string, unknown> }
  [key: string]: unknown
}

interface VisibleAvatarLayout {
  enabled: true
  placement: 'default' | 'header-right' | 'sidebar-top' | 'meta-card'
  shape: 'rounded' | 'circle' | 'square'
  width: number
  height: number
  objectPosition: 'center 20%'
}

type PhotoModuleWithDocumentApply = typeof photoModule & {
  applyResumePhotoToDocument?: (document: CoreResumeDocument, uploadedUrl: unknown) => CoreResumeDocument | void
}

/**
 * Product contract for the eleven public layouts. These values deliberately
 * mirror the portrait proportions used by the template renderer, not generic
 * variant-level fallbacks. A template may style the frame, but it may not
 * silently remove the photo slot.
 */
const EXPECTED_AVATAR_BY_LAYOUT = {
  'qm-blue-top-photo': { enabled: true, placement: 'header-right', shape: 'square', width: 96, height: 120, objectPosition: 'center 20%' },
  'qm-sidebar-profile': { enabled: true, placement: 'sidebar-top', shape: 'square', width: 104, height: 130, objectPosition: 'center 20%' },
  'qm-classic-centered': { enabled: true, placement: 'header-right', shape: 'square', width: 88, height: 110, objectPosition: 'center 20%' },
  'qm-ribbon-compact': { enabled: true, placement: 'default', shape: 'square', width: 96, height: 120, objectPosition: 'center 20%' },
  'qm-timeline-icons': { enabled: true, placement: 'meta-card', shape: 'square', width: 88, height: 110, objectPosition: 'center 20%' },
  'qm-minimal-ats': { enabled: true, placement: 'header-right', shape: 'square', width: 72, height: 90, objectPosition: 'center 20%' },
  'qm-executive-business': { enabled: true, placement: 'header-right', shape: 'square', width: 96, height: 120, objectPosition: 'center 20%' },
  'qm-student-editorial': { enabled: true, placement: 'header-right', shape: 'square', width: 88, height: 110, objectPosition: 'center 20%' },
  'qm-spotlight-featured': { enabled: true, placement: 'meta-card', shape: 'rounded', width: 96, height: 120, objectPosition: 'center 20%' },
  'qm-table-formal': { enabled: true, placement: 'header-right', shape: 'square', width: 78, height: 98, objectPosition: 'center 20%' },
  'qm-asymmetric-profile': { enabled: true, placement: 'header-right', shape: 'square', width: 104, height: 130, objectPosition: 'center 20%' },
} as const satisfies Record<CoreTemplateLayoutKey, VisibleAvatarLayout>

const LAYOUT_KEYS = Object.keys(EXPECTED_AVATAR_BY_LAYOUT) as CoreTemplateLayoutKey[]
const UPLOADED_PHOTO = 'https://aidana.top/uploads/resume-photos/user-7/qa-photo.png'

// The application uses bundler-style extensionless imports. Load model.ts
// through Vite so this Node test exercises the same resolution semantics as
// the production build instead of weakening production imports for the test.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({
  root: projectRoot,
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
})
const {
  createEmptyDocument,
  ensureAllSections,
  extractLayoutFromTemplate,
  parseResumeContent,
} = await vite.ssrLoadModule('/src/core-resume/model.ts')
const { resolveTemplatePreset } = await vite.ssrLoadModule('/src/core-resume/templates.ts')

after(async () => {
  await vite.close()
})

test('all eleven layouts have an explicit visible portrait-photo contract', () => {
  assert.equal(LAYOUT_KEYS.length, 11)
  assert.deepEqual(
    Object.keys(photoModule.RESUME_AVATAR_CONTRACT).sort(),
    [...LAYOUT_KEYS].sort(),
    'central contract and public layout catalog must stay in lockstep',
  )

  for (const layoutKey of LAYOUT_KEYS) {
    const actual = photoModule.createVisibleResumeAvatarLayout(layoutKey)
    assert.deepEqual(actual, EXPECTED_AVATAR_BY_LAYOUT[layoutKey], layoutKey)
    assert.equal(actual.enabled, true, `${layoutKey} must be enabled by default`)
    assert.notEqual(actual.placement, 'hidden', `${layoutKey} must not default to hidden`)
    assert.ok(actual.height > actual.width, `${layoutKey} must retain portrait proportions`)
  }
})

test('template extraction accepts and preserves every public layout key', () => {
  for (const layoutKey of LAYOUT_KEYS) {
    const expectedAvatar = EXPECTED_AVATAR_BY_LAYOUT[layoutKey]
    const extracted = extractLayoutFromTemplate({
      layout: { key: layoutKey, avatar: expectedAvatar },
    })

    assert.deepEqual(extracted, { key: layoutKey, avatar: expectedAvatar }, layoutKey)
  }
})

test('the pure normalizer upgrades every legacy hidden avatar without mutating the contract', () => {
  for (const layoutKey of LAYOUT_KEYS) {
    const normalized = photoModule.normalizeVisibleResumeAvatarLayout(layoutKey, {
      enabled: false,
      placement: 'hidden',
      shape: 'circle',
      width: 40,
      height: 40,
    })

    assert.deepEqual(normalized, EXPECTED_AVATAR_BY_LAYOUT[layoutKey], layoutKey)
    assert.notStrictEqual(normalized, photoModule.RESUME_AVATAR_CONTRACT[layoutKey], `${layoutKey} must receive a detached contract copy`)
  }
})

test('legacy hidden photo defaults migrate to the visible layout contract', () => {
  for (const layoutKey of LAYOUT_KEYS) {
    const legacy = createEmptyDocument()
    legacy.profile.avatar = UPLOADED_PHOTO
    legacy.templateLayout = {
      key: layoutKey,
      avatar: {
        enabled: false,
        placement: 'hidden',
        shape: 'square',
        width: 40,
        height: 40,
      },
    }

    const parsed = parseResumeContent(JSON.stringify(legacy))
    assert.ok(parsed, `${layoutKey} legacy payload should parse`)
    const migrated = ensureAllSections(parsed)

    assert.equal(migrated.profile.avatar, '/uploads/resume-photos/user-7/qa-photo.png', layoutKey)
    assert.deepEqual(migrated.templateLayout, {
      key: layoutKey,
      avatar: EXPECTED_AVATAR_BY_LAYOUT[layoutKey],
    }, layoutKey)

    const reparsed = parseResumeContent(JSON.stringify(migrated))
    assert.ok(reparsed, `${layoutKey} migrated payload should reparse`)
    assert.deepEqual(ensureAllSections(reparsed).templateLayout, migrated.templateLayout, `${layoutKey} migration must be idempotent`)
  }
})

test('an uploaded photo normalizes its URL and automatically enables the active layout', () => {
  const applyResumePhotoToDocument = (photoModule as PhotoModuleWithDocumentApply).applyResumePhotoToDocument
  assert.equal(
    typeof applyResumePhotoToDocument,
    'function',
    'photo.ts must export applyResumePhotoToDocument so editor upload and tests share one state transition',
  )

  for (const layoutKey of LAYOUT_KEYS) {
    const document = createEmptyDocument()
    document.templateLayout = {
      key: layoutKey,
      avatar: { enabled: false, placement: 'hidden' },
    }

    const returned = applyResumePhotoToDocument!(document, UPLOADED_PHOTO)
    const updated = returned || document

    assert.equal(updated.profile.avatar, '/uploads/resume-photos/user-7/qa-photo.png', layoutKey)
    assert.deepEqual(updated.templateLayout, {
      key: layoutKey,
      avatar: EXPECTED_AVATAR_BY_LAYOUT[layoutKey],
    }, layoutKey)
  }
})

test('photo URL and layout survive save/reload round trips for every layout', () => {
  for (const layoutKey of LAYOUT_KEYS) {
    const original = createEmptyDocument()
    original.profile.avatar = '/uploads/resume-photos/user-7/round-trip.png'
    original.templateLayout = {
      key: layoutKey,
      avatar: EXPECTED_AVATAR_BY_LAYOUT[layoutKey],
    }

    const parsed = parseResumeContent(JSON.stringify(original))
    assert.ok(parsed, `${layoutKey} saved payload should parse`)
    const reloaded = ensureAllSections(parsed)

    assert.equal(reloaded.profile.avatar, original.profile.avatar, layoutKey)
    assert.deepEqual(reloaded.templateLayout, original.templateLayout, layoutKey)
  }
})

test('an explicitly selected template overrides the resume previous layout', () => {
  const source = {
    templateLayout: { key: 'qm-blue-top-photo' },
    templateVariant: 'ats',
  }

  const selectedByLayout = resolveTemplatePreset(source, {
    layout: { key: 'qm-student-editorial' },
  })
  assert.equal(selectedByLayout.layoutKey, 'qm-student-editorial')
  assert.equal(selectedByLayout.avatar.enabled, true)
  assert.equal(selectedByLayout.avatar.objectPosition, 'center 20%')

  const selectedByName = resolveTemplatePreset(source, {
    name: '应届生校招项目经历模板',
  })
  assert.equal(selectedByName.layoutKey, 'qm-student-editorial')
})

test('resume metadata remains the fallback when explicit template data is unrecognized', () => {
  const preset = resolveTemplatePreset(
    { templateLayout: { key: 'qm-asymmetric-profile' } },
    { name: '未分类模板' },
  )

  assert.equal(preset.layoutKey, 'qm-asymmetric-profile')
})
