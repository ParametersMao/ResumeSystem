import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto, TemplateResponseDto, TemplateListResponseDto, TemplateDetailResponseDto } from '../../dto/template.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { TemplateSearchDto } from '../../dto/template-search.dto';
import { PaginatedApiResponse, ApiResponse } from '../../common/interfaces/pagination.interface';

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
  async create(@Body() createTemplateDto: CreateTemplateDto): Promise<ApiResponse<TemplateResponseDto>> {
    const template = await this.templatesService.create(createTemplateDto);
    return {
      code: 200,
      message: '模板创建成功',
      data: {
        id: template.id,
        templateName: template.templateName,
        templateData: template.templateData,
        previewImage: template.previewImage,
        description: template.description,
        status: template.status,
        createTime: template.createTime,
        updateTime: template.updateTime,
        useCount: template.useCount,
        downloadCount: template.downloadCount,
      },
    };
  }

  @Put(':id')
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
        previewImage: template.previewImage,
        description: template.description,
        status: template.status,
        createTime: template.createTime,
        updateTime: template.updateTime,
        useCount: template.useCount,
        downloadCount: template.downloadCount,
      },
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.templatesService.remove(+id);
    return {
      code: 200,
      message: '模板删除成功',
      data: null,
    };
  }
} 