import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export type AdminRole = 'admin' | 'operator' | 'viewer';
export const ADMIN_ROLES_KEY = 'adminRoles';
export const AdminRoles = (...roles: AdminRole[]) =>
  SetMetadata(ADMIN_ROLES_KEY, roles);

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.user?.type !== 'admin') {
      throw new ForbiddenException('仅管理员可执行此操作');
    }
    const role = (request.user.role || 'viewer') as AdminRole;
    const configuredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ADMIN_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const isReadOnlyRequest = ['GET', 'HEAD', 'OPTIONS'].includes(
      String(request.method || '').toUpperCase(),
    );
    const allowedRoles: AdminRole[] = configuredRoles?.length
      ? configuredRoles
      : isReadOnlyRequest
        ? ['admin', 'operator', 'viewer']
        : ['admin', 'operator'];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException('当前后台角色没有执行此操作的权限');
    }
    return true;
  }
}
