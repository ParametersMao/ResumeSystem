import { IsString, IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAiOperationDto {
  @IsInt()
  userId: number;

  @IsString()
  @IsIn(['polish', 'generate'])
  operationType: string;

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
  @IsIn(['polish', 'generate'])
  operationType?: string;
}

// 响应数据DTO
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