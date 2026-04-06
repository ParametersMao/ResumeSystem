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
exports.ResumesController = void 0;
const common_1 = require("@nestjs/common");
const resumes_service_1 = require("./resumes.service");
const resume_dto_1 = require("../../dto/resume.dto");
let ResumesController = class ResumesController {
    resumesService;
    constructor(resumesService) {
        this.resumesService = resumesService;
    }
    async create(createResumeDto) {
        const resume = await this.resumesService.create(createResumeDto);
        return {
            code: 200,
            message: '简历创建成功',
            data: resume,
        };
    }
    async findAllByUser(userId, page = 1, limit = 10) {
        const result = await this.resumesService.findAllByUser(+userId, +page, +limit);
        return {
            code: 200,
            message: 'success',
            data: result,
        };
    }
    async findOne(id, userId) {
        const resume = await this.resumesService.findOne(+id, userId ? +userId : undefined);
        return {
            code: 200,
            message: 'success',
            data: resume,
        };
    }
    async update(id, updateResumeDto, userId) {
        const resume = await this.resumesService.update(+id, updateResumeDto, userId ? +userId : undefined);
        return {
            code: 200,
            message: '更新成功',
            data: resume,
        };
    }
    async remove(id, userId) {
        await this.resumesService.remove(+id, userId ? +userId : undefined);
        return {
            code: 200,
            message: '删除成功',
            data: null,
        };
    }
    async exportPdf(html) {
        const url = await this.resumesService.exportPdf(html);
        return {
            code: 200,
            message: '导出成功',
            data: { url },
        };
    }
    async listVersions(id, userId) {
        const versions = await this.resumesService.listVersions(+id, userId ? +userId : undefined);
        return {
            code: 200,
            message: 'success',
            data: versions.map(v => ({
                id: v.id,
                resumeId: v.resumeId,
                userId: v.userId,
                sourceVersion: v.sourceVersion,
                createTime: v.createTime,
            })),
        };
    }
    async rollback(id, versionId, userId) {
        const resume = await this.resumesService.rollback(+id, Number(versionId), userId ? +userId : undefined);
        return {
            code: 200,
            message: '回滚成功',
            data: resume,
        };
    }
};
exports.ResumesController = ResumesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resume_dto_1.CreateResumeDto]),
    __metadata("design:returntype", Promise)
], ResumesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ResumesController.prototype, "findAllByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ResumesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, resume_dto_1.UpdateResumeDto, String]),
    __metadata("design:returntype", Promise)
], ResumesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ResumesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Body)('html')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResumesController.prototype, "exportPdf", null);
__decorate([
    (0, common_1.Get)(':id/versions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ResumesController.prototype, "listVersions", null);
__decorate([
    (0, common_1.Post)(':id/rollback'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('versionId')),
    __param(2, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], ResumesController.prototype, "rollback", null);
exports.ResumesController = ResumesController = __decorate([
    (0, common_1.Controller)('api/resumes'),
    __metadata("design:paramtypes", [resumes_service_1.ResumesService])
], ResumesController);
//# sourceMappingURL=resumes.controller.js.map