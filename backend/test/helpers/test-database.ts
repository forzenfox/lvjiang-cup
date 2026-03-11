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
    await this.createTables();
  }

  async cleanup(): Promise<void> {
    // 清空所有表数据
    await this.databaseService.run('DELETE FROM matches');
    await this.databaseService.run('DELETE FROM team_players');
    await this.databaseService.run('DELETE FROM teams');
    await this.databaseService.run('DELETE FROM streams');
    await this.databaseService.run('DELETE FROM advancement');
  }

  async close(): Promise<void> {
    await this.databaseService.onModuleDestroy();
  }

  getDatabaseService(): DatabaseService {
    return this.databaseService;
  }

  private async createTables(): Promise<void> {
    // 创建战队表
    await this.databaseService.run(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建队员表
    await this.databaseService.run(`
      CREATE TABLE IF NOT EXISTS team_players (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
      )
    `);

    // 创建比赛表
    await this.databaseService.run(`
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        team_a_id TEXT,
        team_b_id TEXT,
        score_a INTEGER DEFAULT 0,
        score_b INTEGER DEFAULT 0,
        winner_id TEXT,
        round TEXT,
        status TEXT DEFAULT 'upcoming',
        start_time TEXT,
        stage TEXT NOT NULL,
        swiss_record TEXT,
        swiss_day INTEGER,
        elimination_bracket TEXT,
        elimination_game_number INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_a_id) REFERENCES teams(id),
        FOREIGN KEY (team_b_id) REFERENCES teams(id)
      )
    `);

    // 创建直播表
    await this.databaseService.run(`
      CREATE TABLE IF NOT EXISTS streams (
        id TEXT PRIMARY KEY DEFAULT 'main',
        title TEXT,
        url TEXT,
        is_live INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建晋级表
    await this.databaseService.run(`
      CREATE TABLE IF NOT EXISTS advancement (
        id TEXT PRIMARY KEY DEFAULT 'current',
        winners_2_0 TEXT,
        winners_2_1 TEXT,
        losers_bracket TEXT,
        eliminated_3rd TEXT,
        eliminated_0_3 TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
}
