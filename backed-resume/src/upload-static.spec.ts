import * as express from 'express';
import { mkdir, mkdtemp, rm, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { tmpdir } from 'os';
import request = require('supertest');
import { createUploadStaticHandlers } from './upload-static';

describe('/uploads static delivery', () => {
  const originalUploadPath = process.env.UPLOAD_PATH;
  let uploadRoot: string;

  beforeEach(async () => {
    uploadRoot = await mkdtemp(join(tmpdir(), 'resume-upload-static-'));
    process.env.UPLOAD_PATH = uploadRoot;
  });

  afterEach(async () => {
    if (originalUploadPath === undefined) {
      delete process.env.UPLOAD_PATH;
    } else {
      process.env.UPLOAD_PATH = originalUploadPath;
    }
    await rm(uploadRoot, { recursive: true, force: true });
  });

  it('serves a stored resume photo from the configured upload root', async () => {
    const photoPath = join(
      uploadRoot,
      'resume-photos',
      'user-7',
      'photo-123.png',
    );
    await mkdir(dirname(photoPath), { recursive: true });
    await writeFile(photoPath, Buffer.from('photo bytes'));

    const app = express();
    app.use('/uploads', ...createUploadStaticHandlers());

    const response = await request(app).get(
      '/uploads/resume-photos/user-7/photo-123.png',
    );

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('image/png');
    expect(response.headers['cache-control']).toBe(
      'public, max-age=31536000, immutable',
    );
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('never exposes private knowledge originals from the same volume', async () => {
    const knowledgePath = join(uploadRoot, 'knowledge', 'private', 'jd.txt');
    await mkdir(dirname(knowledgePath), { recursive: true });
    await writeFile(knowledgePath, 'private job description');

    const app = express();
    app.use('/uploads', ...createUploadStaticHandlers());

    const response = await request(app).get(
      '/uploads/knowledge/private/jd.txt',
    );

    expect(response.status).toBe(404);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.text).not.toContain('private job description');
  });
});
