import { SystemConfigService } from './system-config.service';

describe('SystemConfigService sensitive storage', () => {
  let record: any;
  let repository: any;
  let service: SystemConfigService;

  beforeEach(() => {
    process.env.SYSTEM_CONFIG_MASTER_KEY = Buffer.alloc(32, 11).toString('base64');
    record = {
      id: 1,
      configKey: 'global',
      configData: JSON.stringify({
        email: { smtpPass: 'legacy-smtp-password' },
        ai: { apiKey: 'legacy-api-key' },
      }),
    };
    repository = {
      query: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockImplementation(async () => record),
      create: jest.fn().mockImplementation((value) => value),
      save: jest.fn().mockImplementation(async (value) => {
        record = value;
        return value;
      }),
    };
    service = new SystemConfigService(repository);
  });

  afterEach(() => {
    delete process.env.SYSTEM_CONFIG_MASTER_KEY;
  });

  it('reads legacy plaintext internally while returning configured flags publicly', async () => {
    const internal = await service.getConfig();
    expect(internal.email.smtpPass).toBe('legacy-smtp-password');
    expect(internal.ai.apiKey).toBe('legacy-api-key');

    const publicConfig = await service.getPublicConfig();
    expect(publicConfig.email.smtpPass).toBe('');
    expect(publicConfig.email.smtpPassConfigured).toBe(true);
    expect(publicConfig.ai.apiKey).toBe('');
    expect(publicConfig.ai.apiKeyConfigured).toBe(true);
  });

  it('migrates legacy plaintext to AES-GCM ciphertext on the next save', async () => {
    const response = await service.updatePublicConfig({ site: { siteName: 'Secure Resume' } });
    const stored = JSON.parse(record.configData);

    expect(record.configData).not.toContain('legacy-smtp-password');
    expect(record.configData).not.toContain('legacy-api-key');
    expect(stored.email.smtpPass).toMatch(/^enc:v1:/);
    expect(stored.ai.apiKey).toMatch(/^enc:v1:/);
    expect(response.email.smtpPass).toBe('');
    expect(response.ai.apiKey).toBe('');
    expect((await service.getConfig()).ai.apiKey).toBe('legacy-api-key');
  });

  it('automatically migrates legacy plaintext during application startup', async () => {
    await service.onModuleInit();
    const stored = JSON.parse(record.configData);

    expect(stored.email.smtpPass).toMatch(/^enc:v1:/);
    expect(stored.ai.apiKey).toMatch(/^enc:v1:/);
    expect(record.configData).not.toContain('legacy-smtp-password');
    expect(record.configData).not.toContain('legacy-api-key');
  });

  it('does not replace configured secrets when the public form submits blank values', async () => {
    await service.updateConfig({
      email: { smtpPass: '' },
      ai: { apiKey: '' },
    });
    const internal = await service.getConfig();
    expect(internal.email.smtpPass).toBe('legacy-smtp-password');
    expect(internal.ai.apiKey).toBe('legacy-api-key');
  });
});
