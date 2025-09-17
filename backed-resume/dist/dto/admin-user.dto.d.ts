export declare class CreateAdminUserDto {
    username: string;
    password: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: number;
}
export declare class UpdateAdminUserDto {
    username?: string;
    password?: string;
    email?: string;
    phone?: string;
    role?: string;
}
export declare class UpdateAdminUserStatusDto {
    status: number;
}
export declare class LoginDto {
    username: string;
    password: string;
}
export declare class AdminUserResponseDto {
    id: number;
    username: string;
    email?: string;
    phone?: string;
    role: string;
    status: number;
    createTime: Date;
    updateTime: Date;
}
