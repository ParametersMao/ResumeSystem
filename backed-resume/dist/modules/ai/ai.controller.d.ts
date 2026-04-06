import { ApiResponse } from '../../common/interfaces/pagination.interface';
import { AiOperationsService } from '../ai-operations/ai-operations.service';
import { AiGenerateDto, AiPolishDto } from '../../dto/ai-mock.dto';
export declare class AiController {
    private readonly aiOps;
    constructor(aiOps: AiOperationsService);
    polish(req: any, dto: AiPolishDto): Promise<ApiResponse<any>>;
    generate(req: any, dto: AiGenerateDto): Promise<ApiResponse<any>>;
}
