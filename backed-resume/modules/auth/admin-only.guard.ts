import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.user?.type !== 'admin') {
      throw new ForbiddenException('仅管理员可执行此操作');
    }
    return true;
  }
}
