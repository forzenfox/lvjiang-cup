import { Test, TestingModule } from '@nestjs/testing';
import { BaseCachedService } from '../../src/common/services/base-cached.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';

// 创建测试用的具体服务类
class TestService extends BaseCachedService<{ id: string; name: string }, string> {
  constructor(databaseService: DatabaseService, cacheService: CacheService) {
    super(databaseService, cacheService, 'TestService');
  }

  protected getCachePrefix(): string {
    return 'test';
  }

  protected async findAllFromDb(): Promise<{ id: string; name: string }[]> {
    return this.databaseService.all('SELECT * FROM test_table');
  }

  protected async findOneFromDb(id: string): Promise<{ id: string; name: string } | undefined> {
    return this.databaseService.get('SELECT * FROM test_table WHERE id = ?', [id]);
  }

  // 暴露 protected 方法用于测试
  public testGetAllCacheKey(): string {
    return this.getAllCacheKey();
  }

  public testGetOneCacheKey(id: string): string {
    return this.getOneCacheKey(id);
  }

  public async testGetOrSetAll(): Promise<{ id: string; name: string }[]> {
    return this.getOrSetAll();
  }

  public async testGetOrSetOne(id: string): Promise<{ id: string; name: string }> {
    return this.getOrSetOne(id);
  }

  public testClearAllCache(): void {
    return this.clearAllCache();
  }

  public testClearOneCache(id: string): void {
    return this.clearOneCache(id);
  }

  public testClearRelatedCache(id: string): void {
    return this.clearRelatedCache(id);
  }
}

describe('BaseCachedService', () => {
  let service: TestService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;

  const mockDatabaseService = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);
    service = new TestService(databaseService, cacheService);

    jest.clearAllMocks();
  });

  describe('缓存键生成', () => {
    it('应该生成正确的列表缓存键', () => {
      expect(service.testGetAllCacheKey()).toBe('test:all');
    });

    it('应该生成正确的单个资源缓存键', () => {
      expect(service.testGetOneCacheKey('123')).toBe('test:123');
    });
  });

  describe('getOrSetAll', () => {
    it('应该从缓存返回数据（缓存命中）', async () => {
      const cachedData = [{ id: '1', name: 'Test' }];
      mockCacheService.get.mockReturnValue(cachedData);

      const result = await service.testGetOrSetAll();

      expect(result).toEqual(cachedData);
      expect(mockCacheService.get).toHaveBeenCalledWith('test:all');
      expect(mockDatabaseService.all).not.toHaveBeenCalled();
    });

    it('应该从数据库查询并缓存（缓存未命中）', async () => {
      const dbData = [{ id: '1', name: 'Test' }];
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all.mockResolvedValue(dbData);

      const result = await service.testGetOrSetAll();

      expect(result).toEqual(dbData);
      expect(mockDatabaseService.all).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith('test:all', dbData);
    });
  });

  describe('getOrSetOne', () => {
    it('应该从缓存返回单个资源（缓存命中）', async () => {
      const cachedData = { id: '1', name: 'Test' };
      mockCacheService.get.mockReturnValue(cachedData);

      const result = await service.testGetOrSetOne('1');

      expect(result).toEqual(cachedData);
      expect(mockCacheService.get).toHaveBeenCalledWith('test:1');
      expect(mockDatabaseService.get).not.toHaveBeenCalled();
    });

    it('应该从数据库查询并缓存单个资源（缓存未命中）', async () => {
      const dbData = { id: '1', name: 'Test' };
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(dbData);

      const result = await service.testGetOrSetOne('1');

      expect(result).toEqual(dbData);
      expect(mockDatabaseService.get).toHaveBeenCalledWith(
        'SELECT * FROM test_table WHERE id = ?',
        ['1'],
      );
      expect(mockCacheService.set).toHaveBeenCalledWith('test:1', dbData);
    });

    it('应该在资源不存在时抛出错误', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(undefined);

      await expect(service.testGetOrSetOne('999')).rejects.toThrow(
        'Resource with id 999 not found',
      );
    });
  });

  describe('缓存清除', () => {
    it('应该清除所有缓存', () => {
      service.testClearAllCache();

      expect(mockCacheService.del).toHaveBeenCalledWith('test:all');
    });

    it('应该清除单个资源缓存', () => {
      service.testClearOneCache('1');

      expect(mockCacheService.del).toHaveBeenCalledWith('test:1');
    });

    it('应该清除相关所有缓存（列表+单个）', () => {
      service.testClearRelatedCache('1');

      expect(mockCacheService.del).toHaveBeenCalledWith('test:all');
      expect(mockCacheService.del).toHaveBeenCalledWith('test:1');
    });
  });
});
