import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SystemLogsService } from './system-logs.service';
import { ApiResponse, PaginatedApiResponse } from '../../common/interfaces/pagination.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminOnlyGuard } from '../auth/admin-only.guard';

@Controller('api/system-logs')
@UseGuards(JwtAuthGuard, AdminOnlyGuard)
export class SystemLogsController {
  constructor(private readonly service: SystemLogsService) {}

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('path') path?: string,
    @Query('method') method?: string,
  ): Promise<PaginatedApiResponse<any>> {
    const data = await this.service.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      userId: userId ? Number(userId) : undefined,
      path: path || undefined,
      method: method || undefined,
    });
    return {
      code: 200,
      message: 'success',
      data,
    };
  }
}

