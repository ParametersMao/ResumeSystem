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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const ai_operations_service_1 = require("../ai-operations/ai-operations.service");
const ai_mock_dto_1 = require("../../dto/ai-mock.dto");
function ensureCuser(req) {
    if (!req.user?.id)
        throw new common_1.UnauthorizedException('用户信息无效');
    if (req.user.type !== 'cuser')
        throw new common_1.UnauthorizedException('无权限');
    return req.user.id;
}
function buildPolishSuggestions(input) {
    const base = String(input || '').replace(/\n/g, ' ').trim();
    const t = base.length > 180 ? `${base.slice(0, 180)}…` : base;
    if (!t)
        return [];
    return [
        {
            reason: '精简表达，突出关键词与结果',
            html: `【精简版】${t}`,
        },
        {
            reason: '强调行动与量化影响，提升可读性',
            html: `【行动-影响】通过…（行动），实现…（影响）。${t}`,
        },
        {
            reason: '改为要点式描述，更适合简历快速扫读',
            html: `【要点列举】<ul><li>${t.slice(0, 36)}</li><li>${t.slice(36, 72)}</li><li>${t.slice(72, 108)}</li></ul>`,
        },
    ];
}
function buildGenerate(jobTitle) {
    const title = String(jobTitle || '').trim() || '目标岗位';
    const skills = [
        'Vue3 / TypeScript',
        'Vite / Pinia',
        'HTML / CSS / JavaScript',
        '性能优化与工程化',
        '接口联调与问题排查',
    ];
    const summary = `面向${title}岗位，具备扎实的前端基础与工程化能力，能够独立推进需求交付与质量保障，注重可维护性与用户体验。`;
    const projects = [
        {
            name: `${title}相关项目（示例）`,
            role: '核心开发',
            duration: { start: '2024-01', end: '2024-06' },
            desc: '负责核心模块开发、组件抽象与性能优化；沉淀可复用方案并提升交付效率。',
        },
    ];
    return { summary, skills, projects };
}
let AiController = class AiController {
    aiOps;
    constructor(aiOps) {
        this.aiOps = aiOps;
    }
    async polish(req, dto) {
        const userId = ensureCuser(req);
        const suggestions = buildPolishSuggestions(dto.inputText);
        const output = {
            sectionType: dto.sectionType || null,
            suggestions,
        };
        const tokenUsed = Math.max(20, Math.min(dto.inputText?.length || 0, 800));
        await this.aiOps.create({
            userId,
            operationType: 'polish',
            inputData: dto.inputText,
            outputData: JSON.stringify(output),
            tokenUsed,
        });
        return { code: 200, message: 'success', data: { ...output, tokenUsed } };
    }
    async generate(req, dto) {
        const userId = ensureCuser(req);
        const output = buildGenerate(dto.jobTitle);
        const tokenUsed = 300;
        await this.aiOps.create({
            userId,
            operationType: 'generate',
            inputData: dto.jobTitle,
            outputData: JSON.stringify(output),
            tokenUsed,
        });
        return { code: 200, message: 'success', data: { ...output, tokenUsed } };
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('polish'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_mock_dto_1.AiPolishDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "polish", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_mock_dto_1.AiGenerateDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generate", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('api/ai'),
    __metadata("design:paramtypes", [ai_operations_service_1.AiOperationsService])
], AiController);
//# sourceMappingURL=ai.controller.js.map