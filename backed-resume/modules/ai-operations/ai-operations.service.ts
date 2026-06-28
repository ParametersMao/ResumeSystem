import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiOperation } from '../../entities/ai-operation.entity';
import { CreateAiOperationDto, AiOperationQueryDto, AiOperationResponseDto } from '../../dto/ai-operation.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';

interface AiOperationSchema {
  hasStatus: boolean;
}

@Injectable()
export class AiOperationsService {
  private aiOperationSchemaPromise: Promise<AiOperationSchema> | null = null;

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

    const responseData = operations.map((operation) => this.mapToResponseDto(operation));

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
      relations: ['user'],
    });

    if (!operation) {
      throw new NotFoundException('AI 操作记录不存在');
    }

    return operation;
  }

  async create(createAiOperationDto: CreateAiOperationDto): Promise<AiOperation> {
    const aiOperationSchema = await this.getAiOperationSchema();

    return this.aiOperationRepository.manager.transaction(async (manager) => {
      const userId = createAiOperationDto.userId;

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
        ...(aiOperationSchema.hasStatus ? { status: 'success' } : {}),
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
    const polishCount = await this.aiOperationRepository
      .createQueryBuilder('aiOperation')
      .where('aiOperation.operationType IN (:...types)', { types: ['polish', 'agent-polish'] })
      .getCount();
    const generateCount = await this.aiOperationRepository
      .createQueryBuilder('aiOperation')
      .where('aiOperation.operationType IN (:...types)', { types: ['generate', 'agent-generate'] })
      .getCount();
    const diagnoseCount = await this.aiOperationRepository
      .createQueryBuilder('aiOperation')
      .where('aiOperation.operationType = :type', { type: 'diagnose' })
      .getCount();
    const totalTokens = await this.aiOperationRepository
      .createQueryBuilder('aiOperation')
      .select('SUM(aiOperation.tokenUsed)', 'total')
      .getRawOne();

    return {
      totalOperations,
      polishCount,
      generateCount,
      diagnoseCount,
      totalTokens: parseInt(totalTokens.total, 10) || 0,
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

  private async getAiOperationSchema(): Promise<AiOperationSchema> {
    if (!this.aiOperationSchemaPromise) {
      this.aiOperationSchemaPromise = this.ensureAiOperationSchema();
    }

    return this.aiOperationSchemaPromise;
  }

  private async ensureAiOperationSchema(): Promise<AiOperationSchema> {
    await this.aiOperationRepository.query(`
      CREATE TABLE IF NOT EXISTS ai_operations (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        operation_type VARCHAR(50) NOT NULL,
        input_text TEXT NULL,
        output_text TEXT NULL,
        create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        tokens_used INT NOT NULL DEFAULT 0,
        status ENUM('processing', 'success', 'failed') NOT NULL DEFAULT 'success',
        INDEX idx_ai_operations_user_id (user_id),
        INDEX idx_ai_operations_create_time (create_time)
      )
    `);

    const columns = await this.aiOperationRepository.query('SHOW COLUMNS FROM ai_operations');
    const columnNames = new Set(
      columns.map((column: { Field?: string; field?: string }) => column.Field ?? column.field),
    );

    if (!columnNames.has('input_text')) {
      await this.aiOperationRepository.query(
        'ALTER TABLE ai_operations ADD COLUMN input_text TEXT NULL AFTER operation_type',
      );
    }

    if (!columnNames.has('output_text')) {
      await this.aiOperationRepository.query(
        'ALTER TABLE ai_operations ADD COLUMN output_text TEXT NULL AFTER input_text',
      );
    }

    if (!columnNames.has('tokens_used')) {
      await this.aiOperationRepository.query(
        'ALTER TABLE ai_operations ADD COLUMN tokens_used INT NOT NULL DEFAULT 0 AFTER create_time',
      );
    }

    if (!columnNames.has('status')) {
      await this.aiOperationRepository.query(
        "ALTER TABLE ai_operations ADD COLUMN status ENUM('processing', 'success', 'failed') NOT NULL DEFAULT 'success' AFTER tokens_used",
      );
    }

    return {
      hasStatus: true,
    };
  }

}
