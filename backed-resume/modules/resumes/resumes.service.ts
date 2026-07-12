import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import * as puppeteer from 'puppeteer';
import { Resume } from '../../entities/resume.entity';
import { ResumeVersion } from '../../entities/resume-version.entity';
import { Template } from '../../entities/template.entity';
import { CreateResumeDto, UpdateResumeDto, ResumeResponseDto, ResumeListResponseDto } from '../../dto/resume.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
import { StorageService } from '../storage/storage.service';
import { EntitlementsService } from '../entitlements/entitlements.service';

interface ResumeVersionSchema {
  hasUserId: boolean;
  hasSourceVersion: boolean;
  hasSourceType: boolean;
  hasRemark: boolean;
  hasLegacyVersion: boolean;
  hasHtmlContent: boolean;
}

type ResumeVersionSourceType = 'save' | 'manual' | 'rollback';

const MAX_RESUME_CONTENT_BYTES = 1024 * 1024;
const MAX_RESUME_PREVIEW_BYTES = 2 * 1024 * 1024;
const MAX_EXPORT_HTML_BYTES = 2 * 1024 * 1024;
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ numpages: number }>;

export interface ResumePdfExportResult {
  url: string;
  pageCount: number;
}

@Injectable()
export class ResumesService {
  private resumeVersionSchemaPromise: Promise<ResumeVersionSchema> | null = null;

  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(ResumeVersion)
    private resumeVersionRepository: Repository<ResumeVersion>,
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    private readonly storageService: StorageService,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  async create(createResumeDto: CreateResumeDto, userId: number): Promise<ResumeResponseDto> {
    validateResumeContent(createResumeDto.content);
    validatePreviewImage(createResumeDto.previewImage);

    await this.entitlementsService.assertCanCreateResume(userId);
    await this.entitlementsService.assertDatabaseStorageAvailable(
      userId,
      Buffer.byteLength(createResumeDto.content || '', 'utf8') +
        Buffer.byteLength(createResumeDto.previewImage || '', 'utf8'),
    );
    const normalizedTemplateId = await this.resolveTemplateId(createResumeDto.templateId);
    const savedResume = await this.resumeRepository.manager.transaction(
      async (manager) => {
        const rows: Array<{ resumeLimit: number }> = await manager.query(
          `SELECT resume_limit AS resumeLimit
           FROM c_user_entitlements
           WHERE user_id = ?
           FOR UPDATE`,
          [userId],
        );
        const resumeLimit = Number(rows[0]?.resumeLimit || 2);
        const used = await manager.getRepository(Resume).count({
          where: { userId, status: 1 },
        });
        if (used >= resumeLimit) {
          throw new ForbiddenException(
            `免费版最多保存 ${resumeLimit} 份简历`,
          );
        }
        const resume = manager.getRepository(Resume).create({
          ...createResumeDto,
          templateId: normalizedTemplateId,
          userId,
        });
        return manager.getRepository(Resume).save(resume);
      },
    );
    return this.mapToResponseDto(savedResume);
  }

