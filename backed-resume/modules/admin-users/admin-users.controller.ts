import { Controller, Get, Post, Put, Delete, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto, UpdateAdminUserDto, UpdateAdminUserStatusDto, AdminUserResponseDto } from '../../dto/admin-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedApiResponse, ApiResponse } from '../../common/interfaces/pagination.interface';
import { AdminUser } from '../../entities/admin-user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminOnlyGuard, AdminRoles } from '../auth/admin-only.guard';

@Controller('api/admin/users')
@UseGuards(JwtAuthGuard, AdminOnlyGuard)
@AdminRoles('admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedApiResponse<AdminUserResponseDto>> {
    const result = await this.adminUsersService.findAll(paginationDto);
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Post()
  async create(@Body() createAdminUserDto: CreateAdminUserDto): Promise<ApiResponse<AdminUserResponseDto>> {
    const user = await this.adminUsersService.create(createAdminUserDto);
    return {
      code: 200,
      message: '用户创建成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createTime: user.createTime,
        updateTime: user.updateTime,
      },
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
  ): Promise<ApiResponse<AdminUserResponseDto>> {
    const user = await this.adminUsersService.update(+id, updateAdminUserDto);
    return {
      code: 200,
      message: '用户更新成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createTime: user.createTime,
        updateTime: user.updateTime,
      },
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAdminUserStatusDto,
  ): Promise<ApiResponse<AdminUserResponseDto>> {
    const user = await this.adminUsersService.updateStatus(+id, updateStatusDto);
    return {
      code: 200,
      message: '状态更新成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createTime: user.createTime,
        updateTime: user.updateTime,
      },
    };
  }

  @Patch(':id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body() body: { password: string },
  ): Promise<ApiResponse<AdminUserResponseDto>> {
    const user = await this.adminUsersService.resetPassword(+id, body.password);
    return {
      code: 200,
      message: '密码重置成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createTime: user.createTime,
        updateTime: user.updateTime,
      },
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.adminUsersService.remove(+id);
    return {
      code: 200,
      message: '用户删除成功',
      data: null,
    };
  }
}
