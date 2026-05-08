import { Injectable, NotFoundException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import * as OSS from 'ali-oss';
import * as puppeteer from 'puppeteer';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Resume } from '../../entities/resume.entity';
import { ResumeVersion } from '../../entities/resume-version.entity';
import { CreateResumeDto, UpdateResumeDto, ResumeResponseDto, ResumeListResponseDto } from '../../dto/resume.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';

interface ResumeVersionSchema {
  hasUserId: boolean;
  hasSourceVersion: boolean;
  hasSourceType: boolean;
  hasRemark: boolean;
  hasLegacyVersion: boolean;
  hasHtmlContent: boolean;
}

type ResumeVersionSourceType = 'save' | 'manual' | 'rollback';

interface PdfStorageUploader {
  uploadPdf(fileName: string, pdfBuffer: Buffer): Promise<string>;
}

class LegacyOssUploader implements PdfStorageUploader {
  constructor(private readonly client: OSS) {}

  async uploadPdf(fileName: string, pdfBuffer: Buffer): Promise<string> {
    const result = await this.client.put(fileName, pdfBuffer);
    return result.url;
  }
}

class R2Uploader implements PdfStorageUploader {
  private readonly client: S3Client;

  constructor(
    private readonly bucket: string,
    private readonly publicBaseUrl: string,
    endpoint: string,
    accessKeyId: string,
    secretAccessKey: string,
    region = 'auto',
  ) {
    this.client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadPdf(fileName: string, pdfBuffer: Buffer): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      }),
    );

    return `${this.publicBaseUrl}/${fileName}`;
  }
}

