import { DatabaseService } from '../../src/database/database.service';
import { ConfigService } from '@nestjs/config';

/**
 * 测试数据库辅助类
 * 用于在测试中创建内存数据库实例
 */
export class TestDatabaseHelper {
  private databaseService: DatabaseService;

  constructor() {
    const mockConfigService = {
      get: (key: string) => {
        if (key === 'database.path') return ':memory:';
        return null;
      },
    } as ConfigService;

    this.databaseService = new DatabaseService(mockConfigService);
  }

  async init(): Promise<void> {
    await this.databaseService.onModuleInit();
  }

  async cleanup(): Promise<void> {
    // 清空所有表数据
    await this.databaseService.run('DELETE FROM matches');
    await this.databaseService.run('DELETE FROM team_members');
    await this.databaseService.run('DELETE FROM teams');
    await this.databaseService.run('DELETE FROM advancement');
  }

  async close(): Promise<void> {
    await this.databaseService.onModuleDestroy();
  }

  getDatabaseService(): DatabaseService {
    return this.databaseService;
  }
}
