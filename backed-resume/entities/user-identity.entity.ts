import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CUser } from './c-user.entity';

@Entity('user_identities')
export class UserIdentity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @ManyToOne(() => CUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: CUser;

  @Column({ type: 'varchar', length: 32 })
  provider: string;

  @Column({ type: 'varchar', length: 255, name: 'provider_subject' })
  providerSubject: string;

  @Column({ type: 'tinyint', default: 1 })
  verified: number;

  @Column({ type: 'json', nullable: true, name: 'provider_data' })
  providerData: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time' })
  updateTime: Date;
}
