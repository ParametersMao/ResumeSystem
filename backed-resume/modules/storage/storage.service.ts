import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as OSS from 'ali-oss';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { resolveLocalObjectPath } from './local-storage-path';

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

    // Knowledge originals, especially private JDs, must never inherit a public
    // asset bucket policy. They remain on the protected backend volume and are
    // available only through authenticated knowledge APIs.
    if (isKnowledgeObject(key)) {
      return this.uploadLocalObject(key, input);
    }

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

    return this.uploadLocalObject(key, input);
  }

  async deleteObject(key: string): Promise<void> {
    const safeKey = sanitizeObjectKey(key);
    if (isKnowledgeObject(safeKey)) {
      await this.deleteLocalObject(safeKey);
      return;
    }
    if (this.r2Client && this.r2Bucket) {
      await this.r2Client.send(new DeleteObjectCommand({ Bucket: this.r2Bucket, Key: safeKey }));
      return;
    }
    if (this.ossClient) {
      await this.ossClient.delete(safeKey);
      return;
    }
    await this.deleteLocalObject(safeKey);
  }

  async downloadObject(key: string): Promise<Buffer> {
    const safeKey = sanitizeObjectKey(key);
    if (isKnowledgeObject(safeKey)) {
      return this.downloadLocalObject(safeKey);
    }
    if (this.r2Client && this.r2Bucket) {
      const result = await this.r2Client.send(
        new GetObjectCommand({ Bucket: this.r2Bucket, Key: safeKey }),
      );
      if (!result.Body) throw new Error('对象存储未返回文件内容');
      return Buffer.from(await result.Body.transformToByteArray());
    }
    if (this.ossClient) {
      const result = await this.ossClient.get(safeKey);
      return Buffer.isBuffer(result.content) ? result.content : Buffer.from(result.content);
    }
    return this.downloadLocalObject(safeKey);
  }

  private async uploadLocalObject(key: string, input: UploadObjectInput): Promise<UploadObjectResult> {
    const targetPath = resolveLocalObjectPath(key);
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

  private async deleteLocalObject(key: string): Promise<void> {
    await rm(resolveLocalObjectPath(key), { force: true });
  }

  private async downloadLocalObject(key: string): Promise<Buffer> {
    return readFile(resolveLocalObjectPath(key));
  }
}

function isKnowledgeObject(key: string): boolean {
  return key === 'knowledge' || key.startsWith('knowledge/');
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
  const safeKey = key
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map((part) => part.replace(/[^a-zA-Z0-9._-]/g, '-'))
    .join('/');

  if (!safeKey) {
    throw new Error('Invalid object key');
  }

  return safeKey;
}
