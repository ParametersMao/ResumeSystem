import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemplateDto {
  @IsString()
  templateName: string;

  @IsString()
  templateData: string;

  @IsOptional()
  @IsString()
  previewImage?: string;

  @IsOptional()
  @IsString()
  industryTags?: string;

  @IsOptional()
  @IsString()
  templateVariant?: 'classic' | 'sidebar' | 'timeline' | 'spotlight' | 'ats' | 'executive' | 'compact' | 'editorial';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  recommendWeight?: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  templateName?: string;

  @IsOptional()
  @IsString()
  templateData?: string;

  @IsOptional()
  @IsString()
  previewImage?: string;

  @IsOptional()
  @IsString()
  industryTags?: string;

  @IsOptional()
  @IsString()
  templateVariant?: 'classic' | 'sidebar' | 'timeline' | 'spotlight' | 'ats' | 'executive' | 'compact' | 'editorial';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  recommendWeight?: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

// 列表响应 DTO：不包含 templateData，以提升列表性能。
export class TemplateListResponseDto {
  id: number;
  templateName: string;
  templateVariant?: 'classic' | 'sidebar' | 'timeline' | 'spotlight' | 'ats' | 'executive' | 'compact' | 'editorial';
  previewImage?: string;
  industryTags?: string;
  status?: boolean;
  createTime: Date;
  updateTime: Date;
  useCount: number;
  recommendWeight: number;
}

// 详情响应 DTO：包含完整 templateData。
export class TemplateDetailResponseDto {
  id: number;
  templateName: string;
  templateData: string;
  templateVariant?: 'classic' | 'sidebar' | 'timeline' | 'spotlight' | 'ats' | 'executive' | 'compact' | 'editorial';
  previewImage?: string;
  industryTags?: string;
  status?: boolean;
  createTime: Date;
  updateTime: Date;
  useCount: number;
  recommendWeight: number;
}

// 响应数据 DTO：保持向后兼容。
export class TemplateResponseDto {
  id: number;
  templateName: string;
  templateData: string;
  templateVariant?: 'classic' | 'sidebar' | 'timeline' | 'spotlight' | 'ats' | 'executive' | 'compact' | 'editorial';
  previewImage?: string;
  industryTags?: string;
  status?: boolean;
  createTime: Date;
  updateTime: Date;
  useCount: number;
  recommendWeight: number;
}

