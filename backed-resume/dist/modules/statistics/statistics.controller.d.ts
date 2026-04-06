import { StatisticsService } from './statistics.service';
import { ApiResponse } from '../../common/interfaces/pagination.interface';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getOverview(): Promise<ApiResponse<any>>;
    getTrend(period?: string): Promise<ApiResponse<any>>;
    getPopularTemplates(limit?: string): Promise<ApiResponse<any>>;
    getUserActivity(): Promise<ApiResponse<any>>;
}
