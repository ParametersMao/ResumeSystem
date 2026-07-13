import { IsString, IsEmail, IsOptional, IsInt, Min, Max, Matches } from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

// 密码强度：最少8位，必须包含大小写字母和数字
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export class CreateCUserDto {
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
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number = 1;
}

export class UpdateCUserDto {
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
}

export class UpdateCUserStatusDto {
  @IsInt()
  @Min(0)
  @Max(1)
  status: number;
}

export class ResetCUserPasswordDto {
  @IsString()
  @Matches(PASSWORD_REGEX, {
    message: '密码至少8位，必须包含大小写字母和数字',
  })
  password: string;
}

// 响应数据DTO
export class CUserResponseDto {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  status: number;
  createTime: Date;
  updateTime: Date;
  aiOperationCount: number;
}

export class CUserSearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number;
}
