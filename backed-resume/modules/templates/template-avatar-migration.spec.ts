import {
  TEMPLATE_AVATAR_PRESETS,
  TEMPLATE_LAYOUT_KEYS,
} from './template-avatar-contract';

const scriptContract = require('../../scripts/template-avatar-contract');
const { templates: seededTemplates } = require('../../scripts/seed-diverse-templates');
const {
  buildTemplateUpdate,
  parseCliArgs,
  planTemplateUpdates,
  runMigration,
} = require('../../scripts/migrate-template-avatar-defaults');

function legacyRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 21,
    name: '技术开发 · ATS 单栏投递版',
    is_active: 1,
    use_count: 12,
    html_content: JSON.stringify({
      layoutKey: 'qm-minimal-ats',
      layout: {
        key: 'qm-minimal-ats',
        variant: 'ats',
        avatar: { enabled: false, placement: 'hidden', shape: 'square', width: 0, height: 0 },
      },
      meta: { keep: 'unchanged' },
    }, null, 2),
    ...overrides,
  };
}

function referenceSnapshot() {
  return [{
    id: 21,
    templateName: '技术开发 · ATS 单栏投递版',
    useCount: 12,
    resumeCount: 2,
    favoriteCount: 1,
    usageCount: 7,
    downloadCount: 3,
  }];
}

