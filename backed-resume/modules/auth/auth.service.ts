import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminUsersService } from '../admin-users/admin-users.service';
import { CUsersService } from '../c-users/c-users.service';
import { LoginDto } from '../../dto/admin-user.dto';
import { CreateCUserDto } from '../../dto/c-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from '../../entities/resume.entity';
import { CUserProfile } from '../../entities/c-user-profile.entity';
import { CUserEntitlement } from '../../entities/c-user-entitlement.entity';
import { EmailAuthService } from './email-auth.service';
import { EmailRegisterDto, EmailCodeLoginDto, ResetPasswordByEmailDto } from '../../dto/email-auth.dto';
import { EntitlementsService } from '../entitlements/entitlements.service';

@Injectable()
export class AuthService implements OnModuleInit {
  // 独立的 refresh token service，在类内部创建
  private refreshJwtService: JwtService;

  constructor(
    private adminUsersService: AdminUsersService,
    private cUsersService: CUsersService,
    private jwtService: JwtService, // access token service (injected by Nest)
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(CUserProfile)
    private cUserProfileRepository: Repository<CUserProfile>,
    @InjectRepository(CUserEntitlement)
    private cUserEntitlementRepository: Repository<CUserEntitlement>,
    private readonly emailAuthService: EmailAuthService,
    private readonly entitlementsService: EntitlementsService,
  ) {
    // 在构造函数中初始化 refresh token service
    this.refreshJwtService = new JwtService({
      secret: this.resolveJwtSecret('JWT_REFRESH_SECRET', 'dev-refresh-secret-fallback'),
      signOptions: { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
    });
  }

  private resolveJwtSecret(envName: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET', devFallback: string): string {
    const secret = process.env[envName];
    if (secret && secret.trim() !== '') {
      return secret;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`${envName} is required in production`);
    }

    return devFallback;
  }

  private getJwtConfig() {
    return {
      accessSecret: this.resolveJwtSecret('JWT_ACCESS_SECRET', 'dev-access-secret-fallback'),
      refreshSecret: this.resolveJwtSecret('JWT_REFRESH_SECRET', 'dev-refresh-secret-fallback'),
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    };
  }

  private buildAccessToken(payload: any): string {
    const cfg = this.getJwtConfig();
    return this.jwtService.sign(payload, {
      secret: cfg.accessSecret,
      expiresIn: cfg.accessExpiresIn,
    });
  }

  private buildRefreshToken(payload: any): string {
    const cfg = this.getJwtConfig();
    return this.refreshJwtService.sign(payload, {
      secret: cfg.refreshSecret,
      expiresIn: cfg.refreshExpiresIn,
    });
  }

  private issueTokens(payload: any, userId: number, type: 'admin' | 'cuser') {
    const access_token = this.buildAccessToken(payload);
    const refresh_token = this.buildRefreshToken({
      sub: userId,
      type,
      tokenVersion: Number(payload.tokenVersion || 0),
    });
    return { access_token, refresh_token };
  }

  async onModuleInit() {
    const bootstrapUsername = String(process.env.BOOTSTRAP_ADMIN_USERNAME || '').trim();
    const bootstrapPassword = String(process.env.BOOTSTRAP_ADMIN_PASSWORD || '');
    if (bootstrapUsername || bootstrapPassword) {
      if (!bootstrapUsername || !bootstrapPassword) {
        throw new Error('BOOTSTRAP_ADMIN_USERNAME and BOOTSTRAP_ADMIN_PASSWORD must be configured together');
      }
      await this.adminUsersService.ensureBootstrapAdminAccount(bootstrapUsername, bootstrapPassword);
    }

    if (process.env.NODE_ENV === 'production') {
      return;
    }

    try {
      await this.adminUsersService.ensureDevAdminAccount();
      const cuser = await this.cUsersService.ensureDevTestUser();

      const [profile, entitlement] = await Promise.all([
        this.cUserProfileRepository.findOne({ where: { userId: cuser.id } }),
        this.cUserEntitlementRepository.findOne({ where: { userId: cuser.id } }),
      ]);

      if (!profile) {
        await this.cUserProfileRepository.save({ userId: cuser.id });
      }

      if (!entitlement) {
        await this.cUserEntitlementRepository.save({
          userId: cuser.id,
          planCode: 'free',
          accountWeight: 0,
          aiFreeTotal: 10,
          aiFreeUsed: 0,
          aiFreeResetPolicy: 'monthly',
          expireAt: null,
        });
      }
    } catch (error) {
      console.error('ensure dev auth accounts failed:', error);
    }
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.adminUsersService.findByUsername(username);
    if (user && await this.adminUsersService.verifyPassword(user, password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.username, loginDto.password);
      if (!user) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      if (user.status === 0) {
        throw new UnauthorizedException('用户已被禁用');
      }

      const payload = { username: user.username, sub: user.id, role: user.role, type: 'admin', tokenVersion: user.tokenVersion || 0 };
      const { access_token, refresh_token } = this.issueTokens(payload, user.id, 'admin');

      return {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };
    } catch (e) {
      throw e;
    }
  }

