"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resume_entity_1 = require("../../entities/resume.entity");
const resume_version_entity_1 = require("../../entities/resume-version.entity");
const puppeteer = require("puppeteer");
const OSS = require("ali-oss");
const uuid_1 = require("uuid");
const fs_1 = require("fs");
let ResumesService = class ResumesService {
    resumeRepository;
    resumeVersionRepository;
    ossClient = null;
    constructor(resumeRepository, resumeVersionRepository) {
        this.resumeRepository = resumeRepository;
        this.resumeVersionRepository = resumeVersionRepository;
        const ossConfig = {
            region: process.env.OSS_REGION,
            accessKeyId: process.env.OSS_ACCESS_KEY_ID,
            accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
            bucket: process.env.OSS_BUCKET,
        };
        if (ossConfig.region && ossConfig.accessKeyId && ossConfig.accessKeySecret && ossConfig.bucket) {
            this.ossClient = new OSS({
                region: ossConfig.region,
                accessKeyId: ossConfig.accessKeyId,
                accessKeySecret: ossConfig.accessKeySecret,
                bucket: ossConfig.bucket,
            });
        }
    }
    async create(createResumeDto) {
        const resume = this.resumeRepository.create(createResumeDto);
        const savedResume = await this.resumeRepository.save(resume);
        return this.mapToResponseDto(savedResume);
    }
    async findAllByUser(userId, page = 1, limit = 10) {
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
    async findOne(id, userId) {
        const where = { id, status: 1 };
        if (userId)
            where.userId = userId;
        const resume = await this.resumeRepository.findOne({
            where,
            relations: ['template', 'user'],
        });
        if (!resume) {
            throw new common_1.NotFoundException('简历不存在');
        }
        return this.mapToResponseDto(resume);
    }
    async update(id, updateResumeDto, userId) {
        const where = { id, status: 1 };
        if (userId)
            where.userId = userId;
        const resume = await this.resumeRepository.findOne({ where });
        if (!resume) {
            throw new common_1.NotFoundException('简历不存在');
        }
        if (updateResumeDto.version !== undefined && resume.version !== updateResumeDto.version) {
            throw new common_1.ConflictException('简历版本冲突，请刷新后重试');
        }
        await this.resumeVersionRepository.save({
            resumeId: resume.id,
            userId: resume.userId,
            sourceVersion: resume.version,
            content: resume.content ?? '',
        });
        Object.assign(resume, updateResumeDto);
        resume.version += 1;
        const updatedResume = await this.resumeRepository.save(resume);
        return this.mapToResponseDto(updatedResume);
    }
    async listVersions(resumeId, userId) {
        const where = { resumeId };
        if (userId)
            where.userId = userId;
        return this.resumeVersionRepository.find({
            where,
            order: { createTime: 'DESC' },
            take: 50,
        });
    }
    async rollback(resumeId, versionId, userId) {
        const whereResume = { id: resumeId, status: 1 };
        if (userId)
            whereResume.userId = userId;
        const resume = await this.resumeRepository.findOne({ where: whereResume });
        if (!resume)
            throw new common_1.NotFoundException('简历不存在');
        const whereVersion = { id: versionId, resumeId };
        if (userId)
            whereVersion.userId = userId;
        const version = await this.resumeVersionRepository.findOne({ where: whereVersion });
        if (!version)
            throw new common_1.NotFoundException('历史版本不存在');
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
    async remove(id, userId) {
        const where = { id, status: 1 };
        if (userId)
            where.userId = userId;
        const resume = await this.resumeRepository.findOne({ where });
        if (!resume) {
            throw new common_1.NotFoundException('简历不存在');
        }
        resume.status = 0;
        await this.resumeRepository.save(resume);
    }
    async exportPdf(html) {
        if (!html?.trim()) {
            throw new common_1.ServiceUnavailableException('PDF导出失败：未提供有效HTML内容');
        }
        const executablePath = resolveBrowserExecutablePath();
        if (!executablePath) {
            throw new common_1.ServiceUnavailableException('PDF导出失败：未找到 Chrome/Edge 浏览器，请配置 PUPPETEER_EXECUTABLE_PATH 或使用打印方式导出');
        }
        let browser = null;
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
                const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                const waitFonts = async () => {
                    const fonts = document.fonts;
                    if (fonts?.ready) {
                        try {
                            await fonts.ready;
                        }
                        catch {
                        }
                    }
                };
                const waitImages = async () => {
                    const images = Array.from(document.images || []);
                    await Promise.all(images.map((img) => {
                        if (img.complete)
                            return Promise.resolve();
                        return new Promise((resolve) => {
                            const done = () => resolve();
                            img.addEventListener('load', done, { once: true });
                            img.addEventListener('error', done, { once: true });
                        });
                    }));
                };
                await Promise.race([Promise.all([waitFonts(), waitImages()]), sleep(15_000)]);
            });
            const pdfBuffer = (await page.pdf({
                format: 'A4',
                printBackground: true,
                preferCSSPageSize: true,
                margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
            }));
            if (this.ossClient) {
                const fileName = `resume-${(0, uuid_1.v4)()}.pdf`;
                const result = await this.ossClient.put(fileName, pdfBuffer);
                return result.url;
            }
            return `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`;
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('timeout') || msg.includes('Timeout')) {
                throw new common_1.ServiceUnavailableException('PDF导出超时，请稍后重试或使用打印方式导出');
            }
            if (err instanceof common_1.ServiceUnavailableException) {
                throw err;
            }
            throw new common_1.ServiceUnavailableException(`PDF导出失败：${msg.slice(0, 100)}。请尝试使用打印方式导出。`);
        }
        finally {
            if (browser) {
                await browser.close().catch(() => { });
            }
        }
    }
    mapToResponseDto(resume) {
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
    mapToListResponseDto(resume) {
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
};
exports.ResumesService = ResumesService;
exports.ResumesService = ResumesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resume_entity_1.Resume)),
    __param(1, (0, typeorm_1.InjectRepository)(resume_version_entity_1.ResumeVersion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ResumesService);
function resolveBrowserExecutablePath() {
    const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
    if (envPath && (0, fs_1.existsSync)(envPath))
        return envPath;
    const candidates = [];
    if (process.platform === 'win32') {
        const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';
        const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
        const localAppData = process.env.LOCALAPPDATA || '';
        candidates.push(`${programFiles}\\Google\\Chrome\\Application\\chrome.exe`, `${programFilesX86}\\Google\\Chrome\\Application\\chrome.exe`, localAppData ? `${localAppData}\\Google\\Chrome\\Application\\chrome.exe` : '', `${programFiles}\\Microsoft\\Edge\\Application\\msedge.exe`, `${programFilesX86}\\Microsoft\\Edge\\Application\\msedge.exe`, localAppData ? `${localAppData}\\Microsoft\\Edge\\Application\\msedge.exe` : '');
    }
    else if (process.platform === 'darwin') {
        candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
    }
    else {
        candidates.push('/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge', '/usr/bin/microsoft-edge-stable');
    }
    for (const p of candidates.filter(Boolean)) {
        if ((0, fs_1.existsSync)(p))
            return p;
    }
    return undefined;
}
//# sourceMappingURL=resumes.service.js.map