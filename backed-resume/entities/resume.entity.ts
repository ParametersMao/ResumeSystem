import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CUser } from './c-user.entity';
import { Template } from './template.entity';

@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('longtext')
  content: string; // JSON string containing resume data

  @Column({ name: 'template_id', nullable: true })
  templateId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'preview_image', type: 'text', nullable: true })
  previewImage: string; // Base64 or URL

  @Column({ default: 1 })
  status: number; // 1: active, 0: deleted

  @Column({ default: 0 })
  version: number; // For conflict resolution

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  // Relations
  @ManyToOne(() => CUser)
  @JoinColumn({ name: 'user_id' })
  user: CUser;

  @ManyToOne(() => Template)
  @JoinColumn({ name: 'template_id' })
  template: Template;
}
