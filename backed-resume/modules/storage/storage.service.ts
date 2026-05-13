import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as OSS from 'ali-oss';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

export interface UploadObjectInput {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}

export interface UploadObjectResult {
  key: string;
  url: string;
  provider: 'r2' | 'oss' | 'local';
}

@Injectable()
export class StorageService {
  private readonly r2Client: S3Client | null = null;
  private readonly ossClient: OSS | null = null;
  private readonly r2Bucket = process.env.R2_BUCKET || '';
  private readonly r2PublicBaseUrl = normalizePublicBaseUrl(process.env.R2_PUBLIC_BASE_URL || '');

  constructor() {
    if (isR2Configured()) {
      this.r2Client = new S3Client({
        region: process.env.R2_REGION || 'auto',
        endpoint: normalizeS3Endpoint(process.env.R2_ENDPOINT || '', process.env.R2_BUCKET || ''),
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
      });
    } else if (isOssConfigured()) {
      this.ossClient = new OSS({
        region: process.env.OSS_REGION || '',
        accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
        bucket: process.env.OSS_BUCKET || '',
      });
    }
  }

  async uploadObject(input: UploadObjectInput): Promise<UploadObjectResult> {
    const key = sanitizeObjectKey(input.key);

    if (this.r2Client && this.r2Bucket && this.r2PublicBaseUrl) {
      await this.r2Client.send(
        new PutObjectCommand({
          Bucket: this.r2Bucket,
          Key: key,
          Body: input.body,
          ContentType: input.contentType,
          CacheControl: input.cacheControl,
        }),
      );

      return {
        key,
        url: `${this.r2PublicBaseUrl}/${key}`,
        provider: 'r2',
      };
    }

    if (this.ossClient) {
      const result = await this.ossClient.put(key, input.body, {
        headers: {
          'Content-Type': input.contentType,
          ...(input.cacheControl ? { 'Cache-Control': input.cacheControl } : {}),
        },
      });
      return {
        key,
        url: result.url,
        provider: 'oss',
      };
    }

    const uploadRoot = process.env.UPLOAD_PATH || './uploads';
    const targetPath = join(process.cwd(), uploadRoot, key);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, input.body);

    const publicBaseUrl = normalizePublicBaseUrl(process.env.PUBLIC_FILE_BASE_URL || '');
    const localUrl = `/uploads/${key}`;
    return {
      key,
      url: publicBaseUrl ? `${publicBaseUrl}${localUrl}` : localUrl,
      provider: 'local',
    };
  }
}

function isR2Configured() {
  return Boolean(
    process.env.R2_ENDPOINT &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_BASE_URL,
  );
}

function isOssConfigured() {
  return Boolean(
    process.env.OSS_REGION &&
      process.env.OSS_ACCESS_KEY_ID &&
      process.env.OSS_ACCESS_KEY_SECRET &&
      process.env.OSS_BUCKET,
  );
}

function normalizePublicBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function normalizeS3Endpoint(endpoint: string, bucket: string): string {
  const normalized = endpoint.replace(/\/+$/, '');
  const bucketPath = `/${bucket}`;
  return normalized.endsWith(bucketPath) ? normalized.slice(0, -bucketPath.length) : normalized;
}

function sanitizeObjectKey(key: string): string {
  return key
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map((part) => part.replace(/[^a-zA-Z0-9._-]/g, '-'))
    .join('/');
}
