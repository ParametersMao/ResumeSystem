import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../../entities/system-config.entity';
import { AiConfigDto, PartialSystemConfigDto, SystemConfigDto } from '../../dto/system-config.dto';
import {
  decryptConfigSecret,
  encryptConfigSecret,
  isEncryptedConfigSecret,
} from '../../src/security/config-secret.crypto';

const GLOBAL_CONFIG_KEY = 'global';

const DEFAULT_POLISH_PROMPT_TEMPLATE =
  '你是一名专业简历顾问。请基于目标岗位 {{jobTitle}} 和模块类型 {{sectionType}}，对下面的简历内容进行润色，输出更适合求职简历的版本：\n{{input}}';

const DEFAULT_GENERATE_PROMPT_TEMPLATE =
  [
    '你是一名专业简历顾问。请围绕目标岗位 {{jobTitle}} 和模块类型 {{sectionType}} 生成简历内容初稿。',
    '用户已提供的信息如下：',
    '{{contextText}}',
    '要求：',
    '1. 只能基于用户已提供的信息进行改写、归纳和适度补全表达，不得编造公司、学校、项目名、时间、证书、人数、金额、性能指标或百分比。',
    '2. 技能关键词优先从用户已提供的信息中提取；上下文没有出现的具体技术栈不要主动加入。',
    '3. 如果经历、项目或时间信息不足，对应数组可以返回空数组，或用“待补充”标记缺失字段。',
    '4. 输出内容要简洁、职业，可直接作为简历草稿继续编辑。',
  ].join('\n');

const LEGACY_DEFAULT_GENERATE_PROMPT_TEMPLATE =
  '你是一名专业简历顾问。请围绕目标岗位 {{jobTitle}} 生成简历摘要、技能关键词与项目示例，输出内容要简洁、职业，并可直接用于简历。';

const AI_PROVIDER_PRESETS: Record<string, { apiBaseUrl?: string; apiModel?: string }> = {
  mock: {
    apiModel: 'mock-resume-polish',
  },
  openai: {
    apiBaseUrl: 'https://api.openai.com/v1',
    apiModel: 'gpt-4.1-mini',
  },
  'openai-compatible': {
    apiBaseUrl: 'https://api.openai.com/v1',
    apiModel: 'gpt-4.1-mini',
  },
  deepseek: {
    apiBaseUrl: 'https://api.deepseek.com',
    apiModel: 'deepseek-v4-pro',
  },
  qwen: {
    apiBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiModel: 'qwen-plus',
  },
  glm: {
    apiBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiModel: 'glm-4-flash',
  },
  moonshot: {
    apiBaseUrl: 'https://api.moonshot.cn/v1',
    apiModel: 'moonshot-v1-8k',
  },
  doubao: {
    apiBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    apiModel: 'doubao-seed-1-6-250615',
  },
  'langgraph-agent': {
    apiBaseUrl: 'http://agent:8000',
    apiModel: 'resume-agent',
  },
};

const ENV_AI_PROVIDER = process.env.AI_PROVIDER || 'mock';
const ENV_AI_ENABLED = String(process.env.AI_ENABLED ?? 'true').toLowerCase() !== 'false';
const ENV_AI_BASE_URL =
  process.env.OPENAI_API_URL || (ENV_AI_PROVIDER === 'langgraph-agent' ? process.env.AGENT_SERVICE_URL || '' : '');
const ENV_AI_MODEL = process.env.OPENAI_MODEL || AI_PROVIDER_PRESETS[ENV_AI_PROVIDER]?.apiModel || 'mock-resume-polish';

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
    enabled: ENV_AI_ENABLED,
    executionEngine: process.env.AI_EXECUTION_ENGINE === 'agent' ? 'agent' : 'direct',
    agentBaseUrl: process.env.AGENT_SERVICE_URL || 'http://agent:8000',
    provider: ENV_AI_PROVIDER,
    apiBaseUrl: ENV_AI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY || '',
    apiModel: ENV_AI_MODEL,
    temperature: 0.7,
    dailyLimit: 500,
    perUserLimit: 20,
    polishPromptTemplate: DEFAULT_POLISH_PROMPT_TEMPLATE,
    generatePromptTemplate: DEFAULT_GENERATE_PROMPT_TEMPLATE,
  },
};

