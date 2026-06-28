import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_REGEX } from './c-user.dto';

export const EMAIL_CODE_PURPOSES = ['register', 'login', 'reset-password'] as const;
export type EmailCodePurpose = (typeof EMAIL_CODE_PURPOSES)[number];

export class SendEmailCodeDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsIn(EMAIL_CODE_PURPOSES)
  purpose: EmailCodePurpose;
}

export class EmailRegisterDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @IsString()
  @Matches(PASSWORD_REGEX, {
    message: '密码至少 8 位，必须包含大小写字母和数字',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username?: string;
}

export class EmailCodeLoginDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}

export class ResetPasswordByEmailDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @IsString()
  @Matches(PASSWORD_REGEX, {
    message: '密码至少 8 位，必须包含大小写字母和数字',
  })
  newPassword: string;
}
