import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('c_users')
export class CUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time' })
  updateTime: Date;

  @Column({ type: 'int', default: 0, name: 'ai_operation_count' })
  aiOperationCount: number;

  @Column({ type: 'int', default: 0, name: 'token_version' })
  tokenVersion: number;
}
