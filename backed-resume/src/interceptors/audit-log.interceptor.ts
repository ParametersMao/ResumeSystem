import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, finalize, throwError } from 'rxjs';
import { SystemLogsService } from '../../modules/system-logs/system-logs.service';

function safeStringify(input: any, maxLen = 2000): string {
  try {
    const json = JSON.stringify(input);
    if (!json) return '';
    return json.length > maxLen ? json.slice(0, maxLen) : json;
  } catch {
    return '';
  }
}

function maskSensitive(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  const keys = ['password', 'token', 'access_token', 'authorization', 'secret'];
  for (const k of Object.keys(clone)) {
    if (keys.includes(k.toLowerCase())) {
      clone[k] = '[masked]';
    } else if (typeof clone[k] === 'object' && clone[k] !== null) {
      clone[k] = maskSensitive(clone[k]);
    }
  }
  return clone;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly systemLogs: SystemLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startedAt = Date.now();
    const http = context.switchToHttp();
    const req: any = http.getRequest();
    const res: any = http.getResponse();

    const route = (req.originalUrl || req.url || '').slice(0, 255);
    const method = String(req.method || '').toUpperCase().slice(0, 12);
    const ip = (req.ip || req.headers?.['x-forwarded-for'] || '').toString().slice(0, 64) || null;
    const userAgent = (req.headers?.['user-agent'] || '').toString().slice(0, 512) || null;
    const userId = req.user?.id ?? null;
    const userType = req.user?.type ?? null;

    const paramsJson = safeStringify(maskSensitive({ query: req.query, body: req.body }), 2000) || null;

    let capturedError: any = null;

    return next.handle().pipe(
      catchError((err) => {
        capturedError = err;
        return throwError(() => err);
      }),
      finalize(() => {
        const durationMs = Date.now() - startedAt;
        const statusCode = Number(res?.statusCode) || (capturedError?.status ?? null);

        // 避免日志影响主流程：异步落库，失败忽略
        Promise.resolve().then(async () => {
          try {
            await this.systemLogs.create({
              userId,
              userType,
              route,
              method,
              ip,
              userAgent,
              statusCode: statusCode ?? null,
              durationMs,
              paramsJson,
            });
          } catch {
            // ignore
          }
        });
      }),
    );
  }
}

