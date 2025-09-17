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
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const template_entity_1 = require("../../entities/template.entity");
let TemplatesService = class TemplatesService {
    templateRepository;
    constructor(templateRepository) {
        this.templateRepository = templateRepository;
    }
    async findAll(searchDto) {
        const { page = 1, limit = 10, templateName, description, status } = searchDto;
        const skip = (page - 1) * limit;
        console.log('Template search params:', { page, limit, templateName, description, status });
        try {
            const queryBuilder = this.templateRepository.createQueryBuilder('template');
            if (templateName && templateName.trim() !== '') {
                queryBuilder.andWhere('template.templateName LIKE :templateName', {
                    templateName: `%${templateName.trim()}%`
                });
            }
            if (description && description.trim() !== '') {
                queryBuilder.andWhere('template.description LIKE :description', {
                    description: `%${description.trim()}%`
                });
            }
            if (status === true || status === false) {
                queryBuilder.andWhere('template.status = :status', { status });
            }
            const rawQuery = queryBuilder.getSql();
            console.log('Generated SQL query:', rawQuery);
            queryBuilder
                .orderBy('template.createTime', 'DESC')
                .skip(skip)
                .take(limit);
            const [templates, total] = await queryBuilder.getManyAndCount();
            const responseData = templates.map(template => this.mapToListResponseDto(template));
            console.log(`Found ${total} templates matching criteria`);
            return {
                list: responseData,
                total,
                page,
                limit,
            };
        }
        catch (error) {
            console.error('Error in template search:', error);
            throw error;
        }
    }
    async findOne(id) {
        const template = await this.templateRepository.findOne({ where: { id } });
        if (!template) {
            throw new common_1.NotFoundException('模板不存在');
        }
        return this.mapToDetailResponseDto(template);
    }
    async findOneEntity(id) {
        const template = await this.templateRepository.findOne({ where: { id } });
        if (!template) {
            throw new common_1.NotFoundException('模板不存在');
        }
        return template;
    }
    async create(createTemplateDto) {
        const { templateName, templateData, previewImage, description, status } = createTemplateDto;
        const template = this.templateRepository.create({
            templateName,
            templateData,
            previewImage,
            description,
            status,
        });
        const savedTemplate = await this.templateRepository.save(template);
        return this.mapToResponseDto(savedTemplate);
    }
    async update(id, updateTemplateDto) {
        const template = await this.findOneEntity(id);
        Object.assign(template, updateTemplateDto);
        const updatedTemplate = await this.templateRepository.save(template);
        return this.mapToResponseDto(updatedTemplate);
    }
    async remove(id) {
        const template = await this.findOneEntity(id);
        await this.templateRepository.remove(template);
    }
    async incrementUseCount(id) {
        await this.templateRepository.increment({ id }, 'useCount', 1);
    }
    async incrementDownloadCount(id) {
        await this.templateRepository.increment({ id }, 'downloadCount', 1);
    }
    mapToListResponseDto(template) {
        return {
            id: template.id,
            templateName: template.templateName,
            previewImage: template.previewImage,
            description: template.description,
            status: template.status,
            createTime: template.createTime,
            updateTime: template.updateTime,
            useCount: template.useCount,
            downloadCount: template.downloadCount,
        };
    }
    mapToDetailResponseDto(template) {
        return {
            id: template.id,
            templateName: template.templateName,
            templateData: template.templateData,
            previewImage: template.previewImage,
            description: template.description,
            status: template.status,
            createTime: template.createTime,
            updateTime: template.updateTime,
            useCount: template.useCount,
            downloadCount: template.downloadCount,
        };
    }
    mapToResponseDto(template) {
        return {
            id: template.id,
            templateName: template.templateName,
            templateData: template.templateData,
            previewImage: template.previewImage,
            description: template.description,
            status: template.status,
            createTime: template.createTime,
            updateTime: template.updateTime,
            useCount: template.useCount,
            downloadCount: template.downloadCount,
        };
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(template_entity_1.Template)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map