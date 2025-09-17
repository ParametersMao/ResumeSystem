import { JwtService } from '@nestjs/jwt';
import { AdminUsersService } from '../admin-users/admin-users.service';
import { CUsersService } from '../c-users/c-users.service';
import { LoginDto } from '../../dto/admin-user.dto';
import { CreateCUserDto } from '../../dto/c-user.dto';
export declare class AuthService {
    private adminUsersService;
    private cUsersService;
    private jwtService;
    constructor(adminUsersService: AdminUsersService, cUsersService: CUsersService, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            role: any;
        };
    }>;
    getProfile(userId: number): Promise<{
        id: number;
        username: string;
        email: string;
        phone: string;
        role: string;
        status: number;
        createTime: Date;
        updateTime: Date;
    }>;
    register(createCUserDto: CreateCUserDto): Promise<{
        access_token: string;
        user: {
            id: number;
            username: string;
            email: string;
            phone: string;
        };
    }>;
    cuserLogin(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            phone: any;
        };
    }>;
    validateCUser(username: string, password: string): Promise<any>;
    getCuserProfile(userId: number): Promise<{
        id: number;
        username: string;
        email: string;
        phone: string;
        status: number;
        createTime: Date;
        updateTime: Date;
        aiOperationCount: number;
    }>;
}