@Injectable()
export class SystemConfigService implements OnModuleInit {
  private ensureTablePromise: Promise<void> | null = null;

  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
  ) {}

  async onModuleInit() {
    await this.ensureTable();
    const record = await this.systemConfigRepository.findOne({
      where: { configKey: GLOBAL_CONFIG_KEY },
    });
    if (!record) return;
    let raw: any;
    try {
      raw = JSON.parse(record.configData || '{}');
    } catch {
      return;
    }
    const legacySecretPresent =
      (Boolean(raw?.email?.smtpPass) && !isEncryptedConfigSecret(raw.email.smtpPass)) ||
      (Boolean(raw?.ai?.apiKey) && !isEncryptedConfigSecret(raw.ai.apiKey));
    if (!legacySecretPresent) return;

    const config = this.mergeWithDefault(this.parseConfigData(record.configData));
    record.configData = this.serializeConfigForStorage(config);
    await this.systemConfigRepository.save(record);
  }

  async getConfig(): Promise<SystemConfigDto> {
    await this.ensureTable();
    const record = await this.systemConfigRepository.findOne({
      where: { configKey: GLOBAL_CONFIG_KEY },
    });

    if (!record) {
      const created = this.systemConfigRepository.create({
        configKey: GLOBAL_CONFIG_KEY,
        configData: this.serializeConfigForStorage(DEFAULT_SYSTEM_CONFIG),
      });
      await this.systemConfigRepository.save(created);
      return this.cloneDefaultConfig();
    }

    return this.mergeWithDefault(this.parseConfigData(record.configData));
  }

  async updateConfig(payload: PartialSystemConfigDto): Promise<SystemConfigDto> {
    await this.ensureTable();
    const current = await this.getConfig();
    const next = this.normalizeConfig(
      this.mergeConfig(current, this.preserveSensitiveConfig(current, payload)),
    );

    const existing = await this.systemConfigRepository.findOne({
      where: { configKey: GLOBAL_CONFIG_KEY },
    });

    if (existing) {
      existing.configData = this.serializeConfigForStorage(next);
      await this.systemConfigRepository.save(existing);
    } else {
      const created = this.systemConfigRepository.create({
        configKey: GLOBAL_CONFIG_KEY,
        configData: this.serializeConfigForStorage(next),
      });
      await this.systemConfigRepository.save(created);
    }

    return next;
  }

  async getPublicConfig(): Promise<SystemConfigDto> {
    return this.maskSensitiveConfig(await this.getConfig());
  }

  async updatePublicConfig(payload: PartialSystemConfigDto): Promise<SystemConfigDto> {
    return this.maskSensitiveConfig(await this.updateConfig(payload));
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
      const parsed = JSON.parse(value || '{}') as Partial<SystemConfigDto>;
      if (parsed.email) {
        parsed.email.smtpPass = decryptConfigSecret(
          parsed.email.smtpPass,
          'email.smtpPass',
        ).value;
      }
      if (parsed.ai) {
        parsed.ai.apiKey = decryptConfigSecret(parsed.ai.apiKey, 'ai.apiKey').value;
      }
      return parsed;
    } catch (error) {
      // Invalid JSON remains backward-compatible with the old empty-config fallback,
      // but authentication/key failures must be visible rather than silently erasing secrets.
      try {
        JSON.parse(value || '{}');
      } catch {
        return {};
      }
      throw error;
    }
  }

  private serializeConfigForStorage(config: SystemConfigDto): string {
    const stored: SystemConfigDto = JSON.parse(JSON.stringify(config));
    stored.email.smtpPass = encryptConfigSecret(stored.email.smtpPass, 'email.smtpPass');
    stored.ai.apiKey = encryptConfigSecret(stored.ai.apiKey, 'ai.apiKey');
    delete stored.email.smtpPassConfigured;
    delete stored.ai.apiKeyConfigured;
    return JSON.stringify(stored);
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

  private preserveSensitiveConfig(
    current: SystemConfigDto,
    payload: PartialSystemConfigDto,
  ): PartialSystemConfigDto {
    return {
      ...payload,
      email: payload.email
        ? {
            ...payload.email,
            smtpPass:
              this.toSafeString(payload.email.smtpPass) ||
              current.email.smtpPass,
          }
        : undefined,
      ai: payload.ai
        ? {
            ...payload.ai,
            apiKey:
              this.toSafeString(payload.ai.apiKey) ||
              current.ai.apiKey,
          }
        : undefined,
    };
  }

  private maskSensitiveConfig(config: SystemConfigDto): SystemConfigDto {
    return {
      ...config,
      email: {
        ...config.email,
        smtpPass: '',
        smtpPassConfigured: Boolean(config.email.smtpPass),
      },
      ai: {
        ...config.ai,
        apiKey: '',
        apiKeyConfigured: Boolean(config.ai.apiKey),
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
    const legacyAgentProvider = this.toSafeString(ai?.provider) === 'langgraph-agent';
    const environmentProvider = ENV_AI_PROVIDER === 'langgraph-agent' ? 'mock' : ENV_AI_PROVIDER;
    const provider = legacyAgentProvider ? environmentProvider || 'mock' : this.toSafeString(ai?.provider) || 'mock';
    const preset = AI_PROVIDER_PRESETS[provider] || {};
    const apiBaseUrl = this.toSafeString(ai?.apiBaseUrl) || preset.apiBaseUrl || '';
    const apiModel = this.toSafeString(ai?.apiModel) || preset.apiModel || 'mock-resume-polish';

    return {
      ...ai,
      executionEngine: legacyAgentProvider || ai?.executionEngine === 'agent' ? 'agent' : 'direct',
      agentBaseUrl: this.toSafeString(ai?.agentBaseUrl) || process.env.AGENT_SERVICE_URL || 'http://agent:8000',
      provider,
      apiBaseUrl,
      apiKey: this.toSafeString(ai?.apiKey),
      apiModel,
      polishPromptTemplate: this.normalizePromptTemplate(
        ai?.polishPromptTemplate,
        DEFAULT_POLISH_PROMPT_TEMPLATE,
        ['{{sectionType}}', '{{input}}', '{{jobTitle}}'],
      ),
      generatePromptTemplate: this.normalizePromptTemplate(
        ai?.generatePromptTemplate,
        DEFAULT_GENERATE_PROMPT_TEMPLATE,
        ['{{jobTitle}}'],
        [LEGACY_DEFAULT_GENERATE_PROMPT_TEMPLATE],
      ),
    };
  }

  private normalizePromptTemplate(
    value: string,
    fallback: string,
    requiredTokens: string[],
    deprecatedTemplates: string[] = [],
  ) {
    const normalized = this.toSafeString(value);
    if (!normalized) {
      return fallback;
    }
    if (deprecatedTemplates.includes(normalized)) {
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
