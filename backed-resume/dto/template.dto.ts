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

// 鍒楄〃鍝嶅簲DTO - 涓嶅寘鍚玹emplateData浠ユ彁楂樻€ц兘
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

// 璇︽儏鍝嶅簲DTO - 鍖呭惈瀹屾暣鐨則emplateData
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

// 鍝嶅簲鏁版嵁DTO - 淇濇寔鍚戝悗鍏煎
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

