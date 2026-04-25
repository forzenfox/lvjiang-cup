import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../src/cache/cache.service';

describe('Cache Error Handling', () => {
  let cacheService: CacheService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue(60),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    cacheService = module.get<CacheService>(CacheService);
  });

  describe('Cache Fallback', () => {
    it('should handle get when cache is set', () => {
      const key = 'test_key';
      const value = { data: 'test' };

      cacheService.set(key, value, 60);
      const result = cacheService.get(key);

      expect(result).toEqual(value);
    });

    it('should return undefined for non-existent key', () => {
      const result = cacheService.get('non_existent_key');

      expect(result).toBeUndefined();
    });
  });

  describe('Cache Invalidation', () => {
    it('should delete cache entry', () => {
      const key = 'to_delete';
      const value = 'test';

      cacheService.set(key, value, 60);
      expect(cacheService.get(key)).toEqual(value);

      cacheService.del(key);
      expect(cacheService.get(key)).toBeUndefined();
    });

    it('should delete non-existent key gracefully', () => {
      expect(() => cacheService.del('non_existent')).not.toThrow();
    });

    it('should flush all cache entries', () => {
      cacheService.set('key1', 'value1', 60);
      cacheService.set('key2', 'value2', 60);
      cacheService.set('key3', 'value3', 60);

      cacheService.flush();

      expect(cacheService.get('key1')).toBeUndefined();
      expect(cacheService.get('key2')).toBeUndefined();
      expect(cacheService.get('key3')).toBeUndefined();
    });
  });

  describe('Cache TTL Handling', () => {
    it('should respect TTL when set', () => {
      const key = 'ttl_test';
      const value = 'test';
      const ttl = 60;

      cacheService.set(key, value, ttl);
      const result = cacheService.get(key);

      expect(result).toEqual(value);
    });

    it('should handle large TTL', () => {
      const key = 'large_ttl';
      const value = 'test';
      const ttl = 86400 * 365;

      cacheService.set(key, value, ttl);
      const result = cacheService.get(key);

      expect(result).toEqual(value);
    });
  });

  describe('Cache Data Types', () => {
    it('should handle string values', () => {
      cacheService.set('string_key', 'string_value', 60);
      expect(cacheService.get('string_key')).toBe('string_value');
    });

    it('should handle number values', () => {
      cacheService.set('number_key', 123, 60);
      expect(cacheService.get('number_key')).toBe(123);
    });

    it('should handle boolean values', () => {
      cacheService.set('bool_key', true, 60);
      expect(cacheService.get('bool_key')).toBe(true);
    });

    it('should handle array values', () => {
      const arr = [1, 2, 3];
      cacheService.set('array_key', arr, 60);
      expect(cacheService.get('array_key')).toEqual(arr);
    });

    it('should handle object values', () => {
      const obj = { name: 'test', value: 123 };
      cacheService.set('object_key', obj, 60);
      expect(cacheService.get('object_key')).toEqual(obj);
    });

    it('should handle null values', () => {
      cacheService.set('null_key', null, 60);
      expect(cacheService.get('null_key')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string key', () => {
      cacheService.set('', 'value', 60);
      expect(cacheService.get('')).toBe('value');
    });

    it('should handle very long keys', () => {
      const longKey = 'key_' + 'a'.repeat(1000);
      cacheService.set(longKey, 'value', 60);
      expect(cacheService.get(longKey)).toBe('value');
    });

    it('should handle special characters in keys', () => {
      const specialKey = 'key:with:special-chars_@#$%';
      cacheService.set(specialKey, 'value', 60);
      expect(cacheService.get(specialKey)).toBe('value');
    });

    it('should handle large values', () => {
      const largeValue = 'a'.repeat(100000);
      cacheService.set('large_key', largeValue, 60);
      expect(cacheService.get('large_key')).toBe(largeValue);
    });

    it('should check if key exists', () => {
      cacheService.set('exists_key', 'value', 60);
      expect(cacheService.has('exists_key')).toBe(true);
      expect(cacheService.has('non_exists_key')).toBe(false);
    });
  });
});
