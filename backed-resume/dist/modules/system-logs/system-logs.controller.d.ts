import { SystemLogsService } from './system-logs.service';
import { PaginatedApiResponse } from '../../common/interfaces/pagination.interface';
export declare class SystemLogsController {
    private readonly service;
    constructor(service: SystemLogsService);
    list(page?: string, limit?: string, userId?: string, route?: string, method?: string): Promise<PaginatedApiResponse<any>>;
}
