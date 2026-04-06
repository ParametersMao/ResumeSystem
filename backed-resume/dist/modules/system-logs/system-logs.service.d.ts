import { Repository } from 'typeorm';
import { SystemLog } from '../../entities/system-log.entity';
export declare class SystemLogsService {
    private readonly repo;
    constructor(repo: Repository<SystemLog>);
    create(log: Partial<SystemLog>): Promise<SystemLog>;
    findAll(params: {
        page?: number;
        limit?: number;
        userId?: number;
        route?: string;
        method?: string;
    }): Promise<{
        list: SystemLog[];
        total: number;
        page: number;
        limit: number;
    }>;
}
