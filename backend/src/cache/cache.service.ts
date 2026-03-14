import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const NodeCache = require('node-cache');

@Injectable()
export class CacheService {
  private cache: any;
  private readonly logger = new Logger(CacheService.name);

  constructor(private configService: ConfigService) {
    const ttl = this.configService.get<number>('cache.ttl') || 60;
    this.cache = new NodeCache({
      stdTTL: ttl,
      checkperiod: ttl * 0.2,
      useClones: true,
      deleteOnExpire: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.cache.on('expired', (key: string, _value: any) => {
      this.logger.debug(`Cache expired: ${key}`);
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    const result = this.cache.set(key, value, ttl);
    if (result) {
      this.logger.debug(`Cache set: ${key}`);
    }
    return result;
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
    this.logger.log('Cache flushed');
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  // 获取或设置缓存
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }
}
