import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SystemLogsService } from '../../modules/system-logs/system-logs.service';
export declare class AuditLogInterceptor implements NestInterceptor {
    private readonly systemLogs;
    constructor(systemLogs: SystemLogsService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
