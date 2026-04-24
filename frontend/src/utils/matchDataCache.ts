const CACHE_PREFIX = 'match_data_';
const CACHE_TTL = 5 * 60 * 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const matchDataCache = {
  get<T>(key: string): T | null {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);

      if (!cached) return null;

      const item: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();

      if (now - item.timestamp > CACHE_TTL) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return item.data;
    } catch {
      return null;
    }
  },

  set<T>(key: string, data: T): void {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(item));
    } catch {
      console.warn('[matchDataCache] Failed to set cache');
    }
  },

  remove(key: string): void {
    try {
      const cacheKey = CACHE_PREFIX + key;
      localStorage.removeItem(cacheKey);
    } catch {
      console.warn('[matchDataCache] Failed to remove cache');
    }
  },

  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch {
      console.warn('[matchDataCache] Failed to clear cache');
    }
  },

  getMatchSeriesKey(matchId: string): string {
    return `series_${matchId}`;
  },

  getGameDataKey(matchId: string, gameNumber: number): string {
    return `game_${matchId}_${gameNumber}`;
  },
};

export const useMatchDataCache = () => {
  return matchDataCache;
};
