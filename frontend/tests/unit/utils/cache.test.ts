import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryCache, withCache, CacheTags, globalCache } from '@/utils/cache';

describe('Cache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache({
      defaultTTL: 1000, // 1秒用于测试
      maxSize: 10,
      persist: false,
    });
    // 清理全局缓存
    globalCache.clear();
  });

  afterEach(() => {
    cache.clear();
    globalCache.clear();
  });

  describe('MemoryCache', () => {
    it('should set and get cache correctly', () => {
      cache.set('key', { data: 'value' });

      const result = cache.get('key');

      expect(result).toEqual({ data: 'value' });
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('non-existent');

      expect(result).toBeNull();
    });

    it('should return null for expired cache', async () => {
      cache.set('key', { data: 'value' }, { ttl: 10 }); // 10ms TTL

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 20));

      const result = cache.get('key');

      expect(result).toBeNull();
    });

    it('should delete cache correctly', () => {
      cache.set('key', { data: 'value' });

      const deleted = cache.delete('key');

      expect(deleted).toBe(true);
      expect(cache.get('key')).toBeNull();
    });

    it('should check if cache exists', () => {
      cache.set('key', { data: 'value' });

      expect(cache.has('key')).toBe(true);
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should invalidate by tag', () => {
      cache.set('key1', { data: 'value1' }, { tags: ['tag1'] });
      cache.set('key2', { data: 'value2' }, { tags: ['tag1', 'tag2'] });
      cache.set('key3', { data: 'value3' }, { tags: ['tag2'] });

      cache.invalidateByTag('tag1');

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toEqual({ data: 'value3' });
    });

    it('should invalidate by tag prefix', () => {
      cache.set('key1', { data: 'value1' }, { tags: ['user:1'] });
      cache.set('key2', { data: 'value2' }, { tags: ['user:2'] });
      cache.set('key3', { data: 'value3' }, { tags: ['team:1'] });

      cache.invalidateByTagPrefix('user:');

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toEqual({ data: 'value3' });
    });

    it('should clear all cache', () => {
      cache.set('key1', { data: 'value1' });
      cache.set('key2', { data: 'value2' });

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.size()).toBe(0);
    });

    it('should handle params in key', () => {
      cache.set('key', { data: 'value1' }, { params: { id: 1 } });
      cache.set('key', { data: 'value2' }, { params: { id: 2 } });

      expect(cache.get('key', { id: 1 })).toEqual({ data: 'value1' });
      expect(cache.get('key', { id: 2 })).toEqual({ data: 'value2' });
    });

    it('should get cache info', () => {
      cache.set('key', { data: 'value' }, { ttl: 5000, tags: ['tag1'] });

      const info = cache.getInfo('key');

      expect(info).toBeDefined();
      expect(info?.ttl).toBe(5000);
      expect(info?.tags).toEqual(['tag1']);
      expect(info?.isExpired).toBe(false);
    });

    it('should respect max size', () => {
      const smallCache = new MemoryCache({ maxSize: 2 });

      smallCache.set('key1', { data: 'value1' });
      smallCache.set('key2', { data: 'value2' });
      smallCache.set('key3', { data: 'value3' }); // 应该移除 key1

      expect(smallCache.size()).toBe(2);
      expect(smallCache.get('key1')).toBeNull();
      expect(smallCache.get('key2')).toEqual({ data: 'value2' });
      expect(smallCache.get('key3')).toEqual({ data: 'value3' });
    });
  });

  describe('withCache', () => {
    it('should cache fetcher result', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'fetched' });

      const result1 = await withCache('test-key', fetcher);
      const result2 = await withCache('test-key', fetcher);

      expect(result1).toEqual({ data: 'fetched' });
      expect(result2).toEqual({ data: 'fetched' });
      expect(fetcher).toHaveBeenCalledTimes(1); // 只调用一次
    });

    it('should force refresh when specified', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'fetched' });

      await withCache('test-key', fetcher);

      // 清理全局缓存，然后强制刷新
      globalCache.delete('test-key');
      await withCache('test-key', fetcher, { forceRefresh: true });

      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('should use custom TTL', async () => {
      const fetcher = vi.fn().mockResolvedValue({ data: 'fetched' });

      await withCache('test-key', fetcher, { ttl: 50 });

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 60));

      await withCache('test-key', fetcher);

      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('should handle fetcher errors', async () => {
      const fetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'));

      await expect(withCache('test-key', fetcher)).rejects.toThrow('Fetch failed');
    });
  });

  describe('CacheTags', () => {
    it('should have correct tag values', () => {
      expect(CacheTags.TEAMS).toBe('teams');
      expect(CacheTags.MATCHES).toBe('matches');
      expect(CacheTags.STREAMS).toBe('streams');
      expect(CacheTags.ADVANCEMENT).toBe('advancement');
      expect(CacheTags.USER).toBe('user');
      expect(CacheTags.SETTINGS).toBe('settings');
    });
  });
});
