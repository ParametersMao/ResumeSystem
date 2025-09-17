import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto, TemplateResponseDto, TemplateListResponseDto, TemplateDetailResponseDto } from '../../dto/template.dto';
import { TemplateSearchDto } from '../../dto/template-search.dto';
import { PaginatedApiResponse, ApiResponse } from '../../common/interfaces/pagination.interface';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    findAll(searchDto: TemplateSearchDto): Promise<PaginatedApiResponse<TemplateListResponseDto>>;
    findOne(id: string): Promise<ApiResponse<TemplateDetailResponseDto>>;
    create(createTemplateDto: CreateTemplateDto): Promise<ApiResponse<TemplateResponseDto>>;
    update(id: string, updateTemplateDto: UpdateTemplateDto): Promise<ApiResponse<TemplateResponseDto>>;
    remove(id: string): Promise<ApiResponse<null>>;
}
