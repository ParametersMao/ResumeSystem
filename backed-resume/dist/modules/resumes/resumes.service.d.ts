import { Repository } from 'typeorm';
import { Resume } from '../../entities/resume.entity';
import { CreateResumeDto, UpdateResumeDto, ResumeResponseDto, ResumeListResponseDto } from '../../dto/resume.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
export declare class ResumesService {
    private resumeRepository;
    private ossClient;
    constructor(resumeRepository: Repository<Resume>);
    create(createResumeDto: CreateResumeDto): Promise<ResumeResponseDto>;
    findAllByUser(userId: number, page?: number, limit?: number): Promise<PaginationResponse<ResumeListResponseDto>>;
    findOne(id: number, userId?: number): Promise<ResumeResponseDto>;
    update(id: number, updateResumeDto: UpdateResumeDto, userId?: number): Promise<ResumeResponseDto>;
    remove(id: number, userId?: number): Promise<void>;
    exportPdf(html: string): Promise<string>;
    private mapToResponseDto;
    private mapToListResponseDto;
}
