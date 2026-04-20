import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, UpdateResumeDto, ResumeResponseDto, ResumeListResponseDto } from '../../dto/resume.dto';
import { ApiResponse, PaginatedApiResponse } from '../../common/interfaces/pagination.interface';

@Controller('api/resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  async create(@Body() createResumeDto: CreateResumeDto): Promise<ApiResponse<ResumeResponseDto>> {
    const resume = await this.resumesService.create(createResumeDto);
    return {
      code: 200,
      message: '简历创建成功',
      data: resume,
    };
  }

  @Get()
  async findAllByUser(
    @Query('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedApiResponse<ResumeListResponseDto>> {
    const result = await this.resumesService.findAllByUser(+userId, +page, +limit);
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ): Promise<ApiResponse<ResumeResponseDto>> {
    const resume = await this.resumesService.findOne(+id, userId ? +userId : undefined);
    return {
      code: 200,
      message: 'success',
      data: resume,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
    @Query('userId') userId?: string,
  ): Promise<ApiResponse<ResumeResponseDto>> {
    const resume = await this.resumesService.update(+id, updateResumeDto, userId ? +userId : undefined);
    return {
      code: 200,
      message: '更新成功',
      data: resume,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ): Promise<ApiResponse<null>> {
    await this.resumesService.remove(+id, userId ? +userId : undefined);
    return {
      code: 200,
      message: '删除成功',
      data: null,
    };
  }

  @Post('export')
  async exportPdf(@Body('html') html: string): Promise<ApiResponse<{ url: string }>> {
    const url = await this.resumesService.exportPdf(html);
    return {
      code: 200,
      message: '导出成功',
      data: { url },
    };
  }

  @Get(':id/versions')
  async listVersions(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ): Promise<ApiResponse<any[]>> {
    const versions = await this.resumesService.listVersions(+id, userId ? +userId : undefined);
    return {
      code: 200,
      message: 'success',
      data: versions.map(v => ({
        id: v.id,
        resumeId: v.resumeId,
        userId: v.userId,
        sourceVersion: v.sourceVersion,
        sourceType: v.sourceType,
        remark: v.remark,
        createTime: v.createTime,
        content: v.content,
      })),
    };
  }

  @Post(':id/versions')
  async createVersionSnapshot(
    @Param('id') id: string,
    @Body('remark') remark?: string,
    @Query('userId') userId?: string,
  ): Promise<ApiResponse<any>> {
    const version = await this.resumesService.createVersionSnapshot(+id, userId ? +userId : undefined, remark);
    return {
      code: 200,
      message: '鐗堟湰淇濆瓨鎴愬姛',
      data: {
        id: version.id,
        resumeId: version.resumeId,
        userId: version.userId,
        sourceVersion: version.sourceVersion,
        sourceType: version.sourceType,
        remark: version.remark,
        createTime: version.createTime,
        content: version.content,
      },
    };
  }

  @Post(':id/rollback')
  async rollback(
    @Param('id') id: string,
    @Body('versionId') versionId: number,
    @Query('userId') userId?: string,
  ): Promise<ApiResponse<ResumeResponseDto>> {
    const resume = await this.resumesService.rollback(+id, Number(versionId), userId ? +userId : undefined);
    return {
      code: 200,
      message: '回滚成功',
      data: resume,
    };
  }
} 
