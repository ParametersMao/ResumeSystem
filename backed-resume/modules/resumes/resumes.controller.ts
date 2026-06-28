import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  CreateResumeDto,
  ResumeListResponseDto,
  ResumeResponseDto,
  UpdateResumeDto,
} from '../../dto/resume.dto';
import {
  ApiResponse,
  PaginatedApiResponse,
} from '../../common/interfaces/pagination.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResumesService } from './resumes.service';

function currentCuserId(req: any): number {
  if (!req.user?.id || req.user.type !== 'cuser') {
    throw new UnauthorizedException('无权访问该用户资源');
  }
  return Number(req.user.id);
}

@Controller('api/resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  async create(
    @Request() req,
    @Body() dto: CreateResumeDto,
  ): Promise<ApiResponse<ResumeResponseDto>> {
    const resume = await this.resumesService.create(dto, currentCuserId(req));
    return { code: 200, message: '简历创建成功', data: resume };
  }

  @Get()
  async findAllByUser(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedApiResponse<ResumeListResponseDto>> {
    const result = await this.resumesService.findAllByUser(
      currentCuserId(req),
      +page,
      +limit,
    );
    return { code: 200, message: 'success', data: result };
  }

  @Post('export')
  async exportPdf(
    @Request() req,
    @Body('html') html: string,
  ): Promise<ApiResponse<{ url: string }>> {
    const url = await this.resumesService.exportPdf(html, currentCuserId(req));
    return { code: 200, message: '导出成功', data: { url } };
  }

  @Post('assets/photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const isImage = /^image\/(png|jpe?g|webp)$/i.test(file.mimetype || '');
        cb(isImage ? null : new BadRequestException('仅支持 PNG、JPG、WebP 图片'), isImage);
      },
    }),
  )
  async uploadPhoto(
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<{ url: string; key: string }>> {
    if (!file) throw new BadRequestException('请上传照片文件');
    const result = await this.resumesService.uploadResumePhoto(
      file,
      currentCuserId(req),
    );
    return { code: 200, message: '上传成功', data: result };
  }

  @Get(':id/versions')
  async listVersions(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ApiResponse<any[]>> {
    const versions = await this.resumesService.listVersions(
      +id,
      currentCuserId(req),
    );
    return {
      code: 200,
      message: 'success',
      data: versions.map((version) => ({
        id: version.id,
        resumeId: version.resumeId,
        sourceVersion: version.sourceVersion,
        sourceType: version.sourceType,
        remark: version.remark,
        createTime: version.createTime,
        content: version.content,
      })),
    };
  }

  @Post(':id/versions')
  async createVersionSnapshot(
    @Request() req,
    @Param('id') id: string,
    @Body('remark') remark?: string,
  ): Promise<ApiResponse<any>> {
    const version = await this.resumesService.createVersionSnapshot(
      +id,
      currentCuserId(req),
      remark,
    );
    return { code: 200, message: '版本已保存', data: version };
  }

  @Post(':id/rollback')
  async rollback(
    @Request() req,
    @Param('id') id: string,
    @Body('versionId') versionId: number,
  ): Promise<ApiResponse<ResumeResponseDto>> {
    const resume = await this.resumesService.rollback(
      +id,
      Number(versionId),
      currentCuserId(req),
    );
    return { code: 200, message: '回滚成功', data: resume };
  }

  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ApiResponse<ResumeResponseDto>> {
    const resume = await this.resumesService.findOne(+id, currentCuserId(req));
    return { code: 200, message: 'success', data: resume };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateResumeDto,
  ): Promise<ApiResponse<ResumeResponseDto>> {
    const resume = await this.resumesService.update(
      +id,
      dto,
      currentCuserId(req),
    );
    return { code: 200, message: '更新成功', data: resume };
  }

  @Delete(':id')
  async remove(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ApiResponse<null>> {
    await this.resumesService.remove(+id, currentCuserId(req));
    return { code: 200, message: '删除成功', data: null };
  }
}
