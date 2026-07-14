import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createVisibleResumeAvatarLayout,
  normalizeResumePhotoUrl,
  parseResumePhotoUploadResponse,
  resolveResumeProfilePhoto,
} from '../src/core-resume/photo.ts'

const HTTPS_IP = { origin: 'https://121.43.208.184', protocol: 'https:' }

test('parses current and nested upload response envelopes', () => {
  assert.deepEqual(
    parseResumePhotoUploadResponse({ code: 200, data: { url: '/uploads/resume-photos/a.png', key: 'a.png' } }, HTTPS_IP),
    { url: '/uploads/resume-photos/a.png', key: 'a.png' },
  )
  assert.deepEqual(
    parseResumePhotoUploadResponse({ data: { data: { photoUrl: 'uploads/resume-photos/b.png', storageKey: 'b.png' } } }, HTTPS_IP),
    { url: '/uploads/resume-photos/b.png', key: 'b.png' },
  )
})

test('rejects a nominally successful upload without an image URL', () => {
  assert.throws(
    () => parseResumePhotoUploadResponse({ code: 200, data: { key: 'missing.png' } }, HTTPS_IP),
    /usable image URL/,
  )
})

test('normalizes app upload URLs so domain and IP access remain portable', () => {
  assert.equal(
    normalizeResumePhotoUrl('https://aidana.top/uploads/resume-photos/a.png?version=1', HTTPS_IP),
    '/uploads/resume-photos/a.png?version=1',
  )
  assert.equal(
    normalizeResumePhotoUrl('http://backend:3000/uploads/resume-photos/a.png', HTTPS_IP),
    '/uploads/resume-photos/a.png',
  )
  assert.equal(normalizeResumePhotoUrl('uploads/resume-photos/a.png', HTTPS_IP), '/uploads/resume-photos/a.png')
})

test('preserves external object storage and upgrades mixed-content URLs', () => {
  assert.equal(
    normalizeResumePhotoUrl('https://cdn.example.com/resume-photos/a.png', HTTPS_IP),
    'https://cdn.example.com/resume-photos/a.png',
  )
  assert.equal(
    normalizeResumePhotoUrl('http://cdn.example.com/resume-photos/a.png', HTTPS_IP),
    'https://cdn.example.com/resume-photos/a.png',
  )
})

test('reloads legacy photo fields into the canonical avatar URL', () => {
  assert.equal(
    resolveResumeProfilePhoto({ photo: 'https://aidana.top/uploads/resume-photos/legacy.png' }, HTTPS_IP),
    '/uploads/resume-photos/legacy.png',
  )
  assert.equal(
    resolveResumeProfilePhoto({ avatarUrl: 'https://cdn.example.com/avatar.png' }, HTTPS_IP),
    'https://cdn.example.com/avatar.png',
  )
})

test('creates visible-by-default portrait layouts for every template family', () => {
  assert.deepEqual(createVisibleResumeAvatarLayout('qm-minimal-ats'), {
    enabled: true,
    placement: 'header-right',
    shape: 'square',
    width: 72,
    height: 90,
    objectPosition: 'center 20%',
  })
  assert.deepEqual(createVisibleResumeAvatarLayout('qm-spotlight-featured'), {
    enabled: true,
    placement: 'meta-card',
    shape: 'rounded',
    width: 96,
    height: 120,
    objectPosition: 'center 20%',
  })
})
