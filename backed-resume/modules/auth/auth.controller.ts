import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { LoginDto, RefreshTokenDto } from '../../dto/admin-user.dto';
import { CreateCUserDto } from '../../dto/c-user.dto';
import {
  EmailCodeLoginDto,
  EmailRegisterDto,
  ResetPasswordByEmailDto,
  SendEmailCodeDto,
} from '../../dto/email-auth.dto';
import { ApiResponse } from '../../common/interfaces/pagination.interface';
import { AuthService } from './auth.service';
import { EmailAuthService } from './email-auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailAuthService: EmailAuthService,
  ) {}

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<any>> {
    const result = await this.authService.login(loginDto);
    return { code: 200, message: '登录成功', data: result };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() dto: RefreshTokenDto): Promise<ApiResponse<any>> {
    const result = await this.authService.refresh(dto.refresh_token);
    return { code: 200, message: '刷新成功', data: result };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<ApiResponse<any>> {
    this.assertUserType(req.user, 'admin');
    const profile = await this.authService.getProfile(req.user.id);
    return { code: 200, message: 'success', data: profile };
  }

  // 仅供非生产环境保留的兼容注册入口。
  @Post('register')
  @HttpCode(200)
  async register(@Body() createCUserDto: CreateCUserDto): Promise<ApiResponse<any>> {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('请使用邮箱验证码完成注册');
    }
    const result = await this.authService.register(createCUserDto);
    return { code: 200, message: '注册成功', data: result };
  }

  @Post('cuser/login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  async cuserLogin(@Body() loginDto: LoginDto): Promise<ApiResponse<any>> {
    const result = await this.authService.cuserLogin(loginDto);
    return { code: 200, message: '登录成功', data: result };
  }

  @Get('cuser/profile')
  @UseGuards(JwtAuthGuard)
  async getCuserProfile(@Request() req): Promise<ApiResponse<any>> {
    this.assertUserType(req.user, 'cuser');
    const profile = await this.authService.getCuserProfile(req.user.id);
    return { code: 200, message: 'success', data: profile };
  }

  @Get('cuser/center')
  @UseGuards(JwtAuthGuard)
  async getCuserCenter(@Request() req): Promise<ApiResponse<any>> {
    this.assertUserType(req.user, 'cuser');
    const center = await this.authService.getCuserCenter(req.user.id);
    return { code: 200, message: 'success', data: center };
  }

  @Post('email/send-code')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  async sendEmailCode(
    @Body() dto: SendEmailCodeDto,
    @Request() req,
  ): Promise<ApiResponse<any>> {
    const result = await this.emailAuthService.sendCode(
      dto.email,
      dto.purpose,
      req.ip,
    );
    return { code: 200, message: '验证码已发送', data: result };
  }

  @Post('email/register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  async emailRegister(@Body() dto: EmailRegisterDto): Promise<ApiResponse<any>> {
    const result = await this.authService.registerWithEmail(dto);
    return { code: 200, message: '注册成功', data: result };
  }

  @Post('email/login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  async emailLogin(@Body() dto: EmailCodeLoginDto): Promise<ApiResponse<any>> {
    const result = await this.authService.loginWithEmailCode(dto);
    return { code: 200, message: '登录成功', data: result };
  }

  @Post('email/reset-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordByEmailDto): Promise<ApiResponse<any>> {
    const result = await this.authService.resetPasswordByEmail(dto);
    return { code: 200, message: '密码已重置', data: result };
  }

  @Post('cuser/logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logoutCuser(@Request() req): Promise<ApiResponse<any>> {
    this.assertUserType(req.user, 'cuser');
    const result = await this.authService.logoutCuserEverywhere(req.user.id);
    return { code: 200, message: '已安全退出', data: result };
  }

  private assertUserType(user: any, expectedType: 'admin' | 'cuser') {
    if (!user?.id) {
      throw new UnauthorizedException('用户信息无效');
    }
    if (user.type !== expectedType) {
      throw new UnauthorizedException('无权限');
    }
  }
}
