import {
  BadRequestException,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiResponse } from '../../common/interfaces/pagination.interface';
import { CuserProfileService } from './cuser-profile.service';
import { UpdateCUserProfileDto } from '../../dto/c-user-profile.dto';

function ensureCuser(req: any) {
  if (!req.user?.id) throw new UnauthorizedException('用户信息无效');
  if (req.user.type !== 'cuser') throw new UnauthorizedException('无权限');
  return req.user.id as number;
}

@Controller('api/cuser')
export class CuserProfileController {
  constructor(private readonly profileService: CuserProfileService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<ApiResponse<any>> {
    const userId = ensureCuser(req);
    const profile = await this.profileService.getOrCreate(userId);
    return { code: 200, message: 'success', data: profile };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() dto: UpdateCUserProfileDto): Promise<ApiResponse<any>> {
    const userId = ensureCuser(req);
    const profile = await this.profileService.update(userId, dto);
    return { code: 200, message: 'success', data: profile };
  }

  // 头像上传：不接 OSS，保存到本地 uploads/avatars 并返回可访问 URL
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
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
      const ok = /^image\/(png|jpeg|jpg|webp|gif|svg\+xml)$/i.test(file.mimetype || '');
      cb(ok ? null : new BadRequestException('仅支持图片文件'), ok);
    },
  }))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<{ avatarUrl: string }>> {
    const userId = ensureCuser(req);
    if (!file) {
      // 兜底：返回 mock 头像
      const avatarUrl = '/mock/avatar/default.svg';
      await this.profileService.update(userId, { avatarUrl });
      return { code: 200, message: 'success', data: { avatarUrl } };
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    await this.profileService.update(userId, { avatarUrl });
    return { code: 200, message: 'success', data: { avatarUrl } };
  }
}

