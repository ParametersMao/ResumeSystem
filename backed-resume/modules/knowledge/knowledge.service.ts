import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { KnowledgeDocument } from '../../entities/knowledge-document.entity';
import { StorageService } from '../storage/storage.service';
import { KnowledgeAgentClientService } from './knowledge-agent-client.service';
import { KnowledgeDocumentQueryDto } from '../../dto/knowledge-document.dto';

@Injectable()
export class KnowledgeService {
  private ensureTablePromise: Promise<void> | null = null;

  constructor(
    @InjectRepository(KnowledgeDocument)
    private readonly repository: Repository<KnowledgeDocument>,
    private readonly storageService: StorageService,
    private readonly agentClient: KnowledgeAgentClientService,
  ) {}

  async list(query: KnowledgeDocumentQueryDto) {
    await this.ensureTable();
    const qb = this.repository.createQueryBuilder('document');
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

    const [list, total] = await qb
      .orderBy('document.updateTime', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
    return {
      list: list.map(({ storageKey: _storageKey, storageUrl: _storageUrl, ...document }) => document),
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
    adminId: number;
  }) {
    await this.ensureTable();
    const extension = extname(input.file.originalname).toLowerCase();
    const storage = await this.storageService.uploadObject({
      key: `knowledge/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`,
      body: input.file.buffer,
      contentType: input.file.mimetype,
      cacheControl: 'private, max-age=0',
    });
    let document = await this.repository.save(
      this.repository.create({
        name: String(input.name || input.file.originalname.replace(/\.[^.]+$/, '')).trim(),
        category: String(input.category || 'general').trim() || 'general',
        description: String(input.description || '').trim(),
        fileName: input.file.originalname,
        mimeType: input.file.mimetype,
        fileSize: input.file.size,
        storageKey: storage.key,
        storageUrl: storage.url,
        status: 'indexing',
        chunkCount: 0,
        errorMessage: '',
        enabled: true,
        createdBy: input.adminId,
      }),
    );

    try {
      const result = await this.agentClient.indexDocument({
        documentId: document.id,
        name: document.name,
        category: document.category,
        file: input.file,
      });
      document.status = 'ready';
      document.chunkCount = result.chunk_count;
      document.errorMessage = '';
    } catch (error: any) {
      document.status = 'failed';
      document.errorMessage = String(error?.message || '文档索引失败').slice(0, 1000);
    }
    document = await this.repository.save(document);
    return document;
  }

  async reindex(id: number) {
    await this.ensureTable();
    const document = await this.findOne(id);
    document.status = 'indexing';
    document.errorMessage = '';
    await this.repository.save(document);
    try {
      const buffer = await this.storageService.downloadObject(document.storageKey);
      const result = await this.agentClient.indexDocument({
        documentId: document.id,
        name: document.name,
        category: document.category,
        file: {
          buffer,
          originalname: document.fileName,
          mimetype: document.mimeType,
          size: buffer.length,
        } as Express.Multer.File,
      });
      document.status = document.enabled ? 'ready' : 'disabled';
      document.chunkCount = result.chunk_count;
    } catch (error: any) {
      document.status = 'failed';
      document.errorMessage = String(error?.message || '重新索引失败').slice(0, 1000);
    }
    return this.repository.save(document);
  }

  async toggle(id: number, enabled: boolean) {
    const document = await this.findOne(id);
    await this.agentClient.setDocumentEnabled(id, enabled);
    document.enabled = enabled;
    document.status = enabled ? 'ready' : 'disabled';
    return this.repository.save(document);
  }

  async remove(id: number) {
    const document = await this.findOne(id);
    await this.agentClient.deleteDocument(id);
    await this.storageService.deleteObject(document.storageKey);
    await this.repository.remove(document);
  }

  async search(query: string, limit: number, category?: string) {
    return this.agentClient.search(query, limit, category);
  }

  async metrics() {
    return this.agentClient.getMetrics();
  }

  async getFile(id: number) {
    const document = await this.findOne(id);
    return {
      buffer: await this.storageService.downloadObject(document.storageKey),
      fileName: document.fileName,
      mimeType: document.mimeType,
    };
  }

  private async findOne(id: number) {
    await this.ensureTable();
    const document = await this.repository.findOne({ where: { id } });
    if (!document) throw new NotFoundException('知识文档不存在');
    return document;
  }

  private async ensureTable() {
    if (!this.ensureTablePromise) {
      this.ensureTablePromise = this.repository.query(`
        CREATE TABLE IF NOT EXISTS knowledge_documents (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          category VARCHAR(64) NOT NULL DEFAULT 'general',
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
          INDEX idx_knowledge_category (category)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `).then(() => undefined);
    }
    await this.ensureTablePromise;
  }
}
