import { ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CUserEntitlement } from '../../entities/c-user-entitlement.entity';
import { Resume } from '../../entities/resume.entity';
import { ResumeVersion } from '../../entities/resume-version.entity';

const FREE_PLAN = {
  resumeLimit: 2,
  versionLimit: 5,
  aiMonthlyTotal: 10,
  pdfMonthlyTotal: 3,
  storageLimitBytes: 100 * 1024 * 1024,
};

@Injectable()
export class EntitlementsService implements OnModuleInit {
  constructor(
    @InjectRepository(CUserEntitlement)
    private readonly entitlementRepository: Repository<CUserEntitlement>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(ResumeVersion)
    private readonly versionRepository: Repository<ResumeVersion>,
  ) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  async getSummary(userId: number) {
    const entitlement = await this.getOrCreate(userId);
    const [resumeUsed, databaseStorageBytes] = await Promise.all([
      this.resumeRepository.count({ where: { userId, status: 1 } }),
      this.calculateStorageUsage(userId),
    ]);
    const storageUsedBytes =
      Number(entitlement.storageUsedBytes || 0) + databaseStorageBytes;

    return {
      planCode: entitlement.planCode,
      expireAt: entitlement.expireAt,
      usagePeriodStart: entitlement.usagePeriodStart,
      resume: {
        used: resumeUsed,
        total: entitlement.resumeLimit,
        remaining: Math.max(entitlement.resumeLimit - resumeUsed, 0),
      },
      versionPerResume: {
        total: entitlement.versionLimit,
      },
      ai: {
        used: entitlement.aiFreeUsed,
        total: entitlement.aiFreeTotal,
        remaining: Math.max(
          entitlement.aiFreeTotal - entitlement.aiFreeUsed,
          0,
        ),
      },
      pdf: {
        used: entitlement.pdfMonthlyUsed,
        total: entitlement.pdfMonthlyTotal,
        remaining: Math.max(
          entitlement.pdfMonthlyTotal - entitlement.pdfMonthlyUsed,
          0,
        ),
      },
      storage: {
        usedBytes: storageUsedBytes,
        totalBytes: Number(entitlement.storageLimitBytes),
        remainingBytes: Math.max(
          Number(entitlement.storageLimitBytes) - storageUsedBytes,
          0,
        ),
      },
    };
  }

  async assertCanCreateResume(userId: number) {
    const entitlement = await this.getOrCreate(userId);
    const used = await this.resumeRepository.count({
      where: { userId, status: 1 },
    });
    if (used >= entitlement.resumeLimit) {
      throw new ForbiddenException(
        `免费版最多保存 ${entitlement.resumeLimit} 份简历`,
      );
    }
  }

  async assertCanCreateVersion(userId: number, resumeId: number) {
    const entitlement = await this.getOrCreate(userId);
    const used = await this.versionRepository.count({
      where: { userId, resumeId },
    });
    if (used >= entitlement.versionLimit) {
      throw new ForbiddenException(
        `免费版每份简历最多保留 ${entitlement.versionLimit} 个版本`,
      );
    }
  }

  async trimVersions(userId: number, resumeId: number) {
    const entitlement = await this.getOrCreate(userId);
    const rows: Array<{ id: number }> = await this.versionRepository.query(
      `SELECT id
       FROM resume_versions
       WHERE user_id = ? AND resume_id = ?
       ORDER BY create_time DESC, id DESC
       LIMIT 1000 OFFSET ?`,
      [userId, resumeId, entitlement.versionLimit],
    );
    if (rows.length) {
      await this.versionRepository.delete(rows.map((row) => row.id));
    }
  }

  async consumeAi(userId: number) {
    await this.consumeMonthlyQuota(
      userId,
      'ai_free_used',
      'ai_free_total',
      '本月 AI 免费额度已用完',
    );
  }

  async refundAi(userId: number) {
    await this.refundQuota(userId, 'ai_free_used');
  }

  async consumePdf(userId: number) {
    await this.consumeMonthlyQuota(
      userId,
      'pdf_monthly_used',
      'pdf_monthly_total',
      '本月 PDF 导出额度已用完',
    );
  }

  async refundPdf(userId: number) {
    await this.refundQuota(userId, 'pdf_monthly_used');
  }

