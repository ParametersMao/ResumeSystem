import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto, TemplateResponseDto, TemplateListResponseDto, TemplateDetailResponseDto } from '../../dto/template.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TemplateSearchDto } from '../../dto/template-search.dto';
import { PaginatedApiResponse, ApiResponse } from '../../common/interfaces/pagination.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminOnlyGuard } from '../auth/admin-only.guard';

function ensureCuser(req: any) {
  if (!req.user?.id) throw new UnauthorizedException('用户信息无效');
  if (req.user.type !== 'cuser') throw new UnauthorizedException('无权限');
  return req.user.id as number;
}

@Controller('api/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async findAll(@Query() searchDto: TemplateSearchDto): Promise<PaginatedApiResponse<TemplateListResponseDto>> {
    const result = await this.templatesService.findAll(searchDto);
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Get('/admin/list')
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  async findAllForAdmin(@Query() searchDto: TemplateSearchDto): Promise<PaginatedApiResponse<TemplateListResponseDto>> {
    const result = await this.templatesService.findAll(searchDto, { includeInactive: true });
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Get('/favorites/list')
  @UseGuards(JwtAuthGuard)
  async listFavorites(@Request() req): Promise<ApiResponse<{ templateIds: number[] }>> {
    const userId = ensureCuser(req);
    const templateIds = await this.templatesService.listFavoriteTemplateIds(userId);
    return {
      code: 200,
      message: 'success',
      data: { templateIds },
    };
  }

  @Get('/admin/:id')
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  async findOneForAdmin(@Param('id') id: string): Promise<ApiResponse<TemplateDetailResponseDto>> {
    const template = await this.templatesService.findOne(+id, { includeInactive: true });
    return {
      code: 200,
      message: 'success',
      data: template,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<TemplateDetailResponseDto>> {
    const template = await this.templatesService.findOne(+id);
    return {
      code: 200,
      message: 'success',
      data: template,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  async create(@Body() createTemplateDto: CreateTemplateDto): Promise<ApiResponse<TemplateResponseDto>> {
    const template = await this.templatesService.create(createTemplateDto);
    return {
      code: 200,
      message: '模板创建成功',
      data: {
        id: template.id,
        templateName: template.templateName,
        templateData: template.templateData,
        templateVariant: template.templateVariant,
        layoutKey: template.layoutKey,
        avatarLayout: template.avatarLayout,
        previewImage: template.previewImage,
        industryTags: (template as any).industryTags,
        status: template.status,
        createTime: template.createTime,
        updateTime: template.updateTime,
        useCount: template.useCount,
        recommendWeight: template.recommendWeight,
      },
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  async update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ): Promise<ApiResponse<TemplateResponseDto>> {
    const template = await this.templatesService.update(+id, updateTemplateDto);
    return {
      code: 200,
      message: '模板更新成功',
      data: {
        id: template.id,
        templateName: template.templateName,
        templateData: template.templateData,
        templateVariant: template.templateVariant,
        layoutKey: template.layoutKey,
        avatarLayout: template.avatarLayout,
        previewImage: template.previewImage,
        industryTags: (template as any).industryTags,
        status: template.status,
        createTime: template.createTime,
        updateTime: template.updateTime,
        useCount: template.useCount,
        recommendWeight: template.recommendWeight,
      },
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.templatesService.remove(+id);
    return {
      code: 200,
      message: '模板删除成功',
      data: null,
    };
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async addFavorite(@Request() req, @Param('id') id: string): Promise<ApiResponse<null>> {
    const userId = ensureCuser(req);
    await this.templatesService.addFavorite(userId, +id);
    return {
      code: 200,
      message: '收藏成功',
      data: null,
    };
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async removeFavorite(@Request() req, @Param('id') id: string): Promise<ApiResponse<null>> {
    const userId = ensureCuser(req);
    await this.templatesService.removeFavorite(userId, +id);
    return {
      code: 200,
      message: '已取消收藏',
      data: null,
    };
  }
}
