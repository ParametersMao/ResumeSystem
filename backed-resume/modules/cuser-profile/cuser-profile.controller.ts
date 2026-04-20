import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { extname, join } from 'path';
import { ApiResponse } from '../../common/interfaces/pagination.interface';
import { CUserProfileResponseDto, UpdateCUserProfileDto } from '../../dto/c-user-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CuserProfileService } from './cuser-profile.service';

function ensureCuser(req: any) {
  if (!req.user?.id) {
    throw new UnauthorizedException('用户信息无效');
  }
  if (req.user.type !== 'cuser') {
    throw new UnauthorizedException('无权限访问 C 端用户资料');
  }
  return req.user.id as number;
}

@Controller('api/cuser')
export class CuserProfileController {
  constructor(private readonly profileService: CuserProfileService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<ApiResponse<CUserProfileResponseDto>> {
    const userId = ensureCuser(req);
    const profile = await this.profileService.getProfile(userId);
    return { code: 200, message: 'success', data: profile };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req,
    @Body() dto: UpdateCUserProfileDto,
  ): Promise<ApiResponse<CUserProfileResponseDto>> {
    const userId = ensureCuser(req);
    const profile = await this.profileService.update(userId, dto);
    return { code: 200, message: 'success', data: profile };
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = join(process.cwd(), 'uploads', 'avatars');
          mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const safeExt = (extname(file.originalname || '') || '.png').slice(0, 10);
          const name = `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const isImage = /^image\/(png|jpeg|jpg|webp|gif|svg\+xml)$/i.test(file.mimetype || '');
        cb(isImage ? null : new BadRequestException('仅支持图片文件'), isImage);
      },
    }),
  )
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<{ avatarUrl: string }>> {
    const userId = ensureCuser(req);

    if (!file) {
      const avatarUrl = '/mock/avatar/default.svg';
      await this.profileService.update(userId, { avatarUrl });
      return { code: 200, message: 'success', data: { avatarUrl } };
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    await this.profileService.update(userId, { avatarUrl });
    return { code: 200, message: 'success', data: { avatarUrl } };
  }
}
