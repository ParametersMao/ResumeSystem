export declare class CreateAiOperationDto {
    userId: number;
    operationType: string;
    inputData?: string;
    outputData?: string;
    tokenUsed?: number;
}
export declare class AiOperationQueryDto {
    page?: number;
    limit?: number;
    userId?: number;
    operationType?: string;
}
export declare class AiOperationResponseDto {
    id: number;
    userId: number;
    username?: string;
    operationType: string;
    inputData?: string;
    outputData?: string;
    createTime: Date;
    tokenUsed: number;
}
