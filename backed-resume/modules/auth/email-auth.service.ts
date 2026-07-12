import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomInt } from 'crypto';
import { IsNull, Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailVerificationCode } from '../../entities/email-verification-code.entity';
import { UserIdentity } from '../../entities/user-identity.entity';
import { EmailCodePurpose } from '../../dto/email-auth.dto';
import { CUsersService } from '../c-users/c-users.service';
import { SystemConfigService } from '../system-config/system-config.service';

const CODE_TTL_MS = 10 * 60 * 1000;
const SEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

@Injectable()
export class EmailAuthService implements OnModuleInit {
  constructor(
    @InjectRepository(EmailVerificationCode)
    private readonly codeRepository: Repository<EmailVerificationCode>,
    @InjectRepository(UserIdentity)
    private readonly identityRepository: Repository<UserIdentity>,
    private readonly cUsersService: CUsersService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  async sendCode(
    rawEmail: string,
    purpose: EmailCodePurpose,
    requestIp?: string,
  ): Promise<{ expiresIn: number; developmentCode?: string }> {
    const email = this.normalizeEmail(rawEmail);
    const user = await this.cUsersService.findByEmail(email);

    if (purpose === 'register' && user) {
      throw new ConflictException('该邮箱已注册，请直接登录');
    }
    if (purpose !== 'register' && !user) {
      throw new BadRequestException('该邮箱尚未注册');
    }

    const latest = await this.codeRepository.findOne({
      where: { email, purpose },
      order: { createTime: 'DESC' },
    });
    if (
      latest &&
      Date.now() - new Date(latest.createTime).getTime() < SEND_COOLDOWN_MS
    ) {
      throw new BadRequestException('验证码发送过于频繁，请稍后再试');
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await this.codeRepository.save(
      this.codeRepository.create({
        email,
        purpose,
        codeHash: this.hashCode(email, purpose, code),
        expireAt: new Date(Date.now() + CODE_TTL_MS),
        consumedAt: null,
        attemptCount: 0,
        requestIp: requestIp?.slice(0, 64) || null,
      }),
    );

    const delivered = await this.deliverCode(email, code, purpose);
    const response: { expiresIn: number; developmentCode?: string } = {
      expiresIn: CODE_TTL_MS / 1000,
    };
    if (
      !delivered &&
      (process.env.NODE_ENV !== 'production' ||
        process.env.EMAIL_ALLOW_DEV_CODE === 'true')
    ) {
      response.developmentCode = code;
    }
    return response;
  }

  async consumeCode(
    rawEmail: string,
    purpose: EmailCodePurpose,
    code: string,
  ): Promise<void> {
    const email = this.normalizeEmail(rawEmail);
    const record = await this.codeRepository.findOne({
      where: { email, purpose, consumedAt: IsNull() },
      order: { createTime: 'DESC' },
    });

    if (!record || new Date(record.expireAt).getTime() < Date.now()) {
      throw new UnauthorizedException('验证码无效或已过期');
    }
    if (record.attemptCount >= MAX_ATTEMPTS) {
      throw new UnauthorizedException('验证码尝试次数过多，请重新获取');
    }

    record.attemptCount += 1;
    if (record.codeHash !== this.hashCode(email, purpose, code)) {
      await this.codeRepository.save(record);
      throw new UnauthorizedException('验证码错误');
    }

    record.consumedAt = new Date();
    await this.codeRepository.save(record);
  }

  async bindEmailIdentity(userId: number, rawEmail: string): Promise<void> {
    const email = this.normalizeEmail(rawEmail);
    const existing = await this.identityRepository.findOne({
      where: { provider: 'email', providerSubject: email },
    });
    if (existing && existing.userId !== userId) {
      throw new ConflictException('该邮箱已绑定其他账号');
    }
    if (existing) {
      existing.verified = 1;
      await this.identityRepository.save(existing);
      return;
    }
    await this.identityRepository.save(
      this.identityRepository.create({
        userId,
        provider: 'email',
        providerSubject: email,
        verified: 1,
        providerData: null,
      }),
    );
  }

  private async deliverCode(
    email: string,
    code: string,
    purpose: EmailCodePurpose,
  ): Promise<boolean> {
    const config = (await this.systemConfigService.getConfig()).email;
    const configured = Boolean(
      config.smtpHost &&
      config.smtpPort &&
      config.smtpUser &&
      config.smtpPass &&
      config.fromEmail,
    );
    if (!configured) {
      if (
        process.env.NODE_ENV === 'production' &&
        process.env.EMAIL_ALLOW_DEV_CODE !== 'true'
      ) {
        throw new ServiceUnavailableException('邮件服务尚未配置，请联系管理员');
      }
      return false;
    }

    if (String(config.smtpHost).includes('@')) {
      throw new ServiceUnavailableException('邮件服务配置错误：SMTP 主机应填写 smtp.163.com、smtp.qq.com 这类服务器地址，不能填写邮箱账号。');
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.encryption === 'ssl',
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
      requireTLS: config.encryption === 'tls',
    });
    const action = {
      register: '注册账号',
      login: '登录账号',
      'reset-password': '重置密码',
    }[purpose];
    await transporter.sendMail({
      from: `"${config.fromName || '简历系统'}" <${config.fromEmail}>`,
      to: email,
      subject: `您的${action}验证码`,
      text: `验证码：${code}。10 分钟内有效，请勿向他人泄露。`,
      html: `<p>您正在${action}，验证码为：</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>10 分钟内有效，请勿向他人泄露。</p>`,
    });
    return true;
  }

  private normalizeEmail(email: string): string {
    return String(email || '').trim().toLowerCase();
  }

  private hashCode(email: string, purpose: string, code: string): string {
    const secret =
      process.env.EMAIL_CODE_SECRET ||
      process.env.JWT_ACCESS_SECRET ||
      'development-email-code-secret';
    return createHash('sha256')
      .update(`${email}:${purpose}:${code}:${secret}`)
      .digest('hex');
  }

  private async ensureSchema() {
    const userColumns = await this.codeRepository.query(
      'SHOW COLUMNS FROM c_users',
    );
    const userColumnNames = new Set(
      userColumns.map(
        (column: { Field?: string; field?: string }) =>
          column.Field ?? column.field,
      ),
    );
    if (!userColumnNames.has('token_version')) {
      await this.codeRepository.query(
        'ALTER TABLE c_users ADD COLUMN token_version INT NOT NULL DEFAULT 0 AFTER ai_operation_count',
      );
    }
    const emailIndex = await this.codeRepository.query(
      "SHOW INDEX FROM c_users WHERE Key_name = 'uq_c_users_email'",
    );
    if (!emailIndex.length) {
      const duplicates = await this.codeRepository.query(
        `SELECT email
         FROM c_users
         WHERE email IS NOT NULL AND email <> ''
         GROUP BY email
         HAVING COUNT(*) > 1
         LIMIT 1`,
      );
      if (!duplicates.length) {
        await this.codeRepository.query(
          'ALTER TABLE c_users ADD UNIQUE KEY uq_c_users_email (email)',
        );
      }
    }

    await this.codeRepository.query(`
      CREATE TABLE IF NOT EXISTS user_identities (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        provider VARCHAR(32) NOT NULL,
        provider_subject VARCHAR(255) NOT NULL,
        verified TINYINT NOT NULL DEFAULT 1,
        provider_data JSON NULL,
        create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_identity_provider_subject (provider, provider_subject),
        KEY idx_user_identity_user (user_id),
        CONSTRAINT fk_user_identity_user FOREIGN KEY (user_id) REFERENCES c_users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await this.codeRepository.query(`
      CREATE TABLE IF NOT EXISTS email_verification_codes (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        purpose VARCHAR(32) NOT NULL,
        code_hash VARCHAR(64) NOT NULL,
        expire_at DATETIME NOT NULL,
        consumed_at DATETIME NULL,
        attempt_count INT NOT NULL DEFAULT 0,
        request_ip VARCHAR(64) NULL,
        create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_email_code_lookup (email, purpose, create_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }
}
