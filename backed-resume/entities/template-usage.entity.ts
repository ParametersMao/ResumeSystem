import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CUser } from './c-user.entity';
import { Template } from './template.entity';

@Entity('template_usage')
export class TemplateUsage {
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

  @Column({ type: 'varchar', length: 20 })
  usage_type: string;

  @CreateDateColumn({ type: 'datetime' })
  create_time: Date;
} 