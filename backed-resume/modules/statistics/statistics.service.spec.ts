import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statistic } from '../../entities/statistic.entity';
import { Template } from '../../entities/template.entity';
import { CUser } from '../../entities/c-user.entity';
import { AiOperation } from '../../entities/ai-operation.entity';
import { TemplateUsage } from '../../entities/template-usage.entity';
import { ResumeDownload } from '../../entities/resume-download.entity';
import { Resume } from '../../entities/resume.entity';

describe('StatisticsService', () => {
  let service: StatisticsService;

  const mockRepository = {
    count: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Statistic),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Template),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(CUser),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(AiOperation),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(TemplateUsage),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ResumeDownload),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Resume),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('should return overview statistics', async () => {
      mockRepository.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(300)
        .mockResolvedValueOnce(150);

      const result = await service.getOverview();

      expect(result.total_users).toBe(100);
      expect(result.total_templates).toBe(50);
      expect(result.total_ai_operations).toBe(200);
      expect(result.total_downloads).toBe(300);
      expect(result.total_template_usage).toBe(150);
    });

    it('should return fallback values on error', async () => {
      mockRepository.count.mockRejectedValue(new Error('DB error'));

      const result = await service.getOverview();

      expect(result.total_users).toBe(0);
    });
  });

  describe('getTrendData', () => {
    beforeEach(() => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return trend data for day period', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { date: '2026-04-15', count: '5' },
      ]);

      const result = await service.getTrendData('day');

      expect(result).toHaveProperty('user_trend');
      expect(result).toHaveProperty('ai_operation_trend');
      expect(result).toHaveProperty('download_trend');
      expect(result).toHaveProperty('resume_trend');
    });

    it('should return trend data for week period', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getTrendData('week');

      expect(result).toHaveProperty('user_trend');
    });

    it('should return trend data for month period', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getTrendData('month');

      expect(result).toHaveProperty('user_trend');
    });
  });

  describe('getPopularTemplates', () => {
    it('should return popular templates', async () => {
      const mockTemplates = [
        { id: 1, templateName: '模板1', useCount: 100 },
        { id: 2, templateName: '模板2', useCount: 50 },
      ];
      mockRepository.find.mockResolvedValue(mockTemplates);

      const result = await service.getPopularTemplates(10);

      expect(result).toHaveLength(2);
      expect(result[0].useCount).toBe(100);
    });

    it('should limit templates to specified limit', async () => {
      mockRepository.find.mockResolvedValue([]);

      await service.getPopularTemplates(5);

      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });

    it('should return empty array on error', async () => {
      mockRepository.find.mockRejectedValue(new Error('DB error'));

      const result = await service.getPopularTemplates(10);

      expect(result).toEqual([]);
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity data', async () => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([
        { id: 1, username: 'user1', aiOperationCount: 10 },
      ]);

      const result = await service.getUserActivity();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should fallback to direct query on error', async () => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.loadRelationCountAndMap.mockImplementation(() => {
        throw new Error('Relation error');
      });
      mockQueryBuilder.getMany.mockResolvedValue([{ id: 1, username: 'user1' }]);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { userId: 1, count: '5' },
      ]);

      const result = await service.getUserActivity();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
