import { IsString, IsEmail, IsOptional, IsInt, Min, Max, IsIn, Matches } from 'class-validator';

// 密码强度：最少8位，必须包含大小写字母和数字
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export class CreateAdminUserDto {
  @IsString()
  username: string;

  @IsString()
  @Matches(PASSWORD_REGEX, {
    message: '密码至少8位，必须包含大小写字母和数字',
  })
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
  @Matches(PASSWORD_REGEX, {
    message: '密码至少8位，必须包含大小写字母和数字',
  })
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

export class ResetAdminUserPasswordDto {
  @IsString()
  @Matches(PASSWORD_REGEX, {
    message: '密码至少8位，必须包含大小写字母和数字',
  })
  password: string;
}

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refresh_token: string;
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
