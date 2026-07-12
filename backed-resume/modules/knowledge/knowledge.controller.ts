import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  Res,
  StreamableFile,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KnowledgeService } from './knowledge.service';
import {
  KnowledgeDocumentQueryDto,
  KnowledgeSearchDto,
  KnowledgeToggleDto,
} from '../../dto/knowledge-document.dto';

function ensureAdmin(req: any) {
  if (!req.user?.id || req.user.type !== 'admin') {
    throw new UnauthorizedException('无权访问');
  }
  return req.user.id as number;
}

@Controller('api/admin/knowledge-documents')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  async list(@Request() req, @Query() query: KnowledgeDocumentQueryDto) {
    ensureAdmin(req);
    return { code: 200, message: 'success', data: await this.knowledgeService.list(query) };
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        const allowed = /\.(pdf|docx|txt|md|markdown)$/i.test(file.originalname);
        callback(allowed ? null : new Error('仅支持 PDF、DOCX、TXT、Markdown 文件'), allowed);
      },
    }),
  )
  async upload(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { name?: string; category?: string; description?: string },
  ) {
    const adminId = ensureAdmin(req);
    if (!file) throw new Error('请选择要上传的知识文档');
    const data = await this.knowledgeService.upload({ ...body, file, adminId });
    return { code: 200, message: data.status === 'ready' ? '上传并索引成功' : '文件已上传，但索引失败', data };
  }

  @Post('search')
  async search(@Request() req, @Body() dto: KnowledgeSearchDto) {
    ensureAdmin(req);
    return {
      code: 200,
      message: 'success',
      data: await this.knowledgeService.search(dto.query, dto.limit, dto.category),
    };
  }

  @Get('metrics')
  async metrics(@Request() req) {
    ensureAdmin(req);
    return { code: 200, message: 'success', data: await this.knowledgeService.metrics() };
  }

  @Get(':id/file')
  async download(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    ensureAdmin(req);
    const file = await this.knowledgeService.getFile(id);
    response.setHeader('Content-Type', file.mimeType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
    );
    return new StreamableFile(file.buffer);
  }

  @Post(':id/reindex')
  async reindex(@Request() req, @Param('id', ParseIntPipe) id: number) {
    ensureAdmin(req);
    return { code: 200, message: '重新索引完成', data: await this.knowledgeService.reindex(id) };
  }

  @Put(':id/enabled')
  async toggle(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: KnowledgeToggleDto,
  ) {
    ensureAdmin(req);
    return { code: 200, message: '状态已更新', data: await this.knowledgeService.toggle(id, dto.enabled) };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    ensureAdmin(req);
    await this.knowledgeService.remove(id);
    return { code: 200, message: '知识文档已删除', data: null };
  }
}