  async findAllByUser(userId: number, page = 1, limit = 10): Promise<PaginationResponse<ResumeListResponseDto>> {
    const safePage = Math.max(1, Math.floor(Number(page) || 1));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    const skip = (safePage - 1) * safeLimit;

    const [resumes, total] = await this.resumeRepository.findAndCount({
      where: { userId, status: 1 },
      relations: ['template', 'user'],
      order: { updateTime: 'DESC' },
      skip,
      take: safeLimit,
    });

    const responseData = resumes.map((resume) => this.mapToListResponseDto(resume));

    return {
      list: responseData,
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async findOne(id: number, userId: number): Promise<ResumeResponseDto> {
    const resume = await this.resumeRepository.findOne({
      where: { id, userId, status: 1 },
      relations: ['template', 'user'],
    });

    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    return this.mapToResponseDto(resume);
  }

  async update(id: number, updateResumeDto: UpdateResumeDto, userId: number): Promise<ResumeResponseDto> {
    if (updateResumeDto.content !== undefined) {
      validateResumeContent(updateResumeDto.content);
    }
    if (updateResumeDto.previewImage !== undefined) {
      validatePreviewImage(updateResumeDto.previewImage);
    }

    const resume = await this.resumeRepository.findOne({
      where: { id, userId, status: 1 },
    });
    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    if (updateResumeDto.version !== undefined && resume.version !== updateResumeDto.version) {
      throw new ConflictException('简历版本冲突，请刷新后重试');
    }

    const oldBytes =
      Buffer.byteLength(resume.content || '', 'utf8') +
      Buffer.byteLength(resume.previewImage || '', 'utf8');
    const newBytes =
      Buffer.byteLength(updateResumeDto.content ?? resume.content ?? '', 'utf8') +
      Buffer.byteLength(
        updateResumeDto.previewImage ?? resume.previewImage ?? '',
        'utf8',
      );
    await this.entitlementsService.assertDatabaseStorageAvailable(
      userId,
      newBytes - oldBytes,
    );

    await this.saveVersionSnapshot(resume, 'save');

    const { templateId, ...resumeChanges } = updateResumeDto;
    Object.assign(resume, resumeChanges);
    if (templateId !== undefined) {
      resume.templateId = await this.resolveTemplateId(templateId);
    }
    resume.version += 1;

    const updatedResume = await this.resumeRepository.save(resume);
    return this.mapToResponseDto(updatedResume);
  }

  private async resolveTemplateId(templateId?: number | null): Promise<number | null> {
    if (!templateId) return null;
    const exists = await this.templateRepository.exists({
      where: { id: templateId, status: true },
    });
    return exists ? templateId : null;
  }

  async listVersions(resumeId: number, userId: number): Promise<ResumeVersion[]> {
    await this.assertOwnership(resumeId, userId);
    const schema = await this.getResumeVersionSchema();
    const conditions = ['resume_id = ?'];
    const params: Array<number> = [resumeId];

    if (schema.hasUserId) {
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

  async createVersionSnapshot(resumeId: number, userId: number, remark?: string): Promise<ResumeVersion> {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, userId, status: 1 },
    });
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

  async rollback(resumeId: number, versionId: number, userId: number): Promise<ResumeResponseDto> {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, userId, status: 1 },
    });
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

  async remove(id: number, userId: number): Promise<void> {
    const resume = await this.resumeRepository.findOne({
      where: { id, userId, status: 1 },
    });
    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    resume.status = 0;
    await this.resumeRepository.save(resume);
  }

