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

@Module({
  imports: [
    AdminUsersModule,
    CUsersModule,
    TypeOrmModule.forFeature([Resume, CUserProfile, CUserEntitlement]),
    PassportModule,
    // Access token JwtService
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-fallback',
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
