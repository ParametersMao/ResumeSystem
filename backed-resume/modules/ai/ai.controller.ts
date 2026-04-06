import { Body, Controller, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../../common/interfaces/pagination.interface';
import { AiOperationsService } from '../ai-operations/ai-operations.service';
import { AiGenerateDto, AiPolishDto } from '../../dto/ai-mock.dto';

function ensureCuser(req: any) {
  if (!req.user?.id) throw new UnauthorizedException('用户信息无效');
  if (req.user.type !== 'cuser') throw new UnauthorizedException('无权限');
  return req.user.id as number;
}

function buildPolishSuggestions(input: string): { html: string; reason: string }[] {
  const base = String(input || '').replace(/\n/g, ' ').trim();
  const t = base.length > 180 ? `${base.slice(0, 180)}…` : base;
  if (!t) return [];
  return [
    {
      reason: '精简表达，突出关键词与结果',
      html: `【精简版】${t}`,
    },
    {
      reason: '强调行动与量化影响，提升可读性',
      html: `【行动-影响】通过…（行动），实现…（影响）。${t}`,
    },
    {
      reason: '改为要点式描述，更适合简历快速扫读',
      html: `【要点列举】<ul><li>${t.slice(0, 36)}</li><li>${t.slice(36, 72)}</li><li>${t.slice(72, 108)}</li></ul>`,
    },
  ];
}

function buildGenerate(jobTitle: string) {
  const title = String(jobTitle || '').trim() || '目标岗位';
  const skills = [
    'Vue3 / TypeScript',
    'Vite / Pinia',
    'HTML / CSS / JavaScript',
    '性能优化与工程化',
    '接口联调与问题排查',
  ];
  const summary = `面向${title}岗位，具备扎实的前端基础与工程化能力，能够独立推进需求交付与质量保障，注重可维护性与用户体验。`;
  const projects = [
    {
      name: `${title}相关项目（示例）`,
      role: '核心开发',
      duration: { start: '2024-01', end: '2024-06' },
      desc: '负责核心模块开发、组件抽象与性能优化；沉淀可复用方案并提升交付效率。',
    },
  ];
  return { summary, skills, projects };
}

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiOps: AiOperationsService) {}

  @Post('polish')
  @UseGuards(JwtAuthGuard)
  async polish(@Request() req, @Body() dto: AiPolishDto): Promise<ApiResponse<any>> {
    const userId = ensureCuser(req);
    const suggestions = buildPolishSuggestions(dto.inputText);
    const output = {
      sectionType: dto.sectionType || null,
      suggestions,
    };
    const tokenUsed = Math.max(20, Math.min(dto.inputText?.length || 0, 800));

    await this.aiOps.create({
      userId,
      operationType: 'polish',
      inputData: dto.inputText,
      outputData: JSON.stringify(output),
      tokenUsed,
    } as any);

    return { code: 200, message: 'success', data: { ...output, tokenUsed } };
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(@Request() req, @Body() dto: AiGenerateDto): Promise<ApiResponse<any>> {
    const userId = ensureCuser(req);
    const output = buildGenerate(dto.jobTitle);
    const tokenUsed = 300;

    await this.aiOps.create({
      userId,
      operationType: 'generate',
      inputData: dto.jobTitle,
      outputData: JSON.stringify(output),
      tokenUsed,
    } as any);

    return { code: 200, message: 'success', data: { ...output, tokenUsed } };
  }
}

