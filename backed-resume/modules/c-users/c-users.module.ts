import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CUsersController } from './c-users.controller';
import { CUsersService } from './c-users.service';
import { CUser } from '../../entities/c-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CUser])],
  controllers: [CUsersController],
  providers: [CUsersService],
  exports: [CUsersService],
})
export class CUsersModule {} 