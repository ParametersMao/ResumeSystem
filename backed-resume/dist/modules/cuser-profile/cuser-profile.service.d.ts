import { Repository } from 'typeorm';
import { CUserProfile } from '../../entities/c-user-profile.entity';
import { UpdateCUserProfileDto } from '../../dto/c-user-profile.dto';
export declare class CuserProfileService {
    private readonly profileRepo;
    constructor(profileRepo: Repository<CUserProfile>);
    getOrCreate(userId: number): Promise<CUserProfile>;
    update(userId: number, dto: UpdateCUserProfileDto): Promise<CUserProfile>;
}
