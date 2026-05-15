interface CacheConfig {
  memoryTTL?: number;
  storageTTL?: number;
  enableStorage?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  memoryTTL: number;
  storageTTL: number;
}

let globalCacheEnabled = true;

class UnifiedCache {
  private memoryCache = new Map<string, CacheEntry<unknown>>();
  private defaultConfig: Required<CacheConfig>;

  constructor(defaultConfig: CacheConfig = {}) {
    this.defaultConfig = {
      memoryTTL: defaultConfig.memoryTTL || 60_000,
      storageTTL: defaultConfig.storageTTL || 300_000,
      enableStorage: defaultConfig.enableStorage ?? true,
    };
  }

  get<T>(key: string, config?: CacheConfig): T | null {
    if (!globalCacheEnabled) {
      return null;
    }

    const finalConfig = { ...this.defaultConfig, ...config };

    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      if (Date.now() - memoryEntry.timestamp < memoryEntry.memoryTTL) {
        return memoryEntry.data as T;
      }
      this.memoryCache.delete(key);
    }

    if (finalConfig.enableStorage) {
      try {
        const storageKey = `unified_cache_${key}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored);
          if (Date.now() - entry.timestamp < entry.storageTTL) {
            this.memoryCache.set(key, entry);
            return entry.data;
          }
          localStorage.removeItem(storageKey);
        }
      } catch {
      }
    }

    return null;
  }

  set<T>(key: string, data: T, config?: CacheConfig): void {
    if (!globalCacheEnabled) {
      return;
    }

    const finalConfig = { ...this.defaultConfig, ...config };
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      memoryTTL: finalConfig.memoryTTL,
      storageTTL: finalConfig.storageTTL,
    };

    this.memoryCache.set(key, entry);

    if (finalConfig.enableStorage) {
      try {
        const storageKey = `unified_cache_${key}`;
        localStorage.setItem(storageKey, JSON.stringify(entry));
      } catch {
      }
    }
  }

  clear(key: string): void {
    this.memoryCache.delete(key);
    try {
      const storageKey = `unified_cache_${key}`;
      localStorage.removeItem(storageKey);
    } catch {
    }
  }

  clearAll(): void {
    this.memoryCache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('unified_cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch {
    }
  }

  clearByPrefix(prefix: string): void {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`unified_cache_${prefix}`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch {
    }
  }

  /**
   * 禁用全局缓存
   * 禁用后 get() 始终返回 null，set() 不写入缓存
   * 同时清空现有内存缓存
   */
  disable(): void {
    globalCacheEnabled = false;
    this.memoryCache.clear();
  }

  /**
   * 启用全局缓存
   */
  enable(): void {
    globalCacheEnabled = true;
  }

  /**
   * 检查全局缓存是否启用
   */
  isEnabled(): boolean {
    return globalCacheEnabled;
  }
}

export const unifiedCache = new UnifiedCache();

export type { CacheConfig };
export { UnifiedCache };

export function disableFrontendCache(): void {
  unifiedCache.disable();
}

export function enableFrontendCache(): void {
  unifiedCache.enable();
}