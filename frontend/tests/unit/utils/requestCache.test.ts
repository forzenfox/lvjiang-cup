import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestCache, CACHE_TTL } from '@/utils/requestCache';

describe('requestCache', () => {
  beforeEach(() => {
    requestCache.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('CACHE_TTL 配置', () => {
    it('teams 缓存时长为 5 分钟（300000ms）', () => {
      expect(CACHE_TTL.teams).toBe(300_000);
    });

    it('matches 缓存时长为 1 分钟（60000ms）', () => {
      expect(CACHE_TTL.matches).toBe(60_000);
    });

    it('stream 缓存时长为 15 秒（15000ms）', () => {
      expect(CACHE_TTL.stream).toBe(15_000);
    });

    it('videos 缓存时长为 5 分钟（300000ms）', () => {
      expect(CACHE_TTL.videos).toBe(300_000);
    });

    it('streamers 缓存时长为 5 分钟（300000ms）', () => {
      expect(CACHE_TTL.streamers).toBe(300_000);
    });
  });

  describe('缓存基本操作', () => {
    it('set 和 get 正常工作', () => {
      requestCache.set('test-key', { name: 'test' });
      const result = requestCache.get<{ name: string }>('test-key', 60_000);
      expect(result).toEqual({ name: 'test' });
    });

    it('TTL 内返回缓存数据', () => {
      requestCache.set('test-key', 'cached-data');

      vi.advanceTimersByTime(30_000);

      const result = requestCache.get('test-key', 60_000);
      expect(result).toBe('cached-data');
    });

    it('TTL 过期后返回 null', () => {
      requestCache.set('test-key', 'cached-data');

      vi.advanceTimersByTime(61_000);

      const result = requestCache.get('test-key', 60_000);
      expect(result).toBeNull();
    });

    it('未设置过的 key 返回 null', () => {
      const result = requestCache.get('nonexistent', 60_000);
      expect(result).toBeNull();
    });
  });

  describe('clear 操作', () => {
    it('clear(key) 清除指定 key', () => {
      requestCache.set('key1', 'data1');
      requestCache.set('key2', 'data2');

      requestCache.clear('key1');

      expect(requestCache.get('key1', 60_000)).toBeNull();
      expect(requestCache.get('key2', 60_000)).toBe('data2');
    });

    it('clear() 无参数时清除所有缓存', () => {
      requestCache.set('key1', 'data1');
      requestCache.set('key2', 'data2');

      requestCache.clear();

      expect(requestCache.get('key1', 60_000)).toBeNull();
      expect(requestCache.get('key2', 60_000)).toBeNull();
    });
  });

  describe('getTTL', () => {
    it('获取指定 key 的 TTL', () => {
      expect(requestCache.getTTL('teams')).toBe(300_000);
      expect(requestCache.getTTL('stream')).toBe(15_000);
    });
  });
});
