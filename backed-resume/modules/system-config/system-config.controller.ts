import { Body, Controller, Get, Put, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../../common/interfaces/pagination.interface';
import { SystemConfigService } from './system-config.service';
import { PartialSystemConfigDto, SystemConfigDto } from '../../dto/system-config.dto';
import { AiConnectionTestDto, AiPromptPreviewDto } from '../../dto/ai-runtime.dto';
import { AiRuntimeService } from '../ai/ai-runtime.service';
import { AdminOnlyGuard, AdminRoles } from '../auth/admin-only.guard';

function ensureAdmin(req: any) {
  if (!req.user?.id) throw new UnauthorizedException('用户信息无效');
  if (req.user.type !== 'admin') throw new UnauthorizedException('无权访问');
  return req.user.id as number;
}

@Controller('api/admin/system-config')
@UseGuards(JwtAuthGuard, AdminOnlyGuard)
export class SystemConfigController {
  constructor(
    private readonly systemConfigService: SystemConfigService,
    private readonly aiRuntimeService: AiRuntimeService,
  ) {}

  @Get()
  async getConfig(@Request() req): Promise<ApiResponse<SystemConfigDto>> {
    ensureAdmin(req);
    const data = await this.systemConfigService.getPublicConfig();
    return {
      code: 200,
      message: 'success',
      data,
    };
  }

  @Put()
  @AdminRoles('admin')
  async updateConfig(@Request() req, @Body() payload: PartialSystemConfigDto): Promise<ApiResponse<SystemConfigDto>> {
    ensureAdmin(req);
    const data = await this.systemConfigService.updatePublicConfig(payload || {});
    return {
      code: 200,
      message: '保存成功',
      data,
    };
  }

  @Put('ai/preview')
  @AdminRoles('admin', 'operator')
  async previewAiPrompt(@Request() req, @Body() payload: AiPromptPreviewDto): Promise<ApiResponse<any>> {
    ensureAdmin(req);
    const aiConfig = await this.systemConfigService.getAiConfig();
    const data = this.aiRuntimeService.previewPrompt(payload.taskType, payload, aiConfig);
    return {
      code: 200,
      message: 'success',
      data,
    };
  }

  @Put('ai/test-connection')
  @AdminRoles('admin')
  async testAiConnection(@Request() req, @Body() payload: AiConnectionTestDto): Promise<ApiResponse<any>> {
    ensureAdmin(req);
    const current = await this.systemConfigService.getAiConfig();
    const mergedConfig = {
      ...current,
      ...(payload || {}),
      apiKey: String(payload?.apiKey || '').trim() || current.apiKey,
    };
    const data = await this.aiRuntimeService.testConnection(mergedConfig);
    return {
      code: 200,
      message: 'success',
      data,
    };
  }
}
