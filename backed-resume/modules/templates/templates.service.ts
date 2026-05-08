import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../../entities/template.entity';
import { TemplateFavorite } from '../../entities/template-favorite.entity';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateResponseDto,
  TemplateListResponseDto,
  TemplateDetailResponseDto,
} from '../../dto/template.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
import { TemplateSearchDto } from '../../dto/template-search.dto';

type TemplateVariant = 'classic' | 'sidebar' | 'timeline' | 'spotlight' | 'ats' | 'executive' | 'compact' | 'editorial';
type TemplateSortBy = 'recommended' | 'latest' | 'popular';

@Injectable()
export class TemplatesService {
  private favoritesTableReadyPromise: Promise<void> | null = null;

  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    @InjectRepository(TemplateFavorite)
    private templateFavoriteRepository: Repository<TemplateFavorite>,
  ) {}

  async findAll(searchDto: TemplateSearchDto): Promise<PaginationResponse<TemplateListResponseDto>> {
    const {
      page = 1,
      limit = 10,
      templateName,
      status,
      industryTags,
      templateVariant,
      sortBy = 'recommended',
    } = searchDto;
    const skip = (page - 1) * limit;

    try {
      const queryBuilder = this.templateRepository.createQueryBuilder('template');

      if (templateName && templateName.trim() !== '') {
        queryBuilder.andWhere('template.templateName LIKE :templateName', {
          templateName: `%${templateName.trim()}%`,
        });
      }

      if (status === true || status === false) {
        queryBuilder.andWhere('template.status = :status', { status });
      }

      if (industryTags && industryTags.trim() !== '') {
        const tags = industryTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 10);

        for (const tag of tags) {
          queryBuilder.andWhere('FIND_IN_SET(:tag, template.tags) > 0', { tag });
        }
      }

      if (templateVariant && this.isTemplateVariant(templateVariant)) {
        queryBuilder.andWhere('template.templateData LIKE :variant', {
          variant: `%${templateVariant}%`,
        });
      }

      let templates: Template[] = [];
      let total = 0;

      if (sortBy === 'popular') {
        queryBuilder.orderBy('template.useCount', 'DESC').addOrderBy('template.createTime', 'DESC').skip(skip).take(limit);
        [templates, total] = await queryBuilder.getManyAndCount();
      } else if (sortBy === 'latest') {
        queryBuilder.orderBy('template.createTime', 'DESC').skip(skip).take(limit);
        [templates, total] = await queryBuilder.getManyAndCount();
      } else {
        const allTemplates = await queryBuilder.getMany();
        const sortedTemplates = this.sortTemplates(allTemplates, sortBy);
        total = sortedTemplates.length;
        templates = sortedTemplates.slice(skip, skip + limit);
      }

      return {
        list: templates.map((template) => this.mapToListResponseDto(template)),
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
    const { templateName, previewImage, status, industryTags, templateVariant, recommendWeight } = createTemplateDto;
    const template = this.templateRepository.create({
      templateName,
      templateData: this.normalizeTemplateData(createTemplateDto.templateData, templateVariant, recommendWeight),
      previewImage,
      industryTags: industryTags ?? null,
      status,
    });
    const savedTemplate = await this.templateRepository.save(template);
    return this.mapToResponseDto(savedTemplate);
  }

  async update(id: number, updateTemplateDto: UpdateTemplateDto): Promise<TemplateResponseDto> {
    const template = await this.findOneEntity(id);
    const { templateName, templateData, previewImage, status, industryTags, templateVariant, recommendWeight } = updateTemplateDto;

    if (templateName !== undefined) {
      template.templateName = templateName;
    }

    if (previewImage !== undefined) {
      template.previewImage = previewImage;
    }

    if (industryTags !== undefined) {
      template.industryTags = industryTags ?? null;
    }

    if (status !== undefined) {
      template.status = status;
    }

    if (templateData !== undefined || templateVariant !== undefined || recommendWeight !== undefined) {
      template.templateData = this.normalizeTemplateData(
        templateData ?? template.templateData ?? '{}',
        templateVariant,
        recommendWeight,
      );
    }

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

  async listFavoriteTemplateIds(userId: number): Promise<number[]> {
    await this.ensureFavoritesTable();
    const rows = await this.templateFavoriteRepository.query(
      `
        SELECT template_id AS templateId
        FROM template_favorites
        WHERE user_id = ?
        ORDER BY create_time DESC, id DESC
      `,
      [userId],
    );

    return rows.map((row: { templateId: number }) => Number(row.templateId)).filter((templateId) => Number.isFinite(templateId));
  }

  async addFavorite(userId: number, templateId: number): Promise<void> {
    await this.ensureFavoritesTable();

    const template = await this.templateRepository.findOne({ where: { id: templateId, status: true } });
    if (!template) {
      throw new NotFoundException('模板不存在或已下架');
    }

    await this.templateFavoriteRepository.query(
      `
        INSERT INTO template_favorites (user_id, template_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE create_time = CURRENT_TIMESTAMP
      `,
      [userId, templateId],
    );
  }

  async removeFavorite(userId: number, templateId: number): Promise<void> {
    await this.ensureFavoritesTable();
    await this.templateFavoriteRepository.query(
      'DELETE FROM template_favorites WHERE user_id = ? AND template_id = ?',
      [userId, templateId],
    );
  }

  private mapToListResponseDto(template: Template): TemplateListResponseDto {
    return {
      id: template.id,
      templateName: template.templateName,
      templateVariant: this.resolveTemplateVariant(template.templateData, template.templateName),
      previewImage: template.previewImage,
      industryTags: template.industryTags ?? undefined,
      status: template.status,
      createTime: template.createTime,
      updateTime: template.updateTime,
      useCount: template.useCount,
      recommendWeight: this.resolveRecommendWeight(template.templateData),
    };
  }

  private mapToDetailResponseDto(template: Template): TemplateDetailResponseDto {
    return {
      id: template.id,
      templateName: template.templateName,
      templateData: template.templateData,
      templateVariant: this.resolveTemplateVariant(template.templateData, template.templateName),
      previewImage: template.previewImage,
      industryTags: template.industryTags ?? undefined,
      status: template.status,
      createTime: template.createTime,
      updateTime: template.updateTime,
      useCount: template.useCount,
      recommendWeight: this.resolveRecommendWeight(template.templateData),
    };
  }

  private mapToResponseDto(template: Template): TemplateResponseDto {
    return {
      id: template.id,
      templateName: template.templateName,
      templateData: template.templateData,
      templateVariant: this.resolveTemplateVariant(template.templateData, template.templateName),
      previewImage: template.previewImage,
      industryTags: template.industryTags ?? undefined,
      status: template.status,
      createTime: template.createTime,
      updateTime: template.updateTime,
      useCount: template.useCount,
      recommendWeight: this.resolveRecommendWeight(template.templateData),
    };
  }

  private sortTemplates(templates: Template[], sortBy: TemplateSortBy): Template[] {
    const sorted = [...templates];

    if (sortBy === 'latest') {
      return sorted.sort((left, right) => right.createTime.getTime() - left.createTime.getTime());
    }

    if (sortBy === 'popular') {
      return sorted.sort((left, right) => {
        const useDelta = right.useCount - left.useCount;
        if (useDelta !== 0) {
          return useDelta;
        }

        return right.createTime.getTime() - left.createTime.getTime();
      });
    }

    return sorted.sort((left, right) => {
      const weightDelta = this.resolveRecommendWeight(right.templateData) - this.resolveRecommendWeight(left.templateData);
      if (weightDelta !== 0) {
        return weightDelta;
      }

      const useDelta = right.useCount - left.useCount;
      if (useDelta !== 0) {
        return useDelta;
      }

      return right.createTime.getTime() - left.createTime.getTime();
    });
  }

  private resolveTemplateVariant(templateData: string | null | undefined, templateName: string): TemplateVariant {
    const parsed = this.safeParseTemplateData(templateData);
    const inlineVariant = [
      parsed?.layout?.variant,
      parsed?.theme?.variant,
      parsed?.variant,
    ].find((value) => this.isTemplateVariant(value));

    if (this.isTemplateVariant(inlineVariant)) {
      return inlineVariant;
    }

    const normalizedName = (templateName || '').toLowerCase();

    if (
      normalizedName.includes('sidebar') ||
      normalizedName.includes('split') ||
      normalizedName.includes('modern') ||
      normalizedName.includes('双栏') ||
      normalizedName.includes('侧栏')
    ) {
      return 'sidebar';
    }

    if (
      normalizedName.includes('timeline') ||
      normalizedName.includes('editorial') ||
      normalizedName.includes('story') ||
      normalizedName.includes('journey') ||
      normalizedName.includes('时间轴') ||
      normalizedName.includes('编年')
    ) {
      return 'timeline';
    }

    if (
      normalizedName.includes('spotlight') ||
      normalizedName.includes('featured') ||
      normalizedName.includes('hero') ||
      normalizedName.includes('cover') ||
      normalizedName.includes('聚焦') ||
      normalizedName.includes('封面')
    ) {
      return 'spotlight';
    }

    return 'classic';
  }

  private safeParseTemplateData(templateData: string | null | undefined): any {
    if (!templateData) {
      return null;
    }

    try {
      return JSON.parse(templateData);
    } catch {
      return null;
    }
  }

  private resolveRecommendWeight(templateData: string | null | undefined): number {
    const parsed = this.safeParseTemplateData(templateData);
    const candidate = [
      parsed?.meta?.recommendWeight,
      parsed?.recommendWeight,
    ].find((value) => value !== undefined && value !== null);

    const value = Number(candidate);
    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }

    return Math.floor(value);
  }

  private normalizeTemplateData(
    templateData: string,
    templateVariant?: TemplateVariant,
    recommendWeight?: number,
  ): string {
    const parsed = this.safeParseTemplateData(templateData) ?? {};
    const variant = this.isTemplateVariant(templateVariant)
      ? templateVariant
      : this.resolveTemplateVariant(templateData, '');

    if (this.isTemplateVariant(variant)) {
      parsed.variant = variant;
      parsed.layout = {
        ...(typeof parsed.layout === 'object' && parsed.layout ? parsed.layout : {}),
        variant,
      };
      parsed.theme = {
        ...(typeof parsed.theme === 'object' && parsed.theme ? parsed.theme : {}),
        variant,
      };
    }

    const normalizedWeight = Number(recommendWeight);
    const finalWeight = Number.isFinite(normalizedWeight) && normalizedWeight >= 0
      ? Math.floor(normalizedWeight)
      : this.resolveRecommendWeight(templateData);

    parsed.recommendWeight = finalWeight;
    parsed.meta = {
      ...(typeof parsed.meta === 'object' && parsed.meta ? parsed.meta : {}),
      recommendWeight: finalWeight,
    };

    return JSON.stringify(parsed, null, 2);
  }

  private isTemplateVariant(value: unknown): value is TemplateVariant {
    return (
      value === 'classic' ||
      value === 'sidebar' ||
      value === 'timeline' ||
      value === 'spotlight' ||
      value === 'ats' ||
      value === 'executive' ||
      value === 'compact' ||
      value === 'editorial'
    );
  }

  private async ensureFavoritesTable(): Promise<void> {
    if (!this.favoritesTableReadyPromise) {
      this.favoritesTableReadyPromise = this.templateFavoriteRepository.query(`
        CREATE TABLE IF NOT EXISTS template_favorites (
          id INT NOT NULL AUTO_INCREMENT,
          user_id INT NOT NULL,
          template_id INT NOT NULL,
          create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uq_template_favorites_user_template (user_id, template_id),
          KEY idx_template_favorites_user_create (user_id, create_time),
          KEY idx_template_favorites_template (template_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `).then(() => undefined);
    }

    await this.favoritesTableReadyPromise;
  }
}
