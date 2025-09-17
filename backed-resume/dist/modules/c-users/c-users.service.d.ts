import { Repository } from 'typeorm';
import { CUser } from '../../entities/c-user.entity';
import { CreateCUserDto, UpdateCUserDto, UpdateCUserStatusDto, CUserResponseDto } from '../../dto/c-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
export declare class CUsersService {
    private cUserRepository;
    constructor(cUserRepository: Repository<CUser>);
    findAll(paginationDto: PaginationDto): Promise<PaginationResponse<CUserResponseDto>>;
    findOne(id: number): Promise<CUser>;
    create(createCUserDto: CreateCUserDto): Promise<CUser>;
    update(id: number, updateCUserDto: UpdateCUserDto): Promise<CUser>;
    updateStatus(id: number, updateStatusDto: UpdateCUserStatusDto): Promise<CUser>;
    remove(id: number): Promise<void>;
    findByUsername(username: string): Promise<CUser | null>;
    findByPhone(phone: string): Promise<CUser | null>;
    incrementAiOperationCount(id: number): Promise<void>;
    private mapToResponseDto;
}
