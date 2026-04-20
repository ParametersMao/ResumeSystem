import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, UnauthorizedException, Headers } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from '../../dto/admin-user.dto';
import { CreateCUserDto } from '../../dto/c-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiResponse } from '../../common/interfaces/pagination.interface';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<any>> {
    console.log('login called', loginDto);
    const result = await this.authService.login(loginDto);
    return {
      code: 200,
      message: '登录成功',
      data: result,
    };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() dto: RefreshTokenDto): Promise<ApiResponse<any>> {
    const result = await this.authService.refresh(dto.refresh_token);
    return {
      code: 200,
      message: '刷新成功',
      data: result,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<ApiResponse<any>> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('用户信息无效');
    }
    if (req.user.type !== 'admin') {
      throw new UnauthorizedException('无权限');
    }
    const profile = await this.authService.getProfile(req.user.id);
    return {
      code: 200,
      message: 'success',
      data: profile,
    };
  }

  // C端用户注册
  @Post('register')
  @HttpCode(200)
  async register(@Body() createCUserDto: CreateCUserDto): Promise<ApiResponse<any>> {
    const result = await this.authService.register(createCUserDto);
    return {
      code: 200,
      message: '注册成功',
      data: result,
    };
  }

  // C端用户登录
  @Post('cuser/login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  async cuserLogin(@Body() loginDto: LoginDto): Promise<ApiResponse<any>> {
    const result = await this.authService.cuserLogin(loginDto);
    return {
      code: 200,
      message: '登录成功',
      data: result,
    };
  }

  // C端用户个人信息
  @Get('cuser/profile')
  @UseGuards(JwtAuthGuard)
  async getCuserProfile(@Request() req): Promise<ApiResponse<any>> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('用户信息无效');
    }
    if (req.user.type !== 'cuser') {
      throw new UnauthorizedException('无权限');
    }
    const profile = await this.authService.getCuserProfile(req.user.id);
    return {
      code: 200,
      message: 'success',
      data: profile,
    };
  }

  // C端用户个人中心聚合信息（个人资料 + 权益/配额 + 上次编辑简历）
  @Get('cuser/center')
  @UseGuards(JwtAuthGuard)
  async getCuserCenter(@Request() req): Promise<ApiResponse<any>> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('用户信息无效');
    }
    if (req.user.type !== 'cuser') {
      throw new UnauthorizedException('无权限');
    }
    const center = await this.authService.getCuserCenter(req.user.id);
    return {
      code: 200,
      message: 'success',
      data: center,
    };
  }
}
