import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiResponse } from '../../common/interfaces/pagination.interface';

@Controller('api/statistics')
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
}
