import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLog } from '../../entities/system-log.entity';

@Injectable()
export class SystemLogsService {
  constructor(
    @InjectRepository(SystemLog)
    private readonly repo: Repository<SystemLog>,
  ) {}

  async create(log: Partial<SystemLog>) {
    const entity = this.repo.create(log);
    return await this.repo.save(entity);
  }

  async findAll(params: { page?: number; limit?: number; userId?: number; path?: string; method?: string }) {
    const page = Number.isFinite(params.page) && (params.page as number) > 0 ? Math.floor(params.page as number) : 1;
    const limitRaw = Number.isFinite(params.limit) && (params.limit as number) > 0 ? Math.floor(params.limit as number) : 20;
    const limit = Math.min(limitRaw, 100);
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('log');

    if (params.userId) {
      qb.andWhere('log.userId = :userId', { userId: params.userId });
    }
    if (params.method) {
      qb.andWhere('log.method = :method', { method: params.method.toUpperCase() });
    }
    if (params.path) {
      qb.andWhere('log.path LIKE :path', { path: `%${params.path}%` });
    }

    qb.orderBy('log.createTime', 'DESC')
      .skip(skip)
      .take(limit);

    const [list, total] = await qb.getManyAndCount();

    return { list, total, page, limit };
  }
}

