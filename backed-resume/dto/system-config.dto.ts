export interface SiteConfigDto {
  siteName: string;
  siteLogo: string;
  contactEmail: string;
  contactPhone: string;
  icp?: string;
}

export interface EmailConfigDto {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromName: string;
  fromEmail: string;
  encryption: 'none' | 'ssl' | 'tls';
  smtpPassConfigured?: boolean;
}

export const AI_PROVIDER_VALUES = [
  'mock',
  'openai-compatible',
  'openai',
  'deepseek',
  'qwen',
  'glm',
  'moonshot',
  'doubao',
  'langgraph-agent',
  'custom',
] as const;

export type AiProvider = (typeof AI_PROVIDER_VALUES)[number];

export interface AiConfigDto {
  enabled: boolean;
  executionEngine: 'direct' | 'agent';
  agentBaseUrl: string;
  provider: AiProvider | string;
  apiBaseUrl: string;
  apiKey: string;
  apiModel: string;
  temperature: number;
  dailyLimit: number;
  perUserLimit: number;
  polishPromptTemplate: string;
  generatePromptTemplate: string;
  apiKeyConfigured?: boolean;
}

export interface SystemConfigDto {
  site: SiteConfigDto;
  email: EmailConfigDto;
  ai: AiConfigDto;
}

export type PartialSystemConfigDto = Partial<{
  site: Partial<SiteConfigDto>;
  email: Partial<EmailConfigDto>;
  ai: Partial<AiConfigDto>;
}>;
