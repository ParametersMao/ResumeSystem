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
const puppeteer = require("puppeteer");
const OSS = require("ali-oss");
const uuid_1 = require("uuid");
let ResumesService = class ResumesService {
    resumeRepository;
    ossClient = null;
    constructor(resumeRepository) {
        this.resumeRepository = resumeRepository;
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
        Object.assign(resume, updateResumeDto);
        resume.version += 1;
        const updatedResume = await this.resumeRepository.save(resume);
        return this.mapToResponseDto(updatedResume);
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
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();
        if (this.ossClient) {
            const fileName = `resume-${(0, uuid_1.v4)()}.pdf`;
            const result = await this.ossClient.put(fileName, pdfBuffer);
            return result.url;
        }
        else {
            return `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`;
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
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ResumesService);
//# sourceMappingURL=resumes.service.js.map