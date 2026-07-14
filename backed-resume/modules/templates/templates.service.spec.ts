import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Template } from '../../entities/template.entity';
import { TemplateFavorite } from '../../entities/template-favorite.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import {
  TEMPLATE_AVATAR_PRESETS,
  TEMPLATE_LAYOUT_KEYS,
  TEMPLATE_VARIANT_BY_LAYOUT,
} from './template-avatar-contract';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let repository: Repository<Template>;

  const mockTemplate: Template = {
    id: 1,
    templateName: '技术简历模板',
    templateData: '{"layout":{"key":"qm-sidebar-profile","variant":"sidebar"},"sections":[]}',
    cssContent: 'body { font-size: 14px; }',
    category: 'IT',
    previewImage: 'https://example.com/preview.png',
    industryTags: 'IT,互联网',
    isPremium: false,
    status: true,
    useCount: 10,
    createTime: new Date('2026-04-01'),
    updateTime: new Date('2026-04-01'),
  };

  const mockRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    increment: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockFavoriteRepository = {
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: getRepositoryToken(Template),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(TemplateFavorite),
          useValue: mockFavoriteRepository,
        },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
    repository = module.get<Repository<Template>>(getRepositoryToken(Template));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated templates', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTemplate]),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTemplate], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.list[0].layoutKey).toBe('qm-sidebar-profile');
      expect(result.list[0].templateVariant).toBe('sidebar');
      expect(result.list[0].templateName).toBe('技术简历模板');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('template.status = :status', { status: true });
    });

    it('should filter by templateName', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTemplate]),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTemplate], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll({ page: 1, limit: 10, templateName: '技术' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTemplate]),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTemplate], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll({ page: 1, limit: 10, status: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a template by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTemplate);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.layoutKey).toBe('qm-sidebar-profile');
      expect(result.templateVariant).toBe('sidebar');
      expect(result.templateName).toBe('技术简历模板');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1, status: true } });
    });

    it('should allow admin detail lookup to include inactive templates', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockTemplate, status: false });

      const result = await service.findOne(1, { includeInactive: true });

      expect(result.id).toBe(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when template not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneEntity', () => {
    it('should return template entity by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTemplate);

      const result = await service.findOneEntity(1);

      expect(result).toEqual(mockTemplate);
    });

    it('should throw NotFoundException when template not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneEntity(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      templateName: '新模板',
      templateData: '{"sections": []}',
      previewImage: 'https://example.com/new.png',
      status: true,
    };

    it('should create a new template', async () => {
      mockRepository.create.mockReturnValue(mockTemplate);
      mockRepository.save.mockResolvedValue(mockTemplate);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.templateName).toBe('技术简历模板');
    });
  });

  describe('layout avatar contract', () => {
    it('recognizes all eleven public layout keys, including formal and asymmetric layouts', () => {
      expect(TEMPLATE_LAYOUT_KEYS).toHaveLength(11);
      expect((service as any).resolveTemplateLayoutKey('{"layout":{"key":"qm-table-formal"}}')).toBe('qm-table-formal');
      expect((service as any).resolveTemplateLayoutKey('{"layout":{"key":"qm-asymmetric-profile"}}')).toBe('qm-asymmetric-profile');
    });

    it.each(TEMPLATE_LAYOUT_KEYS)('normalizes %s to its visible key-specific photo preset', (layoutKey) => {
      const variant = TEMPLATE_VARIANT_BY_LAYOUT[layoutKey];
      const normalized = JSON.parse((service as any).normalizeTemplateData(JSON.stringify({
        layoutKey,
        layout: {
          key: layoutKey,
          variant,
          avatar: { enabled: false, placement: 'hidden', shape: 'square', width: 0, height: 0 },
        },
      }), variant));

      expect(normalized.layoutKey).toBe(layoutKey);
      expect(normalized.layout.key).toBe(layoutKey);
      expect(normalized.layout.avatar).toEqual(TEMPLATE_AVATAR_PRESETS[layoutKey]);
      expect(normalized.profile.avatar).toEqual(TEMPLATE_AVATAR_PRESETS[layoutKey]);
      expect(normalized.layout.avatar.enabled).toBe(true);
      expect(normalized.layout.avatar.objectPosition).toBe('center 20%');
    });

    it.each([
      ['ats', 'qm-minimal-ats'],
      ['compact', 'qm-ribbon-compact'],
    ] as const)('keeps the %s variant photo visible when no layout key was supplied', (variant, layoutKey) => {
      const normalized = JSON.parse((service as any).normalizeTemplateData('{}', variant));
      expect(normalized.layout.key).toBe(layoutKey);
      expect(normalized.layout.avatar).toEqual(TEMPLATE_AVATAR_PRESETS[layoutKey]);
      expect(normalized.layout.avatar.enabled).toBe(true);
    });

    it('exposes the key-specific avatar contract in list responses', async () => {
      const formalTemplate = {
        ...mockTemplate,
        templateData: '{"layout":{"key":"qm-table-formal","variant":"classic"}}',
      };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([formalTemplate]),
        getManyAndCount: jest.fn().mockResolvedValue([[formalTemplate], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.list[0].layoutKey).toBe('qm-table-formal');
      expect(result.list[0].avatarLayout).toEqual(TEMPLATE_AVATAR_PRESETS['qm-table-formal']);
    });
  });

  describe('update', () => {
    const updateDto = { templateName: '更新模板' };

    it('should update template successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockTemplate);
      mockRepository.save.mockResolvedValue({ ...mockTemplate, templateName: '更新模板' });

      const result = await service.update(1, updateDto);

      expect(result.templateName).toBe('更新模板');
    });

    it('should throw NotFoundException when template not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove template', async () => {
      mockRepository.findOne.mockResolvedValue(mockTemplate);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockTemplate);
    });

    it('should throw NotFoundException when template not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('incrementUseCount', () => {
    it('should increment use count', async () => {
      mockRepository.increment.mockResolvedValue(undefined);

      await service.incrementUseCount(1);

      expect(mockRepository.increment).toHaveBeenCalledWith({ id: 1 }, 'useCount', 1);
    });
  });
});
