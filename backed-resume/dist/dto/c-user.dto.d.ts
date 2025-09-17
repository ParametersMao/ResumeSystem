export declare class CreateCUserDto {
    username: string;
    password: string;
    email?: string;
    phone?: string;
    status?: number;
}
export declare class UpdateCUserDto {
    username?: string;
    password?: string;
    email?: string;
    phone?: string;
}
export declare class UpdateCUserStatusDto {
    status: number;
}
export declare class CUserResponseDto {
    id: number;
    username: string;
    email?: string;
    phone?: string;
    status: number;
    createTime: Date;
    updateTime: Date;
    aiOperationCount: number;
}
