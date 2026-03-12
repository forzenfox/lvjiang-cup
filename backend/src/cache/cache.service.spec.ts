import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { ConfigService } from '@nestjs/config';

describe('CacheService', () => {
  let service: CacheService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue(60), // TTL 60 seconds
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    // Clear the cache after each test
    service.flush();
    jest.clearAllMocks();
  });

  describe('get() - 缓存命中', () => {
    it('应该返回缓存的值', () => {
      const key = 'test-key';
      const value = { id: 1, name: 'Test' };

      service.set(key, value);
      const result = service.get(key);

      expect(result).toEqual(value);
    });

    it('应该处理字符串值', () => {
      const key = 'string-key';
      const value = 'test-string';

      service.set(key, value);
      const result = service.get(key);

      expect(result).toBe(value);
    });

    it('应该处理数字值', () => {
      const key = 'number-key';
      const value = 42;

      service.set(key, value);
      const result = service.get(key);

      expect(result).toBe(value);
    });
  });

  describe('get() - 缓存未命中', () => {
    it('应该在键不存在时返回 undefined', () => {
      const key = 'non-existent-key';
      const result = service.get(key);

      expect(result).toBeUndefined();
    });
  });

  describe('set() - 设置缓存', () => {
    it('应该成功设置缓存值', () => {
      const key = 'test-key';
      const value = { data: 'test' };

      const result = service.set(key, value);

      expect(result).toBe(true);
      expect(service.get(key)).toEqual(value);
    });

    it('应该支持自定义 TTL', () => {
      const key = 'test-key';
      const value = 'test-value';
      const customTtl = 120;

      service.set(key, value, customTtl);

      expect(service.get(key)).toBe(value);
    });

    it('应该支持对象值', () => {
      const key = 'object-key';
      const value = { id: 1, nested: { data: 'test' } };

      service.set(key, value);
      const result = service.get(key);

      expect(result).toEqual(value);
    });

    it('应该支持数组值', () => {
      const key = 'array-key';
      const value = [1, 2, 3, { id: 4 }];

      service.set(key, value);
      const result = service.get(key);

      expect(result).toEqual(value);
    });
  });

  describe('del() - 删除缓存', () => {
    it('应该删除单个存在的键', () => {
      const key = 'delete-key';
      service.set(key, 'value');

      const result = service.del(key);

      expect(result).toBe(1);
      expect(service.get(key)).toBeUndefined();
    });

    it('应该在删除不存在的键时返回 0', () => {
      const key = 'non-existent-key';

      const result = service.del(key);

      expect(result).toBe(0);
    });
  });

  describe('flush() - 清空所有缓存', () => {
    it('应该清空所有缓存数据', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      service.set('key3', 'value3');

      service.flush();

      expect(service.get('key1')).toBeUndefined();
      expect(service.get('key2')).toBeUndefined();
      expect(service.get('key3')).toBeUndefined();
    });
  });

  describe('has() - 检查键是否存在', () => {
    it('应该在键存在时返回 true', () => {
      const key = 'existing-key';
      service.set(key, 'value');

      const result = service.has(key);

      expect(result).toBe(true);
    });

    it('应该在键不存在时返回 false', () => {
      const key = 'non-existent-key';

      const result = service.has(key);

      expect(result).toBe(false);
    });
  });

  describe('getOrSet() - 获取或设置缓存', () => {
    it('应该在缓存命中时返回缓存值', async () => {
      const key = 'test-key';
      const cachedValue = { id: 1, name: 'Cached' };
      service.set(key, cachedValue);

      const factory = jest.fn().mockResolvedValue({ id: 2, name: 'New' });
      const result = await service.getOrSet(key, factory);

      expect(result).toEqual(cachedValue);
      expect(factory).not.toHaveBeenCalled();
    });

    it('应该在缓存未命中时调用 factory 并缓存结果', async () => {
      const key = 'new-key';
      const newValue = { id: 1, name: 'New' };
      const factory = jest.fn().mockResolvedValue(newValue);

      const result = await service.getOrSet(key, factory);

      expect(result).toEqual(newValue);
      expect(factory).toHaveBeenCalled();
      expect(service.get(key)).toEqual(newValue);
    });

    it('应该支持自定义 TTL', async () => {
      const key = 'ttl-key';
      const value = 'test-value';
      const customTtl = 300;
      const factory = jest.fn().mockResolvedValue(value);

      await service.getOrSet(key, factory, customTtl);

      expect(service.get(key)).toEqual(value);
    });

    it('应该处理 factory 抛出的错误', async () => {
      const key = 'error-key';
      const factory = jest.fn().mockRejectedValue(new Error('Factory error'));

      await expect(service.getOrSet(key, factory)).rejects.toThrow('Factory error');
    });
  });

  describe('配置初始化', () => {
    it('应该从配置中读取 TTL', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('cache.ttl');
    });
  });
});
