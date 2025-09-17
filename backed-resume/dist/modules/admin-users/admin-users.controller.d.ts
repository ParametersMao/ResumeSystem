import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto, UpdateAdminUserDto, UpdateAdminUserStatusDto, AdminUserResponseDto } from '../../dto/admin-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedApiResponse, ApiResponse } from '../../common/interfaces/pagination.interface';
export declare class AdminUsersController {
    private readonly adminUsersService;
    constructor(adminUsersService: AdminUsersService);
    findAll(paginationDto: PaginationDto): Promise<PaginatedApiResponse<AdminUserResponseDto>>;
    create(createAdminUserDto: CreateAdminUserDto): Promise<ApiResponse<AdminUserResponseDto>>;
    update(id: string, updateAdminUserDto: UpdateAdminUserDto): Promise<ApiResponse<AdminUserResponseDto>>;
    updateStatus(id: string, updateStatusDto: UpdateAdminUserStatusDto): Promise<ApiResponse<AdminUserResponseDto>>;
    remove(id: string): Promise<ApiResponse<null>>;
}
