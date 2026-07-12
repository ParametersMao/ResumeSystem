import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AiDiagnoseDto, AiGenerateDto, AiPolishDto } from '../../dto/ai-mock.dto';
import { AiConfigDto } from '../../dto/system-config.dto';

type AgentTaskType = 'diagnose' | 'polish' | 'generate';

interface AgentRequestContext {
  resume_id?: string;
  user_id: number;
  section_type?: string;
  job_title?: string;
  template_variant?: string;
  content?: Record<string, any> | string;
  selected_text?: string;
  user_instruction?: string;
}

interface AgentRawResponse {
  task_type?: string;
  execution_mode?: string;
  provider?: string;
  model?: string;
  steps?: Array<Record<string, any>>;
  suggestions?: Array<Record<string, any>>;
  diagnostics?: string[];
  patch?: Record<string, any>;
  sources?: Array<Record<string, any>>;
  token_used?: number;
}

export interface AiAgentRuntimeResult {
  taskType: AgentTaskType;
  executionMode: string;
  provider: string;
  model: string;
  steps: Array<Record<string, any>>;
  suggestions: Array<Record<string, any>>;
  diagnostics: string[];
  patch: Record<string, any>;
  sources: Array<Record<string, any>>;
  tokenUsed: number;
}

@Injectable()
export class AiAgentClientService {
  async diagnose(dto: AiDiagnoseDto, userId: number, config: AiConfigDto): Promise<AiAgentRuntimeResult> {
    return this.callAgent('diagnose', this.buildDiagnoseContext(dto, userId), config);
  }

  async polish(dto: AiPolishDto, userId: number, config: AiConfigDto): Promise<AiAgentRuntimeResult> {
    return this.callAgent(
      'polish',
      {
        user_id: userId,
        section_type: dto.sectionType || 'general',
        job_title: dto.jobTitle || '目标岗位',
        selected_text: dto.inputText,
      },
      config,
    );
  }

  async generate(dto: AiGenerateDto, userId: number, config: AiConfigDto): Promise<AiAgentRuntimeResult> {
    return this.callAgent(
      'generate',
      {
        user_id: userId,
        section_type: dto.sectionType || 'general',
        job_title: dto.jobTitle || '目标岗位',
        content: dto.contextText || '',
      },
      config,
    );
  }

  private buildDiagnoseContext(dto: AiDiagnoseDto, userId: number): AgentRequestContext {
    return {
      resume_id: dto.resumeId,
      user_id: userId,
      section_type: dto.sectionType || 'general',
      job_title: dto.jobTitle || '目标岗位',
      template_variant: dto.templateVariant || 'classic',
      content: dto.content || dto.contentText || '',
      selected_text: dto.selectedText,
      user_instruction: dto.userInstruction,
    };
  }

  private async callAgent(
    taskType: AgentTaskType,
    context: AgentRequestContext,
    config: AiConfigDto,
  ): Promise<AiAgentRuntimeResult> {
    const baseUrl = this.resolveAgentBaseUrl(config);
    const endpoint = `${baseUrl}/agent/${taskType}`;
    const controller = new AbortController();
    const timeoutMs = Math.min(300_000, Math.max(30_000, Number(process.env.AGENT_REQUEST_TIMEOUT_MS || 150_000)));
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Agent-Secret': this.resolveAgentSecret(),
        },
        body: JSON.stringify({
          task_type: taskType,
          context,
          options: this.buildAgentOptions(config),
        }),
        signal: controller.signal,
      });

      const raw = (await response.json().catch(() => ({}))) as AgentRawResponse & { detail?: string };
      if (!response.ok) {
        throw new BadGatewayException(raw?.detail || `Agent 服务调用失败，状态码 ${response.status}`);
      }

      return this.normalizeAgentResponse(taskType, raw);
    } catch (error: any) {
      if (error instanceof BadGatewayException || error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (error?.name === 'AbortError') {
        throw new BadGatewayException('Agent 服务调用超时，请稍后重试');
      }

      throw new BadGatewayException(`Agent 服务调用失败：${error?.message || '未知错误'}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  private resolveAgentBaseUrl(config: AiConfigDto) {
    const configuredUrl = config.agentBaseUrl || process.env.AGENT_SERVICE_URL;
    const baseUrl = String(configuredUrl || '').trim().replace(/\/+$/, '');

    if (!baseUrl) {
      throw new ServiceUnavailableException('Agent 服务地址未配置，请先在后台 AI 配置中心选择 LangGraph Agent 或配置 AGENT_SERVICE_URL');
    }

    return baseUrl;
  }

  private buildAgentOptions(config: AiConfigDto) {
    return {
      source: 'resume-system',
      provider: config.provider || 'mock',
      api_base_url: config.apiBaseUrl || '',
      api_key: config.apiKey || '',
      model: config.apiModel || '',
      temperature: config.temperature,
      strict_sources: String(process.env.RAG_STRICT_SOURCES || 'false').toLowerCase() === 'true',
      execution_mode:
        config.provider !== 'mock' && config.apiBaseUrl && config.apiKey && config.apiModel
          ? 'live'
          : process.env.AGENT_EXECUTION_MODE || 'mock',
    };
  }

  private resolveAgentSecret() {
    const secret = String(process.env.AGENT_INTERNAL_SECRET || '').trim();
    if (!secret) {
      throw new ServiceUnavailableException('Agent 内部鉴权密钥未配置');
    }
    return secret;
  }

  private normalizeAgentResponse(taskType: AgentTaskType, raw: AgentRawResponse): AiAgentRuntimeResult {
    return {
      taskType,
      executionMode: raw.execution_mode || 'mock',
      provider: raw.provider || 'langgraph-agent',
      model: raw.model || 'resume-agent',
      steps: Array.isArray(raw.steps) ? raw.steps : [],
      suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : [],
      diagnostics: Array.isArray(raw.diagnostics) ? raw.diagnostics : [],
      patch: raw.patch && typeof raw.patch === 'object' ? raw.patch : {},
      sources: Array.isArray(raw.sources) ? raw.sources : [],
      tokenUsed: Number(raw.token_used || 0),
    };
  }
}
