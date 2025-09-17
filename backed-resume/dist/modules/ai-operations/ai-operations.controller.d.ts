import { AiOperationsService } from './ai-operations.service';
import { CreateAiOperationDto, AiOperationQueryDto, AiOperationResponseDto } from '../../dto/ai-operation.dto';
import { PaginatedApiResponse, ApiResponse } from '../../common/interfaces/pagination.interface';
export declare class AiOperationsController {
    private readonly aiOperationsService;
    constructor(aiOperationsService: AiOperationsService);
    findAll(query: AiOperationQueryDto): Promise<PaginatedApiResponse<AiOperationResponseDto>>;
    findOne(id: string): Promise<ApiResponse<AiOperationResponseDto>>;
    create(createAiOperationDto: CreateAiOperationDto): Promise<ApiResponse<AiOperationResponseDto>>;
    remove(id: string): Promise<ApiResponse<null>>;
    getStatistics(): Promise<ApiResponse<any>>;
}
