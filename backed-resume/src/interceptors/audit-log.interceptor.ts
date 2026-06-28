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

    const path = (req.originalUrl || req.url || '').slice(0, 255);
    const method = String(req.method || '').toUpperCase().slice(0, 10) || null;
    const ip = (req.ip || req.headers?.['x-forwarded-for'] || '').toString().slice(0, 50) || null;
    const userAgent = (req.headers?.['user-agent'] || '').toString().slice(0, 500) || null;
    const userId = req.user?.id ?? null;

    const requestBody = safeStringify(maskSensitive({ query: req.query, body: req.body }), 2000) || null;

    let capturedError: any = null;

    return next.handle().pipe(
      catchError((err) => {
        capturedError = err;
        return throwError(() => err);
      }),
      finalize(() => {
        const responseStatus = Number(res?.statusCode) || (capturedError?.status ?? null);
        const errorMessage = capturedError?.message || null;

        // 避免日志影响主流程：异步落库，失败忽略
        Promise.resolve().then(async () => {
          try {
            await this.systemLogs.create({
              userId,
              action: method + ' ' + path,
              method,
              path,
              ip,
              userAgent,
              requestBody,
              responseStatus: responseStatus ?? null,
              errorMessage,
            });
          } catch {
            // ignore
          }
        });
      }),
    );
  }
}