  async refresh(refreshToken: string) {
    const cfg = this.getJwtConfig();
    let payload: any;
    try {
      payload = this.refreshJwtService.verify(refreshToken, {
        secret: cfg.refreshSecret,
      });
    } catch (e) {
      throw new UnauthorizedException('refresh_token 无效或已过期');
    }

    if (payload.type === 'admin') {
      const user = await this.adminUsersService.findOne(payload.sub);
      if (!user || user.status === 0) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }
      if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
        throw new UnauthorizedException('登录状态已失效，请重新登录');
      }
      const newPayload = { username: user.username, sub: user.id, role: user.role, type: 'admin', tokenVersion: user.tokenVersion || 0 };
      const { access_token, refresh_token } = this.issueTokens(newPayload, user.id, 'admin');
      return { access_token, refresh_token };
    } else if (payload.type === 'cuser') {
      const user = await this.cUsersService.findOne(payload.sub);
      if (!user || user.status === 0) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }
      if (Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
        throw new UnauthorizedException('登录状态已失效，请重新登录');
      }
      const newPayload = {
        username: user.username,
        sub: user.id,
        type: 'cuser',
        tokenVersion: user.tokenVersion || 0,
      };
      const { access_token, refresh_token } = this.issueTokens(newPayload, user.id, 'cuser');
      return { access_token, refresh_token };
    } else {
      throw new UnauthorizedException('无效的 token 类型');
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
      const existingUser = await this.cUsersService.findByUsername(createCUserDto.username);
      if (existingUser) {
        throw new ConflictException('用户名已存在');
      }

      if (createCUserDto.phone) {
        const existingPhone = await this.cUsersService.findByPhone(createCUserDto.phone);
        if (existingPhone) {
          throw new ConflictException('手机号已存在');
        }
      }

      const user = await this.cUsersService.create(createCUserDto);

      await Promise.all([
        this.cUserProfileRepository.save({ userId: user.id }),
        this.cUserEntitlementRepository.save({
          userId: user.id,
          planCode: 'free',
          accountWeight: 0,
          aiFreeTotal: 10,
          aiFreeUsed: 0,
          aiFreeResetPolicy: 'monthly',
          expireAt: null,
        }),
      ]);

      const payload = {
        username: user.username,
        sub: user.id,
        type: 'cuser',
        tokenVersion: user.tokenVersion || 0,
      };
      const { access_token, refresh_token } = this.issueTokens(payload, user.id, 'cuser');

      return {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
      };
    } catch (e) {
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

      const payload = {
        username: user.username,
        sub: user.id,
        type: 'cuser',
        tokenVersion: user.tokenVersion || 0,
      };
      const { access_token, refresh_token } = this.issueTokens(payload, user.id, 'cuser');

      return {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
      };
    } catch (e) {
      throw e;
    }
  }

  async validateCUser(username: string, password: string): Promise<any> {
    const normalized = String(username || '').trim();
    const user = normalized.includes('@')
      ? await this.cUsersService.findByEmail(normalized)
      : await this.cUsersService.findByUsername(normalized);
    if (user && await this.cUsersService.verifyPassword(user, password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async registerWithEmail(dto: EmailRegisterDto) {
    const email = dto.email.trim().toLowerCase();
    await this.emailAuthService.consumeCode(email, 'register', dto.code);
    if (await this.cUsersService.findByEmail(email)) {
      throw new ConflictException('该邮箱已注册');
    }

    const username = await this.resolveAvailableUsername(dto.username, email);
    const user = await this.cUsersService.create({
      username,
      password: dto.password,
      email,
      status: 1,
    });
    await Promise.all([
      this.cUserProfileRepository.save({ userId: user.id }),
      this.cUserEntitlementRepository.save({
        userId: user.id,
        planCode: 'free',
        accountWeight: 0,
        aiFreeTotal: 10,
        aiFreeUsed: 0,
        aiFreeResetPolicy: 'monthly',
        expireAt: null,
      }),
      this.emailAuthService.bindEmailIdentity(user.id, email),
    ]);
    return this.buildCuserSession(user);
  }

  async loginWithEmailCode(dto: EmailCodeLoginDto) {
    const email = dto.email.trim().toLowerCase();
    await this.emailAuthService.consumeCode(email, 'login', dto.code);
    const user = await this.cUsersService.findByEmail(email);
    if (!user || user.status === 0) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }
    await this.emailAuthService.bindEmailIdentity(user.id, email);
    return this.buildCuserSession(user);
  }

  async resetPasswordByEmail(dto: ResetPasswordByEmailDto) {
    const email = dto.email.trim().toLowerCase();
    await this.emailAuthService.consumeCode(email, 'reset-password', dto.code);
    const user = await this.cUsersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('该邮箱尚未注册');
    }
    await this.cUsersService.updatePassword(user.id, dto.newPassword);
    return { success: true };
  }

  async logoutCuserEverywhere(userId: number) {
    await this.cUsersService.invalidateSessions(userId);
    return { success: true };
  }

  private buildCuserSession(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      type: 'cuser',
      tokenVersion: user.tokenVersion || 0,
    };
    const { access_token, refresh_token } = this.issueTokens(payload, user.id, 'cuser');
    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
    };
  }

  private async resolveAvailableUsername(preferred: string | undefined, email: string) {
    const base = (preferred || email.split('@')[0] || 'user')
      .replace(/[^\w-]/g, '')
      .slice(0, 24) || 'user';
    if (!(await this.cUsersService.findByUsername(base))) {
      return base;
    }
    for (let index = 1; index <= 100; index += 1) {
      const candidate = `${base.slice(0, 24)}${String(index).padStart(2, '0')}`;
      if (!(await this.cUsersService.findByUsername(candidate))) {
        return candidate;
      }
    }
    return `user${Date.now()}`;
  }

  async getCuserProfile(userId: number) {
    const user = await this.cUsersService.findOne(userId);
    const { password, ...result } = user;
    return result;
  }

  async getCuserCenter(userId: number) {
    const user = await this.cUsersService.findOne(userId);
    const { password, ...safeUser } = user as any;

    let [profile, entitlementSummary, lastEditedResume] = await Promise.all([
      this.cUserProfileRepository.findOne({ where: { userId } }),
      this.entitlementsService.getSummary(userId),
      this.resumeRepository.findOne({
        where: { userId, status: 1 },
        order: { updateTime: 'DESC' },
        relations: ['template'],
      }),
    ]);

    if (!profile) {
      profile = await this.cUserProfileRepository.save({ userId });
    }
    return {
      user: safeUser,
      profile,
      entitlements: entitlementSummary,
      lastEditedResume: lastEditedResume
        ? {
            id: lastEditedResume.id,
            title: lastEditedResume.title,
            templateId: lastEditedResume.templateId,
            templateName: lastEditedResume.template?.templateName,
            previewImage: lastEditedResume.previewImage,
            version: lastEditedResume.version,
            updateTime: lastEditedResume.updateTime,
          }
        : null,
    };
  }
}
