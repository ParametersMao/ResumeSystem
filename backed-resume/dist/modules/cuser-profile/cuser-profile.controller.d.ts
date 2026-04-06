import { ApiResponse } from '../../common/interfaces/pagination.interface';
import { CuserProfileService } from './cuser-profile.service';
import { UpdateCUserProfileDto } from '../../dto/c-user-profile.dto';
export declare class CuserProfileController {
    private readonly profileService;
    constructor(profileService: CuserProfileService);
    getProfile(req: any): Promise<ApiResponse<any>>;
    updateProfile(req: any, dto: UpdateCUserProfileDto): Promise<ApiResponse<any>>;
    uploadAvatar(req: any, file?: Express.Multer.File): Promise<ApiResponse<{
        avatarUrl: string;
    }>>;
}
