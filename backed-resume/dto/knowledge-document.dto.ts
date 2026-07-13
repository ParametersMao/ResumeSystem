import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export const KNOWLEDGE_SOURCE_TYPES = [
  'standard',
  'role-framework',
  'resume-exemplar',
  'job-description',
] as const;
export const ADMIN_KNOWLEDGE_SOURCE_TYPES = [
  'standard',
  'role-framework',
  'resume-exemplar',
] as const;
export type KnowledgeSourceType = (typeof KNOWLEDGE_SOURCE_TYPES)[number];
export type KnowledgeScope = 'global' | 'private';

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

  @IsOptional()
  @IsIn(ADMIN_KNOWLEDGE_SOURCE_TYPES)
  sourceType?: KnowledgeSourceType;
}

export class AdminKnowledgeUploadDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn(ADMIN_KNOWLEDGE_SOURCE_TYPES)
  sourceType: KnowledgeSourceType = 'standard';

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  licensed = false;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  piiReviewed = false;
}

export class JobDescriptionUpsertDto {
  @IsOptional()
  @IsString()
  @MaxLength(10 * 1024 * 1024)
  text?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
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
