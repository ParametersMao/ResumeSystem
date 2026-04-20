import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AiGenerateDto, AiPolishDto } from '../../dto/ai-mock.dto';
import { AiConfigDto } from '../../dto/system-config.dto';

interface PolishSuggestion {
  reason: string;
  html: string;
}

type LiveExecutionMode = 'mock' | 'prepared' | 'live';
type PreviewExecutionMode = 'mock' | 'prepared';

interface OpenAiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAiChoice {
  message?: {
    content?: string | Array<{ type?: string; text?: string; [key: string]: any }>;
  };
}

interface OpenAiChatCompletionResponse {
  choices?: OpenAiChoice[];
  usage?: {
    total_tokens?: number;
  };
  error?: {
    message?: string;
  };
}

export interface AiPolishRuntimeResult {
  sectionType: string | null;
  suggestions: PolishSuggestion[];
  provider: string;
  model: string;
  tokenUsed: number;
  promptPreview: string;
  executionMode: LiveExecutionMode;
}

export interface AiGenerateRuntimeResult {
  sectionType: string | null;
  intention: string;
  summary: string;
  skills: string[];
  experiences: Array<Record<string, any>>;
  projects: Array<Record<string, any>>;
  provider: string;
  model: string;
  tokenUsed: number;
  promptPreview: string;
  executionMode: LiveExecutionMode;
}

export interface AiPromptPreviewResult {
  taskType: 'polish' | 'generate';
  provider: string;
  model: string;
  promptPreview: string;
  executionMode: PreviewExecutionMode;
  configReady: boolean;
}

export interface AiConnectionTestResult {
  provider: string;
  model: string;
  executionMode: LiveExecutionMode;
  configReady: boolean;
  success: boolean;
  status: 'mock' | 'incomplete' | 'success' | 'failed';
  message: string;
  endpoint?: string;
  responsePreview?: string;
}

@Injectable()
export class AiRuntimeService {
  async polish(dto: AiPolishDto, config: AiConfigDto): Promise<AiPolishRuntimeResult> {
    const inputText = this.toPlainText(dto.inputText);
    const promptPreview = this.renderPrompt(config.polishPromptTemplate, {
      input: inputText,
      sectionType: dto.sectionType || 'general',
      jobTitle: this.toPlainText(dto.jobTitle || '') || '目标岗位',
    });
    const executionMode = this.resolveExecutionMode(config, false);

    if (executionMode === 'live') {
      const liveResult = await this.callOpenAiCompatible<{
        suggestions?: Array<{ reason?: string; text?: string; html?: string; content?: string }>;
      }>({
        config,
        promptPreview,
        taskType: 'polish',
        fallbackErrorMessage: 'AI 润色服务返回结果异常',
      });

      const suggestions = (liveResult.payload.suggestions || [])
        .map((item) => this.normalizePolishSuggestion(item))
        .filter((item): item is PolishSuggestion => Boolean(item));

      if (!suggestions.length) {
        throw new BadGatewayException('AI 润色结果为空，请检查模型输出格式');
      }

      return {
        sectionType: dto.sectionType || null,
        suggestions,
        provider: config.provider,
        model: config.apiModel,
        tokenUsed: liveResult.tokenUsed,
        promptPreview,
        executionMode,
      };
    }

    const suggestions = this.buildPolishSuggestions(inputText, dto.sectionType || 'general', promptPreview, dto.jobTitle);
    return {
      sectionType: dto.sectionType || null,
      suggestions,
      provider: config.provider,
      model: config.apiModel,
      tokenUsed: Math.max(20, Math.min(inputText.length || 0, 800)),
      promptPreview,
      executionMode,
    };
  }

