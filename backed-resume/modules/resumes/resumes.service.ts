import { Injectable, NotFoundException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from '../../entities/resume.entity';
import { ResumeVersion } from '../../entities/resume-version.entity';
import { CreateResumeDto, UpdateResumeDto, ResumeResponseDto, ResumeListResponseDto } from '../../dto/resume.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
import * as puppeteer from 'puppeteer';
import * as OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

@Injectable()
export class ResumesService {
  private ossClient: OSS | null = null;

  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(ResumeVersion)
    private resumeVersionRepository: Repository<ResumeVersion>,
  ) {
    // 只有在配置完整时才初始化OSS客户端
    const ossConfig = {
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
    };

    // 检查所有必需的配置是否存在
    if (ossConfig.region && ossConfig.accessKeyId && ossConfig.accessKeySecret && ossConfig.bucket) {
      this.ossClient = new OSS({
        region: ossConfig.region,
        accessKeyId: ossConfig.accessKeyId,
        accessKeySecret: ossConfig.accessKeySecret,
        bucket: ossConfig.bucket,
      });
    }
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

    const responseData = resumes.map(resume => this.mapToListResponseDto(resume));

    return {
      list: responseData,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number, userId?: number): Promise<ResumeResponseDto> {
    const where: any = { id, status: 1 };
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
    const where: any = { id, status: 1 };
    if (userId) where.userId = userId;

    const resume = await this.resumeRepository.findOne({ where });
    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    // Version conflict check
    if (updateResumeDto.version !== undefined && resume.version !== updateResumeDto.version) {
      throw new ConflictException('简历版本冲突，请刷新后重试');
    }

    // 写入历史快照（更新前的 content）
    await this.resumeVersionRepository.save({
      resumeId: resume.id,
      userId: resume.userId,
      sourceVersion: resume.version,
      content: resume.content ?? '',
    });

    // Update fields
    Object.assign(resume, updateResumeDto);
    resume.version += 1;

    const updatedResume = await this.resumeRepository.save(resume);
    return this.mapToResponseDto(updatedResume);
  }

  async listVersions(resumeId: number, userId?: number): Promise<ResumeVersion[]> {
    const where: any = { resumeId };
    if (userId) where.userId = userId;
    return this.resumeVersionRepository.find({
      where,
      order: { createTime: 'DESC' },
      take: 50,
    });
  }

  async rollback(resumeId: number, versionId: number, userId?: number): Promise<ResumeResponseDto> {
    const whereResume: any = { id: resumeId, status: 1 };
    if (userId) whereResume.userId = userId;
    const resume = await this.resumeRepository.findOne({ where: whereResume });
    if (!resume) throw new NotFoundException('简历不存在');

    const whereVersion: any = { id: versionId, resumeId };
    if (userId) whereVersion.userId = userId;
    const version = await this.resumeVersionRepository.findOne({ where: whereVersion });
    if (!version) throw new NotFoundException('历史版本不存在');

    // 回滚前也记录一次当前快照，避免“回滚即丢失当前”
    await this.resumeVersionRepository.save({
      resumeId: resume.id,
      userId: resume.userId,
      sourceVersion: resume.version,
      content: resume.content ?? '',
    });

    resume.content = version.content;
    resume.version += 1;
    const saved = await this.resumeRepository.save(resume);
    return this.mapToResponseDto(saved);
  }

  async remove(id: number, userId?: number): Promise<void> {
    const where: any = { id, status: 1 };
    if (userId) where.userId = userId;

    const resume = await this.resumeRepository.findOne({ where });
    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    // Soft delete
    resume.status = 0;
    await this.resumeRepository.save(resume);
  }

  async exportPdf(html: string): Promise<string> {
    if (!html?.trim()) {
      throw new ServiceUnavailableException('PDF导出失败：未提供有效HTML内容');
    }

    const executablePath = resolveBrowserExecutablePath();
    if (!executablePath) {
      throw new ServiceUnavailableException(
        'PDF导出失败：未找到 Chrome/Edge 浏览器，请配置 PUPPETEER_EXECUTABLE_PATH 或使用打印方式导出',
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

      await page.setContent(html, { waitUntil: 'load', timeout: 30_000 });
      await page.emulateMediaType('print');

      await page.evaluate(async () => {
        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        const waitFonts = async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fonts = (document as any).fonts;
          if (fonts?.ready) {
            try {
              await fonts.ready;
            } catch {
              // ignore
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
        margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
      })) as unknown as Buffer;

      if (this.ossClient) {
        const fileName = `resume-${uuidv4()}.pdf`;
        const result = await this.ossClient.put(fileName, pdfBuffer);
        return result.url;
      }
      return `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('timeout') || msg.includes('Timeout')) {
        throw new ServiceUnavailableException('PDF导出超时，请稍后重试或使用打印方式导出');
      }
      if (err instanceof ServiceUnavailableException) {
        throw err;
      }
      throw new ServiceUnavailableException(
        `PDF导出失败：${msg.slice(0, 100)}。请尝试使用打印方式导出。`,
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
    // linux
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