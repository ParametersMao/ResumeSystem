import { Repository } from 'typeorm';
import { AdminUser } from '../../entities/admin-user.entity';
import { CreateAdminUserDto, UpdateAdminUserDto, UpdateAdminUserStatusDto, AdminUserResponseDto } from '../../dto/admin-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
export declare class AdminUsersService {
    private adminUserRepository;
    constructor(adminUserRepository: Repository<AdminUser>);
    findAll(paginationDto: PaginationDto): Promise<PaginationResponse<AdminUserResponseDto>>;
    findOne(id: number): Promise<AdminUser>;
    create(createAdminUserDto: CreateAdminUserDto): Promise<AdminUser>;
    update(id: number, updateAdminUserDto: UpdateAdminUserDto): Promise<AdminUser>;
    updateStatus(id: number, updateStatusDto: UpdateAdminUserStatusDto): Promise<AdminUser>;
    remove(id: number): Promise<void>;
    findByUsername(username: string): Promise<AdminUser | null>;
    private mapToResponseDto;
}
