import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { CUser } from './c-user.entity';

@Entity('c_user_profiles')
export class CUserProfile {
  @PrimaryColumn({ type: 'int', name: 'user_id' })
  userId: number;

  @OneToOne(() => CUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: CUser;

  @Column({ type: 'varchar', length: 64, nullable: true })
  nickname: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true, name: 'avatar_url' })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  bio: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time' })
  updateTime: Date;
}

