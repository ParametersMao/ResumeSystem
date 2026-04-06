import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { CUser } from './c-user.entity';

@Entity('c_user_entitlements')
export class CUserEntitlement {
  @PrimaryColumn({ type: 'int', name: 'user_id' })
  userId: number;

  @OneToOne(() => CUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: CUser;

  @Column({ type: 'varchar', length: 32, default: 'free', name: 'plan_code' })
  planCode: string;

  @Column({ type: 'int', default: 0, name: 'account_weight' })
  accountWeight: number;

  @Column({ type: 'int', default: 20, name: 'ai_free_total' })
  aiFreeTotal: number;

  @Column({ type: 'int', default: 0, name: 'ai_free_used' })
  aiFreeUsed: number;

  @Column({ type: 'varchar', length: 16, default: 'never', name: 'ai_free_reset_policy' })
  aiFreeResetPolicy: string;

  @Column({ type: 'datetime', nullable: true, name: 'expire_at' })
  expireAt: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time' })
  updateTime: Date;
}

