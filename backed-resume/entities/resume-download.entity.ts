import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CUser } from './c-user.entity';
import { Template } from './template.entity';

@Entity('resume_downloads')
export class ResumeDownload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => CUser)
  @JoinColumn({ name: 'user_id' })
  user: CUser;

  @Column()
  template_id: number;

  @ManyToOne(() => Template)
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @CreateDateColumn({ type: 'datetime' })
  download_time: Date;
} 