import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTED_VALUE_PREFIX = 'enc:v1:';
const AES_KEY_BYTES = 32;
const GCM_IV_BYTES = 12;
const GCM_TAG_BYTES = 16;

export interface DecryptedConfigSecret {
  value: string;
  wasLegacyPlaintext: boolean;
}

export function encryptConfigSecret(value: string, fieldName: string): string {
  const plaintext = String(value || '');
  if (!plaintext) return '';

  const key = readMasterKey();
  const iv = randomBytes(GCM_IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(buildAdditionalAuthenticatedData(fieldName), 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const payload = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
  return `${ENCRYPTED_VALUE_PREFIX}${payload.toString('base64url')}`;
}

export function decryptConfigSecret(value: unknown, fieldName: string): DecryptedConfigSecret {
  const storedValue = String(value || '');
  if (!storedValue) return { value: '', wasLegacyPlaintext: false };
  if (!storedValue.startsWith(ENCRYPTED_VALUE_PREFIX)) {
    return { value: storedValue, wasLegacyPlaintext: true };
  }

  const key = readMasterKey();
  let payload: Buffer;
  try {
    payload = Buffer.from(storedValue.slice(ENCRYPTED_VALUE_PREFIX.length), 'base64url');
  } catch {
    throw new Error(`Encrypted system configuration field ${fieldName} is malformed`);
  }
  if (payload.length <= GCM_IV_BYTES + GCM_TAG_BYTES) {
    throw new Error(`Encrypted system configuration field ${fieldName} is malformed`);
  }

  const iv = payload.subarray(0, GCM_IV_BYTES);
  const tag = payload.subarray(GCM_IV_BYTES, GCM_IV_BYTES + GCM_TAG_BYTES);
  const ciphertext = payload.subarray(GCM_IV_BYTES + GCM_TAG_BYTES);

  try {
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(Buffer.from(buildAdditionalAuthenticatedData(fieldName), 'utf8'));
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return { value: plaintext.toString('utf8'), wasLegacyPlaintext: false };
  } catch {
    throw new Error(
      `Unable to decrypt system configuration field ${fieldName}; verify SYSTEM_CONFIG_MASTER_KEY`,
    );
  }
}

export function isEncryptedConfigSecret(value: unknown): boolean {
  return String(value || '').startsWith(ENCRYPTED_VALUE_PREFIX);
}

function readMasterKey(): Buffer {
  const configured = String(process.env.SYSTEM_CONFIG_MASTER_KEY || '').trim();
  if (!configured) {
    throw new Error(
      'SYSTEM_CONFIG_MASTER_KEY is required to persist or read sensitive system configuration',
    );
  }

  const normalized = configured.replace(/^base64:/i, '');
  let key: Buffer;
  if (/^(?:hex:)?[a-f0-9]{64}$/i.test(configured)) {
    key = Buffer.from(configured.replace(/^hex:/i, ''), 'hex');
  } else {
    try {
      key = Buffer.from(normalized, 'base64');
    } catch {
      key = Buffer.alloc(0);
    }
  }

  if (key.length !== AES_KEY_BYTES) {
    throw new Error(
      'SYSTEM_CONFIG_MASTER_KEY must be exactly 32 bytes encoded as base64 or 64 hexadecimal characters',
    );
  }
  return key;
}

function buildAdditionalAuthenticatedData(fieldName: string): string {
  return `resume-system:system-config:v1:${fieldName}`;
}
