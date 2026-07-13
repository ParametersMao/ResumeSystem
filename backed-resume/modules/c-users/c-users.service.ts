import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CUser } from '../../entities/c-user.entity';
import { CreateCUserDto, UpdateCUserDto, UpdateCUserStatusDto, CUserResponseDto } from '../../dto/c-user.dto';
import { CUserSearchDto } from '../../dto/c-user.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
import * as bcrypt from 'bcrypt';
import { KnowledgeService } from '../knowledge/knowledge.service';

@Injectable()
export class CUsersService {
  constructor(
    @InjectRepository(CUser)
    private cUserRepository: Repository<CUser>,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  async findAll(paginationDto: CUserSearchDto): Promise<PaginationResponse<CUserResponseDto>> {
    const { page = 1, limit = 10, search, status } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.cUserRepository
      .createQueryBuilder('user')
      .orderBy('user.createTime', 'DESC')
      .skip(skip)
      .take(limit);
    if (search?.trim()) {
      const keyword = `%${search.trim()}%`;
      query.andWhere(new Brackets((builder) => {
        builder
          .where('user.username LIKE :keyword', { keyword })
          .orWhere('user.email LIKE :keyword', { keyword })
          .orWhere('user.phone LIKE :keyword', { keyword });
      }));
    }
    if (status === 0 || status === 1) {
      query.andWhere('user.status = :status', { status });
    }
    const [users, total] = await query.getManyAndCount();

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
    user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    return this.cUserRepository.save(user);
  }

  async resetPassword(id: number, password: string): Promise<CUser> {
    const user = await this.findOne(id);
    user.password = await bcrypt.hash(password, 10);
    user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    return this.cUserRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.knowledgeService.deletePrivateKnowledgeForUser(id);
    await this.cUserRepository.remove(user);
  }

  async findByUsername(username: string): Promise<CUser | null> {
    return this.cUserRepository.findOne({ where: { username } });
  }

  async findByPhone(phone: string): Promise<CUser | null> {
    return this.cUserRepository.findOne({ where: { phone } });
  }

  async findByEmail(email: string): Promise<CUser | null> {
    return this.cUserRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async updatePassword(id: number, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.cUserRepository
      .createQueryBuilder()
      .update(CUser)
      .set({
        password: hashedPassword,
        tokenVersion: () => 'token_version + 1',
      })
      .where('id = :id', { id })
      .execute();
  }

  async invalidateSessions(id: number): Promise<void> {
    await this.cUserRepository.increment({ id }, 'tokenVersion', 1);
  }

  async verifyPassword(user: CUser | null, password: string): Promise<boolean> {
    if (!user?.password) {
      return false;
    }

    if (this.isBcryptHash(user.password)) {
      try {
        return await bcrypt.compare(password, user.password);
      } catch (error) {
        console.error('cuser bcrypt compare failed:', error);
        return false;
      }
    }

    if (user.password === password) {
      user.password = await bcrypt.hash(password, 10);
      await this.cUserRepository.save(user);
      return true;
    }

    return false;
  }

  async ensureDevTestUser(): Promise<CUser> {
    const defaultPassword = process.env.DEV_TEST_USER_PASSWORD || '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const existing = await this.findByUsername('testuser');

    if (!existing) {
      const user = this.cUserRepository.create({
        username: 'testuser',
        password: hashedPassword,
        email: 'testuser@example.com',
        status: 1,
      });
      return this.cUserRepository.save(user);
    }

    existing.status = 1;
    existing.email = existing.email || 'testuser@example.com';

    const canUseDefaultPassword = await this.verifyPassword(existing, defaultPassword);
    if (!canUseDefaultPassword) {
      existing.password = hashedPassword;
    }

    return this.cUserRepository.save(existing);
  }

  async incrementAiOperationCount(id: number): Promise<void> {
    await this.cUserRepository.increment({ id }, 'aiOperationCount', 1);
  }

  private isBcryptHash(value: string): boolean {
    return /^\$2[aby]\$\d{2}\$.{53}$/.test(value);
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
