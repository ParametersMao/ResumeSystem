import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../../entities/admin-user.entity';
import { CreateAdminUserDto, UpdateAdminUserDto, UpdateAdminUserStatusDto, AdminUserResponseDto } from '../../dto/admin-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginationResponse<AdminUserResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.adminUserRepository.findAndCount({
      skip,
      take: limit,
      order: { createTime: 'DESC' },
    });

    const responseData = users.map(user => this.mapToResponseDto(user));

    return {
      list: responseData,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<AdminUser> {
    const user = await this.adminUserRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async create(createAdminUserDto: CreateAdminUserDto): Promise<AdminUser> {
    // 检查用户名是否已存在
    const existingUser = await this.adminUserRepository.findOne({
      where: { username: createAdminUserDto.username }
    });
    
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createAdminUserDto.password, 10);
    
    const user = this.adminUserRepository.create({
      username: createAdminUserDto.username,
      password: hashedPassword,
      email: createAdminUserDto.email,
      phone: createAdminUserDto.phone,
      role: createAdminUserDto.role || 'admin',
      status: createAdminUserDto.status ?? 1,
    });
    
    return this.adminUserRepository.save(user);
  }

  async update(id: number, updateAdminUserDto: UpdateAdminUserDto): Promise<AdminUser> {
    const user = await this.findOne(id);
    
    // 如果更新用户名，检查是否与其他用户冲突
    if (updateAdminUserDto.username && updateAdminUserDto.username !== user.username) {
      const existingUser = await this.adminUserRepository.findOne({
        where: { username: updateAdminUserDto.username }
      });
      
      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 如果更新密码，需要加密
    if (updateAdminUserDto.password) {
      updateAdminUserDto.password = await bcrypt.hash(updateAdminUserDto.password, 10);
    }

    Object.assign(user, {
      username: updateAdminUserDto.username,
      password: updateAdminUserDto.password,
      email: updateAdminUserDto.email,
      phone: updateAdminUserDto.phone,
      role: updateAdminUserDto.role,
    });
    
    return this.adminUserRepository.save(user);
  }

  async updateStatus(id: number, updateStatusDto: UpdateAdminUserStatusDto): Promise<AdminUser> {
    const user = await this.findOne(id);
    user.status = updateStatusDto.status;
    return this.adminUserRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.adminUserRepository.remove(user);
  }

  async findByUsername(username: string): Promise<AdminUser | null> {
    console.log('findByUsername called', username);
    return this.adminUserRepository.findOne({ where: { username } });
  }

  private mapToResponseDto(user: AdminUser): AdminUserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createTime: user.createTime,
      updateTime: user.updateTime,
    };
  }
} 