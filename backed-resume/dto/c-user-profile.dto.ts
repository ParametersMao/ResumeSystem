import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateCUserProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  avatarUrl?: string;
}

export class CUserProfileResponseDto {
  userId: number;
  nickname: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createTime: Date;
  updateTime: Date;
}
