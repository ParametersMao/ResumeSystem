import { CUser } from './c-user.entity';
export declare class AiOperation {
    id: number;
    userId: number;
    user: CUser;
    operationType: string;
    inputData: string;
    outputData: string;
    createTime: Date;
    tokenUsed: number;
}
