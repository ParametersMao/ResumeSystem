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
exports.AiOperationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_operation_entity_1 = require("../../entities/ai-operation.entity");
let AiOperationsService = class AiOperationsService {
    aiOperationRepository;
    constructor(aiOperationRepository) {
        this.aiOperationRepository = aiOperationRepository;
    }
    async findAll(query) {
        const { page = 1, limit = 10, userId, operationType } = query;
        const skip = (page - 1) * limit;
        const queryBuilder = this.aiOperationRepository
            .createQueryBuilder('aiOperation')
            .leftJoinAndSelect('aiOperation.user', 'user')
            .orderBy('aiOperation.createTime', 'DESC');
        if (userId) {
            queryBuilder.andWhere('aiOperation.userId = :userId', { userId });
        }
        if (operationType) {
            queryBuilder.andWhere('aiOperation.operationType = :operationType', { operationType });
        }
        const [operations, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        const responseData = operations.map(operation => this.mapToResponseDto(operation));
        return {
            list: responseData,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const operation = await this.aiOperationRepository.findOne({
            where: { id },
            relations: ['user']
        });
        if (!operation) {
            throw new common_1.NotFoundException('AI操作记录不存在');
        }
        return operation;
    }
    async create(createAiOperationDto) {
        return this.aiOperationRepository.manager.transaction(async (manager) => {
            const userId = createAiOperationDto.userId;
            await manager.query(`INSERT IGNORE INTO c_user_entitlements
          (user_id, plan_code, account_weight, ai_free_total, ai_free_used, ai_free_reset_policy, expire_at)
         VALUES (?, 'free', 0, 20, 0, 'never', NULL)`, [userId]);
            const updateResult = await manager.query(`UPDATE c_user_entitlements
         SET ai_free_used = ai_free_used + 1
         WHERE user_id = ? AND ai_free_used < ai_free_total`, [userId]);
            const affectedRows = updateResult?.affectedRows ?? updateResult?.[0]?.affectedRows ?? 0;
            if (!affectedRows) {
                throw new common_1.ForbiddenException('AI 免费次数不足');
            }
            await manager.query(`UPDATE c_users SET ai_operation_count = ai_operation_count + 1 WHERE id = ?`, [userId]);
            const operation = manager.getRepository(ai_operation_entity_1.AiOperation).create({
                userId,
                operationType: createAiOperationDto.operationType,
                inputData: createAiOperationDto.inputData,
                outputData: createAiOperationDto.outputData,
                tokenUsed: createAiOperationDto.tokenUsed ?? 0,
            });
            return manager.getRepository(ai_operation_entity_1.AiOperation).save(operation);
        });
    }
    async remove(id) {
        const operation = await this.findOne(id);
        await this.aiOperationRepository.remove(operation);
    }
    async getStatistics() {
        const totalOperations = await this.aiOperationRepository.count();
        const polishCount = await this.aiOperationRepository.count({ where: { operationType: 'polish' } });
        const generateCount = await this.aiOperationRepository.count({ where: { operationType: 'generate' } });
        const totalTokens = await this.aiOperationRepository
            .createQueryBuilder('aiOperation')
            .select('SUM(aiOperation.tokenUsed)', 'total')
            .getRawOne();
        return {
            totalOperations,
            polishCount,
            generateCount,
            totalTokens: parseInt(totalTokens.total) || 0,
        };
    }
    mapToResponseDto(operation) {
        return {
            id: operation.id,
            userId: operation.userId,
            username: operation.user?.username,
            operationType: operation.operationType,
            inputData: operation.inputData,
            outputData: operation.outputData,
            createTime: operation.createTime,
            tokenUsed: operation.tokenUsed,
        };
    }
};
exports.AiOperationsService = AiOperationsService;
exports.AiOperationsService = AiOperationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_operation_entity_1.AiOperation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AiOperationsService);
//# sourceMappingURL=ai-operations.service.js.map