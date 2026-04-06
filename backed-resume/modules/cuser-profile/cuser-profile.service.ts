import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CUserProfile } from '../../entities/c-user-profile.entity';
import { UpdateCUserProfileDto } from '../../dto/c-user-profile.dto';

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

  async update(userId: number, dto: UpdateCUserProfileDto): Promise<CUserProfile> {
    const profile = await this.getOrCreate(userId);
    if (dto.nickname !== undefined) profile.nickname = dto.nickname ?? null;
    if (dto.bio !== undefined) profile.bio = dto.bio ?? null;
    if (dto.avatarUrl !== undefined) profile.avatarUrl = dto.avatarUrl ?? null;
    return await this.profileRepo.save(profile);
  }
}

