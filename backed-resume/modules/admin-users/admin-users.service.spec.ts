import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersService } from './admin-users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminUser } from '../../entities/admin-user.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let repository: Repository<AdminUser>;

  const mockAdminUser: AdminUser = {
    id: 1,
    username: 'admin',
    password: '$2b$10$hashedpassword',
    email: 'admin@example.com',
    phone: '13800138000',
    role: 'admin',
    status: 1,
    createTime: new Date('2026-04-01'),
    updateTime: new Date('2026-04-01'),
  };

  const mockRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        {
          provide: getRepositoryToken(AdminUser),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
    repository = module.get<Repository<AdminUser>>(getRepositoryToken(AdminUser));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated admin users', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockAdminUser], 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.list[0].username).toBe('admin');
    });

    it('should return empty list when no users', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.list).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return an admin user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockAdminUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockAdminUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      username: 'newadmin',
      password: 'password123',
      email: 'newadmin@example.com',
      phone: '13900139000',
      role: 'operator',
    };

    it('should create a new admin user successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockAdminUser);
      mockRepository.save.mockResolvedValue(mockAdminUser);

      const result = await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when username exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockAdminUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update admin user successfully', async () => {
      const updateDto = { email: 'updated@example.com' };
      mockRepository.findOne.mockResolvedValue(mockAdminUser);
      mockRepository.save.mockResolvedValue({ ...mockAdminUser, ...updateDto });

      const result = await service.update(1, updateDto);

      expect(result.email).toBe('updated@example.com');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { email: 'test@test.com' })).rejects.toThrow(NotFoundException);
    });

    it('should hash password when updating', async () => {
      mockRepository.findOne.mockResolvedValue(mockAdminUser);
      mockRepository.save.mockResolvedValue(mockAdminUser);

      await service.update(1, { password: 'newpassword' });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    });

    it('should throw ConflictException when updating to existing username', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce({ ...mockAdminUser, id: 2 });

      await expect(service.update(1, { username: 'anotheradmin' })).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('should update user status', async () => {
      mockRepository.findOne.mockResolvedValue(mockAdminUser);
      mockRepository.save.mockResolvedValue({ ...mockAdminUser, status: 0 });

      const result = await service.updateStatus(1, { status: 0 });

      expect(result.status).toBe(0);
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      mockRepository.findOne.mockResolvedValue(mockAdminUser);
      mockRepository.save.mockResolvedValue(mockAdminUser);

      await service.resetPassword(1, 'newpassword123');

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });
  });

  describe('remove', () => {
    it('should remove admin user', async () => {
      mockRepository.findOne.mockResolvedValue(mockAdminUser);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockAdminUser);
    });
  });

  describe('findByUsername', () => {
    it('should return user by username', async () => {
      mockRepository.findOne.mockResolvedValue(mockAdminUser);

      const result = await service.findByUsername('admin');

      expect(result).toEqual(mockAdminUser);
    });

    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });
});
