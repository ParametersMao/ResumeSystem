import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiOperation } from '../../entities/ai-operation.entity';
import { CreateAiOperationDto, AiOperationQueryDto, AiOperationResponseDto } from '../../dto/ai-operation.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';

interface AiOperationSchema {
  hasStatus: boolean;
}

interface EntitlementSchema {
  hasPlanCode: boolean;
  hasAccountWeight: boolean;
  hasAiFreeTotal: boolean;
  hasAiFreeUsed: boolean;
  hasAiFreeResetPolicy: boolean;
  hasExpireAt: boolean;
}

@Injectable()
export class AiOperationsService {
  private aiOperationSchemaPromise: Promise<AiOperationSchema> | null = null;
  private entitlementSchemaPromise: Promise<EntitlementSchema> | null = null;

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
    const [aiOperationSchema, entitlementSchema] = await Promise.all([
      this.getAiOperationSchema(),
      this.getEntitlementSchema(),
    ]);

    return this.aiOperationRepository.manager.transaction(async (manager) => {
      const userId = createAiOperationDto.userId;

      if (this.canEnforceEntitlementLimit(entitlementSchema)) {
        await manager.query(
          `INSERT IGNORE INTO c_user_entitlements
            (user_id, plan_code, account_weight, ai_free_total, ai_free_used, ai_free_reset_policy, expire_at)
           VALUES (?, 'free', 0, 20, 0, 'never', NULL)`,
          [userId],
        );

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
      }

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

  private canEnforceEntitlementLimit(schema: EntitlementSchema) {
    return (
      schema.hasPlanCode &&
      schema.hasAccountWeight &&
      schema.hasAiFreeTotal &&
      schema.hasAiFreeUsed &&
      schema.hasAiFreeResetPolicy &&
      schema.hasExpireAt
    );
  }

  private async getAiOperationSchema(): Promise<AiOperationSchema> {
    if (!this.aiOperationSchemaPromise) {
      this.aiOperationSchemaPromise = this.ensureAiOperationSchema();
    }

    return this.aiOperationSchemaPromise;
  }

  private async getEntitlementSchema(): Promise<EntitlementSchema> {
    if (!this.entitlementSchemaPromise) {
      this.entitlementSchemaPromise = this.ensureEntitlementSchema();
    }

    return this.entitlementSchemaPromise;
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

  private async ensureEntitlementSchema(): Promise<EntitlementSchema> {
    await this.aiOperationRepository.query(`
      CREATE TABLE IF NOT EXISTS c_user_entitlements (
        user_id INT NOT NULL PRIMARY KEY,
        plan_code VARCHAR(32) NOT NULL DEFAULT 'free',
        account_weight INT NOT NULL DEFAULT 0,
        ai_free_total INT NOT NULL DEFAULT 20,
        ai_free_used INT NOT NULL DEFAULT 0,
        ai_free_reset_policy VARCHAR(16) NOT NULL DEFAULT 'never',
        expire_at DATETIME NULL,
        create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const userColumns = await this.aiOperationRepository.query('SHOW COLUMNS FROM c_users');
    const userColumnNames = new Set(
      userColumns.map((column: { Field?: string; field?: string }) => column.Field ?? column.field),
    );

    if (!userColumnNames.has('ai_operation_count')) {
      await this.aiOperationRepository.query(
        'ALTER TABLE c_users ADD COLUMN ai_operation_count INT NOT NULL DEFAULT 0 AFTER status',
      );
    }

    const columns = await this.aiOperationRepository.query('SHOW COLUMNS FROM c_user_entitlements');
    const columnNames = new Set(
      columns.map((column: { Field?: string; field?: string }) => column.Field ?? column.field),
    );

    if (!columnNames.has('plan_code')) {
      await this.aiOperationRepository.query(
        "ALTER TABLE c_user_entitlements ADD COLUMN plan_code VARCHAR(32) NOT NULL DEFAULT 'free' AFTER user_id",
      );
    }

    if (!columnNames.has('account_weight')) {
      await this.aiOperationRepository.query(
        'ALTER TABLE c_user_entitlements ADD COLUMN account_weight INT NOT NULL DEFAULT 0 AFTER plan_code',
      );
    }

    if (!columnNames.has('ai_free_total')) {
      await this.aiOperationRepository.query(
        'ALTER TABLE c_user_entitlements ADD COLUMN ai_free_total INT NOT NULL DEFAULT 20 AFTER account_weight',
      );
    }

    if (!columnNames.has('ai_free_used')) {
      await this.aiOperationRepository.query(
        'ALTER TABLE c_user_entitlements ADD COLUMN ai_free_used INT NOT NULL DEFAULT 0 AFTER ai_free_total',
      );
    }

    if (!columnNames.has('ai_free_reset_policy')) {
      await this.aiOperationRepository.query(
        "ALTER TABLE c_user_entitlements ADD COLUMN ai_free_reset_policy VARCHAR(16) NOT NULL DEFAULT 'never' AFTER ai_free_used",
      );
    }

    if (!columnNames.has('expire_at')) {
      await this.aiOperationRepository.query(
        'ALTER TABLE c_user_entitlements ADD COLUMN expire_at DATETIME NULL AFTER ai_free_reset_policy',
      );
    }

    return {
      hasPlanCode: true,
      hasAccountWeight: true,
      hasAiFreeTotal: true,
      hasAiFreeUsed: true,
      hasAiFreeResetPolicy: true,
      hasExpireAt: true,
    };
  }
}
