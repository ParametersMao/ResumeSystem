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
}

export interface AiConfigDto {
  enabled: boolean;
  provider: string;
  apiBaseUrl: string;
  apiKey: string;
  apiModel: string;
  temperature: number;
  dailyLimit: number;
  perUserLimit: number;
  polishPromptTemplate: string;
  generatePromptTemplate: string;
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
