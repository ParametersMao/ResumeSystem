import { IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';

export class CreateResumeDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  templateId?: number;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  previewImage?: string;
}

export class UpdateResumeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  templateId?: number;

  @IsOptional()
  @IsString()
  previewImage?: string;

  @IsOptional()
  @IsInt()
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
