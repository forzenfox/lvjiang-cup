import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  requestCache,
  CACHE_TTL,
  disableFrontendCache,
  enableFrontendCache,
} from '@/utils/requestCache';

describe('requestCache', () => {
  beforeEach(() => {
    requestCache.clear();
    requestCache.enable(); // 确保每次测试前缓存是启用的
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

  // 新增测试：全局开关功能
  describe('全局缓存开关', () => {
    it('默认状态下缓存是启用的', () => {
      expect(requestCache.isEnabled()).toBe(true);
    });

    it('disable() 后缓存被禁用', () => {
      requestCache.disable();
      expect(requestCache.isEnabled()).toBe(false);
    });

    it('disable() 后 get 返回 null', () => {
      requestCache.set('test-key', 'cached-data');
      requestCache.disable();

      const result = requestCache.get('test-key', 60_000);
      expect(result).toBeNull();
    });

    it('disable() 后 set 不存储数据', () => {
      requestCache.disable();
      requestCache.set('test-key', 'new-data');

      requestCache.enable();
      const result = requestCache.get('test-key', 60_000);
      expect(result).toBeNull();
    });

    it('disable() 会清空现有缓存', () => {
      requestCache.set('key1', 'data1');
      requestCache.set('key2', 'data2');

      requestCache.disable();

      requestCache.enable();
      expect(requestCache.get('key1', 60_000)).toBeNull();
      expect(requestCache.get('key2', 60_000)).toBeNull();
    });

    it('enable() 后缓存恢复工作', () => {
      requestCache.disable();
      requestCache.enable();

      requestCache.set('test-key', 'cached-data');
      const result = requestCache.get('test-key', 60_000);
      expect(result).toBe('cached-data');
    });

    it('enable() 后 isEnabled() 返回 true', () => {
      requestCache.disable();
      requestCache.enable();
      expect(requestCache.isEnabled()).toBe(true);
    });
  });

  // 新增测试：便捷导出函数
  describe('便捷导出函数', () => {
    it('disableFrontendCache() 禁用缓存', () => {
      disableFrontendCache();
      expect(requestCache.isEnabled()).toBe(false);
    });

    it('enableFrontendCache() 启用缓存', () => {
      disableFrontendCache();
      enableFrontendCache();
      expect(requestCache.isEnabled()).toBe(true);
    });
  });
});
