import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  templateName: string;

  @Column({ type: 'text' })
  templateData: string;

  @Column({ type: 'longtext', nullable: true })
  previewImage: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'industry_tags' })
  industryTags: string | null;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time' })
  updateTime: Date;

  @Column({ type: 'int', default: 0, name: 'use_count' })
  useCount: number;

  @Column({ type: 'int', default: 0, name: 'download_count' })
  downloadCount: number;
} 