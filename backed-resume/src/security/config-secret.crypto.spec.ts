import {
  decryptConfigSecret,
  encryptConfigSecret,
  isEncryptedConfigSecret,
} from './config-secret.crypto';

describe('config secret authenticated encryption', () => {
  const masterKey = Buffer.alloc(32, 7).toString('base64');

  beforeEach(() => {
    process.env.SYSTEM_CONFIG_MASTER_KEY = masterKey;
  });

  afterEach(() => {
    delete process.env.SYSTEM_CONFIG_MASTER_KEY;
  });

  it('round-trips a secret without storing plaintext', () => {
    const encrypted = encryptConfigSecret('sk-sensitive-value', 'ai.apiKey');
    expect(isEncryptedConfigSecret(encrypted)).toBe(true);
    expect(encrypted).not.toContain('sk-sensitive-value');
    expect(decryptConfigSecret(encrypted, 'ai.apiKey')).toEqual({
      value: 'sk-sensitive-value',
      wasLegacyPlaintext: false,
    });
  });

  it('authenticates both ciphertext and field binding', () => {
    const encrypted = encryptConfigSecret('smtp-password', 'email.smtpPass');
    expect(() => decryptConfigSecret(encrypted, 'ai.apiKey')).toThrow(/Unable to decrypt/);

    const [prefix, version, encodedPayload] = encrypted.split(':');
    const payload = Buffer.from(encodedPayload, 'base64url');
    payload[Math.floor(payload.length / 2)] ^= 0x01;
    const tampered = `${prefix}:${version}:${payload.toString('base64url')}`;
    expect(() => decryptConfigSecret(tampered, 'email.smtpPass')).toThrow(/Unable to decrypt/);
  });

  it('accepts legacy plaintext but requires a valid master key for encryption', () => {
    expect(decryptConfigSecret('legacy-secret', 'ai.apiKey')).toEqual({
      value: 'legacy-secret',
      wasLegacyPlaintext: true,
    });
    delete process.env.SYSTEM_CONFIG_MASTER_KEY;
    expect(() => encryptConfigSecret('secret', 'ai.apiKey')).toThrow(/SYSTEM_CONFIG_MASTER_KEY/);
  });
});
