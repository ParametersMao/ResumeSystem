import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('template_favorites')
@Index('idx_template_favorites_user', ['userId'])
@Index('idx_template_favorites_template', ['templateId'])
export class TemplateFavorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'template_id', type: 'int' })
  templateId: number;

  @CreateDateColumn({ name: 'create_time', type: 'datetime' })
  createTime: Date;
}
