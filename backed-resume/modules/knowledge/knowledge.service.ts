import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, LessThanOrEqual, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { KnowledgeDocument } from '../../entities/knowledge-document.entity';
import { Resume } from '../../entities/resume.entity';
import { StorageService } from '../storage/storage.service';
import { KnowledgeAgentClientService } from './knowledge-agent-client.service';
import {
  ADMIN_KNOWLEDGE_SOURCE_TYPES,
  KnowledgeDocumentQueryDto,
  KnowledgeSourceType,
} from '../../dto/knowledge-document.dto';
import { MAX_KNOWLEDGE_FILE_SIZE, validateKnowledgeFile } from './knowledge-file-validation';

interface CreateKnowledgeDocumentInput {
  file: Express.Multer.File;
  name: string;
  category: string;
  description: string;
  sourceType: KnowledgeSourceType;
  scope: 'global' | 'private';
  ownerUserId: number | null;
  resumeId: number | null;
  licensed: boolean;
  piiReviewed: boolean;
  expiresAt: Date | null;
  createdBy: number | null;
  storagePrefix: string;
}

@Injectable()
export class KnowledgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KnowledgeService.name);
  private ensureTablePromise: Promise<void> | null = null;
  private expiryCleanupTimer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(KnowledgeDocument)
    private readonly repository: Repository<KnowledgeDocument>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    private readonly storageService: StorageService,
    private readonly agentClient: KnowledgeAgentClientService,
  ) {}

  async onModuleInit() {
    await this.ensureTable();
    await this.purgeExpiredPrivateDocuments();
    this.expiryCleanupTimer = setInterval(
      () => void this.purgeExpiredPrivateDocuments(),
      60 * 60 * 1000,
    );
    this.expiryCleanupTimer.unref();
  }

  onModuleDestroy() {
    if (this.expiryCleanupTimer) clearInterval(this.expiryCleanupTimer);
  }

  async list(query: KnowledgeDocumentQueryDto) {
    await this.ensureTable();
    const qb = this.repository
      .createQueryBuilder('document')
      .andWhere('document.scope = :scope', { scope: 'global' });
    if (query.search) {
      qb.andWhere(
        new Brackets((where) => {
          where
            .where('document.name LIKE :search', { search: `%${query.search}%` })
            .orWhere('document.fileName LIKE :search', { search: `%${query.search}%` });
        }),
      );
    }
    if (query.category) qb.andWhere('document.category = :category', { category: query.category });
    if (query.status) qb.andWhere('document.status = :status', { status: query.status });
    if (query.sourceType) {
      qb.andWhere('document.sourceType = :sourceType', { sourceType: query.sourceType });
    }

    const [list, total] = await qb
      .orderBy('document.updateTime', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
    return {
      list: list.map((document) => this.toMetadata(document)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async upload(input: {
    file: Express.Multer.File;
    name?: string;
    category?: string;
    description?: string;
    sourceType?: KnowledgeSourceType;
    licensed?: boolean;
    piiReviewed?: boolean;
    adminId: number;
  }) {
    const sourceType = input.sourceType || 'standard';
    if (!(ADMIN_KNOWLEDGE_SOURCE_TYPES as readonly string[]).includes(sourceType)) {
      throw new BadRequestException('管理员只能上传全局规范、岗位框架或合规简历样例');
    }
    if (sourceType === 'resume-exemplar' && (!input.licensed || !input.piiReviewed)) {
      throw new BadRequestException('简历样例必须确认已获授权并完成 PII 脱敏复核');
    }

    const document = await this.createAndIndex({
      file: input.file,
      name: String(input.name || input.file.originalname.replace(/\.[^.]+$/, '')).trim(),
      category: String(input.category || 'general').trim() || 'general',
      description: String(input.description || '').trim(),
      sourceType,
      scope: 'global',
      ownerUserId: null,
      resumeId: null,
      licensed: sourceType === 'resume-exemplar' && Boolean(input.licensed),
      piiReviewed: sourceType === 'resume-exemplar' && Boolean(input.piiReviewed),
      expiresAt: null,
      createdBy: input.adminId,
      storagePrefix: `knowledge/global/${new Date().toISOString().slice(0, 10)}`,
    });
    return this.toMetadata(document);
  }

  async replaceJobDescription(input: {
    resumeId: number;
    ownerUserId: number;
    file?: Express.Multer.File;
    text?: string;
    expiresAt?: string;
  }) {
    await this.assertOwnedResume(input.resumeId, input.ownerUserId);
    await this.ensureTable();
    const text = String(input.text || '').trim();
    if (input.file && text) {
      throw new BadRequestException('请只选择上传文件或粘贴 JD 文本中的一种方式');
    }
    if (!input.file && !text) {
      throw new BadRequestException('请上传 JD 文件或粘贴 JD 文本');
    }

    const file = input.file || this.textAsKnowledgeFile(text);
    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    if (expiresAt && (!Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date())) {
      throw new BadRequestException('JD 过期时间必须是未来时间');
    }

    const previousDocuments = await this.repository.find({
      where: {
        sourceType: 'job-description',
        scope: 'private',
        ownerUserId: input.ownerUserId,
        resumeId: input.resumeId,
      },
      order: { updateTime: 'DESC' },
    });

    const replacement = await this.createAndIndex({
      file,
      name: `Job description for resume ${input.resumeId}`,
      category: 'job-description',
      description: 'Private job description workspace',
      sourceType: 'job-description',
      scope: 'private',
      ownerUserId: input.ownerUserId,
      resumeId: input.resumeId,
      licensed: false,
      piiReviewed: false,
      expiresAt,
      createdBy: null,
      storagePrefix: `knowledge/private/user-${input.ownerUserId}/resume-${input.resumeId}`,
    });

    // The old source and vectors remain untouched until the replacement is fully indexed.
    if (replacement.status === 'ready') {
      for (const previous of previousDocuments) {
        await this.deleteDocumentResources(previous);
      }
    }
    return this.toMetadata(replacement);
  }

  async getJobDescription(resumeId: number, ownerUserId: number) {
    await this.assertOwnedResume(resumeId, ownerUserId);
    await this.ensureTable();
    const documents = await this.repository.find({
      where: {
        sourceType: 'job-description',
        scope: 'private',
        ownerUserId,
        resumeId,
      },
      order: { updateTime: 'DESC' },
    });
    const now = Date.now();
    const unexpired = documents.filter(
      (document) => !document.expiresAt || document.expiresAt.getTime() > now,
    );
    const current = unexpired.find((document) => document.status === 'ready' && document.enabled) || unexpired[0];
    return current ? this.toMetadata(current) : null;
  }

  async deleteJobDescription(resumeId: number, ownerUserId: number) {
    await this.assertOwnedResume(resumeId, ownerUserId);
    await this.ensureTable();
    const documents = await this.repository.find({
      where: {
        sourceType: 'job-description',
        scope: 'private',
        ownerUserId,
        resumeId,
      },
    });
    for (const document of documents) await this.deleteDocumentResources(document);
  }

  async deletePrivateKnowledgeForUser(ownerUserId: number) {
    await this.ensureTable();
    const documents = await this.repository.find({
      where: { scope: 'private', ownerUserId },
    });
    for (const document of documents) await this.deleteDocumentResources(document);
  }

  async purgeExpiredPrivateDocuments(now = new Date()) {
    await this.ensureTable();
    const expired = await this.repository.find({
      where: {
        scope: 'private',
        expiresAt: LessThanOrEqual(now),
      },
    });
    for (const document of expired) {
      try {
        await this.deleteDocumentResources(document);
      } catch (error: any) {
        this.logger.warn(
          `Failed to purge expired private knowledge document ${document.id}: ${String(error?.message || error).slice(0, 240)}`,
        );
      }
    }
    return expired.length;
  }

  async reindex(id: number) {
    const document = await this.findGlobalOne(id);
    document.status = 'indexing';
    document.errorMessage = '';
    await this.repository.save(document);
    try {
      const buffer = await this.storageService.downloadObject(document.storageKey);
      const result = await this.agentClient.indexDocument({
        documentId: document.id,
        name: document.name,
        category: document.category,
        sourceType: document.sourceType,
        scope: document.scope,
        ownerUserId: document.ownerUserId,
        resumeId: document.resumeId,
        licensed: document.licensed,
        piiReviewed: document.piiReviewed,
        expiresAt: document.expiresAt,
        file: {
          buffer,
          originalname: document.fileName,
          mimetype: document.mimeType,
          size: buffer.length,
        } as Express.Multer.File,
      });
      document.status = document.enabled ? 'ready' : 'disabled';
      document.chunkCount = result.chunk_count;
      document.errorMessage = '';
    } catch (error: any) {
      document.status = 'failed';
      document.errorMessage = String(error?.message || '重新索引失败').slice(0, 1000);
    }
    return this.toMetadata(await this.repository.save(document));
  }

  async toggle(id: number, enabled: boolean) {
    const document = await this.findGlobalOne(id);
    await this.agentClient.setDocumentEnabled(id, enabled);
    document.enabled = enabled;
    document.status = enabled ? 'ready' : 'disabled';
    return this.toMetadata(await this.repository.save(document));
  }

  async remove(id: number) {
    const document = await this.findGlobalOne(id);
    await this.deleteDocumentResources(document);
  }

  async search(query: string, limit: number, category?: string) {
    return this.agentClient.search(query, limit, category, {
      sourceTypes: [...ADMIN_KNOWLEDGE_SOURCE_TYPES],
      scope: 'global',
    });
  }

  async metrics() {
    return this.agentClient.getMetrics();
  }

  async getFile(id: number) {
    const document = await this.findGlobalOne(id);
    return {
      buffer: await this.storageService.downloadObject(document.storageKey),
      fileName: document.fileName,
      mimeType: document.mimeType,
    };
  }

  private async createAndIndex(input: CreateKnowledgeDocumentInput): Promise<KnowledgeDocument> {
    await this.ensureTable();
    const validated = validateKnowledgeFile(input.file);
    const safeFile: Express.Multer.File = {
      ...input.file,
      mimetype: validated.mimeType,
    };
    const storage = await this.storageService.uploadObject({
      key: `${input.storagePrefix}/${randomUUID()}${validated.extension}`,
      body: safeFile.buffer,
      contentType: safeFile.mimetype,
      cacheControl: 'private, max-age=0',
    });
    let document = await this.repository.save(
      this.repository.create({
        name: input.name,
        category: input.category,
        description: input.description,
        sourceType: input.sourceType,
        scope: input.scope,
        ownerUserId: input.ownerUserId,
        resumeId: input.resumeId,
        licensed: input.licensed,
        piiReviewed: input.piiReviewed,
        expiresAt: input.expiresAt,
        fileName: safeFile.originalname,
        mimeType: safeFile.mimetype,
        fileSize: safeFile.size,
        storageKey: storage.key,
        storageUrl: storage.url,
        status: 'indexing',
        chunkCount: 0,
        errorMessage: '',
        enabled: true,
        createdBy: input.createdBy,
      }),
    );

    try {
      const result = await this.agentClient.indexDocument({
        documentId: document.id,
        name: document.name,
        category: document.category,
        sourceType: document.sourceType,
        scope: document.scope,
        ownerUserId: document.ownerUserId,
        resumeId: document.resumeId,
        licensed: document.licensed,
        piiReviewed: document.piiReviewed,
        expiresAt: document.expiresAt,
        file: safeFile,
      });
      document.status = 'ready';
      document.chunkCount = result.chunk_count;
      document.errorMessage = '';
    } catch (error: any) {
      document.status = 'failed';
      document.errorMessage = String(error?.message || '文档索引失败').slice(0, 1000);
    }
    return this.repository.save(document);
  }

  private async deleteDocumentResources(document: KnowledgeDocument) {
    await this.agentClient.deleteDocument(document.id);
    await this.storageService.deleteObject(document.storageKey);
    await this.repository.remove(document);
  }

  private async findGlobalOne(id: number) {
    await this.ensureTable();
    const document = await this.repository.findOne({ where: { id, scope: 'global' } });
    if (!document) throw new NotFoundException('知识文档不存在');
    return document;
  }

  private async assertOwnedResume(resumeId: number, ownerUserId: number) {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, userId: ownerUserId, status: 1 },
    });
    if (!resume) throw new NotFoundException('简历不存在');
  }

  private textAsKnowledgeFile(text: string): Express.Multer.File {
    const buffer = Buffer.from(text, 'utf8');
    if (buffer.length > MAX_KNOWLEDGE_FILE_SIZE) {
      throw new BadRequestException('JD 文本不能超过 10MB');
    }
    return {
      fieldname: 'file',
      originalname: 'job-description.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: buffer.length,
      buffer,
    } as Express.Multer.File;
  }

  private toMetadata(document: KnowledgeDocument) {
    const { storageKey: _storageKey, storageUrl: _storageUrl, ...metadata } = document;
    return {
      ...metadata,
      enabled: Boolean(document.enabled),
      licensed: Boolean(document.licensed),
      piiReviewed: Boolean(document.piiReviewed),
    };
  }

  private async ensureTable() {
    if (!this.ensureTablePromise) this.ensureTablePromise = this.createOrUpgradeTable();
    await this.ensureTablePromise;
  }

  private async createOrUpgradeTable() {
    await this.repository.query(`
      CREATE TABLE IF NOT EXISTS knowledge_documents (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(64) NOT NULL DEFAULT 'general',
        source_type VARCHAR(32) NOT NULL DEFAULT 'standard',
        scope VARCHAR(16) NOT NULL DEFAULT 'global',
        owner_user_id INT NULL,
        resume_id INT NULL,
        licensed TINYINT(1) NOT NULL DEFAULT 0,
        pii_reviewed TINYINT(1) NOT NULL DEFAULT 0,
        expires_at DATETIME NULL,
        description VARCHAR(500) NOT NULL DEFAULT '',
        file_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(120) NOT NULL,
        file_size BIGINT NOT NULL,
        storage_key VARCHAR(500) NOT NULL,
        storage_url VARCHAR(1000) NOT NULL,
        status VARCHAR(24) NOT NULL DEFAULT 'pending',
        chunk_count INT NOT NULL DEFAULT 0,
        error_message VARCHAR(1000) NOT NULL DEFAULT '',
        enabled TINYINT(1) NOT NULL DEFAULT 1,
        created_by INT NULL,
        create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_knowledge_status (status),
        INDEX idx_knowledge_category (category),
        INDEX idx_knowledge_source_scope (source_type, scope),
        INDEX idx_knowledge_owner_resume (owner_user_id, resume_id, source_type)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    const existingColumns = new Set(
      ((await this.repository.query('SHOW COLUMNS FROM knowledge_documents')) || []).map(
        (row: any) => String(row.Field || row.field || '').toLowerCase(),
      ),
    );
    const columns: Record<string, string> = {
      source_type: "VARCHAR(32) NOT NULL DEFAULT 'standard' AFTER category",
      scope: "VARCHAR(16) NOT NULL DEFAULT 'global' AFTER source_type",
      owner_user_id: 'INT NULL AFTER scope',
      resume_id: 'INT NULL AFTER owner_user_id',
      licensed: 'TINYINT(1) NOT NULL DEFAULT 0 AFTER resume_id',
      pii_reviewed: 'TINYINT(1) NOT NULL DEFAULT 0 AFTER licensed',
      expires_at: 'DATETIME NULL AFTER pii_reviewed',
    };
    for (const [name, definition] of Object.entries(columns)) {
      if (!existingColumns.has(name)) {
        await this.repository.query(`ALTER TABLE knowledge_documents ADD COLUMN ${name} ${definition}`);
      }
    }

    const existingIndexes = new Set(
      ((await this.repository.query('SHOW INDEX FROM knowledge_documents')) || []).map(
        (row: any) => String(row.Key_name || row.key_name || '').toLowerCase(),
      ),
    );
    if (!existingIndexes.has('idx_knowledge_source_scope')) {
      await this.repository.query(
        'CREATE INDEX idx_knowledge_source_scope ON knowledge_documents (source_type, scope)',
      );
    }
    if (!existingIndexes.has('idx_knowledge_owner_resume')) {
      await this.repository.query(
        'CREATE INDEX idx_knowledge_owner_resume ON knowledge_documents (owner_user_id, resume_id, source_type)',
      );
    }
  }
}
