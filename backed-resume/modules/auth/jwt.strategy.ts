import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-fallback',
    });
  }

  async validate(payload: any) {
    const type = payload.type ?? (payload.role ? 'admin' : 'cuser');
    return {
      id: payload.sub,
      username: payload.username,
      type,
      role: payload.role,
    };
  }
}
