import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsBoolean, IsNumber } from 'class-validator';

export class AiPromptPreviewDto {
  @IsIn(['polish', 'generate'])
  taskType: 'polish' | 'generate';

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  inputText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sectionType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  jobTitle?: string;
}

export class AiConnectionTestDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  provider?: string;

  @IsOptional()
  @IsIn(['direct', 'agent'])
  executionEngine?: 'direct' | 'agent';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  agentBaseUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  apiBaseUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  apiKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  apiModel?: string;

  @IsOptional()
  @IsNumber()
  temperature?: number;
}
