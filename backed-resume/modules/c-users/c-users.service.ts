import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CUser } from '../../entities/c-user.entity';
import { CreateCUserDto, UpdateCUserDto, UpdateCUserStatusDto, CUserResponseDto } from '../../dto/c-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CUsersService {
  constructor(
    @InjectRepository(CUser)
    private cUserRepository: Repository<CUser>,
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<PaginationResponse<CUserResponseDto>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.cUserRepository.findAndCount({
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

  async findOne(id: number): Promise<CUser> {
    const user = await this.cUserRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async create(createCUserDto: CreateCUserDto): Promise<CUser> {
    // 检查用户名是否已存在
    const existingUser = await this.cUserRepository.findOne({
      where: { username: createCUserDto.username }
    });
    
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查手机号是否已存在
    if (createCUserDto.phone) {
      const existingPhone = await this.cUserRepository.findOne({
        where: { phone: createCUserDto.phone }
      });
      
      if (existingPhone) {
        throw new ConflictException('手机号已存在');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createCUserDto.password, 10);
    
    const user = this.cUserRepository.create({
      username: createCUserDto.username,
      password: hashedPassword,
      email: createCUserDto.email,
      phone: createCUserDto.phone,
      status: createCUserDto.status ?? 1,
    });
    
    return this.cUserRepository.save(user);
  }

  async update(id: number, updateCUserDto: UpdateCUserDto): Promise<CUser> {
    const user = await this.findOne(id);
    
    // 如果更新用户名，检查是否与其他用户冲突
    if (updateCUserDto.username && updateCUserDto.username !== user.username) {
      const existingUser = await this.cUserRepository.findOne({
        where: { username: updateCUserDto.username }
      });
      
      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 如果更新手机号，检查是否与其他用户冲突
    if (updateCUserDto.phone && updateCUserDto.phone !== user.phone) {
      const existingPhone = await this.cUserRepository.findOne({
        where: { phone: updateCUserDto.phone }
      });
      
      if (existingPhone) {
        throw new ConflictException('手机号已存在');
      }
    }

    // 如果更新密码，需要加密
    if (updateCUserDto.password) {
      updateCUserDto.password = await bcrypt.hash(updateCUserDto.password, 10);
    }

    Object.assign(user, {
      username: updateCUserDto.username,
      password: updateCUserDto.password,
      email: updateCUserDto.email,
      phone: updateCUserDto.phone,
    });
    
    return this.cUserRepository.save(user);
  }

  async updateStatus(id: number, updateStatusDto: UpdateCUserStatusDto): Promise<CUser> {
    const user = await this.findOne(id);
    user.status = updateStatusDto.status;
    return this.cUserRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.cUserRepository.remove(user);
  }

  async findByUsername(username: string): Promise<CUser | null> {
    return this.cUserRepository.findOne({ where: { username } });
  }

  async findByPhone(phone: string): Promise<CUser | null> {
    return this.cUserRepository.findOne({ where: { phone } });
  }

  async incrementAiOperationCount(id: number): Promise<void> {
    await this.cUserRepository.increment({ id }, 'aiOperationCount', 1);
  }

  private mapToResponseDto(user: CUser): CUserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      status: user.status,
      createTime: user.createTime,
      updateTime: user.updateTime,
      aiOperationCount: user.aiOperationCount,
    };
  }
} 