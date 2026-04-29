/**
 * 请求缓存工具类
 *
 * 功能：
 * 1. 内存级缓存，减少重复API请求
 * 2. 支持TTL（Time To Live）过期策略
 * 3. 支持全局开关控制（管理后台禁用缓存）
 *
 * 缓存策略（按数据变化频率）：
 * - 直播信息: 15秒（高频变化）
 * - 比赛数据: 1分钟（中频变化）
 * - 战队数据: 5分钟（低频变化）
 * - 视频数据: 5分钟（低频变化）
 * - 主播信息: 5分钟（低频变化）
 */

const CACHE_TTL = {
  teams: 300_000,
  matches: 60_000,
  stream: 15_000,
  videos: 300_000,
  streamers: 300_000,
} as const;

interface CacheItem {
  data: unknown;
  timestamp: number;
}

let frontendCacheEnabled = true; // 全局缓存开关

class RequestCache {
  private cache = new Map<string, CacheItem>();

  /**
   * 获取缓存数据
   * @param key 缓存键
   * @param ttl 过期时间（毫秒）
   * @returns 缓存数据或 null
   */
  get<T>(key: string, ttl: number): T | null {
    // 全局禁用时直接返回 null
    if (!frontendCacheEnabled) {
      return null;
    }

    const item = this.cache.get(key);
    if (!item || Date.now() - item.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param data 缓存数据
   */
  set(key: string, data: unknown): void {
    // 全局禁用时不设置缓存
    if (!frontendCacheEnabled) {
      return;
    }

    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * 清除缓存
   * @param key 缓存键，不传则清除所有
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * 获取配置的 TTL
   * @param key 缓存键类型
   */
  getTTL(key: keyof typeof CACHE_TTL): number {
    return CACHE_TTL[key];
  }

  /**
   * 启用前端缓存
   */
  enable(): void {
    frontendCacheEnabled = true;
    console.log('[RequestCache] Frontend cache enabled');
  }

  /**
   * 禁用前端缓存
   */
  disable(): void {
    frontendCacheEnabled = false;
    this.cache.clear(); // 禁用时同时清空现有缓存
    console.log('[RequestCache] Frontend cache disabled and cleared');
  }

  /**
   * 检查前端缓存是否启用
   */
  isEnabled(): boolean {
    return frontendCacheEnabled;
  }
}

export const requestCache = new RequestCache();
export { CACHE_TTL };
export type CacheKey = keyof typeof CACHE_TTL;

// 便捷导出方法
export function disableFrontendCache() {
  requestCache.disable();
}

export function enableFrontendCache() {
  requestCache.enable();
}
