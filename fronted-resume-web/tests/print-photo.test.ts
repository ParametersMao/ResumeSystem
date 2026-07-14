import assert from 'node:assert/strict'
import test from 'node:test'
import { buildCoreResumePrintHtml } from '../src/core-resume/print.ts'

test('includes the optional minimal ATS photo slot styles in exported HTML', () => {
  const markup = '<header class="ats-resume-header has-avatar"><div class="ats-avatar-wrap"><img class="resume-avatar ats-avatar" src="/uploads/resume-photos/a.png" /></div></header>'
  const html = buildCoreResumePrintHtml(markup, 'ATS photo test')

  assert.match(html, /\.ats-resume-header\.has-avatar\s*\{/)
  assert.match(html, /\.ats-avatar-wrap\s*\{/)
  assert.match(html, /\.ats-avatar\s*\{/)
  assert.match(html, /src="\/uploads\/resume-photos\/a\.png"/)
})
