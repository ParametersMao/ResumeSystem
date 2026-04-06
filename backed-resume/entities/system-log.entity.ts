import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('system_logs')
export class SystemLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId: number | null;

  @Column({ type: 'varchar', length: 16, name: 'user_type', nullable: true })
  userType: string | null;

  @Column({ type: 'varchar', length: 255 })
  route: string;

  @Column({ type: 'varchar', length: 12 })
  method: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 512, name: 'user_agent', nullable: true })
  userAgent: string | null;

  @Column({ type: 'int', name: 'status_code', nullable: true })
  statusCode: number | null;

  @Column({ type: 'int', name: 'duration_ms', nullable: true })
  durationMs: number | null;

  @Column({ type: 'text', name: 'params_json', nullable: true })
  paramsJson: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;
}

