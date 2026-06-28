import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class KnowledgeDocumentQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsIn(['pending', 'indexing', 'ready', 'failed', 'disabled'])
  status?: string;
}

export class KnowledgeSearchDto {
  @IsString()
  @MaxLength(2000)
  query: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit = 5;
}

export class KnowledgeToggleDto {
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  enabled: boolean;
}