describe('template avatar production migration', () => {
  it('keeps the operational script contract aligned with the typed backend contract', () => {
    expect(Object.keys(scriptContract.TEMPLATE_AVATAR_PRESETS).sort()).toEqual([...TEMPLATE_LAYOUT_KEYS].sort());
    expect(scriptContract.TEMPLATE_AVATAR_PRESETS).toEqual(TEMPLATE_AVATAR_PRESETS);
  });

  it('builds all eleven seed templates from the same visible avatar contract without running the seed', () => {
    expect(seededTemplates).toHaveLength(11);
    for (const template of seededTemplates) {
      const parsed = JSON.parse(template.htmlContent);
      const layoutKey = parsed.layout.key;
      expect(TEMPLATE_LAYOUT_KEYS).toContain(layoutKey);
      expect(parsed.layout.avatar).toEqual(TEMPLATE_AVATAR_PRESETS[layoutKey]);
      expect(parsed.layout.avatar.enabled).toBe(true);
      expect(parsed.layout.avatar.objectPosition).toBe('center 20%');
    }
  });

  it('keeps legacy resume compatibility detection exact and opt-in', () => {
    expect(scriptContract.isExactLegacyHiddenAvatar({
      enabled: false,
      placement: 'hidden',
      shape: 'square',
      width: 0,
      height: 0,
    })).toBe(true);
    expect(scriptContract.isExactLegacyHiddenAvatar({
      enabled: false,
      placement: 'hidden',
      shape: 'square',
      width: 0,
      height: 0,
      userOverride: true,
    })).toBe(false);
  });

  it('upgrades only an exact legacy hidden signature while preserving the template ID and other JSON', () => {
    const row = legacyRow();
    const update = buildTemplateUpdate(row);
    expect(update).not.toBeNull();
    expect(update.id).toBe(21);
    expect(update.layoutKey).toBe('qm-minimal-ats');

    const migrated = JSON.parse(update.afterHtml);
    expect(migrated.meta).toEqual({ keep: 'unchanged' });
    expect(migrated.layout.avatar).toEqual(TEMPLATE_AVATAR_PRESETS['qm-minimal-ats']);
    expect(migrated.profile.avatar).toEqual(TEMPLATE_AVATAR_PRESETS['qm-minimal-ats']);
  });

  it.each([
    { enabled: false, placement: 'hidden', shape: 'square', width: 0 },
    { enabled: false, placement: 'hidden', shape: 'square', width: 0, height: 0, userOverride: true },
    { enabled: true, placement: 'hidden', shape: 'square', width: 0, height: 0 },
    { enabled: false, placement: 'header-right', shape: 'square', width: 0, height: 0 },
  ])('normalizes every non-canonical active template avatar preset: %j', (avatar) => {
    const row = legacyRow();
    const parsed = JSON.parse(row.html_content);
    parsed.layout.avatar = avatar;
    row.html_content = JSON.stringify(parsed);
    const update = buildTemplateUpdate(row);
    expect(update).not.toBeNull();
    expect(JSON.parse(update.afterHtml).layout.avatar).toEqual(TEMPLATE_AVATAR_PRESETS['qm-minimal-ats']);
  });

  it('normalizes recognized layouts but ignores unknown layout keys', () => {
    const row = legacyRow();
    const parsed = JSON.parse(row.html_content);
    parsed.layoutKey = 'qm-blue-top-photo';
    parsed.layout.key = 'qm-blue-top-photo';
    row.html_content = JSON.stringify(parsed);
    expect(buildTemplateUpdate(row)).not.toBeNull();

    parsed.layoutKey = 'third-party-layout';
    parsed.layout.key = 'third-party-layout';
    row.html_content = JSON.stringify(parsed);
    expect(buildTemplateUpdate(row)).toBeNull();
  });

  it('normalizes all eleven active layout rows and is idempotent on a second pass', () => {
    const rows = TEMPLATE_LAYOUT_KEYS.map((layoutKey, index) => ({
      id: index + 1,
      name: layoutKey,
      is_active: 1,
      use_count: index,
      html_content: JSON.stringify({
        layoutKey,
        layout: { key: layoutKey, avatar: { placement: 'default' } },
      }),
    }));

    const firstPass = planTemplateUpdates(rows);
    expect(firstPass).toHaveLength(11);
    for (const update of firstPass) {
      const migrated = JSON.parse(update.afterHtml);
      expect(migrated.layout.avatar).toEqual(TEMPLATE_AVATAR_PRESETS[update.layoutKey]);
      expect(migrated.profile.avatar).toEqual(TEMPLATE_AVATAR_PRESETS[update.layoutKey]);
    }

    const secondPassRows = rows.map((row) => {
      const update = firstPass.find((item) => item.id === row.id);
      return { ...row, html_content: update.afterHtml };
    });
    expect(planTemplateUpdates(secondPassRows)).toEqual([]);
  });

  it('defaults to dry-run, performs no UPDATE, and rolls back its read transaction', async () => {
    const connection = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValueOnce([[legacyRow()], []]),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };

    const result = await runMigration(connection, { log: jest.fn() });
    expect(result.mode).toBe('dry-run');
    expect(result.candidates).toHaveLength(1);
    expect(connection.beginTransaction).toHaveBeenCalledTimes(1);
    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.query).toHaveBeenCalledTimes(1);
    expect(connection.query.mock.calls.some(([sql]) => /^\s*UPDATE\s/i.test(sql))).toBe(false);
  });

  it('requires explicit --apply and commits only an optimistic in-place UPDATE', async () => {
    const before = referenceSnapshot();
    const after = referenceSnapshot();
    const connection = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn()
        .mockResolvedValueOnce([[legacyRow()], []])
        .mockResolvedValueOnce([before, []])
        .mockResolvedValueOnce([{ affectedRows: 1 }, []])
        .mockResolvedValueOnce([after, []]),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };

    const result = await runMigration(connection, { apply: true, log: jest.fn() });
    expect(result).toMatchObject({ mode: 'apply', applied: 1 });
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.rollback).not.toHaveBeenCalled();

    const mutationCalls = connection.query.mock.calls.filter(([sql]) => /^\s*(UPDATE|DELETE|INSERT)\s/i.test(sql));
    expect(mutationCalls).toHaveLength(1);
    expect(mutationCalls[0][0]).toBe('UPDATE templates SET html_content = ? WHERE id = ? AND html_content = ?');
    expect(mutationCalls[0][1][1]).toBe(21);
  });

  it('rolls back when references or counters change unexpectedly', async () => {
    const changed = referenceSnapshot();
    changed[0].usageCount += 1;
    const connection = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn()
        .mockResolvedValueOnce([[legacyRow()], []])
        .mockResolvedValueOnce([referenceSnapshot(), []])
        .mockResolvedValueOnce([{ affectedRows: 1 }, []])
        .mockResolvedValueOnce([changed, []]),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    };

    await expect(runMigration(connection, { apply: true, log: jest.fn() })).rejects.toThrow(
      'Template IDs, references, and counters changed',
    );
    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.commit).not.toHaveBeenCalled();
  });

  it('parses safe CLI modes and rejects contradictory or unknown flags', () => {
    expect(parseCliArgs([])).toEqual({ apply: false, help: false });
    expect(parseCliArgs(['--dry-run'])).toEqual({ apply: false, help: false });
    expect(parseCliArgs(['--apply'])).toEqual({ apply: true, help: false });
    expect(() => parseCliArgs(['--apply', '--dry-run'])).toThrow('Choose either');
    expect(() => parseCliArgs(['--force'])).toThrow('Unknown option');
  });
});
