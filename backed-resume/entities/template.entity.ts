import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  templateName: string;

  @Column({ name: 'thumbnail', type: 'longtext', nullable: true })
  previewImage: string;

  @Column({ name: 'html_content', type: 'longtext', nullable: true })
  templateData: string;

  @Column({ name: 'css_content', type: 'longtext', nullable: true })
  cssContent: string;

  @Column({ nullable: true })
  category: string;

  @Column({ name: 'tags', type: 'varchar', length: 500, nullable: true })
  industryTags: string | null;

  @Column({ name: 'is_premium', default: false })
  isPremium: boolean;

  @Column({ name: 'is_active', default: true })
  status: boolean;

  @Column({ name: 'use_count', type: 'int', default: 0 })
  useCount: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
} 
