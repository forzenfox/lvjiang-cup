import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

// Mock node-cache - 在导入 CacheService 之前
const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();
const mockCacheDel = jest.fn();
const mockCacheFlushAll = jest.fn();
const mockCacheHas = jest.fn();
const mockOn = jest.fn();

jest.mock('node-cache', () => {
  return jest.fn().mockImplementation(() => ({
    get: mockCacheGet,
    set: mockCacheSet,
    del: mockCacheDel,
    flushAll: mockCacheFlushAll,
    has: mockCacheHas,
    on: mockOn,
  }));
});

import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let configService: ConfigService;

  const defaultTtl = 60;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(defaultTtl),
          },
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get() - 缓存命中', () => {
    it('当缓存存在时应该返回缓存值', () => {
      // Arrange
      const key = 'test-key';
      const expectedValue = { data: 'cached value' };
      mockCacheGet.mockReturnValue(expectedValue);

      // Act
      const result = service.get(key);

      // Assert
      expect(mockCacheGet).toHaveBeenCalledWith(key);
      expect(result).toEqual(expectedValue);
    });

    it('应该支持不同类型的缓存值', () => {
      // Arrange
      const stringValue = 'string value';
      const numberValue = 42;
      const arrayValue = [1, 2, 3];

      // Act & Assert
      mockCacheGet.mockReturnValue(stringValue);
      expect(service.get('string-key')).toBe(stringValue);

      mockCacheGet.mockReturnValue(numberValue);
      expect(service.get('number-key')).toBe(numberValue);

      mockCacheGet.mockReturnValue(arrayValue);
      expect(service.get('array-key')).toEqual(arrayValue);
    });
  });

  describe('get() - 缓存未命中', () => {
    it('当缓存不存在时应该返回undefined', () => {
      // Arrange
      const key = 'non-existent-key';
      mockCacheGet.mockReturnValue(undefined);

      // Act
      const result = service.get(key);

      // Assert
      expect(mockCacheGet).toHaveBeenCalledWith(key);
      expect(result).toBeUndefined();
    });

    it('当缓存值为null时应该返回null', () => {
      // Arrange
      const key = 'null-key';
      mockCacheGet.mockReturnValue(null);

      // Act
      const result = service.get(key);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('get() - 缓存过期', () => {
    it('当缓存过期时应该返回undefined', () => {
      // Arrange
      const key = 'expired-key';
      mockCacheGet.mockReturnValue(undefined);

      // Act
      const result = service.get(key);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('set() - 设置缓存', () => {
    it('应该成功设置缓存值', () => {
      // Arrange
      const key = 'test-key';
      const value = { data: 'test value' };
      mockCacheSet.mockReturnValue(true);

      // Act
      const result = service.set(key, value);

      // Assert
      expect(mockCacheSet).toHaveBeenCalledWith(key, value, undefined);
      expect(result).toBe(true);
    });

    it('应该支持设置字符串值', () => {
      // Arrange
      const key = 'string-key';
      const value = 'test string';
      mockCacheSet.mockReturnValue(true);

      // Act
      service.set(key, value);

      // Assert
      expect(mockCacheSet).toHaveBeenCalledWith(key, value, undefined);
    });

    it('应该支持设置对象值', () => {
      // Arrange
      const key = 'object-key';
      const value = { id: 1, name: 'Test' };
      mockCacheSet.mockReturnValue(true);

      // Act
      service.set(key, value);

      // Assert
      expect(mockCacheSet).toHaveBeenCalledWith(key, value, undefined);
    });
  });

  describe('set() - 自定义 TTL', () => {
    it('应该使用自定义TTL设置缓存', () => {
      // Arrange
      const key = 'test-key';
      const value = 'test value';
      const customTtl = 300;
      mockCacheSet.mockReturnValue(true);

      // Act
      const result = service.set(key, value, customTtl);

      // Assert
      expect(mockCacheSet).toHaveBeenCalledWith(key, value, customTtl);
      expect(result).toBe(true);
    });

    it('应该支持TTL为0的缓存', () => {
      // Arrange
      const key = 'no-ttl-key';
      const value = 'test value';
      mockCacheSet.mockReturnValue(true);

      // Act
      service.set(key, value, 0);

      // Assert
      expect(mockCacheSet).toHaveBeenCalledWith(key, value, 0);
    });
  });

  describe('set() - 默认 TTL', () => {
    it('应该在初始化时读取配置中的默认TTL', () => {
      // Assert
      expect(configService.get).toHaveBeenCalledWith('cache.ttl');
    });

    it('当未指定TTL时应该使用默认TTL', () => {
      // Arrange
      const key = 'default-ttl-key';
      const value = 'test value';
      mockCacheSet.mockReturnValue(true);

      // Act
      service.set(key, value);

      // Assert
      expect(mockCacheSet).toHaveBeenCalledWith(key, value, undefined);
    });
  });

  describe('del() - 删除单个 key', () => {
    it('应该删除指定的缓存key', () => {
      // Arrange
      const key = 'delete-key';
      mockCacheDel.mockReturnValue(1);

      // Act
      const result = service.del(key);

      // Assert
      expect(mockCacheDel).toHaveBeenCalledWith(key);
      expect(result).toBe(1);
    });

    it('应该返回删除的key数量', () => {
      // Arrange
      const key = 'delete-key';
      mockCacheDel.mockReturnValue(1);

      // Act
      const result = service.del(key);

      // Assert
      expect(result).toBe(1);
    });
  });

  describe('del() - 删除前缀匹配 keys', () => {
    it('应该支持删除匹配前缀的所有keys', () => {
      // Arrange
      const prefix = 'user:';
      mockCacheDel.mockReturnValue(3);

      // Act
      const result = service.del(prefix);

      // Assert
      expect(mockCacheDel).toHaveBeenCalledWith(prefix);
      expect(result).toBe(3);
    });

    it('当删除多个keys时应该返回删除的数量', () => {
      // Arrange
      const pattern = 'session:*';
      mockCacheDel.mockReturnValue(5);

      // Act
      const result = service.del(pattern);

      // Assert
      expect(result).toBe(5);
    });
  });

  describe('del() - 删除不存在的 key', () => {
    it('当删除不存在的key时应该返回0', () => {
      // Arrange
      const key = 'non-existent-key';
      mockCacheDel.mockReturnValue(0);

      // Act
      const result = service.del(key);

      // Assert
      expect(mockCacheDel).toHaveBeenCalledWith(key);
      expect(result).toBe(0);
    });

    it('当删除已过期key时应该返回0', () => {
      // Arrange
      const key = 'expired-key';
      mockCacheDel.mockReturnValue(0);

      // Act
      const result = service.del(key);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('clear() - 清空所有缓存', () => {
    it('应该清空所有缓存数据', () => {
      // Arrange
      mockCacheFlushAll.mockReturnValue(undefined);

      // Act
      service.flush();

      // Assert
      expect(mockCacheFlushAll).toHaveBeenCalled();
    });

    it('调用flush后应该清空所有缓存', () => {
      // Arrange
      mockCacheFlushAll.mockReturnValue(undefined);
      mockCacheGet.mockReturnValue(undefined);

      // Act
      service.flush();
      const result = service.get('any-key');

      // Assert
      expect(mockCacheFlushAll).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('has() - 检查缓存存在性', () => {
    it('当缓存存在时应该返回true', () => {
      // Arrange
      const key = 'existing-key';
      mockCacheHas.mockReturnValue(true);

      // Act
      const result = service.has(key);

      // Assert
      expect(mockCacheHas).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });

    it('当缓存不存在时应该返回false', () => {
      // Arrange
      const key = 'non-existing-key';
      mockCacheHas.mockReturnValue(false);

      // Act
      const result = service.has(key);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getOrSet() - 获取或设置缓存', () => {
    it('当缓存命中时应该直接返回缓存值', async () => {
      // Arrange
      const key = 'test-key';
      const cachedValue = { data: 'cached' };
      mockCacheGet.mockReturnValue(cachedValue);
      const factory = jest.fn();

      // Act
      const result = await service.getOrSet(key, factory);

      // Assert
      expect(result).toEqual(cachedValue);
      expect(factory).not.toHaveBeenCalled();
    });

    it('当缓存未命中时应该调用factory并缓存结果', async () => {
      // Arrange
      const key = 'test-key';
      const factoryValue = { data: 'factory result' };
      mockCacheGet.mockReturnValue(undefined);
      mockCacheSet.mockReturnValue(true);
      const factory = jest.fn().mockResolvedValue(factoryValue);

      // Act
      const result = await service.getOrSet(key, factory);

      // Assert
      expect(factory).toHaveBeenCalled();
      expect(mockCacheSet).toHaveBeenCalledWith(key, factoryValue, undefined);
      expect(result).toEqual(factoryValue);
    });

    it('应该支持自定义TTL的getOrSet', async () => {
      // Arrange
      const key = 'test-key';
      const factoryValue = { data: 'result' };
      const customTtl = 120;
      mockCacheGet.mockReturnValue(undefined);
      mockCacheSet.mockReturnValue(true);
      const factory = jest.fn().mockResolvedValue(factoryValue);

      // Act
      await service.getOrSet(key, factory, customTtl);

      // Assert
      expect(mockCacheSet).toHaveBeenCalledWith(key, factoryValue, customTtl);
    });
  });

  describe('事件监听', () => {
    it('应该在初始化时监听expired事件', () => {
      // Assert
      expect(mockOn).toHaveBeenCalledWith('expired', expect.any(Function));
    });
  });
});
