import { Injectable, NotFoundException } from '@nestjs/common';
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
    const operation = this.aiOperationRepository.create({
      userId: createAiOperationDto.userId,
      operationType: createAiOperationDto.operationType,
      inputData: createAiOperationDto.inputData,
      outputData: createAiOperationDto.outputData,
      tokenUsed: createAiOperationDto.tokenUsed ?? 0,
    });
    
    return this.aiOperationRepository.save(operation);
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