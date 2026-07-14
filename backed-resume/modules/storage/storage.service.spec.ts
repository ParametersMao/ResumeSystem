import { mkdtemp, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { resolveLocalUploadRoot } from './local-storage-path';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: class S3Client {
    send = jest.fn();
  },
  PutObjectCommand: class PutObjectCommand {},
  GetObjectCommand: class GetObjectCommand {},
  DeleteObjectCommand: class DeleteObjectCommand {},
}));
jest.mock('ali-oss', () => class OSS {});

import { StorageService } from './storage.service';

describe('StorageService resume photos', () => {
  const originalEnv = { ...process.env };
  let uploadRoot: string;

  beforeEach(async () => {
    process.env = { ...originalEnv };
    uploadRoot = await mkdtemp(join(tmpdir(), 'resume-photo-storage-'));
    process.env.UPLOAD_PATH = uploadRoot;
    process.env.PUBLIC_FILE_BASE_URL = 'https://aidana.top';
    delete process.env.R2_ENDPOINT;
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    delete process.env.R2_BUCKET;
    delete process.env.R2_PUBLIC_BASE_URL;
    delete process.env.OSS_REGION;
    delete process.env.OSS_ACCESS_KEY_ID;
    delete process.env.OSS_ACCESS_KEY_SECRET;
    delete process.env.OSS_BUCKET;
  });

  afterEach(async () => {
    process.env = { ...originalEnv };
    await rm(uploadRoot, { recursive: true, force: true });
  });

  it('stores a local-fallback photo in the configured upload root', async () => {
    const service = new StorageService();
    const body = Buffer.from('photo bytes');

    const result = await service.uploadObject({
      key: 'resume-photos/user-7/photo-123.png',
      body,
      contentType: 'image/png',
    });

    expect(result).toEqual({
      key: 'resume-photos/user-7/photo-123.png',
      url: 'https://aidana.top/uploads/resume-photos/user-7/photo-123.png',
      provider: 'local',
    });
    await expect(
      readFile(join(uploadRoot, 'resume-photos', 'user-7', 'photo-123.png')),
    ).resolves.toEqual(body);
    await expect(
      service.downloadObject('resume-photos/user-7/photo-123.png'),
    ).resolves.toEqual(body);
  });

  it('uses an absolute UPLOAD_PATH unchanged', () => {
    expect(resolveLocalUploadRoot()).toBe(uploadRoot);
  });

  it('preserves the configured R2 provider for resume photos', async () => {
    process.env.R2_ENDPOINT = 'https://storage.example.test';
    process.env.R2_REGION = 'auto';
    process.env.R2_ACCESS_KEY_ID = 'test-access-key';
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.R2_BUCKET = 'test-bucket';
    process.env.R2_PUBLIC_BASE_URL = 'https://assets.example.test';

    const service = new StorageService();
    await expect(
      service.uploadObject({
        key: 'resume-photos/user-7/photo-remote.png',
        body: Buffer.from('remote photo bytes'),
        contentType: 'image/png',
      }),
    ).resolves.toEqual({
      key: 'resume-photos/user-7/photo-remote.png',
      url: 'https://assets.example.test/resume-photos/user-7/photo-remote.png',
      provider: 'r2',
    });
  });
});
