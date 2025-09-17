import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('statistics')
export class Statistic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  statistic_type: string;

  @Column({ type: 'text' })
  statistic_data: string;

  @CreateDateColumn({ type: 'datetime' })
  create_time: Date;
} 