import { IsString, IsOptional, IsInt, Min, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateResumeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  templateId?: number;

  @IsOptional()
  @IsString()
  previewImage?: string;
}

export class UpdateResumeDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  templateId?: number;

  @IsOptional()
  @IsString()
  previewImage?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  version?: number;
}

export class ResumeResponseDto {
  id: number;
  title: string;
  content: string;
  templateId?: number;
  templateName?: string;
  userId: number;
  userName?: string;
  previewImage?: string;
  status: number;
  version: number;
  createTime: Date;
  updateTime: Date;
}

export class ResumeListResponseDto {
  id: number;
  title: string;
  templateId?: number;
  templateName?: string;
  userId: number;
  userName?: string;
  previewImage?: string;
  status: number;
  version: number;
  createTime: Date;
  updateTime: Date;
}