  async generate(dto: AiGenerateDto, config: AiConfigDto): Promise<AiGenerateRuntimeResult> {
    const jobTitle = this.toPlainText(dto.jobTitle) || '目标岗位';
    const sectionType = this.toPlainText(dto.sectionType || '') || 'general';
    const contextText = this.toPlainText(dto.contextText || '');
    const promptPreview = this.renderPrompt(config.generatePromptTemplate, {
      jobTitle,
      sectionType,
      contextText,
    });
    const executionMode = this.resolveExecutionMode(config, false);

    if (executionMode === 'live') {
      const liveResult = await this.callOpenAiCompatible<{
        sectionType?: string;
        intention?: string;
        summary?: string;
        skills?: string[];
        experiences?: Array<Record<string, any>>;
        projects?: Array<Record<string, any>>;
      }>({
        config,
        promptPreview,
        taskType: 'generate',
        fallbackErrorMessage: 'AI 生成功能返回结果异常',
      });

      return {
        sectionType: liveResult.payload.sectionType || sectionType,
        intention: this.toPlainText(liveResult.payload.intention || ''),
        summary: this.toPlainText(liveResult.payload.summary || ''),
        skills: Array.isArray(liveResult.payload.skills)
          ? liveResult.payload.skills.map((item) => this.toPlainText(String(item))).filter(Boolean)
          : [],
        experiences: Array.isArray(liveResult.payload.experiences) ? liveResult.payload.experiences : [],
        projects: Array.isArray(liveResult.payload.projects) ? liveResult.payload.projects : [],
        provider: config.provider,
        model: config.apiModel,
        tokenUsed: liveResult.tokenUsed,
        promptPreview,
        executionMode,
      };
    }

    const isProfessionalTone = /职业|专业|简洁|正式/.test(promptPreview);
    const inferred = this.inferGenerateSeed(sectionType, contextText, jobTitle);
    const generatedExperience = {
      company: inferred.organization || `${jobTitle}相关团队（示例）`,
      role: inferred.role || jobTitle,
      duration: { start: '2024-01', end: '2024-12' },
      desc: this.buildStarDescription({
        scenario: inferred.organization || `${jobTitle}相关团队`,
        action: `负责${jobTitle}方向的核心模块交付，联动产品、设计与后端推进需求落地`,
        result: inferred.keyword
          ? `围绕${inferred.keyword}持续优化关键流程，提升交付质量与协作效率`
          : '持续优化交付质量、协作效率与最终体验',
      }),
    };
    const generatedProject = {
      name: inferred.projectName || `${jobTitle}相关项目（示例）`,
      role: inferred.role || '核心开发',
      duration: { start: '2024-01', end: '2024-06' },
      desc: this.buildStarDescription({
        scenario: inferred.projectName || `${jobTitle}相关项目`,
        action: '负责核心模块开发、组件抽象与性能优化，推动可复用方案落地',
        result: inferred.keyword
          ? `围绕${inferred.keyword}持续优化关键体验与页面稳定性`
          : '提升交付效率、页面稳定性与整体体验一致性',
      }),
    };

    return {
      sectionType,
      intention: `${jobTitle}`,
      summary: isProfessionalTone
        ? `面向${jobTitle}岗位，具备扎实的专业基础与工程化能力，能够围绕业务目标独立推进需求交付，并通过结果导向的表达清晰呈现项目价值与个人贡献。`
        : `适配${jobTitle}岗位，具备完整的开发与协作能力，能够高质量完成需求落地，并持续优化效率、质量与用户体验。`,
      skills: [
        'Vue 3 / TypeScript',
        'Vite / Pinia',
        'HTML / CSS / JavaScript',
        '前端工程化与性能优化',
        '接口联调与问题排查',
      ],
      experiences: [generatedExperience],
      projects: [generatedProject],
      provider: config.provider,
      model: config.apiModel,
      tokenUsed: 300,
      promptPreview,
      executionMode,
    };
  }

  previewPrompt(
    taskType: 'polish' | 'generate',
    payload: { inputText?: string; sectionType?: string; jobTitle?: string },
    config: AiConfigDto,
  ): AiPromptPreviewResult {
    const promptPreview =
      taskType === 'polish'
        ? this.renderPrompt(config.polishPromptTemplate, {
            input: this.toPlainText(payload.inputText || ''),
            sectionType: payload.sectionType || 'general',
            jobTitle: this.toPlainText(payload.jobTitle || '') || '目标岗位',
          })
        : this.renderPrompt(config.generatePromptTemplate, {
            jobTitle: this.toPlainText(payload.jobTitle || '') || '目标岗位',
            sectionType: payload.sectionType || 'general',
            contextText: this.toPlainText(payload.inputText || ''),
          });

    return {
      taskType,
      provider: config.provider,
      model: config.apiModel,
      promptPreview,
      executionMode: this.resolveExecutionMode(config, true),
      configReady: this.isExternalConfigReady(config),
    };
  }

