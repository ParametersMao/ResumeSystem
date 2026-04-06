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

  async findAll(params: { page?: number; limit?: number; userId?: number; route?: string; method?: string }) {
    const page = Number.isFinite(params.page) && (params.page as number) > 0 ? Math.floor(params.page as number) : 1;
    const limitRaw = Number.isFinite(params.limit) && (params.limit as number) > 0 ? Math.floor(params.limit as number) : 20;
    const limit = Math.min(limitRaw, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.method) where.method = params.method.toUpperCase();
    if (params.route) where.route = params.route;

    const [list, total] = await this.repo.findAndCount({
      where,
      order: { createTime: 'DESC' },
      skip,
      take: limit,
    });

    return { list, total, page, limit };
  }
}

