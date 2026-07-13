import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../../entities/admin-user.entity';
import { CreateAdminUserDto, UpdateAdminUserDto, UpdateAdminUserStatusDto, AdminUserResponseDto } from '../../dto/admin-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminUsersService implements OnModuleInit {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
  ) {}

  async onModuleInit(): Promise<void> {
    const columns: Array<{ Field: string }> = await this.adminUserRepository.query(
      'SHOW COLUMNS FROM admin_users',
    );
    if (!columns.some((column) => column.Field === 'token_version')) {
      await this.adminUserRepository.query(
        'ALTER TABLE admin_users ADD COLUMN token_version INT NOT NULL DEFAULT 0 AFTER status',
      );
    }
  }

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
    const passwordChanged = Boolean(updateAdminUserDto.password);
    const roleChanged = Boolean(updateAdminUserDto.role && updateAdminUserDto.role !== user.role);
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
    if (passwordChanged || roleChanged) {
      user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    }
    
    return this.adminUserRepository.save(user);
  }

  async updateStatus(id: number, updateStatusDto: UpdateAdminUserStatusDto): Promise<AdminUser> {
    const user = await this.findOne(id);
    user.status = updateStatusDto.status;
    user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    return this.adminUserRepository.save(user);
  }

  async resetPassword(id: number, password: string): Promise<AdminUser> {
    const user = await this.findOne(id);
    user.password = await bcrypt.hash(password, 10);
    user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    return this.adminUserRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.adminUserRepository.remove(user);
  }

  async findByUsername(username: string): Promise<AdminUser | null> {
    return this.adminUserRepository.findOne({ where: { username } });
  }

  async verifyPassword(user: AdminUser | null, password: string): Promise<boolean> {
    if (!user?.password) {
      return false;
    }

    if (this.isBcryptHash(user.password)) {
      try {
        return await bcrypt.compare(password, user.password);
      } catch (error) {
        console.error('admin bcrypt compare failed:', error);
        return false;
      }
    }

    if (user.password === password) {
      user.password = await bcrypt.hash(password, 10);
      await this.adminUserRepository.save(user);
      return true;
    }

    return false;
  }

  async ensureDevAdminAccount(): Promise<AdminUser> {
    const defaultPassword = process.env.DEV_ADMIN_PASSWORD || '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const existing = await this.findByUsername('admin');

    if (!existing) {
      const user = this.adminUserRepository.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        status: 1,
      });
      return this.adminUserRepository.save(user);
    }

    existing.role = existing.role || 'admin';
    existing.status = 1;

    const canUseDefaultPassword = await this.verifyPassword(existing, defaultPassword);
    if (!canUseDefaultPassword) {
      existing.password = hashedPassword;
    }

    return this.adminUserRepository.save(existing);
  }

  async ensureBootstrapAdminAccount(username: string, password: string): Promise<AdminUser> {
    const normalizedUsername = username.trim();
    if (!normalizedUsername || password.length < 12) {
      throw new Error('BOOTSTRAP_ADMIN_USERNAME and a password of at least 12 characters are required');
    }

    const existing = await this.findByUsername(normalizedUsername);
    if (existing) {
      return existing;
    }

    const user = this.adminUserRepository.create({
      username: normalizedUsername,
      password: await bcrypt.hash(password, 12),
      role: 'admin',
      status: 1,
      tokenVersion: 0,
    });
    return this.adminUserRepository.save(user);
  }

  private isBcryptHash(value: string): boolean {
    return /^\$2[aby]\$\d{2}\$.{53}$/.test(value);
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
