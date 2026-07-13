import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JobDescriptionUpsertDto } from '../../dto/knowledge-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MAX_KNOWLEDGE_FILE_SIZE } from './knowledge-file-validation';
import { KnowledgeService } from './knowledge.service';

function currentCuserId(req: any): number {
  if (!req.user?.id || req.user.type !== 'cuser') {
    throw new UnauthorizedException('No permission to access this user resource');
  }
  return Number(req.user.id);
}

@Controller('api/resumes/:id/job-description')
@UseGuards(JwtAuthGuard)
export class JobDescriptionController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_KNOWLEDGE_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        const allowed = /\.(pdf|docx|txt|md|markdown)$/i.test(file.originalname);
        callback(
          allowed ? null : new BadRequestException('仅支持 PDF、DOCX、TXT、Markdown 文件'),
          allowed,
        );
      },
    }),
  )
  async replace(
    @Request() req,
    @Param('id', ParseIntPipe) resumeId: number,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: JobDescriptionUpsertDto,
  ) {
    const data = await this.knowledgeService.replaceJobDescription({
      resumeId,
      ownerUserId: currentCuserId(req),
      file,
      text: body?.text,
      expiresAt: body?.expiresAt,
    });
    return {
      code: 200,
      message: data.status === 'ready' ? 'JD 已索引' : 'JD 索引失败，原 JD 已保留',
      data,
    };
  }

  @Get()
  async get(@Request() req, @Param('id', ParseIntPipe) resumeId: number) {
    return {
      code: 200,
      message: 'success',
      data: await this.knowledgeService.getJobDescription(resumeId, currentCuserId(req)),
    };
  }

  @Delete()
  async remove(@Request() req, @Param('id', ParseIntPipe) resumeId: number) {
    await this.knowledgeService.deleteJobDescription(resumeId, currentCuserId(req));
    return { code: 200, message: 'JD 已删除', data: null };
  }
}
