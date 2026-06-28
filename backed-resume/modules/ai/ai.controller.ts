import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../../common/interfaces/pagination.interface';
import { AiOperationsService } from '../ai-operations/ai-operations.service';
import { AiDiagnoseDto, AiGenerateDto, AiPolishDto } from '../../dto/ai-mock.dto';
import { SystemConfigService } from '../system-config/system-config.service';
import { AiRuntimeService } from './ai-runtime.service';
import { AiAgentClientService } from './ai-agent-client.service';
import { EntitlementsService } from '../entitlements/entitlements.service';

function ensureCuser(req: any) {
  if (!req.user?.id) throw new UnauthorizedException('用户信息无效');
  if (req.user.type !== 'cuser') throw new UnauthorizedException('无权访问');
  return req.user.id as number;
}

@Controller('api')
export class AiController {
  constructor(
    private readonly aiOps: AiOperationsService,
    private readonly systemConfigService: SystemConfigService,
    private readonly aiRuntimeService: AiRuntimeService,
    private readonly aiAgentClientService: AiAgentClientService,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  @Post('ai/polish')
  @UseGuards(JwtAuthGuard)
  async polish(@Request() req, @Body() dto: AiPolishDto): Promise<ApiResponse<any>> {
    const userId = ensureCuser(req);
    const aiConfig = await this.systemConfigService.getAiConfig();
    if (!aiConfig.enabled) {
      throw new ForbiddenException('AI 功能已停用');
    }

    const useAgent = aiConfig.executionEngine === 'agent';
    const output = await this.withAiQuota(userId, this.shouldCharge(aiConfig), async () => {
      const result = useAgent
        ? await this.aiAgentClientService.polish(dto, userId, aiConfig)
        : await this.aiRuntimeService.polish(dto, aiConfig);

      await this.aiOps.create({
        userId,
        operationType: useAgent ? 'agent-polish' : 'polish',
        inputData: JSON.stringify({
          sectionType: dto.sectionType || 'general',
          jobTitle: dto.jobTitle || '',
          inputLength: this.contentLength(dto.inputText),
        }),
        outputData: JSON.stringify(this.buildAuditOutput(result)),
        tokenUsed: result.tokenUsed,
      } as any);
      return result;
    });

    return { code: 200, message: 'success', data: output };
  }

  @Post('ai/generate')
  @UseGuards(JwtAuthGuard)
  async generate(@Request() req, @Body() dto: AiGenerateDto): Promise<ApiResponse<any>> {
    const userId = ensureCuser(req);
    const aiConfig = await this.systemConfigService.getAiConfig();
    if (!aiConfig.enabled) {
      throw new ForbiddenException('AI 功能已停用');
    }

    const useAgent = aiConfig.executionEngine === 'agent';
    const output = await this.withAiQuota(userId, this.shouldCharge(aiConfig), async () => {
      const result = useAgent
        ? await this.aiAgentClientService.generate(dto, userId, aiConfig)
        : await this.aiRuntimeService.generate(dto, aiConfig);

      await this.aiOps.create({
        userId,
        operationType: useAgent ? 'agent-generate' : 'generate',
        inputData: JSON.stringify({
          jobTitle: dto.jobTitle,
          sectionType: dto.sectionType || 'general',
          contextLength: this.contentLength(dto.contextText),
        }),
        outputData: JSON.stringify(this.buildAuditOutput(result)),
        tokenUsed: result.tokenUsed,
      } as any);
      return result;
    });

    return { code: 200, message: 'success', data: output };
  }

  @Post('ai/diagnose')
  @UseGuards(JwtAuthGuard)
  async diagnose(@Request() req, @Body() dto: AiDiagnoseDto): Promise<ApiResponse<any>> {
    const userId = ensureCuser(req);
    const aiConfig = await this.systemConfigService.getAiConfig();
    if (!aiConfig.enabled) {
      throw new ForbiddenException('AI 功能已停用');
    }

    const useAgent = aiConfig.executionEngine === 'agent';
    const output = await this.withAiQuota(userId, this.shouldCharge(aiConfig), async () => {
      const result = useAgent
        ? await this.aiAgentClientService.diagnose(dto, userId, aiConfig)
        : await this.aiRuntimeService.diagnose(dto, aiConfig);

      await this.aiOps.create({
        userId,
        operationType: useAgent ? 'agent-diagnose' : 'diagnose',
        inputData: JSON.stringify({
          resumeId: dto.resumeId,
          jobTitle: dto.jobTitle,
          sectionType: dto.sectionType || 'general',
          templateVariant: dto.templateVariant,
          contentLength: this.contentLength(dto.selectedText || dto.contentText || dto.content),
          hasUserInstruction: Boolean(dto.userInstruction),
        }),
        outputData: JSON.stringify(this.buildAuditOutput(result)),
        tokenUsed: result.tokenUsed,
      } as any);
      return result;
    });

    return { code: 200, message: 'success', data: output };
  }

  private async withAiQuota<T>(
    userId: number,
    shouldCharge: boolean,
    operation: () => Promise<T>,
  ): Promise<T> {
    if (!shouldCharge) {
      return operation();
    }

    await this.entitlementsService.consumeAi(userId);
    try {
      return await operation();
    } catch (error) {
      await this.entitlementsService.refundAi(userId);
      throw error;
    }
  }

  private shouldCharge(config: {
    provider?: string;
    apiBaseUrl?: string;
    apiKey?: string;
    apiModel?: string;
  }) {
    return Boolean(
      config.provider &&
        config.provider !== 'mock' &&
        config.apiBaseUrl &&
        config.apiKey &&
        config.apiModel,
    );
  }

  private contentLength(value: unknown) {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === 'string') {
      return value.length;
    }

    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  private buildAuditOutput(result: any) {
    return {
      taskType: result?.taskType || null,
      executionMode: result?.executionMode || null,
      provider: result?.provider || null,
      model: result?.model || null,
      tokenUsed: Number(result?.tokenUsed || 0),
      suggestionCount: Array.isArray(result?.suggestions) ? result.suggestions.length : 0,
      diagnosticCount: Array.isArray(result?.diagnostics) ? result.diagnostics.length : 0,
      strategyCount: Array.isArray(result?.strategy) ? result.strategy.length : 0,
      warningCount: Array.isArray(result?.warnings) ? result.warnings.length : 0,
      skillCount: Array.isArray(result?.skills) ? result.skills.length : 0,
      experienceCount: Array.isArray(result?.experiences) ? result.experiences.length : 0,
      projectCount: Array.isArray(result?.projects) ? result.projects.length : 0,
    };
  }
}
