import { Repository } from 'typeorm';
import { AiOperation } from '../../entities/ai-operation.entity';
import { CreateAiOperationDto, AiOperationQueryDto, AiOperationResponseDto } from '../../dto/ai-operation.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
export declare class AiOperationsService {
    private aiOperationRepository;
    constructor(aiOperationRepository: Repository<AiOperation>);
    findAll(query: AiOperationQueryDto): Promise<PaginationResponse<AiOperationResponseDto>>;
    findOne(id: number): Promise<AiOperation>;
    create(createAiOperationDto: CreateAiOperationDto): Promise<AiOperation>;
    remove(id: number): Promise<void>;
    getStatistics(): Promise<any>;
    private mapToResponseDto;
}
