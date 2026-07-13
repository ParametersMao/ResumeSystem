import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export type TemplateVariant = 'classic' | 'sidebar' | 'timeline' | 'spotlight' | 'ats' | 'executive' | 'compact' | 'editorial';
export type TemplateLayoutKey =
  | 'qm-blue-top-photo'
  | 'qm-sidebar-profile'
  | 'qm-classic-centered'
  | 'qm-ribbon-compact'
  | 'qm-timeline-icons'
  | 'qm-minimal-ats'
  | 'qm-executive-business'
  | 'qm-student-editorial'
  | 'qm-spotlight-featured';

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
  templateVariant?: TemplateVariant;

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
  templateVariant?: TemplateVariant;

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
  templateVariant?: TemplateVariant;
  layoutKey?: TemplateLayoutKey;
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
  templateVariant?: TemplateVariant;
  layoutKey?: TemplateLayoutKey;
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
  templateVariant?: TemplateVariant;
  layoutKey?: TemplateLayoutKey;
  previewImage?: string;
  industryTags?: string;
  status?: boolean;
  createTime: Date;
  updateTime: Date;
  useCount: number;
  recommendWeight: number;
}

