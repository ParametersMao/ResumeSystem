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
exports.AiOperationsController = void 0;
const common_1 = require("@nestjs/common");
const ai_operations_service_1 = require("./ai-operations.service");
const ai_operation_dto_1 = require("../../dto/ai-operation.dto");
let AiOperationsController = class AiOperationsController {
    aiOperationsService;
    constructor(aiOperationsService) {
        this.aiOperationsService = aiOperationsService;
    }
    async findAll(query) {
        const result = await this.aiOperationsService.findAll(query);
        return {
            code: 200,
            message: 'success',
            data: result,
        };
    }
    async findOne(id) {
        const operation = await this.aiOperationsService.findOne(+id);
        return {
            code: 200,
            message: 'success',
            data: {
                id: operation.id,
                userId: operation.userId,
                username: operation.user?.username,
                operationType: operation.operationType,
                inputData: operation.inputData,
                outputData: operation.outputData,
                createTime: operation.createTime,
                tokenUsed: operation.tokenUsed,
            },
        };
    }
    async create(createAiOperationDto) {
        const operation = await this.aiOperationsService.create(createAiOperationDto);
        return {
            code: 200,
            message: 'AI 操作记录创建成功',
            data: {
                id: operation.id,
                userId: operation.userId,
                username: operation.user?.username,
                operationType: operation.operationType,
                inputData: operation.inputData,
                outputData: operation.outputData,
                createTime: operation.createTime,
                tokenUsed: operation.tokenUsed,
            },
        };
    }
    async remove(id) {
        await this.aiOperationsService.remove(+id);
        return {
            code: 200,
            message: 'AI 操作记录删除成功',
            data: null,
        };
    }
    async getStatistics() {
        const statistics = await this.aiOperationsService.getStatistics();
        return {
            code: 200,
            message: 'success',
            data: statistics,
        };
    }
};
exports.AiOperationsController = AiOperationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_operation_dto_1.AiOperationQueryDto]),
    __metadata("design:returntype", Promise)
], AiOperationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiOperationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_operation_dto_1.CreateAiOperationDto]),
    __metadata("design:returntype", Promise)
], AiOperationsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiOperationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('statistics/overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiOperationsController.prototype, "getStatistics", null);
exports.AiOperationsController = AiOperationsController = __decorate([
    (0, common_1.Controller)('api/ai-operations'),
    __metadata("design:paramtypes", [ai_operations_service_1.AiOperationsService])
], AiOperationsController);
//# sourceMappingURL=ai-operations.controller.js.map