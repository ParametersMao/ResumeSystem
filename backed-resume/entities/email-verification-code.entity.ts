import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('email_verification_codes')
@Index(['email', 'purpose', 'createTime'])
export class EmailVerificationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 32 })
  purpose: string;

  @Column({ type: 'varchar', length: 64, name: 'code_hash' })
  codeHash: string;

  @Column({ type: 'datetime', name: 'expire_at' })
  expireAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'consumed_at' })
  consumedAt: Date | null;

  @Column({ type: 'int', default: 0, name: 'attempt_count' })
  attemptCount: number;

  @Column({ type: 'varchar', length: 64, nullable: true, name: 'request_ip' })
  requestIp: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;
}
