import { PaginationDto } from '../common/dto/pagination.dto';
export declare class TemplateSearchDto extends PaginationDto {
    templateName?: string;
    description?: string;
    status?: boolean;
}
