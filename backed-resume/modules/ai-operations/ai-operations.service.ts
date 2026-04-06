import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiOperation } from '../../entities/ai-operation.entity';
import { CreateAiOperationDto, AiOperationQueryDto, AiOperationResponseDto } from '../../dto/ai-operation.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';

@Injectable()
export class AiOperationsService {
  constructor(
    @InjectRepository(AiOperation)
    private aiOperationRepository: Repository<AiOperation>,
  ) {}

  async findAll(query: AiOperationQueryDto): Promise<PaginationResponse<AiOperationResponseDto>> {
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

  async findOne(id: number): Promise<AiOperation> {
    const operation = await this.aiOperationRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
    if (!operation) {
      throw new NotFoundException('AI操作记录不存在');
    }
    return operation;
  }

  async create(createAiOperationDto: CreateAiOperationDto): Promise<AiOperation> {
    return this.aiOperationRepository.manager.transaction(async (manager) => {
      const userId = createAiOperationDto.userId;

      // 兜底：如果历史环境没有回填权益记录，这里先补一条默认记录
      await manager.query(
        `INSERT IGNORE INTO c_user_entitlements
          (user_id, plan_code, account_weight, ai_free_total, ai_free_used, ai_free_reset_policy, expire_at)
         VALUES (?, 'free', 0, 20, 0, 'never', NULL)`,
        [userId],
      );

      // 并发安全扣减：仅当 ai_free_used < ai_free_total 时才 +1
      const updateResult: any = await manager.query(
        `UPDATE c_user_entitlements
         SET ai_free_used = ai_free_used + 1
         WHERE user_id = ? AND ai_free_used < ai_free_total`,
        [userId],
      );

      const affectedRows = updateResult?.affectedRows ?? updateResult?.[0]?.affectedRows ?? 0;
      if (!affectedRows) {
        throw new ForbiddenException('AI 免费次数不足');
      }

      // 同步历史累计统计字段（用于现有统计接口）
      await manager.query(
        `UPDATE c_users SET ai_operation_count = ai_operation_count + 1 WHERE id = ?`,
        [userId],
      );

      const operation = manager.getRepository(AiOperation).create({
        userId,
        operationType: createAiOperationDto.operationType,
        inputData: createAiOperationDto.inputData,
        outputData: createAiOperationDto.outputData,
        tokenUsed: createAiOperationDto.tokenUsed ?? 0,
      });

      return manager.getRepository(AiOperation).save(operation);
    });
  }

  async remove(id: number): Promise<void> {
    const operation = await this.findOne(id);
    await this.aiOperationRepository.remove(operation);
  }

  async getStatistics(): Promise<any> {
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

  private mapToResponseDto(operation: AiOperation): AiOperationResponseDto {
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
} 