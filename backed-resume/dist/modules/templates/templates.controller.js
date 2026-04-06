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
exports.TemplatesController = void 0;
const common_1 = require("@nestjs/common");
const templates_service_1 = require("./templates.service");
const template_dto_1 = require("../../dto/template.dto");
const template_search_dto_1 = require("../../dto/template-search.dto");
let TemplatesController = class TemplatesController {
    templatesService;
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    async findAll(searchDto) {
        const result = await this.templatesService.findAll(searchDto);
        return {
            code: 200,
            message: 'success',
            data: result,
        };
    }
    async findOne(id) {
        const template = await this.templatesService.findOne(+id);
        return {
            code: 200,
            message: 'success',
            data: template,
        };
    }
    async create(createTemplateDto) {
        const template = await this.templatesService.create(createTemplateDto);
        return {
            code: 200,
            message: '模板创建成功',
            data: {
                id: template.id,
                templateName: template.templateName,
                templateData: template.templateData,
                previewImage: template.previewImage,
                description: template.description,
                industryTags: template.industryTags,
                status: template.status,
                createTime: template.createTime,
                updateTime: template.updateTime,
                useCount: template.useCount,
                downloadCount: template.downloadCount,
            },
        };
    }
    async update(id, updateTemplateDto) {
        const template = await this.templatesService.update(+id, updateTemplateDto);
        return {
            code: 200,
            message: '模板更新成功',
            data: {
                id: template.id,
                templateName: template.templateName,
                templateData: template.templateData,
                previewImage: template.previewImage,
                description: template.description,
                industryTags: template.industryTags,
                status: template.status,
                createTime: template.createTime,
                updateTime: template.updateTime,
                useCount: template.useCount,
                downloadCount: template.downloadCount,
            },
        };
    }
    async remove(id) {
        await this.templatesService.remove(+id);
        return {
            code: 200,
            message: '模板删除成功',
            data: null,
        };
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_search_dto_1.TemplateSearchDto]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, template_dto_1.UpdateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "remove", null);
exports.TemplatesController = TemplatesController = __decorate([
    (0, common_1.Controller)('api/templates'),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService])
], TemplatesController);
//# sourceMappingURL=templates.controller.js.map