@Injectable()
export class ResumesService {
  private pdfStorageUploader: PdfStorageUploader | null = null;
  private resumeVersionSchemaPromise: Promise<ResumeVersionSchema> | null = null;

  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(ResumeVersion)
    private resumeVersionRepository: Repository<ResumeVersion>,
  ) {
    this.pdfStorageUploader = createPdfStorageUploader();
  }

  async create(createResumeDto: CreateResumeDto): Promise<ResumeResponseDto> {
    const resume = this.resumeRepository.create(createResumeDto);
    const savedResume = await this.resumeRepository.save(resume);
    return this.mapToResponseDto(savedResume);
  }

  async findAllByUser(userId: number, page = 1, limit = 10): Promise<PaginationResponse<ResumeListResponseDto>> {
    const skip = (page - 1) * limit;

    const [resumes, total] = await this.resumeRepository.findAndCount({
      where: { userId, status: 1 },
      relations: ['template', 'user'],
      order: { updateTime: 'DESC' },
      skip,
      take: limit,
    });

    const responseData = resumes.map((resume) => this.mapToListResponseDto(resume));

    return {
      list: responseData,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number, userId?: number): Promise<ResumeResponseDto> {
    const where: Record<string, number> = { id, status: 1 };
    if (userId) where.userId = userId;

    const resume = await this.resumeRepository.findOne({
      where,
      relations: ['template', 'user'],
    });

    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    return this.mapToResponseDto(resume);
  }

  async update(id: number, updateResumeDto: UpdateResumeDto, userId?: number): Promise<ResumeResponseDto> {
    const where: Record<string, number> = { id, status: 1 };
    if (userId) where.userId = userId;

    const resume = await this.resumeRepository.findOne({ where });
    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    if (updateResumeDto.version !== undefined && resume.version !== updateResumeDto.version) {
      throw new ConflictException('简历版本冲突，请刷新后重试');
    }

    await this.saveVersionSnapshot(resume, 'save');

    Object.assign(resume, updateResumeDto);
    resume.version += 1;

    const updatedResume = await this.resumeRepository.save(resume);
    return this.mapToResponseDto(updatedResume);
  }

  async listVersions(resumeId: number, userId?: number): Promise<ResumeVersion[]> {
    const schema = await this.getResumeVersionSchema();
    const conditions = ['resume_id = ?'];
    const params: Array<number> = [resumeId];

    if (userId && schema.hasUserId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }

    const versionColumn = schema.hasSourceVersion ? 'source_version' : 'version';
    const rows = await this.resumeVersionRepository.query(
      `
        SELECT
          id,
          resume_id AS resumeId,
          ${schema.hasUserId ? 'user_id' : 'NULL'} AS userId,
          ${versionColumn} AS sourceVersion,
          ${schema.hasSourceType ? 'source_type' : "'save'"} AS sourceType,
          ${schema.hasRemark ? 'remark' : 'NULL'} AS remark,
          content,
          create_time AS createTime
        FROM resume_versions
        WHERE ${conditions.join(' AND ')}
        ORDER BY create_time DESC
        LIMIT 50
      `,
      params,
    );

    return rows as ResumeVersion[];
  }

  async createVersionSnapshot(resumeId: number, userId?: number, remark?: string): Promise<ResumeVersion> {
    const whereResume: Record<string, number> = { id: resumeId, status: 1 };
    if (userId) whereResume.userId = userId;

    const resume = await this.resumeRepository.findOne({ where: whereResume });
    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    await this.saveVersionSnapshot(resume, 'manual', remark);

    const versions = await this.listVersions(resumeId, userId);
    const latest = versions[0];
    if (!latest) {
      throw new NotFoundException('未找到历史版本快照');
    }

    return latest;
  }

  async rollback(resumeId: number, versionId: number, userId?: number): Promise<ResumeResponseDto> {
    const whereResume: Record<string, number> = { id: resumeId, status: 1 };
    if (userId) whereResume.userId = userId;

    const resume = await this.resumeRepository.findOne({ where: whereResume });
    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    const version = await this.findVersionSnapshot(resumeId, versionId, userId);
    if (!version) {
      throw new NotFoundException('历史版本不存在');
    }

    await this.saveVersionSnapshot(resume, 'rollback');

    resume.content = version.content;
    resume.version += 1;
    const saved = await this.resumeRepository.save(resume);
    return this.mapToResponseDto(saved);
  }

  async remove(id: number, userId?: number): Promise<void> {
    const where: Record<string, number> = { id, status: 1 };
    if (userId) where.userId = userId;

    const resume = await this.resumeRepository.findOne({ where });
    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    resume.status = 0;
    await this.resumeRepository.save(resume);
  }

  async exportPdf(html: string): Promise<string> {
    if (!html?.trim()) {
      throw new ServiceUnavailableException('PDF 导出失败：未提供有效 HTML 内容');
    }

    const executablePath = resolveBrowserExecutablePath();
    if (!executablePath) {
      throw new ServiceUnavailableException(
        'PDF 导出失败：未找到 Chrome/Edge 浏览器，请配置 PUPPETEER_EXECUTABLE_PATH 或使用打印方式导出',
      );
    }

    let browser: puppeteer.Browser | null = null;
    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      page.setDefaultTimeout(30_000);

      await page.setContent(injectPdfSafeMargins(html), { waitUntil: 'load', timeout: 30_000 });
      await page.emulateMediaType('print');

      await page.evaluate(async () => {
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        const waitFonts = async () => {
          const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
          if (fonts?.ready) {
            try {
              await fonts.ready;
            } catch {
              // ignore font loading errors
            }
          }
        };

        const waitImages = async () => {
          const images = Array.from(document.images || []);
          await Promise.all(
            images.map((img) => {
              if (img.complete) return Promise.resolve();
              return new Promise<void>((resolve) => {
                const done = () => resolve();
                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
              });
            }),
          );
        };

        await Promise.race([Promise.all([waitFonts(), waitImages()]), sleep(15_000)]);
      });

      const pdfBuffer = (await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
      })) as unknown as Buffer;

      if (this.pdfStorageUploader) {
        const fileName = `resume-${randomUUID()}.pdf`;
        return await this.pdfStorageUploader.uploadPdf(fileName, pdfBuffer);
      }

      return `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('timeout') || msg.includes('Timeout')) {
        throw new ServiceUnavailableException('PDF 导出超时，请稍后重试或使用打印方式导出');
      }
      if (err instanceof ServiceUnavailableException) {
        throw err;
      }
      throw new ServiceUnavailableException(
        `PDF 导出失败：${msg.slice(0, 100)}。请尝试使用打印方式导出。`,
      );
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  }

  private mapToResponseDto(resume: Resume): ResumeResponseDto {
    return {
      id: resume.id,
      title: resume.title,
      content: resume.content,
      templateId: resume.templateId,
      templateName: resume.template?.templateName,
      userId: resume.userId,
      userName: resume.user?.username,
      previewImage: resume.previewImage,
      status: resume.status,
      version: resume.version,
      createTime: resume.createTime,
      updateTime: resume.updateTime,
    };
  }

  private mapToListResponseDto(resume: Resume): ResumeListResponseDto {
    return {
      id: resume.id,
      title: resume.title,
      templateId: resume.templateId,
      templateName: resume.template?.templateName,
      userId: resume.userId,
      userName: resume.user?.username,
      previewImage: resume.previewImage,
      status: resume.status,
      version: resume.version,
      createTime: resume.createTime,
      updateTime: resume.updateTime,
    };
  }

  private async getResumeVersionSchema(): Promise<ResumeVersionSchema> {
    if (!this.resumeVersionSchemaPromise) {
      this.resumeVersionSchemaPromise = this.resumeVersionRepository
        .query('SHOW COLUMNS FROM resume_versions')
        .then(async (rows: Array<{ Field: string }>) => {
          const fields = new Set(rows.map((row) => row.Field));

          if (!fields.has('source_type')) {
            const sourceTypeAnchor = fields.has('source_version')
              ? 'source_version'
              : (fields.has('version') ? 'version' : 'resume_id');
            await this.resumeVersionRepository.query(
              `ALTER TABLE resume_versions ADD COLUMN source_type VARCHAR(24) NOT NULL DEFAULT 'save' AFTER ${sourceTypeAnchor}`,
            );
            fields.add('source_type');
          }

          if (!fields.has('remark')) {
            await this.resumeVersionRepository.query(
              'ALTER TABLE resume_versions ADD COLUMN remark VARCHAR(120) NULL AFTER source_type',
            );
            fields.add('remark');
          }

          return {
            hasUserId: fields.has('user_id'),
            hasSourceVersion: fields.has('source_version'),
            hasSourceType: fields.has('source_type'),
            hasRemark: fields.has('remark'),
            hasLegacyVersion: fields.has('version'),
            hasHtmlContent: fields.has('html_content'),
          };
        });
    }

    return this.resumeVersionSchemaPromise;
  }

  private async saveVersionSnapshot(
    resume: Resume,
    sourceType: ResumeVersionSourceType,
    remark?: string,
  ): Promise<void> {
    const schema = await this.getResumeVersionSchema();
    const columns = ['resume_id'];
    const params: Array<number | string | null> = [resume.id];

    if (schema.hasUserId) {
      columns.push('user_id');
      params.push(resume.userId);
    }

    if (schema.hasSourceVersion) {
      columns.push('source_version');
      params.push(resume.version);
    } else if (schema.hasLegacyVersion) {
      columns.push('version');
      params.push(resume.version);
    }

    columns.push('content');
    params.push(resume.content ?? '');

    if (schema.hasSourceType) {
      columns.push('source_type');
      params.push(sourceType);
    }

    if (schema.hasRemark) {
      columns.push('remark');
      params.push(remark ? remark.slice(0, 120) : null);
    }

    if (schema.hasHtmlContent) {
      columns.push('html_content');
      params.push(null);
    }

    const placeholders = columns.map(() => '?').join(', ');
    await this.resumeVersionRepository.query(
      `INSERT INTO resume_versions (${columns.join(', ')}) VALUES (${placeholders})`,
      params,
    );
  }

  private async findVersionSnapshot(resumeId: number, versionId: number, userId?: number): Promise<ResumeVersion | null> {
    const schema = await this.getResumeVersionSchema();
    const conditions = ['id = ?', 'resume_id = ?'];
    const params: Array<number> = [versionId, resumeId];

    if (userId && schema.hasUserId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }

    const versionColumn = schema.hasSourceVersion ? 'source_version' : 'version';
    const rows = await this.resumeVersionRepository.query(
      `
        SELECT
          id,
          resume_id AS resumeId,
          ${schema.hasUserId ? 'user_id' : 'NULL'} AS userId,
          ${versionColumn} AS sourceVersion,
          ${schema.hasSourceType ? 'source_type' : "'save'"} AS sourceType,
          ${schema.hasRemark ? 'remark' : 'NULL'} AS remark,
          content,
          create_time AS createTime
        FROM resume_versions
        WHERE ${conditions.join(' AND ')}
        LIMIT 1
      `,
      params,
    );

    return (rows[0] as ResumeVersion | undefined) ?? null;
  }
}

function createPdfStorageUploader(): PdfStorageUploader | null {
  const r2Config = {
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
    region: process.env.R2_REGION || 'auto',
  };

  if (
    r2Config.endpoint &&
    r2Config.accessKeyId &&
    r2Config.secretAccessKey &&
    r2Config.bucket &&
    r2Config.publicBaseUrl
  ) {
    return new R2Uploader(
      r2Config.bucket,
      normalizePublicBaseUrl(r2Config.publicBaseUrl),
      normalizeS3Endpoint(r2Config.endpoint, r2Config.bucket),
      r2Config.accessKeyId,
      r2Config.secretAccessKey,
      r2Config.region,
    );
  }

  const ossConfig = {
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
  };

  if (ossConfig.region && ossConfig.accessKeyId && ossConfig.accessKeySecret && ossConfig.bucket) {
    return new LegacyOssUploader(
      new OSS({
        region: ossConfig.region,
        accessKeyId: ossConfig.accessKeyId,
        accessKeySecret: ossConfig.accessKeySecret,
        bucket: ossConfig.bucket,
      }),
    );
  }

  return null;
}

function normalizePublicBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function normalizeS3Endpoint(endpoint: string, bucket: string): string {
  const normalized = endpoint.replace(/\/+$/, '');
  const bucketPath = `/${bucket}`;

  if (normalized.endsWith(bucketPath)) {
    return normalized.slice(0, -bucketPath.length);
  }

  return normalized;
}

function injectPdfSafeMargins(html: string): string {
  if (html.includes('resume-pdf-safe-margins')) {
    return html;
  }

  const safeMarginStyle = `
    <style id="resume-pdf-safe-margins">
      @page {
        size: A4;
        margin: 5mm;
      }

      html,
      body {
        margin: 0 !important;
        background: #ffffff !important;
      }

      body {
        box-sizing: border-box !important;
        padding: 5mm !important;
      }

      .resume-sheet {
        max-width: 100% !important;
      }

      .resume-section,
      .timeline-section,
      .spotlight-section,
      .section-item,
      .timeline-card,
      .spotlight-card {
        break-inside: auto !important;
        page-break-inside: auto !important;
      }

      .section-heading,
      .item-heading,
      .timeline-marker,
      .timeline-card-top,
      .spotlight-card-head {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }

      p,
      li {
        orphans: 2;
        widows: 2;
      }
    </style>
  `;

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${safeMarginStyle}</head>`);
  }

  return `${safeMarginStyle}${html}`;
}

function resolveBrowserExecutablePath(): string | undefined {
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
  if (envPath && existsSync(envPath)) return envPath;

  const candidates: string[] = [];
  if (process.platform === 'win32') {
    const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';
    const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
    const localAppData = process.env.LOCALAPPDATA || '';

    candidates.push(
      `${programFiles}\\Google\\Chrome\\Application\\chrome.exe`,
      `${programFilesX86}\\Google\\Chrome\\Application\\chrome.exe`,
      localAppData ? `${localAppData}\\Google\\Chrome\\Application\\chrome.exe` : '',
      `${programFiles}\\Microsoft\\Edge\\Application\\msedge.exe`,
      `${programFilesX86}\\Microsoft\\Edge\\Application\\msedge.exe`,
      localAppData ? `${localAppData}\\Microsoft\\Edge\\Application\\msedge.exe` : '',
    );
  } else if (process.platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    );
  } else {
    candidates.push(
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/microsoft-edge',
      '/usr/bin/microsoft-edge-stable',
    );
  }

  for (const p of candidates.filter(Boolean)) {
    if (existsSync(p)) return p;
  }

  return undefined;
}
