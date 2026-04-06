import { Repository } from 'typeorm';
import { Resume } from '../../entities/resume.entity';
import { ResumeVersion } from '../../entities/resume-version.entity';
import { CreateResumeDto, UpdateResumeDto, ResumeResponseDto, ResumeListResponseDto } from '../../dto/resume.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
export declare class ResumesService {
    private resumeRepository;
    private resumeVersionRepository;
    private ossClient;
    constructor(resumeRepository: Repository<Resume>, resumeVersionRepository: Repository<ResumeVersion>);
    create(createResumeDto: CreateResumeDto): Promise<ResumeResponseDto>;
    findAllByUser(userId: number, page?: number, limit?: number): Promise<PaginationResponse<ResumeListResponseDto>>;
    findOne(id: number, userId?: number): Promise<ResumeResponseDto>;
    update(id: number, updateResumeDto: UpdateResumeDto, userId?: number): Promise<ResumeResponseDto>;
    listVersions(resumeId: number, userId?: number): Promise<ResumeVersion[]>;
    rollback(resumeId: number, versionId: number, userId?: number): Promise<ResumeResponseDto>;
    remove(id: number, userId?: number): Promise<void>;
    exportPdf(html: string): Promise<string>;
    private mapToResponseDto;
    private mapToListResponseDto;
}
