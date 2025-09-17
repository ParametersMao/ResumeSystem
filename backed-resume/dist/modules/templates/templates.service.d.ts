import { Repository } from 'typeorm';
import { Template } from '../../entities/template.entity';
import { CreateTemplateDto, UpdateTemplateDto, TemplateResponseDto, TemplateListResponseDto, TemplateDetailResponseDto } from '../../dto/template.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
import { TemplateSearchDto } from '../../dto/template-search.dto';
export declare class TemplatesService {
    private templateRepository;
    constructor(templateRepository: Repository<Template>);
    findAll(searchDto: TemplateSearchDto): Promise<PaginationResponse<TemplateListResponseDto>>;
    findOne(id: number): Promise<TemplateDetailResponseDto>;
    findOneEntity(id: number): Promise<Template>;
    create(createTemplateDto: CreateTemplateDto): Promise<TemplateResponseDto>;
    update(id: number, updateTemplateDto: UpdateTemplateDto): Promise<TemplateResponseDto>;
    remove(id: number): Promise<void>;
    incrementUseCount(id: number): Promise<void>;
    incrementDownloadCount(id: number): Promise<void>;
    private mapToListResponseDto;
    private mapToDetailResponseDto;
    private mapToResponseDto;
}
