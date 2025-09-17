import { ResumesService } from './resumes.service';
import { CreateResumeDto, UpdateResumeDto, ResumeResponseDto, ResumeListResponseDto } from '../../dto/resume.dto';
import { ApiResponse, PaginatedApiResponse } from '../../common/interfaces/pagination.interface';
export declare class ResumesController {
    private readonly resumesService;
    constructor(resumesService: ResumesService);
    create(createResumeDto: CreateResumeDto): Promise<ApiResponse<ResumeResponseDto>>;
    findAllByUser(userId: string, page?: number, limit?: number): Promise<PaginatedApiResponse<ResumeListResponseDto>>;
    findOne(id: string, userId?: string): Promise<ApiResponse<ResumeResponseDto>>;
    update(id: string, updateResumeDto: UpdateResumeDto, userId?: string): Promise<ApiResponse<ResumeResponseDto>>;
    remove(id: string, userId?: string): Promise<ApiResponse<null>>;
    exportPdf(html: string): Promise<ApiResponse<{
        url: string;
    }>>;
}
