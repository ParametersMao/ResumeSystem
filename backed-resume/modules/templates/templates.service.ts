import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../../entities/template.entity';
import { CreateTemplateDto, UpdateTemplateDto, TemplateResponseDto, TemplateListResponseDto, TemplateDetailResponseDto } from '../../dto/template.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
import { TemplateSearchDto } from '../../dto/template-search.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  async findAll(searchDto: TemplateSearchDto): Promise<PaginationResponse<TemplateListResponseDto>> {
    const { page = 1, limit = 10, templateName, description, status, industryTags } = searchDto;
    const skip = (page - 1) * limit;
    
    // 打印接收到的查询参数，用于调试
    console.log('Template search params:', { page, limit, templateName, description, status, industryTags });
    
    try {
      // 构建查询条件
      const queryBuilder = this.templateRepository.createQueryBuilder('template');
      
      // 添加检索条件，确保空字符串和null值不被用作过滤条件
      if (templateName && templateName.trim() !== '') {
        queryBuilder.andWhere('template.templateName LIKE :templateName', { 
          templateName: `%${templateName.trim()}%` 
        });
      }
      
      if (description && description.trim() !== '') {
        queryBuilder.andWhere('template.description LIKE :description', { 
          description: `%${description.trim()}%` 
        });
      }
      
      // 明确检查布尔值
      if (status === true || status === false) {
        queryBuilder.andWhere('template.status = :status', { status });
      }

      // 行业标签筛选：前端传 industryTags=互联网,金融（逗号分隔）
      if (industryTags && industryTags.trim() !== '') {
        const tags = industryTags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
          .slice(0, 10);
        for (const tag of tags) {
          // MySQL: FIND_IN_SET(tag, industry_tags) > 0
          queryBuilder.andWhere('FIND_IN_SET(:tag, template.industry_tags) > 0', { tag });
        }
      }
      
      // 打印生成的SQL，用于调试
      const rawQuery = queryBuilder.getSql();
      console.log('Generated SQL query:', rawQuery);
      
      // 分页和排序
      queryBuilder
        .orderBy('template.createTime', 'DESC')
        .skip(skip)
        .take(limit);
  
      // 执行查询
      const [templates, total] = await queryBuilder.getManyAndCount();
      
      const responseData = templates.map(template => this.mapToListResponseDto(template));
      
      // 打印查询结果
      console.log(`Found ${total} templates matching criteria`);
      
      return {
        list: responseData,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in template search:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<TemplateDetailResponseDto> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('模板不存在');
    }
    return this.mapToDetailResponseDto(template);
  }

  async findOneEntity(id: number): Promise<Template> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('模板不存在');
    }
    return template;
  }

  async create(createTemplateDto: CreateTemplateDto): Promise<TemplateResponseDto> {
    const { templateName, templateData, previewImage, description, status, industryTags } = createTemplateDto;
    const template = this.templateRepository.create({
      templateName,
      templateData, // Keep as string, do not parse
      previewImage,
      description,
      industryTags: industryTags ?? null,
      status,
    });
    const savedTemplate = await this.templateRepository.save(template);
    return this.mapToResponseDto(savedTemplate);
  }

  async update(id: number, updateTemplateDto: UpdateTemplateDto): Promise<TemplateResponseDto> {
    const template = await this.findOneEntity(id);
    
    // templateData is already a string, no parsing needed.
    Object.assign(template, updateTemplateDto);
    
    const updatedTemplate = await this.templateRepository.save(template);
    return this.mapToResponseDto(updatedTemplate);
  }

  async remove(id: number): Promise<void> {
    const template = await this.findOneEntity(id);
    await this.templateRepository.remove(template);
  }

  async incrementUseCount(id: number): Promise<void> {
    await this.templateRepository.increment({ id }, 'useCount', 1);
  }

  async incrementDownloadCount(id: number): Promise<void> {
    await this.templateRepository.increment({ id }, 'downloadCount', 1);
  }

  private mapToListResponseDto(template: Template): TemplateListResponseDto {
    return {
      id: template.id,
      templateName: template.templateName,
      // 列表不包含 templateData 以提高性能
      previewImage: template.previewImage,
      description: template.description,
      industryTags: template.industryTags ?? undefined,
      status: template.status,
      createTime: template.createTime,
      updateTime: template.updateTime,
      useCount: template.useCount,
      downloadCount: template.downloadCount,
    };
  }

  private mapToDetailResponseDto(template: Template): TemplateDetailResponseDto {
    return {
      id: template.id,
      templateName: template.templateName,
      templateData: template.templateData, // 详情包含完整的 templateData
      previewImage: template.previewImage,
      description: template.description,
      industryTags: template.industryTags ?? undefined,
      status: template.status,
      createTime: template.createTime,
      updateTime: template.updateTime,
      useCount: template.useCount,
      downloadCount: template.downloadCount,
    };
  }

  private mapToResponseDto(template: Template): TemplateResponseDto {
    return {
      id: template.id,
      templateName: template.templateName,
      templateData: template.templateData,
      previewImage: template.previewImage,
      description: template.description,
      industryTags: template.industryTags ?? undefined,
      status: template.status,
      createTime: template.createTime,
      updateTime: template.updateTime,
      useCount: template.useCount,
      downloadCount: template.downloadCount,
    };
  }
} 