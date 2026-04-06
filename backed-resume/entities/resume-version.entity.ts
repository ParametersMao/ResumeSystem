import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Resume } from './resume.entity';

@Entity('resume_versions')
export class ResumeVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'resume_id' })
  resumeId: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'int', name: 'source_version', default: 0 })
  sourceVersion: number;

  @Column('longtext')
  content: string;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @ManyToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resume_id' })
  resume: Resume;
}

