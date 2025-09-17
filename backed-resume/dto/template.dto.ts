import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

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
  description?: string;

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
  description?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

// 列表响应DTO - 不包含templateData以提高性能
export class TemplateListResponseDto {
  id: number;
  templateName: string;
  previewImage?: string;
  description?: string;
  status?: boolean;
  createTime: Date;
  updateTime: Date;
  useCount: number;
  downloadCount: number;
}

// 详情响应DTO - 包含完整的templateData
export class TemplateDetailResponseDto {
  id: number;
  templateName: string;
  templateData: string;
  previewImage?: string;
  description?: string;
  status?: boolean;
  createTime: Date;
  updateTime: Date;
  useCount: number;
  downloadCount: number;
}

// 响应数据DTO - 保持向后兼容
export class TemplateResponseDto {
  id: number;
  templateName: string;
  templateData: string;
  previewImage?: string;
  description?: string;
  status?: boolean;
  createTime: Date;
  updateTime: Date;
  useCount: number;
  downloadCount: number;
} 