/**
 * 缓存项
 */
interface CacheItem<T> {
  /** 缓存数据 */
  data: T;
  /** 缓存时间戳 */
  timestamp: number;
  /** 过期时间（毫秒） */
  ttl: number;
  /** 缓存标签，用于批量失效 */
  tags?: string[];
}

/**
 * 缓存配置
 */
interface CacheConfig {
  /** 默认过期时间（毫秒） */
  defaultTTL?: number;
  /** 最大缓存数量 */
  maxSize?: number;
  /** 是否启用本地存储持久化 */
  persist?: boolean;
  /** 本地存储键名 */
  storageKey?: string;
}

/**
 * 内存缓存管理器
 */
class MemoryCache {
  private cache: Map<string, CacheItem<unknown>> = new Map();
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 默认 5 分钟
      maxSize: 100,
      persist: false,
      storageKey: 'app-cache',
      ...config,
    };

    // 如果启用持久化，从本地存储恢复
    if (this.config.persist) {
      this.loadFromStorage();
    }
  }

  /**
   * 生成缓存键
   */
  private generateKey(key: string, params?: Record<string, unknown>): string {
    if (!params) return key;
    const sortedParams = Object.keys(params)
      .sort()
      .map(k => `${k}=${JSON.stringify(params[k])}`)
      .join('&');
    return `${key}?${sortedParams}`;
  }

  /**
   * 检查缓存是否过期
   */
  private isExpired(item: CacheItem<unknown>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 确保缓存不超过最大限制
   */
  private ensureSize(): void {
    if (this.cache.size >= this.config.maxSize) {
      // 删除最旧的缓存
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 从本地存储加载
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [key, item] of Object.entries(parsed)) {
          const cacheItem = item as CacheItem<unknown>;
          // 只加载未过期的缓存
          if (!this.isExpired(cacheItem)) {
            this.cache.set(key, cacheItem);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage(): void {
    try {
      const data: Record<string, CacheItem<unknown>> = {};
      for (const [key, item] of this.cache.entries()) {
        data[key] = item;
      }
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  /**
   * 获取缓存
   */
  get<T>(key: string, params?: Record<string, unknown>): T | null {
    const cacheKey = this.generateKey(key, params);
    const item = this.cache.get(cacheKey) as CacheItem<T> | undefined;

    if (!item) return null;

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return item.data;
  }

  /**
   * 设置缓存
   */
  set<T>(
    key: string,
    data: T,
    options?: {
      ttl?: number;
      params?: Record<string, unknown>;
      tags?: string[];
    }
  ): void {
    this.cleanup();
    this.ensureSize();

    const cacheKey = this.generateKey(key, options?.params);
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: options?.ttl ?? this.config.defaultTTL,
      tags: options?.tags,
    };

    this.cache.set(cacheKey, item as CacheItem<unknown>);

    if (this.config.persist) {
      this.saveToStorage();
    }
  }

  /**
   * 删除缓存
   */
  delete(key: string, params?: Record<string, unknown>): boolean {
    const cacheKey = this.generateKey(key, params);
    return this.cache.delete(cacheKey);
  }

  /**
   * 根据标签删除缓存
   */
  invalidateByTag(tag: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags?.includes(tag)) {
        this.cache.delete(key);
      }
    }

    if (this.config.persist) {
      this.saveToStorage();
    }
  }

  /**
   * 根据标签前缀删除缓存
   */
  invalidateByTagPrefix(prefix: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags?.some(tag => tag.startsWith(prefix))) {
        this.cache.delete(key);
      }
    }

    if (this.config.persist) {
      this.saveToStorage();
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();

    if (this.config.persist) {
      localStorage.removeItem(this.config.storageKey);
    }
  }

  /**
   * 检查缓存是否存在且有效
   */
  has(key: string, params?: Record<string, unknown>): boolean {
    const cacheKey = this.generateKey(key, params);
    const item = this.cache.get(cacheKey);

    if (!item) return false;
    if (this.isExpired(item)) {
      this.cache.delete(cacheKey);
      return false;
    }

    return true;
  }

  /**
   * 获取缓存信息
   */
  getInfo(key: string, params?: Record<string, unknown>) {
    const cacheKey = this.generateKey(key, params);
    const item = this.cache.get(cacheKey);

    if (!item) return null;

    return {
      age: Date.now() - item.timestamp,
      ttl: item.ttl,
      isExpired: this.isExpired(item),
      tags: item.tags,
    };
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// 创建全局缓存实例
export const globalCache = new MemoryCache({
  defaultTTL: 5 * 60 * 1000, // 5 分钟
  maxSize: 200,
  persist: true,
  storageKey: 'lvjiang-cup-cache',
});

/**
 * 请求缓存包装器
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    params?: Record<string, unknown>;
    tags?: string[];
    forceRefresh?: boolean;
  }
): Promise<T> {
  const { ttl, params, tags, forceRefresh = false } = options || {};

  // 如果不是强制刷新，先尝试从缓存获取
  if (!forceRefresh) {
    const cached = globalCache.get<T>(key, params);
    if (cached !== null) {
      return cached;
    }
  }

  // 执行请求
  const data = await fetcher();

  // 存入缓存
  globalCache.set(key, data, { ttl, params, tags });

  return data;
}

/**
 * 缓存标签常量
 */
export const CacheTags = {
  TEAMS: 'teams',
  MATCHES: 'matches',
  STREAMS: 'streams',
  ADVANCEMENT: 'advancement',
  USER: 'user',
  SETTINGS: 'settings',
} as const;

/**
 * 预取数据
 */
export function prefetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    params?: Record<string, unknown>;
    tags?: string[];
  }
): void {
  // 如果缓存已存在，不重复预取
  if (globalCache.has(key, options?.params)) {
    return;
  }

  // 异步预取数据
  fetcher()
    .then(data => {
      globalCache.set(key, data, options);
    })
    .catch(error => {
      console.warn(`Prefetch failed for ${key}:`, error);
    });
}

/**
 * 批量预取
 */
export function prefetchBatch(
  items: Array<{
    key: string;
    fetcher: () => Promise<unknown>;
    options?: {
      ttl?: number;
      params?: Record<string, unknown>;
      tags?: string[];
    };
  }>
): void {
  items.forEach(({ key, fetcher, options }) => {
    prefetch(key, fetcher, options);
  });
}

/**
 * 清除缓存
 */
export function clearCache(tag?: string): void {
  if (tag) {
    globalCache.invalidateByTag(tag);
  } else {
    globalCache.clear();
  }
}

/**
 * 获取缓存统计
 */
export function getCacheStats() {
  return {
    size: globalCache.size(),
    keys: globalCache.keys(),
  };
}

export { MemoryCache };
export default globalCache;
