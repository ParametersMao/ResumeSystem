import { Controller, Get, Post, Put, Delete, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CUsersService } from './c-users.service';
import { CreateCUserDto, UpdateCUserDto, UpdateCUserStatusDto, CUserResponseDto } from '../../dto/c-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedApiResponse, ApiResponse } from '../../common/interfaces/pagination.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminOnlyGuard } from '../auth/admin-only.guard';

@Controller('api/cusers')
@UseGuards(JwtAuthGuard, AdminOnlyGuard)
export class CUsersController {
  constructor(private readonly cUsersService: CUsersService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedApiResponse<CUserResponseDto>> {
    const result = await this.cUsersService.findAll(paginationDto);
    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Post()
  async create(@Body() createCUserDto: CreateCUserDto): Promise<ApiResponse<CUserResponseDto>> {
    const user = await this.cUsersService.create(createCUserDto);
    return {
      code: 200,
      message: '用户创建成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        status: user.status,
        createTime: user.createTime,
        updateTime: user.updateTime,
        aiOperationCount: user.aiOperationCount,
      },
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCUserDto: UpdateCUserDto,
  ): Promise<ApiResponse<CUserResponseDto>> {
    const user = await this.cUsersService.update(+id, updateCUserDto);
    return {
      code: 200,
      message: '用户更新成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        status: user.status,
        createTime: user.createTime,
        updateTime: user.updateTime,
        aiOperationCount: user.aiOperationCount,
      },
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCUserStatusDto,
  ): Promise<ApiResponse<CUserResponseDto>> {
    const user = await this.cUsersService.updateStatus(+id, updateStatusDto);
    return {
      code: 200,
      message: '状态更新成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        status: user.status,
        createTime: user.createTime,
        updateTime: user.updateTime,
        aiOperationCount: user.aiOperationCount,
      },
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.cUsersService.remove(+id);
    return {
      code: 200,
      message: '用户删除成功',
      data: null,
    };
  }
}
