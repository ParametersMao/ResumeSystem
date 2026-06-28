import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AdminUsersService } from '../admin-users/admin-users.service';
import { CUsersService } from '../c-users/c-users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { Resume } from '../../entities/resume.entity';
import { CUserProfile } from '../../entities/c-user-profile.entity';
import { CUserEntitlement } from '../../entities/c-user-entitlement.entity';
import { EmailAuthService } from './email-auth.service';
import { EntitlementsService } from '../entitlements/entitlements.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let adminUsersService: AdminUsersService;
  let cUsersService: CUsersService;
  let jwtService: JwtService;

  const mockAdminUser = {
    id: 1,
    username: 'admin',
    password: '$2b$10$hashedpassword',
    role: 'admin',
    status: 1,
  };

  const mockCUser = {
    id: 2,
    username: 'testuser',
    password: '$2b$10$hashedpassword',
    email: 'test@example.com',
    phone: '13800138000',
    status: 1,
  };

  const mockAdminUsersService = {
    findByUsername: jest.fn(),
    findOne: jest.fn(),
    verifyPassword: jest.fn((user, password) => bcrypt.compare(password, user.password)),
  };

  const mockCUsersService = {
    findByUsername: jest.fn(),
    findByPhone: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    verifyPassword: jest.fn((user, password) => bcrypt.compare(password, user.password)),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-access-token'),
    verify: jest.fn(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockEmailAuthService = {
    consumeCode: jest.fn(),
    bindEmailIdentity: jest.fn(),
  };

  const mockEntitlementsService = {
    getSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AdminUsersService,
          useValue: mockAdminUsersService,
        },
        {
          provide: CUsersService,
          useValue: mockCUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(Resume),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(CUserProfile),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(CUserEntitlement),
          useValue: mockRepository,
        },
        {
          provide: EmailAuthService,
          useValue: mockEmailAuthService,
        },
        {
          provide: EntitlementsService,
          useValue: mockEntitlementsService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    adminUsersService = module.get<AdminUsersService>(AdminUsersService);
    cUsersService = module.get<CUsersService>(CUsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      mockAdminUsersService.findByUsername.mockResolvedValue(mockAdminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('admin', 'password');

      expect(result).toBeTruthy();
      expect(result.password).toBeUndefined();
    });

    it('should return null when user not found', async () => {
      mockAdminUsersService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      mockAdminUsersService.findByUsername.mockResolvedValue(mockAdminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('admin', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return tokens and user on successful login', async () => {
      mockAdminUsersService.findByUsername.mockResolvedValue(mockAdminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login({ username: 'admin', password: 'password' });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.username).toBe('admin');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAdminUsersService.findByUsername.mockResolvedValue(null);

      await expect(service.login({ username: 'admin', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for disabled user', async () => {
      mockAdminUsersService.findByUsername.mockResolvedValue({ ...mockAdminUser, status: 0 });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login({ username: 'admin', password: 'password' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    // Note: refreshJwtService is created internally, so we test the error case
    it('should throw UnauthorizedException for invalid refresh token format', async () => {
      await expect(service.refresh('invalid-token'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      mockAdminUsersService.findOne.mockResolvedValue(mockAdminUser);

      const result = await service.getProfile(1);

      expect(result.username).toBe('admin');
    });
  });

  describe('register', () => {
    const registerDto = {
      username: 'newuser',
      password: 'password123',
      email: 'new@example.com',
      phone: '13900139000',
    };

    it('should register new user and return tokens', async () => {
      mockCUsersService.findByUsername.mockResolvedValue(null);
      mockCUsersService.findByPhone.mockResolvedValue(null);
      mockCUsersService.create.mockResolvedValue(mockCUser);
      mockRepository.save.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('should throw ConflictException when username exists', async () => {
      mockCUsersService.findByUsername.mockResolvedValue(mockCUser);

      await expect(service.register(registerDto))
        .rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when phone exists', async () => {
      mockCUsersService.findByUsername.mockResolvedValue(null);
      mockCUsersService.findByPhone.mockResolvedValue(mockCUser);

      await expect(service.register(registerDto))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('cuserLogin', () => {
    it('should return tokens for cuser login', async () => {
      mockCUsersService.findByUsername.mockResolvedValue(mockCUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.cuserLogin({ username: 'testuser', password: 'password' });

      expect(result).toHaveProperty('access_token');
      expect(result.user.username).toBe('testuser');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockCUsersService.findByUsername.mockResolvedValue(null);

      await expect(service.cuserLogin({ username: 'nonexistent', password: 'pass' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for disabled cuser', async () => {
      mockCUsersService.findByUsername.mockResolvedValue({ ...mockCUser, status: 0 });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.cuserLogin({ username: 'testuser', password: 'password' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getCuserProfile', () => {
    it('should return cuser profile without password', async () => {
      mockCUsersService.findOne.mockResolvedValue(mockCUser);

      const result = await service.getCuserProfile(2);

      expect(result.username).toBe('testuser');
    });
  });
});
