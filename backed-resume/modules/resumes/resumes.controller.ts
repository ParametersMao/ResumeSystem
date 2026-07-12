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
import { ResumeImportResult, ResumeImportService } from './resume-import.service';

function currentCuserId(req: any): number {
  if (!req.user?.id || req.user.type !== 'cuser') {
    throw new UnauthorizedException('No permission to access this user resource');
  }
  return Number(req.user.id);
}

function parsePositiveId(value: string | number, label = 'id'): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestException(`${label} is invalid`);
  }
  return id;
}

@Controller('api/resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly resumeImportService: ResumeImportService,
  ) {}

  @Post()
  async create(
    @Request() req,
    @Body() dto: CreateResumeDto,
  ): Promise<ApiResponse<ResumeResponseDto>> {
    const resume = await this.resumesService.create(dto, currentCuserId(req));
    return { code: 200, message: 'Resume created', data: resume };
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
  ): Promise<ApiResponse<{ url: string; pageCount: number }>> {
    const result = await this.resumesService.exportPdf(html, currentCuserId(req));
    return { code: 200, message: 'Exported', data: result };
  }

  @Post('assets/photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const isImage = /^image\/(png|jpe?g|webp)$/i.test(file.mimetype || '');
        cb(
          isImage ? null : new BadRequestException('Only PNG, JPG, JPEG, and WebP images are supported'),
          isImage,
        );
      },
    }),
  )
  async uploadPhoto(
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<{ url: string; key: string }>> {
    if (!file) {
      throw new BadRequestException('Please upload a photo file');
    }
    const result = await this.resumesService.uploadResumePhoto(
      file,
      currentCuserId(req),
    );
    return { code: 200, message: 'Uploaded', data: result };
  }

  @Post('import/parse')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async parseImport(
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<ResumeImportResult>> {
    currentCuserId(req);
    if (!file) {
      throw new BadRequestException('请选择要导入的简历文件');
    }
    const result = await this.resumeImportService.parse(file);
    return { code: 200, message: '解析完成，请核对后再创建简历', data: result };
  }

  @Get(':id/versions')
  async listVersions(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ApiResponse<any[]>> {
    const versions = await this.resumesService.listVersions(
      parsePositiveId(id, 'resumeId'),
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
      parsePositiveId(id, 'resumeId'),
      currentCuserId(req),
      remark,
    );
    return { code: 200, message: 'Version saved', data: version };
  }

  @Post(':id/rollback')
  async rollback(
    @Request() req,
    @Param('id') id: string,
    @Body('versionId') versionId: number,
  ): Promise<ApiResponse<ResumeResponseDto>> {
    const resume = await this.resumesService.rollback(
      parsePositiveId(id, 'resumeId'),
      parsePositiveId(versionId, 'versionId'),
      currentCuserId(req),
    );
    return { code: 200, message: 'Rolled back', data: resume };
  }

  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ApiResponse<ResumeResponseDto>> {
    const resume = await this.resumesService.findOne(
      parsePositiveId(id, 'resumeId'),
      currentCuserId(req),
    );
    return { code: 200, message: 'success', data: resume };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateResumeDto,
  ): Promise<ApiResponse<ResumeResponseDto>> {
    const resume = await this.resumesService.update(
      parsePositiveId(id, 'resumeId'),
      dto,
      currentCuserId(req),
    );
    return { code: 200, message: 'Updated', data: resume };
  }

  @Delete(':id')
  async remove(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ApiResponse<null>> {
    await this.resumesService.remove(
      parsePositiveId(id, 'resumeId'),
      currentCuserId(req),
    );
    return { code: 200, message: 'Deleted', data: null };
  }
}
