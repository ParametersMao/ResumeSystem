import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AiOperationsService } from './ai-operations.service';
import { CreateAiOperationDto, AiOperationQueryDto, AiOperationResponseDto } from '../../dto/ai-operation.dto';
import { PaginatedApiResponse, ApiResponse } from '../../common/interfaces/pagination.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminOnlyGuard } from '../auth/admin-only.guard';

@Controller('api/ai-operations')
@UseGuards(JwtAuthGuard, AdminOnlyGuard)
export class AiOperationsController {
  constructor(private readonly aiOperationsService: AiOperationsService) {}

  @Get()
  async findAll(@Query() query: AiOperationQueryDto): Promise<PaginatedApiResponse<AiOperationResponseDto>> {
    const result = await this.aiOperationsService.findAll(query);
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<AiOperationResponseDto>> {
    const operation = await this.aiOperationsService.findOne(+id);
    return {
      code: 200,
      message: 'success',
      data: {
        id: operation.id,
        userId: operation.userId,
        username: operation.user?.username,
        operationType: operation.operationType,
        inputData: operation.inputData,
        outputData: operation.outputData,
        createTime: operation.createTime,
        tokenUsed: operation.tokenUsed,
      },
    };
  }

  @Post()
  async create(@Body() createAiOperationDto: CreateAiOperationDto): Promise<ApiResponse<AiOperationResponseDto>> {
    const operation = await this.aiOperationsService.create(createAiOperationDto);
    return {
      code: 200,
      message: 'AI 操作记录创建成功',
      data: {
        id: operation.id,
        userId: operation.userId,
        username: operation.user?.username,
        operationType: operation.operationType,
        inputData: operation.inputData,
        outputData: operation.outputData,
        createTime: operation.createTime,
        tokenUsed: operation.tokenUsed,
      },
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.aiOperationsService.remove(+id);
    return {
      code: 200,
      message: 'AI 操作记录删除成功',
      data: null,
    };
  }

  @Get('statistics/overview')
  async getStatistics(): Promise<ApiResponse<any>> {
    const statistics = await this.aiOperationsService.getStatistics();
    return {
      code: 200,
      message: 'success',
      data: statistics,
    };
  }
}
