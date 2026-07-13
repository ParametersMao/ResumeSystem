import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class AiPolishDto {
  @IsString()
  @MaxLength(8000)
  inputText: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sectionType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  resumeId?: string;

  @IsOptional()
  @IsBoolean()
  includeExemplars?: boolean;
}

export class AiGenerateDto {
  @IsString()
  @MaxLength(128)
  jobTitle: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sectionType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  contextText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  resumeId?: string;

  @IsOptional()
  @IsBoolean()
  includeExemplars?: boolean;
}

export class AiDiagnoseDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  resumeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sectionType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  templateVariant?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  selectedText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  contentText?: string;

  @IsOptional()
  @IsObject()
  content?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  userInstruction?: string;
}

