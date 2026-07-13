import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CUsersService } from '../c-users/c-users.service';
import { AdminUsersService } from '../admin-users/admin-users.service';

function resolveAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (secret && secret.trim()) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_ACCESS_SECRET is required in production');
  }
  return 'dev-access-secret-fallback';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly cUsersService: CUsersService,
    private readonly adminUsersService: AdminUsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: resolveAccessSecret(),
    });
  }

  async validate(payload: any) {
    const type = payload.type ?? (payload.role ? 'admin' : 'cuser');
    if (type === 'cuser') {
      const user = await this.cUsersService.findOne(payload.sub);
      if (
        user.status === 0 ||
        Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0)
      ) {
        throw new UnauthorizedException('登录状态已失效，请重新登录');
      }
    } else if (type === 'admin') {
      const user = await this.adminUsersService.findOne(payload.sub);
      if (
        user.status === 0 ||
        Number(payload.tokenVersion || 0) !== Number(user.tokenVersion || 0) ||
        payload.role !== user.role
      ) {
        throw new UnauthorizedException('登录状态已失效，请重新登录');
      }
    }
    return {
      id: payload.sub,
      username: payload.username,
      type,
      role: payload.role,
    };
  }
}
