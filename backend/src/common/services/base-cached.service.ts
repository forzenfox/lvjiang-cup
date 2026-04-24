import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';

/**
 * 缓存服务基类
 *
 * 提供通用的缓存处理逻辑，包括：
 * - 缓存检查和获取
 * - 缓存写入
 * - 缓存失效
 *
 * 子类只需实现数据查询逻辑，缓存处理由基类自动完成
 */
@Injectable()
export abstract class BaseCachedService<T, ID = string> {
  protected readonly logger: Logger;
  protected readonly databaseService: DatabaseService;
  protected readonly cacheService: CacheService;

  constructor(databaseService: DatabaseService, cacheService: CacheService, serviceName: string) {
    this.logger = new Logger(serviceName);
    this.databaseService = databaseService;
    this.cacheService = cacheService;
  }

  /**
   * 获取缓存键前缀（子类必须实现）
   */
  protected abstract getCachePrefix(): string;

  /**
   * 获取所有数据的缓存键
   */
  protected getAllCacheKey(): string {
    return `${this.getCachePrefix()}:all`;
  }

  /**
   * 获取单个数据的缓存键
   */
  protected getOneCacheKey(id: ID): string {
    return `${this.getCachePrefix()}:${id}`;
  }

  /**
   * 查询所有数据（子类必须实现）
   */
  protected abstract findAllFromDb(): Promise<T[]>;

  /**
   * 根据 ID 查询单个数据（子类必须实现）
   */
  protected abstract findOneFromDb(id: ID): Promise<T | undefined>;

  /**
   * 获取或设置缓存
   */
  protected async getOrSetAll(): Promise<T[]> {
    const cacheKey = this.getAllCacheKey();
    const cached = this.cacheService.get<T[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.findAllFromDb();
    this.cacheService.set(cacheKey, data);
    return data;
  }

  /**
   * 获取或设置单个资源的缓存
   */
  protected async getOrSetOne(id: ID): Promise<T> {
    const cacheKey = this.getOneCacheKey(id);
    const cached = this.cacheService.get<T>(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.findOneFromDb(id);
    if (!data) {
      throw new Error(`Resource with id ${id} not found`);
    }

    this.cacheService.set(cacheKey, data);
    return data;
  }

  /**
   * 清除所有缓存
   */
  protected clearAllCache(): void {
    this.cacheService.del(this.getAllCacheKey());
  }

  /**
   * 清除单个资源的缓存
   */
  protected clearOneCache(id: ID): void {
    this.cacheService.del(this.getOneCacheKey(id));
  }

  /**
   * 清除所有相关缓存
   */
  protected clearAllRelatedCache(): void {
    this.clearAllCache();
  }

  /**
   * 清除单个资源相关的所有缓存
   */
  protected clearRelatedCache(id: ID): void {
    this.clearAllCache();
    this.clearOneCache(id);
  }
}
