import { JwtService } from '@nestjs/jwt';
import { AdminUsersService } from '../admin-users/admin-users.service';
import { CUsersService } from '../c-users/c-users.service';
import { LoginDto } from '../../dto/admin-user.dto';
import { CreateCUserDto } from '../../dto/c-user.dto';
import { Repository } from 'typeorm';
import { Resume } from '../../entities/resume.entity';
import { CUserProfile } from '../../entities/c-user-profile.entity';
import { CUserEntitlement } from '../../entities/c-user-entitlement.entity';
export declare class AuthService {
    private adminUsersService;
    private cUsersService;
    private jwtService;
    private resumeRepository;
    private cUserProfileRepository;
    private cUserEntitlementRepository;
    constructor(adminUsersService: AdminUsersService, cUsersService: CUsersService, jwtService: JwtService, resumeRepository: Repository<Resume>, cUserProfileRepository: Repository<CUserProfile>, cUserEntitlementRepository: Repository<CUserEntitlement>);
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
    getCuserCenter(userId: number): Promise<{
        user: any;
        profile: CUserProfile;
        entitlements: {
            aiFreeRemaining: number;
            userId: number;
            user: import("../../entities/c-user.entity").CUser;
            planCode: string;
            accountWeight: number;
            aiFreeTotal: number;
            aiFreeUsed: number;
            aiFreeResetPolicy: string;
            expireAt: Date | null;
            createTime: Date;
            updateTime: Date;
        };
        lastEditedResume: {
            id: number;
            title: string;
            templateId: number;
            templateName: string;
            previewImage: string;
            version: number;
            updateTime: Date;
        } | null;
    }>;
}
