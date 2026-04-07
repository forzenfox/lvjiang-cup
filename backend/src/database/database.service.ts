import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// 打开数据库
function openDatabase(dbPath: string): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

// 运行 SQL 结果接口
export interface RunResult {
  lastID: number;
  changes: number;
}

// 运行 SQL
function run(db: sqlite3.Database, sql: string, params: any[] = []): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          lastID: this.lastID,
          changes: this.changes,
        });
      }
    });
  });
}

// 获取单行
function get<T>(db: sqlite3.Database, sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as T);
      }
    });
  });
}

// 获取多行
function all<T>(db: sqlite3.Database, sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as T[]);
      }
    });
  });
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: sqlite3.Database;
  private isConnected = false;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const dbPath = this.configService.get<string>('database.path');

    // 确保数据目录存在
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 创建数据库连接
    try {
      this.db = await openDatabase(dbPath);
      this.isConnected = true;
      this.logger.log('Database connected');

      // 启用 WAL 模式提升性能
      await run(this.db, 'PRAGMA journal_mode = WAL');
      await run(this.db, 'PRAGMA synchronous = NORMAL');
      await run(this.db, 'PRAGMA temp_store = MEMORY');
      await run(this.db, 'PRAGMA mmap_size = 30000000000');

      // 初始化表结构
      await this.initTables();
    } catch (err) {
      this.logger.error('Database initialization failed', err.message);
      throw err;
    }
  }

  onModuleDestroy() {
    if (this.db && this.isConnected) {
      this.isConnected = false;
      this.db.close((err) => {
        if (err) {
          // 只记录非"Database handle is closed"的错误
          if (!err.message?.includes('Database handle is closed')) {
            this.logger.error('Error closing database', err.message);
          }
        } else {
          this.logger.log('Database connection closed');
        }
      });
    }
  }

  getDatabase(): sqlite3.Database {
    return this.db;
  }

  // 包装方法供其他服务使用
  async run(sql: string, params: any[] = []): Promise<RunResult> {
    return run(this.db, sql, params);
  }

  async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return get<T>(this.db, sql, params);
  }

  async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return all<T>(this.db, sql, params);
  }

  private async initTables() {
    // teams 表
    await run(
      this.db,
      `
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT,
        logo_url TEXT,
        logo_thumbnail_url TEXT,
        battle_cry TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    );

    // team_members 表 (原 players 表)
    await run(
      this.db,
      `
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        nickname TEXT NOT NULL,
        avatar_url TEXT,
        position TEXT CHECK(position IN ('TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT')),
        team_id TEXT NOT NULL,
        game_id TEXT,
        bio TEXT,
        champion_pool TEXT,
        rating INTEGER DEFAULT 60,
        is_captain INTEGER DEFAULT 0,
        live_url TEXT,
        sort_order INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
      )
    `,
    );

    // matches 表
    await run(
      this.db,
      `
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        team_a_id TEXT,
        team_b_id TEXT,
        score_a INTEGER DEFAULT 0,
        score_b INTEGER DEFAULT 0,
        winner_id TEXT,
        round TEXT,
        status TEXT CHECK(status IN ('upcoming', 'ongoing', 'finished')),
        start_time TEXT,
        stage TEXT CHECK(stage IN ('swiss', 'elimination')),
        swiss_record TEXT,
        swiss_day INTEGER,
        elimination_bracket TEXT CHECK(elimination_bracket IN ('winners', 'losers', 'grand_finals')),
        elimination_game_number INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_a_id) REFERENCES teams(id),
        FOREIGN KEY (team_b_id) REFERENCES teams(id),
        FOREIGN KEY (winner_id) REFERENCES teams(id)
      )
    `,
    );

    // stream_info 表
    await run(
      this.db,
      `
      CREATE TABLE IF NOT EXISTS stream_info (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        title TEXT,
        url TEXT,
        is_live INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    );

    // advancement 表
    await run(
      this.db,
      `
      CREATE TABLE IF NOT EXISTS advancement (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        winners2_0 TEXT DEFAULT '[]',
        winners2_1 TEXT DEFAULT '[]',
        losers_bracket TEXT DEFAULT '[]',
        eliminated_3rd TEXT DEFAULT '[]',
        eliminated_0_3 TEXT DEFAULT '[]',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    );

    // 执行增量迁移
    await this.migrateTables();

    // 初始化 stream_info 和 advancement 的默认数据
    await this.initDefaultData();

    this.logger.log('Database tables initialized');
  }

  private async migrateTables() {
    const migrations: { table: string; checks: { column: string; sql: string }[] }[] = [
      {
        table: 'teams',
        checks: [
          {
            column: 'logo_url',
            sql: 'ALTER TABLE teams ADD COLUMN logo_url TEXT',
          },
          {
            column: 'logo_thumbnail_url',
            sql: 'ALTER TABLE teams ADD COLUMN logo_thumbnail_url TEXT',
          },
          {
            column: 'battle_cry',
            sql: 'ALTER TABLE teams ADD COLUMN battle_cry TEXT',
          },
        ],
      },
      {
        table: 'players',
        checks: [
          {
            column: 'user_id',
            sql: 'ALTER TABLE players ADD COLUMN user_id INTEGER',
          },
          {
            column: 'nickname',
            sql: 'ALTER TABLE players ADD COLUMN nickname TEXT',
          },
          {
            column: 'avatar_url',
            sql: 'ALTER TABLE players ADD COLUMN avatar_url TEXT',
          },
          {
            column: 'game_id',
            sql: 'ALTER TABLE players ADD COLUMN game_id TEXT',
          },
          {
            column: 'bio',
            sql: 'ALTER TABLE players ADD COLUMN bio TEXT',
          },
          {
            column: 'champion_pool',
            sql: 'ALTER TABLE players ADD COLUMN champion_pool TEXT',
          },
          {
            column: 'rating',
            sql: 'ALTER TABLE players ADD COLUMN rating INTEGER DEFAULT 60',
          },
          {
            column: 'is_captain',
            sql: 'ALTER TABLE players ADD COLUMN is_captain INTEGER DEFAULT 0',
          },
          {
            column: 'live_url',
            sql: 'ALTER TABLE players ADD COLUMN live_url TEXT',
          },
          {
            column: 'sort_order',
            sql: 'ALTER TABLE players ADD COLUMN sort_order INTEGER',
          },
        ],
      },
    ];

    for (const migration of migrations) {
      const tableExists = await this.tableExists(migration.table);
      if (!tableExists) {
        continue;
      }

      const existingColumns = await this.getTableColumns(migration.table);

      for (const check of migration.checks) {
        if (!existingColumns.includes(check.column)) {
          try {
            await run(this.db, check.sql);
            this.logger.log(`Migrated: Added ${check.column} to ${migration.table}`);
          } catch (err) {
            if (!err.message?.includes('duplicate column name')) {
              this.logger.warn(`Migration failed for ${migration.table}.${check.column}: ${err.message}`);
            }
          }
        }
      }
    }

    const playersExists = await this.tableExists('players');
    const teamMembersExists = await this.tableExists('team_members');

    if (playersExists && !teamMembersExists) {
      try {
        await run(this.db, 'ALTER TABLE players RENAME TO team_members');
        this.logger.log('Migrated: Renamed players to team_members');

        if (await this.columnExists('team_members', 'name')) {
          await run(this.db, 'ALTER TABLE team_members RENAME COLUMN name TO nickname');
          this.logger.log('Migrated: Renamed name to nickname in team_members');
        }
        if (await this.columnExists('team_members', 'avatar')) {
          await run(this.db, 'ALTER TABLE team_members RENAME COLUMN avatar TO avatar_url');
          this.logger.log('Migrated: Renamed avatar to avatar_url in team_members');
        }
      } catch (err) {
        this.logger.warn(`Migration failed for players rename: ${err.message}`);
      }
    }

    this.logger.log('Migration completed');
  }

  private async tableExists(tableName: string): Promise<boolean> {
    const result = await get<{ count: number }>(
      this.db,
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name = ?",
      [tableName],
    );
    return result && result.count > 0;
  }

  private async columnExists(tableName: string, columnName: string): Promise<boolean> {
    const columns = await this.getTableColumns(tableName);
    return columns.includes(columnName);
  }

  private async getTableColumns(tableName: string): Promise<string[]> {
    const result = await get<{ sql: string }>(
      this.db,
      "SELECT sql FROM sqlite_master WHERE type='table' AND name = ?",
      [tableName],
    );
    if (!result || !result.sql) {
      return [];
    }
    const match = result.sql.match(/\(([^)]+)\)/);
    if (!match) {
      return [];
    }
    const columnDefs = match[1].split(',');
    return columnDefs
      .map((def) => {
        const trimmed = def.trim();
        const spaceIndex = trimmed.indexOf(' ');
        const parenIndex = trimmed.indexOf('(');
        const name = trimmed.substring(0, spaceIndex > 0 ? spaceIndex : parenIndex > 0 ? parenIndex : trimmed.length);
        return name.trim();
      })
      .filter((name) => name && !name.startsWith('FOREIGN') && !name.startsWith('PRIMARY') && !name.startsWith('CHECK'));
  }

  private async initDefaultData() {
    // 初始化 stream_info
    await run(
      this.db,
      `
      INSERT OR IGNORE INTO stream_info (id, title, url, is_live)
      VALUES (1, '', '', 0)
    `,
    );

    // 初始化 advancement
    await run(
      this.db,
      `
      INSERT OR IGNORE INTO advancement (id, winners2_0, winners2_1, losers_bracket, eliminated_3rd, eliminated_0_3)
      VALUES (1, '[]', '[]', '[]', '[]', '[]')
    `,
    );
  }

  // 清空所有数据
  async clearAllData() {
    await run(this.db, 'DELETE FROM team_members');
    await run(this.db, 'DELETE FROM teams');
    await run(this.db, 'DELETE FROM matches');
    await run(
      this.db,
      `UPDATE stream_info SET title = '', url = '', is_live = 0, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
    );
    await run(
      this.db,
      `UPDATE advancement SET winners2_0 = '[]', winners2_1 = '[]', losers_bracket = '[]', eliminated_3rd = '[]', eliminated_0_3 = '[]', updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
    );
    this.logger.log('All data cleared');
  }

  // 重置比赛槽位（清空战队和比分，保留槽位结构）
  async resetMatchSlots() {
    await run(
      this.db,
      `
      UPDATE matches 
      SET team_a_id = NULL, team_b_id = NULL, score_a = 0, score_b = 0, 
          winner_id = NULL, status = 'upcoming', updated_at = CURRENT_TIMESTAMP
    `,
    );
    this.logger.log('Match slots reset');
  }
}
