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
import { memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { ApiResponse } from '../../common/interfaces/pagination.interface';
import { CUserProfileResponseDto, UpdateCUserProfileDto } from '../../dto/c-user-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CuserProfileService } from './cuser-profile.service';
import { StorageService } from '../storage/storage.service';

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
  constructor(
    private readonly profileService: CuserProfileService,
    private readonly storageService: StorageService,
  ) {}

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
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const isImage = /^image\/(png|jpe?g|webp)$/i.test(file.mimetype || '');
        cb(isImage ? null : new BadRequestException('仅支持 PNG、JPG、WebP 图片'), isImage);
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

    const result = await this.storageService.uploadObject({
      key: `avatars/user-${userId}/avatar-${Date.now()}-${randomUUID()}${resolveImageExtension(file)}`,
      body: file.buffer,
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000, immutable',
    });
    const avatarUrl = result.url;
    await this.profileService.update(userId, { avatarUrl });
    return { code: 200, message: 'success', data: { avatarUrl } };
  }
}

function resolveImageExtension(file: Express.Multer.File): string {
  const mimeExtMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  return mimeExtMap[file.mimetype] || '.png';
}