  async testConnection(config: AiConfigDto): Promise<AiConnectionTestResult> {
    const executionMode = this.resolveExecutionMode(config, false);
    const endpoint = config.provider === 'mock' ? '' : `${this.normalizeApiBaseUrl(config.apiBaseUrl)}/models`;

    if (config.provider === 'mock') {
      return {
        provider: config.provider,
        model: config.apiModel,
        executionMode,
        configReady: true,
        success: true,
        status: 'mock',
        message: '当前是 Mock 模式，无需外部连通性校验。',
      };
    }

    if (!this.isExternalConfigReady(config)) {
      return {
        provider: config.provider,
        model: config.apiModel,
        executionMode,
        configReady: false,
        success: false,
        status: 'incomplete',
        message: '外部 provider 配置未完成，请先补齐 API Base URL、API Key 和模型名称。',
        endpoint,
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
        signal: controller.signal,
      });

      const rawText = await response.text();
      const responsePreview = rawText.trim().slice(0, 300);

      if (response.ok) {
        return {
          provider: config.provider,
          model: config.apiModel,
          executionMode,
          configReady: true,
          success: true,
          status: 'success',
          message: '连接测试成功，当前 provider 已可正常访问。',
          endpoint,
          responsePreview,
        };
      }

      return {
        provider: config.provider,
        model: config.apiModel,
        executionMode,
        configReady: true,
        success: false,
        status: 'failed',
        message: `连接测试失败，状态码 ${response.status}。请检查 Base URL、API Key 或服务商兼容性。`,
        endpoint,
        responsePreview,
      };
    } catch (error: any) {
      const message =
        error?.name === 'AbortError'
          ? '连接测试超时，请检查网络环境或服务响应速度。'
          : `连接测试失败：${error?.message || '未知错误'}`;

      return {
        provider: config.provider,
        model: config.apiModel,
        executionMode,
        configReady: true,
        success: false,
        status: 'failed',
        message,
        endpoint,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private resolveExecutionMode(config: AiConfigDto, forPreview: true): PreviewExecutionMode;
  private resolveExecutionMode(config: AiConfigDto, forPreview: false): LiveExecutionMode;
  private resolveExecutionMode(config: AiConfigDto, forPreview: boolean): LiveExecutionMode | PreviewExecutionMode {
    if (config.provider === 'mock') {
      return 'mock';
    }

    if (!this.isExternalConfigReady(config)) {
      return 'prepared';
    }

    return forPreview ? 'prepared' : 'live';
  }

  private isExternalConfigReady(config: AiConfigDto) {
    if (config.provider === 'mock') return true;
    return Boolean(config.apiBaseUrl && config.apiKey && config.apiModel);
  }

  private renderPrompt(template: string, variables: Record<string, string>) {
    return String(template || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => variables[key] ?? '');
  }

  private toPlainText(value: string) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  private escapeHtml(value: string) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private splitBulletLines(text: string) {
    return text
      .split(/[。！？；;.!?\n]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  private buildPolishSuggestions(
    input: string,
    sectionType: string,
    promptPreview: string,
    jobTitle?: string,
  ): PolishSuggestion[] {
    const base = this.toPlainText(input);
    if (!base) return [];

    const targetJobTitle = this.toPlainText(jobTitle || '');
    const conciseBase = base.length > 90 ? `${base.slice(0, 88)}...` : base;
    const concise = targetJobTitle ? `面向${targetJobTitle}岗位，${conciseBase}` : conciseBase;
    const actionSentence = /^(负责|主导|参与|推动|完成|搭建|优化|设计|开发)/.test(base)
      ? base
      : `负责${base}`;
    const bullets = this.splitBulletLines(base);
    const bulletHtml =
      bullets.length > 0
        ? `<ul>${bullets.map((item) => `<li>${this.escapeHtml(item)}</li>`).join('')}</ul>`
        : `<p>${this.escapeHtml(base)}</p>`;
    const focusLabel = /结果|量化|成果/.test(promptPreview) ? '结果导向' : '专业表达';
    const sectionLabelMap: Record<string, string> = {
      summary: '自我评价',
      intention: '求职意向',
      experience: '工作经验',
      projects: '项目经历',
    };
    const sectionLabel = sectionLabelMap[sectionType] || '当前模块';

    return [
      {
        reason: `精简${sectionLabel}内容，优先突出岗位关键词和结果信息。`,
        html: `<p><strong>精简版：</strong>${this.escapeHtml(concise)}</p>`,
      },
      {
        reason: `强化行动和${focusLabel}，更适合简历中的经历描述。`,
        html: `<p><strong>行动-结果版：</strong>${this.escapeHtml(
          actionSentence,
        )}，并持续推动关键事项落地，提升交付质量与协作效率。</p>`,
      },
      {
        reason: '改成要点式呈现，便于招聘方快速扫读。',
        html: `<div><strong>要点版：</strong>${bulletHtml}</div>`,
      },
    ];
  }

  private normalizePolishSuggestion(item: { reason?: string; text?: string; html?: string; content?: string }) {
    const reason = this.toPlainText(item.reason || '');
    const html = this.normalizeSuggestionHtml(item);
    if (!reason || !html) {
      return null;
    }

    return {
      reason,
      html,
    };
  }

  private normalizeSuggestionHtml(item: { text?: string; html?: string; content?: string }) {
    if (item.html && String(item.html).trim()) {
      return String(item.html).trim();
    }

    const text = this.toPlainText(item.text || item.content || '');
    if (!text) {
      return '';
    }

    return `<p>${this.escapeHtml(text)}</p>`;
  }

  private async callOpenAiCompatible<T>({
    config,
    promptPreview,
    taskType,
    fallbackErrorMessage,
  }: {
    config: AiConfigDto;
    promptPreview: string;
    taskType: 'polish' | 'generate';
    fallbackErrorMessage: string;
  }): Promise<{ payload: T; tokenUsed: number }> {
    if (!this.isExternalConfigReady(config)) {
      throw new ServiceUnavailableException('当前 AI 外部 provider 配置未完成，暂时无法发起真实调用');
    }

    const endpoint = `${this.normalizeApiBaseUrl(config.apiBaseUrl)}/chat/completions`;
    const messages = this.buildMessages(taskType, promptPreview);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.apiModel,
          temperature: config.temperature,
          messages,
        }),
        signal: controller.signal,
      });

      const json = (await response.json().catch(() => ({}))) as OpenAiChatCompletionResponse;
      if (!response.ok) {
        const message = json?.error?.message || `AI 服务调用失败，状态码 ${response.status}`;
        throw new BadGatewayException(message);
      }

      const content = this.extractMessageContent(json);
      const payload = this.parseJsonPayload<T>(content, fallbackErrorMessage);

      return {
        payload,
        tokenUsed: Number(json?.usage?.total_tokens || 0),
      };
    } catch (error: any) {
      if (error instanceof BadGatewayException || error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (error?.name === 'AbortError') {
        throw new BadGatewayException('AI 服务调用超时，请稍后重试');
      }

      throw new BadGatewayException(error?.message || fallbackErrorMessage);
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildMessages(taskType: 'polish' | 'generate', promptPreview: string): OpenAiMessage[] {
    const formatInstruction =
      taskType === 'polish'
        ? [
            '你是专业简历优化助手。',
            '请仅返回 JSON，不要添加 Markdown 代码块。',
            'JSON 结构必须为：{"suggestions":[{"reason":"...","text":"..."},{"reason":"...","text":"..."}]}。',
            'suggestions 至少返回 2 条，reason 要简短明确，text 直接给可替换到简历里的中文内容。',
          ].join('\n')
        : [
            '你是专业简历生成助手。',
            '请仅返回 JSON，不要添加 Markdown 代码块。',
            'JSON 结构必须为：{"sectionType":"...","intention":"...","summary":"...","skills":["..."],"experiences":[{"company":"...","role":"...","duration":{"start":"YYYY-MM","end":"YYYY-MM"},"desc":"..."}],"projects":[{"name":"...","role":"...","duration":{"start":"YYYY-MM","end":"YYYY-MM"},"desc":"..."}]}。',
            'summary 要像可直接放进自我评价的中文初稿，intention 直接返回求职意向，skills 至少 4 项，experiences 和 projects 至少各 1 项。',
            '如果用户已经提供部分关键词、项目名、公司名、角色或时间，请优先沿用这些已知信息补全剩余字段，不要随意改写已有事实。',
            '经历和项目描述优先采用成果导向表达，尽量体现场景、动作和结果，可参考 STAR 思路，但不要机械写成字母缩写。',
          ].join('\n');

    return [
      {
        role: 'system',
        content: formatInstruction,
      },
      {
        role: 'user',
        content: promptPreview,
      },
    ];
  }

  private normalizeApiBaseUrl(baseUrl: string) {
    return String(baseUrl || '').replace(/\/+$/, '');
  }

  private inferGenerateSeed(sectionType: string, contextText: string, jobTitle: string) {
    const text = this.toPlainText(contextText);
    const lines = text
      .split(/[|\n]/)
      .map((item) => item.trim())
      .filter(Boolean);

    const projectName = this.extractSeedValue(lines, ['项目名称', '项目', '名称']) || '';
    const organization = this.extractSeedValue(lines, ['公司名称', '公司', '组织', '机构']) || '';
    const role = this.extractSeedValue(lines, ['角色', '岗位', '职位']) || jobTitle;
    const keyword = this.extractSeedValue(lines, ['关键词', '补充', '方向']) || lines[0] || '';

    return {
      projectName,
      organization,
      role,
      keyword: projectName || organization || keyword,
      sectionType,
    };
  }

  private buildStarDescription({
    scenario,
    action,
    result,
  }: {
    scenario: string;
    action: string;
    result: string;
  }) {
    const cleanedScenario = this.toPlainText(scenario || '相关业务场景');
    const cleanedAction = this.toPlainText(action);
    const cleanedResult = this.toPlainText(result);

    return `围绕${cleanedScenario}的关键需求，${cleanedAction}，并${cleanedResult}。`;
  }

  private extractSeedValue(lines: string[], labels: string[]) {
    for (const line of lines) {
      const matchedLabel = labels.find((label) => line.startsWith(`${label}：`) || line.startsWith(`${label}:`));
      if (matchedLabel) {
        return line.replace(new RegExp(`^${matchedLabel}[：:]\\s*`), '').trim();
      }
    }

    return '';
  }

  private extractMessageContent(response: OpenAiChatCompletionResponse) {
    const firstChoice = response?.choices?.[0];
    const content = firstChoice?.message?.content;
    if (typeof content === 'string' && content.trim()) {
      return content.trim();
    }

    if (Array.isArray(content)) {
      const merged = content
        .map((part) => {
          if (typeof part?.text === 'string') {
            return part.text;
          }
          return '';
        })
        .join('\n')
        .trim();

      if (merged) {
        return merged;
      }
    }

    throw new BadGatewayException('AI 服务未返回可解析的内容');
  }

  private parseJsonPayload<T>(rawContent: string, fallbackErrorMessage: string): T {
    const normalized = rawContent.trim();
    const candidates = [
      normalized,
      normalized.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim(),
    ];

    for (const candidate of candidates) {
      if (!candidate) {
        continue;
      }

      try {
        return JSON.parse(candidate) as T;
      } catch {
        const firstBrace = candidate.indexOf('{');
        const lastBrace = candidate.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
          try {
            return JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as T;
          } catch {
            // Try next candidate.
          }
        }
      }
    }

    throw new BadGatewayException(fallbackErrorMessage);
  }
}
