import { Test, TestingModule } from '@nestjs/testing';
import { CUsersService } from './c-users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CUser } from '../../entities/c-user.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { KnowledgeService } from '../knowledge/knowledge.service';

jest.mock('../knowledge/knowledge.service', () => ({
  KnowledgeService: class KnowledgeService {},
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('CUsersService', () => {
  let service: CUsersService;
  let repository: Repository<CUser>;

  const mockUser: CUser = {
    id: 1,
    username: 'testuser',
    password: '$2b$10$hashedpassword',
    email: 'test@example.com',
    phone: '13800138000',
    status: 1,
    createTime: new Date('2026-04-01'),
    updateTime: new Date('2026-04-01'),
    aiOperationCount: 0,
    tokenVersion: 0,
  };

  const mockQueryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    increment: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };
  const mockKnowledgeService = {
    deletePrivateKnowledgeForUser: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CUsersService,
        {
          provide: getRepositoryToken(CUser),
          useValue: mockRepository,
        },
        {
          provide: KnowledgeService,
          useValue: mockKnowledgeService,
        },
      ],
    }).compile();

    service = module.get<CUsersService>(CUsersService);
    repository = module.get<Repository<CUser>>(getRepositoryToken(CUser));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.list[0].username).toBe('testuser');
    });

    it('should return empty list when no users', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.list).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('applies the numeric status filter from the admin contract', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockUser], 1]);

      await service.findAll({ page: 1, limit: 10, status: 1, search: 'test' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.status = :status',
        { status: 1 },
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      username: 'newuser',
      password: 'password123',
      email: 'new@example.com',
      phone: '13900139000',
    };

    it('should create a new user successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when username exists', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when phone exists', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateDto = { email: 'updated@example.com' };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await service.update(1, updateDto);

      expect(result.email).toBe('updated@example.com');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { email: 'test@test.com' })).rejects.toThrow(NotFoundException);
    });

    it('should hash password when updating', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      await service.update(1, { password: 'newpassword' });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    });
  });

  describe('updateStatus', () => {
    it('should update user status', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue({ ...mockUser, status: 0 });

      const result = await service.updateStatus(1, { status: 0 });

      expect(result.status).toBe(0);
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      await service.resetPassword(1, 'newpassword123');

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });
  });

  describe('remove', () => {
    it('should remove user', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockKnowledgeService.deletePrivateKnowledgeForUser).toHaveBeenCalledWith(1);
      expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findByUsername', () => {
    it('should return user by username', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByPhone', () => {
    it('should return user by phone', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByPhone('13800138000');

      expect(result).toEqual(mockUser);
    });
  });
});
