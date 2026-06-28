import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CUserProfile } from '../../entities/c-user-profile.entity';
import { CUserProfileResponseDto, UpdateCUserProfileDto } from '../../dto/c-user-profile.dto';

@Injectable()
export class CuserProfileService {
  constructor(
    @InjectRepository(CUserProfile)
    private readonly profileRepo: Repository<CUserProfile>,
  ) {}

  async getOrCreate(userId: number): Promise<CUserProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = await this.profileRepo.save({ userId });
    }
    return profile;
  }

  async getProfile(userId: number): Promise<CUserProfileResponseDto> {
    return this.toResponse(await this.getOrCreate(userId));
  }

  async update(userId: number, dto: UpdateCUserProfileDto): Promise<CUserProfileResponseDto> {
    const profile = await this.getOrCreate(userId);
    if (dto.nickname !== undefined) profile.realName = dto.nickname ?? null;
    if (dto.bio !== undefined) profile.bio = dto.bio ?? null;
    if (dto.avatarUrl !== undefined) profile.avatar = dto.avatarUrl ?? null;
    return this.toResponse(await this.profileRepo.save(profile));
  }

  private toResponse(profile: CUserProfile): CUserProfileResponseDto {
    return {
      userId: profile.userId,
      nickname: profile.realName ?? null,
      bio: profile.bio ?? null,
      avatarUrl: profile.avatar ?? null,
      createTime: profile.createTime,
      updateTime: profile.updateTime,
    };
  }
}

