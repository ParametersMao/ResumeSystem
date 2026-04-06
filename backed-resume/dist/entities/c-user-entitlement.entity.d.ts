import { CUser } from './c-user.entity';
export declare class CUserEntitlement {
    userId: number;
    user: CUser;
    planCode: string;
    accountWeight: number;
    aiFreeTotal: number;
    aiFreeUsed: number;
    aiFreeResetPolicy: string;
    expireAt: Date | null;
    createTime: Date;
    updateTime: Date;
}
