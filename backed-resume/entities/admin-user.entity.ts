import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 20, name: 'user_type' })
  role: string; // 'admin', 'operator', 'viewer'

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 0: 禁用，1: 启用

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time' })
  updateTime: Date;
} 