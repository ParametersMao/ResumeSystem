export declare class SystemLog {
    id: number;
    userId: number | null;
    userType: string | null;
    route: string;
    method: string;
    ip: string | null;
    userAgent: string | null;
    statusCode: number | null;
    durationMs: number | null;
    paramsJson: string | null;
    createTime: Date;
}