  async exportPdf(html: string, userId: number): Promise<ResumePdfExportResult> {
    if (!html?.trim()) {
      throw new ServiceUnavailableException('PDF 导出失败：未提供有效 HTML 内容');
    }
    if (Buffer.byteLength(html, 'utf8') > MAX_EXPORT_HTML_BYTES) {
      throw new BadRequestException('PDF 导出失败：HTML 内容过大，请减少图片或复杂样式后重试');
    }

    const executablePath = resolveBrowserExecutablePath();
    if (!executablePath) {
      throw new ServiceUnavailableException(
        'PDF 导出失败：未找到 Chrome/Edge 浏览器，请配置 PUPPETEER_EXECUTABLE_PATH 或使用打印方式导出',
      );
    }

    await this.entitlementsService.consumePdf(userId);
    let browser: puppeteer.Browser | null = null;
    let reservedStorageBytes = 0;
    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-default-apps',
          '--disable-sync',
          '--disable-translate',
          '--disable-features=UseDBus,AudioServiceOutOfProcess',
          '--no-first-run',
          '--no-zygote',
          '--headless=new',
        ],
      });

      const page = await browser.newPage();
      page.setDefaultTimeout(30_000);
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (isAllowedPdfResourceUrl(request.url(), request.resourceType())) {
          void request.continue().catch(() => {});
          return;
        }
        void request.abort('blockedbyclient').catch(() => {});
      });

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
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      })) as unknown as Buffer;

      const parsedPdf = await pdfParse(Buffer.from(pdfBuffer));
      const pageCount = Number(parsedPdf.numpages);
      if (!Number.isInteger(pageCount) || pageCount < 1) {
        throw new ServiceUnavailableException('PDF 导出失败：生成文件未包含有效页面');
      }

      reservedStorageBytes = pdfBuffer.length;
      await this.entitlementsService.consumeStorage(
        userId,
        reservedStorageBytes,
      );
      const fileName = `exports/user-${userId}/resume-${randomUUID()}.pdf`;
      const result = await this.storageService.uploadObject({
        key: fileName,
        body: Buffer.from(pdfBuffer),
        contentType: 'application/pdf',
        cacheControl: 'private, max-age=0, must-revalidate',
      });
      return { url: result.url, pageCount };
    } catch (err: unknown) {
      await this.entitlementsService.refundPdf(userId);
      if (reservedStorageBytes) {
        await this.entitlementsService.refundStorage(
          userId,
          reservedStorageBytes,
        );
      }
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

  async uploadResumePhoto(file: Express.Multer.File, userId: number): Promise<{ url: string; key: string }> {
    const ext = resolveImageExtension(file);
    const userSegment = `user-${userId}`;
    await this.entitlementsService.consumeStorage(userId, file.size);
    try {
      const result = await this.storageService.uploadObject({
        key: `resume-photos/${userSegment}/photo-${Date.now()}-${randomUUID()}${ext}`,
        body: file.buffer,
        contentType: file.mimetype,
        cacheControl: 'public, max-age=31536000, immutable',
      });

      return { url: result.url, key: result.key };
    } catch (error) {
      await this.entitlementsService.refundStorage(userId, file.size);
      throw error;
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
    await this.entitlementsService.trimVersions(resume.userId, resume.id);
  }

  private async findVersionSnapshot(resumeId: number, versionId: number, userId: number): Promise<ResumeVersion | null> {
    const schema = await this.getResumeVersionSchema();
    const conditions = ['id = ?', 'resume_id = ?'];
    const params: Array<number> = [versionId, resumeId];

    if (schema.hasUserId) {
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

  private async assertOwnership(resumeId: number, userId: number): Promise<void> {
    const exists = await this.resumeRepository.exist({
      where: { id: resumeId, userId, status: 1 },
    });
    if (!exists) {
      throw new NotFoundException('简历不存在');
    }
  }
}

function validateResumeContent(content: string): void {
  if (!content?.trim()) {
    throw new BadRequestException('简历内容不能为空');
  }

  if (Buffer.byteLength(content, 'utf8') > MAX_RESUME_CONTENT_BYTES) {
    throw new BadRequestException('简历内容过大，请减少图片或文本内容后重试');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new BadRequestException('简历内容必须是合法 JSON');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new BadRequestException('简历内容必须是 JSON 对象');
  }
}

function validatePreviewImage(previewImage?: string): void {
  if (!previewImage) return;
  if (Buffer.byteLength(previewImage, 'utf8') > MAX_RESUME_PREVIEW_BYTES) {
    throw new BadRequestException('简历预览图过大，请重新生成或减少图片体积');
  }
}

function isAllowedPdfResourceUrl(rawUrl: string, resourceType: string): boolean {
  if (resourceType === 'document') return true;
  if (!rawUrl) return true;
  if (/^(about:blank|data:|blob:)/i.test(rawUrl)) return true;

  try {
    const url = new URL(rawUrl);
    if (!['127.0.0.1', 'localhost', '::1'].includes(url.hostname)) {
      return false;
    }

    return (
      url.pathname.startsWith('/uploads/') ||
      url.pathname.startsWith('/mock/') ||
      url.pathname.startsWith('/assets/') ||
      url.pathname === '/favicon.ico'
    );
  } catch {
    return false;
  }
}

export function injectPdfSafeMargins(html: string): string {
  if (html.includes('resume-pdf-safe-margins')) {
    return html;
  }

  const port = process.env.PORT || 3000;
  const baseHref = `http://127.0.0.1:${port}/`;
  const baseTag = `<base href="${baseHref}">`;
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

      .resume-sheet {
        max-width: 100% !important;
      }

      .resume-section,
      .timeline-section,
      .spotlight-section,
      .student-section,
      .formal-table-section,
      .asymmetric-section,
      .asymmetric-story-section {
        break-inside: auto !important;
        page-break-inside: auto !important;
      }

      .section-item,
      .timeline-card,
      .spotlight-card,
      .student-item,
      .formal-table-items > article,
      .asymmetric-story-section > article,
      .asymmetric-compact-items > article {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .section-heading,
      .item-heading,
      .timeline-marker,
      .timeline-card-top,
      .spotlight-card-head,
      .student-section-heading,
      .formal-table-section > header,
      .asymmetric-story-section > header {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }

      h1,
      h2,
      h3,
      p,
      li {
        orphans: 2;
        widows: 2;
      }
    </style>
  `;

  if (/<\/head>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`).replace(/<\/head>/i, `${safeMarginStyle}</head>`);
  }

  return `${baseTag}${safeMarginStyle}${html}`;
}

function resolveImageExtension(file: Express.Multer.File): string {
  if (!isSupportedImageBuffer(file.buffer, file.mimetype)) {
    throw new BadRequestException('上传失败：图片文件内容与类型不匹配');
  }

  const mimeExtMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  return mimeExtMap[file.mimetype] || '.png';
}

function isSupportedImageBuffer(buffer: Buffer, mimetype: string): boolean {
  if (!buffer?.length) return false;

  if (mimetype === 'image/png') {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff && buffer.includes(Buffer.from([0xff, 0xd9]), 3);
  }

  if (mimetype === 'image/webp') {
    return buffer.length > 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }

  return false;
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
