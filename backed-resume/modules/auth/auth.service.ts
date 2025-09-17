import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminUsersService } from '../admin-users/admin-users.service';
import { CUsersService } from '../c-users/c-users.service';
import { LoginDto } from '../../dto/admin-user.dto';
import { CreateCUserDto } from '../../dto/c-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private adminUsersService: AdminUsersService,
    private cUsersService: CUsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    console.log('validateUser called', username);
    const user = await this.adminUsersService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    console.log('authService.login called', loginDto);
    try {
      const user = await this.validateUser(loginDto.username, loginDto.password);
      if (!user) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      if (user.status === 0) {
        throw new UnauthorizedException('用户已被禁用');
      }

      const payload = { username: user.username, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };
    } catch (e) {
      console.error('login error', e);
      throw e;
    }
  }

  async getProfile(userId: number) {
    const user = await this.adminUsersService.findOne(userId);
    const { password, ...result } = user;
    return result;
  }

  // C端用户注册
  async register(createCUserDto: CreateCUserDto) {
    try {
      // 检查用户名是否已存在
      const existingUser = await this.cUsersService.findByUsername(createCUserDto.username);
      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }

      // 检查手机号是否已存在（如果提供了手机号）
      if (createCUserDto.phone) {
        const existingPhone = await this.cUsersService.findByPhone(createCUserDto.phone);
        if (existingPhone) {
          throw new ConflictException('手机号已存在');
        }
      }

      // 创建用户
      const user = await this.cUsersService.create(createCUserDto);

      // 生成JWT token
      const payload = { username: user.username, sub: user.id, type: 'cuser' };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
      };
    } catch (e) {
      console.error('register error', e);
      throw e;
    }
  }

  // C端用户登录
  async cuserLogin(loginDto: LoginDto) {
    try {
      const user = await this.validateCUser(loginDto.username, loginDto.password);
      if (!user) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      if (user.status === 0) {
        throw new UnauthorizedException('用户已被禁用');
      }

      const payload = { username: user.username, sub: user.id, type: 'cuser' };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
      };
    } catch (e) {
      console.error('cuserLogin error', e);
      throw e;
    }
  }

  // 验证C端用户
  async validateCUser(username: string, password: string): Promise<any> {
    const user = await this.cUsersService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 获取C端用户信息
  async getCuserProfile(userId: number) {
    const user = await this.cUsersService.findOne(userId);
    const { password, ...result } = user;
    return result;
  }
} 