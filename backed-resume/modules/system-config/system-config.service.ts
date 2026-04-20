import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../../entities/system-config.entity';
import { AiConfigDto, PartialSystemConfigDto, SystemConfigDto } from '../../dto/system-config.dto';

const GLOBAL_CONFIG_KEY = 'global';

const DEFAULT_POLISH_PROMPT_TEMPLATE =
  '你是一名专业简历顾问。请基于目标岗位 {{jobTitle}} 和模块类型 {{sectionType}}，对下面的简历内容进行润色，输出更适合求职简历的版本：\n{{input}}';

const DEFAULT_GENERATE_PROMPT_TEMPLATE =
  '你是一名专业简历顾问。请围绕目标岗位 {{jobTitle}} 生成简历摘要、技能关键词与项目示例，输出内容要简洁、职业，并可直接用于简历。';

const DEFAULT_SYSTEM_CONFIG: SystemConfigDto = {
  site: {
    siteName: '简历系统',
    siteLogo: '',
    contactEmail: 'support@example.com',
    contactPhone: '',
    icp: '',
  },
  email: {
    smtpHost: '',
    smtpPort: 465,
    smtpUser: '',
    smtpPass: '',
    fromName: '简历系统',
    fromEmail: '',
    encryption: 'ssl',
  },
  ai: {
    enabled: true,
    provider: 'mock',
    apiBaseUrl: '',
    apiKey: '',
    apiModel: 'mock-resume-polish',
    temperature: 0.7,
    dailyLimit: 500,
    perUserLimit: 20,
    polishPromptTemplate: DEFAULT_POLISH_PROMPT_TEMPLATE,
    generatePromptTemplate: DEFAULT_GENERATE_PROMPT_TEMPLATE,
  },
};

@Injectable()
export class SystemConfigService {
  private ensureTablePromise: Promise<void> | null = null;

  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
  ) {}

  async getConfig(): Promise<SystemConfigDto> {
    await this.ensureTable();
    const record = await this.systemConfigRepository.findOne({
      where: { configKey: GLOBAL_CONFIG_KEY },
    });

    if (!record) {
      const created = this.systemConfigRepository.create({
        configKey: GLOBAL_CONFIG_KEY,
        configData: JSON.stringify(DEFAULT_SYSTEM_CONFIG),
      });
      await this.systemConfigRepository.save(created);
      return this.cloneDefaultConfig();
    }

    return this.mergeWithDefault(this.parseConfigData(record.configData));
  }

  async updateConfig(payload: PartialSystemConfigDto): Promise<SystemConfigDto> {
    await this.ensureTable();
    const current = await this.getConfig();
    const next = this.normalizeConfig(this.mergeConfig(current, payload));

    const existing = await this.systemConfigRepository.findOne({
      where: { configKey: GLOBAL_CONFIG_KEY },
    });

    if (existing) {
      existing.configData = JSON.stringify(next);
      await this.systemConfigRepository.save(existing);
    } else {
      const created = this.systemConfigRepository.create({
        configKey: GLOBAL_CONFIG_KEY,
        configData: JSON.stringify(next),
      });
      await this.systemConfigRepository.save(created);
    }

    return next;
  }

  async getAiConfig(): Promise<AiConfigDto> {
    const config = await this.getConfig();
    return config.ai;
  }

  private async ensureTable() {
    if (!this.ensureTablePromise) {
      this.ensureTablePromise = this.createTableIfNeeded();
    }
    await this.ensureTablePromise;
  }

  private async createTableIfNeeded() {
    await this.systemConfigRepository.query(`
      CREATE TABLE IF NOT EXISTS system_configs (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(64) NOT NULL UNIQUE,
        config_data LONGTEXT NOT NULL,
        create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  private parseConfigData(value: string): Partial<SystemConfigDto> {
    try {
      return JSON.parse(value || '{}');
    } catch {
      return {};
    }
  }

  private cloneDefaultConfig(): SystemConfigDto {
    return JSON.parse(JSON.stringify(DEFAULT_SYSTEM_CONFIG));
  }

  private mergeWithDefault(partial: Partial<SystemConfigDto>): SystemConfigDto {
    return this.normalizeConfig(this.mergeConfig(this.cloneDefaultConfig(), partial));
  }

  private mergeConfig(base: SystemConfigDto, patch: PartialSystemConfigDto | Partial<SystemConfigDto>): SystemConfigDto {
    return {
      site: {
        ...base.site,
        ...(patch.site || {}),
      },
      email: {
        ...base.email,
        ...(patch.email || {}),
      },
      ai: {
        ...base.ai,
        ...(patch.ai || {}),
      },
    };
  }

  private normalizeConfig(config: SystemConfigDto): SystemConfigDto {
    return {
      ...config,
      site: {
        ...config.site,
        siteName: this.toSafeString(config.site?.siteName) || DEFAULT_SYSTEM_CONFIG.site.siteName,
      },
      email: {
        ...config.email,
        fromName: this.toSafeString(config.email?.fromName) || DEFAULT_SYSTEM_CONFIG.email.fromName,
      },
      ai: this.normalizeAiConfig(config.ai),
    };
  }

  private normalizeAiConfig(ai: AiConfigDto): AiConfigDto {
    return {
      ...ai,
      provider: this.toSafeString(ai?.provider) || 'mock',
      apiBaseUrl: this.toSafeString(ai?.apiBaseUrl),
      apiKey: this.toSafeString(ai?.apiKey),
      apiModel: this.toSafeString(ai?.apiModel) || 'mock-resume-polish',
      polishPromptTemplate: this.normalizePromptTemplate(
        ai?.polishPromptTemplate,
        DEFAULT_POLISH_PROMPT_TEMPLATE,
        ['{{sectionType}}', '{{input}}', '{{jobTitle}}'],
      ),
      generatePromptTemplate: this.normalizePromptTemplate(
        ai?.generatePromptTemplate,
        DEFAULT_GENERATE_PROMPT_TEMPLATE,
        ['{{jobTitle}}'],
      ),
    };
  }

  private normalizePromptTemplate(value: string, fallback: string, requiredTokens: string[]) {
    const normalized = this.toSafeString(value);
    if (!normalized) {
      return fallback;
    }

    const missingRequiredToken = requiredTokens.some((token) => !normalized.includes(token));
    const brokenQuestionMarks = (normalized.match(/\?/g) || []).length >= 3;
    const containsReplacementChar = normalized.includes('�') || normalized.includes('锟');
    const containsMojibakePattern = /浣犳槸|绠€|妯″|鍐呭|宀椾|涓€|銆|锛/.test(normalized);
    const containsChinese = /[\u4e00-\u9fff]/.test(normalized);

    if (missingRequiredToken || containsReplacementChar || containsMojibakePattern || brokenQuestionMarks || !containsChinese) {
      return fallback;
    }

    return normalized;
  }

  private toSafeString(value: string | undefined | null) {
    return String(value || '').trim();
  }
}
