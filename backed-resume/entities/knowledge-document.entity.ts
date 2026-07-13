import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('knowledge_documents')
export class KnowledgeDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 64, default: 'general' })
  category: string;

  @Column({ type: 'varchar', length: 32, default: 'standard', name: 'source_type' })
  sourceType: 'standard' | 'role-framework' | 'resume-exemplar' | 'job-description';

  @Column({ type: 'varchar', length: 16, default: 'global' })
  scope: 'global' | 'private';

  @Column({ type: 'int', nullable: true, name: 'owner_user_id' })
  ownerUserId: number | null;

  @Column({ type: 'int', nullable: true, name: 'resume_id' })
  resumeId: number | null;

  @Column({ type: 'tinyint', width: 1, default: 0 })
  licensed: boolean;

  @Column({ type: 'tinyint', width: 1, default: 0, name: 'pii_reviewed' })
  piiReviewed: boolean;

  @Column({ type: 'datetime', nullable: true, name: 'expires_at' })
  expiresAt: Date | null;

  @Column({ type: 'varchar', length: 500, default: '' })
  description: string;

  @Column({ type: 'varchar', length: 255, name: 'file_name' })
  fileName: string;

  @Column({ type: 'varchar', length: 120, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'bigint', name: 'file_size' })
  fileSize: number;

  @Column({ type: 'varchar', length: 500, name: 'storage_key' })
  storageKey: string;

  @Column({ type: 'varchar', length: 1000, name: 'storage_url' })
  storageUrl: string;

  @Column({ type: 'varchar', length: 24, default: 'pending' })
  status: 'pending' | 'indexing' | 'ready' | 'failed' | 'disabled';

  @Column({ type: 'int', default: 0, name: 'chunk_count' })
  chunkCount: number;

  @Column({ type: 'varchar', length: 1000, default: '', name: 'error_message' })
  errorMessage: string;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  enabled: boolean;

  @Column({ type: 'int', nullable: true, name: 'created_by' })
  createdBy: number | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time' })
  updateTime: Date;
}
