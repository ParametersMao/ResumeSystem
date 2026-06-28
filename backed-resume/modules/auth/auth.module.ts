import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminUsersModule } from '../admin-users/admin-users.module';
import { CUsersModule } from '../c-users/c-users.module';
import { JwtStrategy } from './jwt.strategy';
import { Resume } from '../../entities/resume.entity';
import { CUserProfile } from '../../entities/c-user-profile.entity';
import { CUserEntitlement } from '../../entities/c-user-entitlement.entity';
import { EmailVerificationCode } from '../../entities/email-verification-code.entity';
import { UserIdentity } from '../../entities/user-identity.entity';
import { EmailAuthService } from './email-auth.service';
import { SystemConfigModule } from '../system-config/system-config.module';
import { EntitlementsModule } from '../entitlements/entitlements.module';

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

@Module({
  imports: [
    AdminUsersModule,
    CUsersModule,
    SystemConfigModule,
    EntitlementsModule,
    TypeOrmModule.forFeature([
      Resume,
      CUserProfile,
      CUserEntitlement,
      EmailVerificationCode,
      UserIdentity,
    ]),
    PassportModule,
    // Access token JwtService
    JwtModule.register({
      secret: resolveAccessSecret(),
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailAuthService],
  exports: [AuthService],
})
export class AuthModule {}
