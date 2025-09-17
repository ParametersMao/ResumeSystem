import { IsString, IsEmail, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

export class CreateAdminUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['admin', 'operator', 'viewer'])
  role?: string = 'admin';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number = 1;
}

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['admin', 'operator', 'viewer'])
  role?: string;
}

export class UpdateAdminUserStatusDto {
  @IsInt()
  @Min(0)
  @Max(1)
  status: number;
}

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

// 响应数据DTO
export class AdminUserResponseDto {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  status: number;
  createTime: Date;
  updateTime: Date;
} 