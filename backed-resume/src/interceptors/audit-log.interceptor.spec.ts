import { isSensitiveAuditKey, maskSensitive } from './audit-log.interceptor';

describe('audit log sensitive value masking', () => {
  it.each([
    'password',
    'new_password',
    'apiKey',
    'api_key',
    'API-KEY',
    'smtpPass',
    'smtp_password',
    'accessToken',
    'refresh_token',
    'clientSecret',
    'Authorization',
    'private_key',
  ])('recognizes %s and its naming variants', (key) => {
    expect(isSensitiveAuditKey(key)).toBe(true);
  });

  it('recursively masks objects and arrays without mutating the request', () => {
    const input = {
      apiKey: 'top-secret',
      email: { smtp_pass: 'mail-secret', smtpHost: 'smtp.example.com' },
      providers: [{ access_token: 'token-value', model: 'deepseek' }],
    };
    const masked = maskSensitive(input);

    expect(masked).toEqual({
      apiKey: '[masked]',
      email: { smtp_pass: '[masked]', smtpHost: 'smtp.example.com' },
      providers: [{ access_token: '[masked]', model: 'deepseek' }],
    });
    expect(input.apiKey).toBe('top-secret');
  });
});
