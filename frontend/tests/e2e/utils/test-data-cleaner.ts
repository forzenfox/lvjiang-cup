import { Page } from '@playwright/test';

/**
 * 测试数据清理工具
 * 用于在测试用例执行后清理测试数据
 */
export class TestDataCleaner {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 清理所有测试数据
   */
  async cleanAll(): Promise<void> {
    await this.cleanLocalStorage();
    await this.cleanSessionStorage();
    await this.cleanCookies();
    await this.cleanIndexedDB();
  }

  /**
   * 清理 localStorage 中的测试数据
   */
  async cleanLocalStorage(): Promise<void> {
    await this.page.evaluate(() => {
      const keysToClear = [
        // 缓存数据
        'lvjiang-cup-cache',
        
        // 认证信息
        'token',
        'user',
        'auth-token',
        
        // 测试数据
        'teams',
        'matches',
        'streams',
        'advancement',
        
        // 主题设置
        'theme',
        
        // 其他测试数据
        'test-data',
        'e2e-data'
      ];

      // 删除指定的键
      keysToClear.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });

      // 清理所有以 'test-' 或 'e2e-' 开头的键
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('test-') || key.startsWith('e2e-')) {
          localStorage.removeItem(key);
        }
      });
    });
  }

  /**
   * 清理 sessionStorage
   */
  async cleanSessionStorage(): Promise<void> {
    await this.page.evaluate(() => {
      sessionStorage.clear();
    });
  }

  /**
   * 清理 Cookie
   */
  async cleanCookies(): Promise<void> {
    const context = this.page.context();
    await context.clearCookies();
  }

  /**
   * 清理 IndexedDB
   */
  async cleanIndexedDB(): Promise<void> {
    await this.page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase('lvjiang-cup-db');
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    });
  }

  /**
   * 清理特定的 localStorage 键
   */
  async cleanSpecificKeys(keys: string[]): Promise<void> {
    await this.page.evaluate((keysToRemove) => {
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
    }, keys);
  }

  /**
   * 清理特定标签的缓存
   */
  async cleanCacheByTag(tag: string): Promise<void> {
    await this.page.evaluate((tagToRemove) => {
      const cacheKey = 'lvjiang-cup-cache';
      const cacheData = localStorage.getItem(cacheKey);
      
      if (cacheData) {
        try {
          const parsed = JSON.parse(cacheData);
          for (const key in parsed) {
            const item = parsed[key];
            if (item.tags && item.tags.includes(tagToRemove)) {
              delete parsed[key];
            }
          }
          localStorage.setItem(cacheKey, JSON.stringify(parsed));
        } catch (e) {
          console.warn('清理缓存失败:', e);
        }
      }
    }, tag);
  }

  /**
   * 获取当前存储的测试数据信息
   */
  async getStorageInfo(): Promise<{
    localStorage: { keys: string[]; count: number };
    sessionStorage: { keys: string[]; count: number };
  }> {
    return await this.page.evaluate(() => {
      return {
        localStorage: {
          keys: Object.keys(localStorage),
          count: Object.keys(localStorage).length
        },
        sessionStorage: {
          keys: Object.keys(sessionStorage),
          count: Object.keys(sessionStorage).length
        }
      };
    });
  }

  /**
   * 打印存储信息（用于调试）
   */
  async logStorageInfo(): Promise<void> {
    const info = await this.getStorageInfo();
    console.log('LocalStorage:', info.localStorage);
    console.log('SessionStorage:', info.sessionStorage);
  }
}

/**
 * 清理测试数据的辅助函数
 */
export async function cleanTestData(page: Page): Promise<void> {
  const cleaner = new TestDataCleaner(page);
  await cleaner.cleanAll();
}

/**
 * 清理特定缓存标签的辅助函数
 */
export async function cleanCacheByTag(page: Page, tag: string): Promise<void> {
  const cleaner = new TestDataCleaner(page);
  await cleaner.cleanCacheByTag(tag);
}

/**
 * 缓存标签常量
 */
export const TestCleanTags = {
  TEAMS: 'teams',
  MATCHES: 'matches',
  STREAMS: 'streams',
  ADVANCEMENT: 'advancement',
  USER: 'user',
} as const;
