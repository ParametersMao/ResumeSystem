import { BadRequestException, Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { StatisticsService } from './statistics.service';
import { ApiResponse } from '../../common/interfaces/pagination.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminOnlyGuard, AdminRoles } from '../auth/admin-only.guard';

@Controller('api/statistics')
@UseGuards(JwtAuthGuard, AdminOnlyGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  async getOverview(): Promise<ApiResponse<any>> {
    const overview = await this.statisticsService.getOverview();
    return {
      code: 200,
      message: 'success',
      data: overview,
    };
  }

  @Get('trend')
  async getTrend(@Query('period') period: string = 'day'): Promise<ApiResponse<any>> {
    const trend = await this.statisticsService.getTrendData(period);
    return {
      code: 200,
      message: 'success',
      data: trend,
    };
  }

  @Get('popular-templates')
  async getPopularTemplates(@Query('limit') limit?: string): Promise<ApiResponse<any>> {
    const templates = await this.statisticsService.getPopularTemplates(limit ? Number(limit) : undefined);
    return {
      code: 200,
      message: 'success',
      data: templates,
    };
  }

  @Get('user-activity')
  async getUserActivity(@Query('limit') limit?: string): Promise<ApiResponse<any>> {
    const users = await this.statisticsService.getUserActivity(limit ? Number(limit) : undefined);
    return {
      code: 200,
      message: 'success',
      data: users,
    };
  }

  @Get('export')
  @AdminRoles('admin', 'operator')
  async exportData(
    @Query('type') type: string,
    @Query('format') format = 'csv',
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const allowedTypes = ['users', 'resumes', 'templates', 'ai-operations'];
    if (!allowedTypes.includes(type)) {
      throw new BadRequestException('不支持的数据导出类型');
    }
    if (!['csv', 'json'].includes(format)) {
      throw new BadRequestException('仅支持 CSV 或 JSON 格式');
    }
    const result = await this.statisticsService.exportData(
      type as 'users' | 'resumes' | 'templates' | 'ai-operations',
      format as 'csv' | 'json',
      startDate,
      endDate,
    );
    response.setHeader('Content-Type', result.contentType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.fileName}"`,
    );
    response.setHeader('X-Export-Row-Count', String(result.rowCount));
    response.send(result.body);
  }
}
