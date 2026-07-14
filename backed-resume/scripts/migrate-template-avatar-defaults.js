'use strict'

const assert = require('node:assert/strict')
const mysql = require('mysql2/promise')
const {
  getTemplateAvatarPreset,
  isTemplateLayoutKey,
} = require('./template-avatar-contract')

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'resume_system',
  charset: 'utf8mb4',
}

function buildTemplateUpdate(row) {
  if (!row || !Number.isInteger(Number(row.id)) || typeof row.html_content !== 'string') {
    return null
  }

  let parsed
  try {
    parsed = JSON.parse(row.html_content)
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null

  const layoutKey = parsed.layout?.key || parsed.layoutKey
  if (!isTemplateLayoutKey(layoutKey)) return null

  const profile = parsed.profile && typeof parsed.profile === 'object' && !Array.isArray(parsed.profile)
    ? parsed.profile
    : {}
  const avatar = getTemplateAvatarPreset(layoutKey)

  if (
    parsed.layoutKey === layoutKey
    && parsed.layout?.key === layoutKey
    && isDeepEqual(parsed.layout?.avatar, avatar)
    && isDeepEqual(profile.avatar, avatar)
  ) {
    return null
  }

  parsed.layoutKey = layoutKey
  parsed.layout = {
    ...parsed.layout,
    key: layoutKey,
    avatar,
  }
  parsed.profile = {
    ...profile,
    avatar,
  }

  return {
    id: Number(row.id),
    name: String(row.name || ''),
    layoutKey,
    beforeHtml: row.html_content,
    afterHtml: JSON.stringify(parsed, null, 2),
  }
}

function isDeepEqual(left, right) {
  try {
    assert.deepStrictEqual(left, right)
    return true
  } catch {
    return false
  }
}

function planTemplateUpdates(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map(buildTemplateUpdate)
    .filter(Boolean)
}

async function readReferenceSnapshot(connection, templateIds) {
  if (!templateIds.length) return []

  const [rows] = await connection.query(
    `SELECT
       t.id,
       t.name AS templateName,
       t.use_count AS useCount,
       (SELECT COUNT(*) FROM resumes r WHERE r.template_id = t.id) AS resumeCount,
       (SELECT COUNT(*) FROM template_favorites f WHERE f.template_id = t.id) AS favoriteCount,
       (SELECT COUNT(*) FROM template_usage u WHERE u.template_id = t.id) AS usageCount,
       (SELECT COUNT(*) FROM resume_downloads d WHERE d.template_id = t.id) AS downloadCount
     FROM templates t
     WHERE t.id IN (?)
     ORDER BY t.id`,
    [templateIds],
  )

  return rows.map((row) => ({
    id: Number(row.id),
    templateName: String(row.templateName || ''),
    useCount: Number(row.useCount || 0),
    resumeCount: Number(row.resumeCount || 0),
    favoriteCount: Number(row.favoriteCount || 0),
    usageCount: Number(row.usageCount || 0),
    downloadCount: Number(row.downloadCount || 0),
  }))
}

async function runMigration(connection, options = {}) {
  const apply = options.apply === true
  const log = typeof options.log === 'function' ? options.log : console.log
  await connection.beginTransaction()

  try {
    const lockClause = apply ? ' FOR UPDATE' : ''
    const [rows] = await connection.query(
      `SELECT id, name, html_content, use_count, is_active
       FROM templates
       WHERE is_active = 1
       ORDER BY id${lockClause}`,
    )
    const updates = planTemplateUpdates(rows)

    log(`[template-avatar-migration] mode=${apply ? 'apply' : 'dry-run'} candidates=${updates.length}`)
    for (const update of updates) {
      log(`[template-avatar-migration] template=${update.id} layout=${update.layoutKey} name=${update.name}`)
    }

    if (!apply || updates.length === 0) {
      await connection.rollback()
      return { mode: apply ? 'apply' : 'dry-run', applied: 0, candidates: updates }
    }

    const templateIds = updates.map((update) => update.id)
    const beforeReferences = await readReferenceSnapshot(connection, templateIds)

    for (const update of updates) {
      const [result] = await connection.query(
        'UPDATE templates SET html_content = ? WHERE id = ? AND html_content = ?',
        [update.afterHtml, update.id, update.beforeHtml],
      )
      if (Number(result.affectedRows) !== 1) {
        throw new Error(`Template ${update.id} changed concurrently; migration aborted`)
      }
    }

    const afterReferences = await readReferenceSnapshot(connection, templateIds)
    assert.deepStrictEqual(
      afterReferences,
      beforeReferences,
      'Template IDs, references, and counters changed during avatar migration',
    )

    await connection.commit()
    log(`[template-avatar-migration] committed=${updates.length}`)
    return { mode: 'apply', applied: updates.length, candidates: updates }
  } catch (error) {
    await connection.rollback()
    throw error
  }
}

function parseCliArgs(argv) {
  const args = new Set(argv)
  const allowed = new Set(['--apply', '--dry-run', '--help'])
  const unknown = [...args].filter((arg) => !allowed.has(arg))
  if (unknown.length) throw new Error(`Unknown option: ${unknown.join(', ')}`)
  if (args.has('--apply') && args.has('--dry-run')) {
    throw new Error('Choose either --apply or --dry-run, not both')
  }
  return {
    apply: args.has('--apply'),
    help: args.has('--help'),
  }
}

async function main() {
  const options = parseCliArgs(process.argv.slice(2))
  if (options.help) {
    console.log('Usage: node scripts/migrate-template-avatar-defaults.js [--dry-run|--apply]')
    console.log('Default mode is dry-run. Database writes require the explicit --apply flag.')
    return
  }

  const connection = await mysql.createConnection(dbConfig)
  try {
    const result = await runMigration(connection, options)
    if (!options.apply) {
      console.log(`[template-avatar-migration] dry-run complete; would-update=${result.candidates.length}`)
    }
  } finally {
    await connection.end()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[template-avatar-migration] failed: ${error.message}`)
    process.exitCode = 1
  })
}

module.exports = {
  buildTemplateUpdate,
  parseCliArgs,
  planTemplateUpdates,
  readReferenceSnapshot,
  runMigration,
}
