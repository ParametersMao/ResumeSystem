import { IsString, IsEmail, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateCUserDto {
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