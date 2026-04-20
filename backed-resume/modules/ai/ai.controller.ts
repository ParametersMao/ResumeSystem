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
import { AiGenerateDto, AiPolishDto } from '../../dto/ai-mock.dto';
import { SystemConfigService } from '../system-config/system-config.service';
import { AiRuntimeService } from './ai-runtime.service';

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
  ) {}

  @Post('ai/polish')
  @UseGuards(JwtAuthGuard)
  async polish(@Request() req, @Body() dto: AiPolishDto): Promise<ApiResponse<any>> {
    const userId = ensureCuser(req);
    const aiConfig = await this.systemConfigService.getAiConfig();
    if (!aiConfig.enabled) {
      throw new ForbiddenException('AI 功能已停用');
    }

    const output = await this.aiRuntimeService.polish(dto, aiConfig);

    await this.aiOps.create({
      userId,
      operationType: 'polish',
      inputData: dto.inputText,
      outputData: JSON.stringify(output),
      tokenUsed: output.tokenUsed,
    } as any);

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

    const output = await this.aiRuntimeService.generate(dto, aiConfig);

    await this.aiOps.create({
      userId,
      operationType: 'generate',
      inputData: JSON.stringify({
        jobTitle: dto.jobTitle,
        sectionType: dto.sectionType || 'general',
      }),
      outputData: JSON.stringify(output),
      tokenUsed: output.tokenUsed,
    } as any);

    return { code: 200, message: 'success', data: output };
  }
}
