import { CUsersService } from './c-users.service';
import { CreateCUserDto, UpdateCUserDto, UpdateCUserStatusDto, CUserResponseDto } from '../../dto/c-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedApiResponse, ApiResponse } from '../../common/interfaces/pagination.interface';
export declare class CUsersController {
    private readonly cUsersService;
    constructor(cUsersService: CUsersService);
    findAll(paginationDto: PaginationDto): Promise<PaginatedApiResponse<CUserResponseDto>>;
    create(createCUserDto: CreateCUserDto): Promise<ApiResponse<CUserResponseDto>>;
    update(id: string, updateCUserDto: UpdateCUserDto): Promise<ApiResponse<CUserResponseDto>>;
    updateStatus(id: string, updateStatusDto: UpdateCUserStatusDto): Promise<ApiResponse<CUserResponseDto>>;
    remove(id: string): Promise<ApiResponse<null>>;
}
