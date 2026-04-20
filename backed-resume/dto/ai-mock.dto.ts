import { IsOptional, IsString, MaxLength } from 'class-validator';

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
}

