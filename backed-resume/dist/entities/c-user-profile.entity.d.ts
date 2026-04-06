import { CUser } from './c-user.entity';
export declare class CUserProfile {
    userId: number;
    user: CUser;
    nickname: string | null;
    avatarUrl: string | null;
    bio: string | null;
    createTime: Date;
    updateTime: Date;
}
