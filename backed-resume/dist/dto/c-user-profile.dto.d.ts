export declare class UpdateCUserProfileDto {
    nickname?: string;
    bio?: string;
    avatarUrl?: string;
}
export declare class CUserProfileResponseDto {
    userId: number;
    nickname: string | null;
    bio: string | null;
    avatarUrl: string | null;
    createTime: Date;
    updateTime: Date;
}
