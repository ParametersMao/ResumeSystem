import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CUserProfile } from '../../entities/c-user-profile.entity';
import { CuserProfileController } from './cuser-profile.controller';
import { CuserProfileService } from './cuser-profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([CUserProfile])],
  controllers: [CuserProfileController],
  providers: [CuserProfileService],
  exports: [CuserProfileService],
})
export class CuserProfileModule {}

