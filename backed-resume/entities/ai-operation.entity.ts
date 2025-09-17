import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CUser } from './c-user.entity';

@Entity('ai_operations')
export class AiOperation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => CUser)
  @JoinColumn({ name: 'user_id' })
  user: CUser;

  @Column({ type: 'varchar', length: 20, name: 'operation_type' })
  operationType: string; // 'polish', 'generate'

  @Column({ type: 'text', nullable: true, name: 'input_data' })
  inputData: string;

  @Column({ type: 'text', nullable: true, name: 'output_data' })
  outputData: string;

  @CreateDateColumn({ type: 'datetime', name: 'create_time' })
  createTime: Date;

  @Column({ type: 'int', default: 0, name: 'token_used' })
  tokenUsed: number;
} 