  async consumeStorage(userId: number, bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) return;
    await this.getOrCreate(userId);
    const result: any = await this.entitlementRepository.query(
      `UPDATE c_user_entitlements
       SET storage_used_bytes = storage_used_bytes + ?
       WHERE user_id = ?
         AND storage_used_bytes + ? <= storage_limit_bytes`,
      [bytes, userId, bytes],
    );
    const affectedRows =
      result?.affectedRows ?? result?.[0]?.affectedRows ?? 0;
    if (!affectedRows) {
      throw new ForbiddenException('免费版云端存储空间不足');
    }
  }

  async assertDatabaseStorageAvailable(userId: number, additionalBytes: number) {
    if (additionalBytes <= 0) return;
    const entitlement = await this.getOrCreate(userId);
    const databaseBytes = await this.calculateStorageUsage(userId);
    const totalUsed =
      Number(entitlement.storageUsedBytes || 0) + databaseBytes;
    if (totalUsed + additionalBytes > Number(entitlement.storageLimitBytes)) {
      throw new ForbiddenException('免费版云端存储空间不足');
    }
  }

  async refundStorage(userId: number, bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) return;
    await this.entitlementRepository.query(
      `UPDATE c_user_entitlements
       SET storage_used_bytes = GREATEST(storage_used_bytes - ?, 0)
       WHERE user_id = ?`,
      [bytes, userId],
    );
  }

  private async getOrCreate(userId: number) {
    await this.entitlementRepository.query(
      `INSERT IGNORE INTO c_user_entitlements
        (user_id, plan_code, account_weight, ai_free_total, ai_free_used,
         ai_free_reset_policy, resume_limit, version_limit,
         pdf_monthly_total, pdf_monthly_used, storage_limit_bytes,
         storage_used_bytes, usage_period_start, expire_at)
       VALUES (?, 'free', 0, ?, 0, 'monthly', ?, ?, ?, 0, ?, 0, NOW(), NULL)`,
      [
        userId,
        FREE_PLAN.aiMonthlyTotal,
        FREE_PLAN.resumeLimit,
        FREE_PLAN.versionLimit,
        FREE_PLAN.pdfMonthlyTotal,
        FREE_PLAN.storageLimitBytes,
      ],
    );
    await this.resetMonthlyUsage(userId);
    const entitlement = await this.entitlementRepository.findOne({
      where: { userId },
    });
    if (!entitlement) {
      throw new ForbiddenException('用户权益初始化失败');
    }
    return entitlement;
  }

  private async resetMonthlyUsage(userId: number) {
    await this.entitlementRepository.query(
      `UPDATE c_user_entitlements
       SET ai_free_used = 0,
           pdf_monthly_used = 0,
           usage_period_start = NOW()
       WHERE user_id = ?
         AND (
           usage_period_start IS NULL
           OR DATE_FORMAT(usage_period_start, '%Y-%m') <> DATE_FORMAT(NOW(), '%Y-%m')
         )`,
      [userId],
    );
  }

  private async consumeMonthlyQuota(
    userId: number,
    usedColumn: 'ai_free_used' | 'pdf_monthly_used',
    totalColumn: 'ai_free_total' | 'pdf_monthly_total',
    message: string,
  ) {
    await this.getOrCreate(userId);
    const result: any = await this.entitlementRepository.query(
      `UPDATE c_user_entitlements
       SET ${usedColumn} = ${usedColumn} + 1
       WHERE user_id = ? AND ${usedColumn} < ${totalColumn}`,
      [userId],
    );
    const affectedRows =
      result?.affectedRows ?? result?.[0]?.affectedRows ?? 0;
    if (!affectedRows) {
      throw new ForbiddenException(message);
    }
  }

  private async refundQuota(
    userId: number,
    usedColumn: 'ai_free_used' | 'pdf_monthly_used',
  ) {
    await this.entitlementRepository.query(
      `UPDATE c_user_entitlements
       SET ${usedColumn} = GREATEST(${usedColumn} - 1, 0)
       WHERE user_id = ?`,
      [userId],
    );
  }

  private async calculateStorageUsage(userId: number): Promise<number> {
    const row = await this.resumeRepository
      .createQueryBuilder('resume')
      .select(
        'COALESCE(SUM(OCTET_LENGTH(resume.content) + COALESCE(OCTET_LENGTH(resume.previewImage), 0)), 0)',
        'bytes',
      )
      .where('resume.userId = :userId', { userId })
      .andWhere('resume.status = 1')
      .getRawOne();
    return Number(row?.bytes || 0);
  }

  private async ensureSchema() {
    const columns = await this.entitlementRepository.query(
      'SHOW COLUMNS FROM c_user_entitlements',
    );
    const names = new Set(
      columns.map(
        (column: { Field?: string; field?: string }) =>
          column.Field ?? column.field,
      ),
    );
    const additions: Array<[string, string]> = [
      ['resume_limit', 'INT NOT NULL DEFAULT 2'],
      ['version_limit', 'INT NOT NULL DEFAULT 5'],
      ['pdf_monthly_total', 'INT NOT NULL DEFAULT 3'],
      ['pdf_monthly_used', 'INT NOT NULL DEFAULT 0'],
      ['storage_limit_bytes', 'BIGINT NOT NULL DEFAULT 104857600'],
      ['storage_used_bytes', 'BIGINT NOT NULL DEFAULT 0'],
      ['usage_period_start', 'DATETIME NULL'],
    ];
    for (const [name, definition] of additions) {
      if (!names.has(name)) {
        await this.entitlementRepository.query(
          `ALTER TABLE c_user_entitlements ADD COLUMN ${name} ${definition}`,
        );
      }
    }
    await this.entitlementRepository.query(
      `UPDATE c_user_entitlements
       SET ai_free_total = 10,
           ai_free_reset_policy = 'monthly',
           usage_period_start = COALESCE(usage_period_start, NOW())
       WHERE plan_code = 'free'`,
    );
  }
}
