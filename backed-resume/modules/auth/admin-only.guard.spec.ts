import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminOnlyGuard } from './admin-only.guard';

describe('AdminOnlyGuard RBAC', () => {
  const context = (user: any, method = 'GET') => ({
    switchToHttp: () => ({ getRequest: () => ({ user, method }) }),
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
  } as unknown as ExecutionContext);

  it('allows viewers to read admin resources', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    expect(new AdminOnlyGuard(reflector).canActivate(context({ type: 'admin', role: 'viewer' }))).toBe(true);
  });

  it('blocks viewers from write operations', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    expect(() => new AdminOnlyGuard(reflector).canActivate(
      context({ type: 'admin', role: 'viewer' }, 'DELETE'),
    )).toThrow(ForbiddenException);
  });

  it('honors endpoint-specific role restrictions', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['admin']) } as unknown as Reflector;
    expect(() => new AdminOnlyGuard(reflector).canActivate(
      context({ type: 'admin', role: 'operator' }),
    )).toThrow(ForbiddenException);
  });

  it('allows operators to perform ordinary content writes', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    expect(new AdminOnlyGuard(reflector).canActivate(
      context({ type: 'admin', role: 'operator' }, 'POST'),
    )).toBe(true);
  });
});
