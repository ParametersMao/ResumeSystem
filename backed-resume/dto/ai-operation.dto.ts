import { IsString, IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export type AiOperationType = 'polish' | 'generate' | 'diagnose' | 'agent-polish' | 'agent-generate';

const AI_OPERATION_TYPES: AiOperationType[] = ['polish', 'generate', 'diagnose', 'agent-polish', 'agent-generate'];

export class CreateAiOperationDto {
  @IsInt()
  userId: number;

  @IsString()
  @IsIn(AI_OPERATION_TYPES)
  operationType: AiOperationType;

  @IsOptional()
  @IsString()
  inputData?: string;

  @IsOptional()
  @IsString()
  outputData?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  tokenUsed?: number = 0;
}

export class AiOperationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsString()
  @IsIn(AI_OPERATION_TYPES)
  operationType?: AiOperationType;
}

// 响应数据 DTO
export class AiOperationResponseDto {
  id: number;
  userId: number;
  username?: string;
  operationType: string;
  inputData?: string;
  outputData?: string;
  createTime: Date;
  tokenUsed: number;
}
