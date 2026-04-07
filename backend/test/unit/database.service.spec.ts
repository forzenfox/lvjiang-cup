import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

// Mock fs - 在导入 DatabaseService 之前
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

import * as fs from 'fs';

// 模拟 sqlite3
const mockRun = jest.fn();
const mockGet = jest.fn();
const mockAll = jest.fn();
const mockClose = jest.fn();

const createMockDatabase = () => ({
  run: mockRun,
  get: mockGet,
  all: mockAll,
  close: mockClose,
});

// 在模块级别 mock sqlite3
jest.mock('sqlite3', () => {
  return {
    Database: jest.fn().mockImplementation(function (
      dbPath: string,
      callback?: (err: Error | null) => void,
    ) {
      const db = createMockDatabase();
      // 同步调用回调
      if (callback) {
        process.nextTick(() => callback(null));
      }
      return db;
    }),
    verbose: jest.fn().mockReturnThis(),
  };
});

import { DatabaseService } from '../../src/database/database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let configService: ConfigService;

  const mockDbPath = './data/test.db';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(mockDbPath),
          },
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('数据库连接', () => {
    it('应该使用配置中的路径连接数据库', async () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      mockRun.mockImplementation(function (this: any, sql: string, params: any[], callback: any) {
        callback.call({ lastID: 1, changes: 1 }, null);
      });

      // Act
      await service.onModuleInit();

      // Assert
      expect(configService.get).toHaveBeenCalledWith('database.path');
    });

    it('当数据目录不存在时应该创建目录', async () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      mockRun.mockImplementation(function (this: any, sql: string, params: any[], callback: any) {
        callback.call({ lastID: 1, changes: 1 }, null);
      });

      // Act
      await service.onModuleInit();

      // Assert
      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });
  });

  describe('执行查询 (get方法)', () => {
    beforeEach(async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      mockRun.mockImplementation(function (this: any, sql: string, params: any[], callback: any) {
        callback.call({ lastID: 1, changes: 1 }, null);
      });
      await service.onModuleInit();
    });

    it('应该返回单行查询结果', async () => {
      // Arrange
      const expectedRow = { id: '1', name: 'Test Team' };
      mockGet.mockImplementation((sql, params, callback) => {
        callback(null, expectedRow);
      });

      // Act
      const result = await service.get('SELECT * FROM teams WHERE id = ?', ['1']);

      // Assert
      expect(result).toEqual(expectedRow);
    });

    it('当没有匹配行时应该返回undefined', async () => {
      // Arrange
      mockGet.mockImplementation((sql, params, callback) => {
        callback(null, undefined);
      });

      // Act
      const result = await service.get('SELECT * FROM teams WHERE id = ?', ['999']);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('执行查询 (all方法)', () => {
    beforeEach(async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      mockRun.mockImplementation(function (this: any, sql: string, params: any[], callback: any) {
        callback.call({ lastID: 1, changes: 1 }, null);
      });
      await service.onModuleInit();
    });

    it('应该返回多行查询结果', async () => {
      // Arrange
      const expectedRows = [
        { id: '1', name: 'Team A' },
        { id: '2', name: 'Team B' },
      ];
      mockAll.mockImplementation((sql, params, callback) => {
        callback(null, expectedRows);
      });

      // Act
      const result = await service.all('SELECT * FROM teams');

      // Assert
      expect(result).toEqual(expectedRows);
      expect(result).toHaveLength(2);
    });

    it('当表为空时应该返回空数组', async () => {
      // Arrange
      mockAll.mockImplementation((sql, params, callback) => {
        callback(null, []);
      });

      // Act
      const result = await service.all('SELECT * FROM teams');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('执行修改 (run方法)', () => {
    beforeEach(async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      mockRun.mockImplementation(function (this: any, sql: string, params: any[], callback: any) {
        callback.call({ lastID: 1, changes: 1 }, null);
      });
      await service.onModuleInit();
    });

    it('应该执行INSERT并返回lastID和changes', async () => {
      // Arrange
      mockRun.mockImplementation(function (this: any, sql, params, callback) {
        callback.call({ lastID: 5, changes: 1 }, null);
      });

      // Act
      const result = await service.run('INSERT INTO teams (id, name) VALUES (?, ?)', [
        '5',
        'New Team',
      ]);

      // Assert
      expect(result.lastID).toBe(5);
      expect(result.changes).toBe(1);
    });

    it('应该执行UPDATE并返回changes数量', async () => {
      // Arrange
      mockRun.mockImplementation(function (this: any, sql, params, callback) {
        callback.call({ lastID: 0, changes: 3 }, null);
      });

      // Act
      const result = await service.run('UPDATE teams SET name = ? WHERE id > ?', ['Updated', '0']);

      // Assert
      expect(result.changes).toBe(3);
    });
  });

  describe('事务处理', () => {
    beforeEach(async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      mockRun.mockImplementation(function (this: any, sql: string, params: any[], callback: any) {
        callback.call({ lastID: 1, changes: 1 }, null);
      });
      await service.onModuleInit();
    });

    it('应该支持事务的BEGIN, COMMIT操作', async () => {
      // Act
      await service.run('BEGIN TRANSACTION');
      await service.run('INSERT INTO teams (id, name) VALUES (?, ?)', ['1', 'Team A']);
      await service.run('COMMIT');

      // Assert
      expect(mockRun).toHaveBeenCalledWith('BEGIN TRANSACTION', [], expect.any(Function));
      expect(mockRun).toHaveBeenCalledWith('COMMIT', [], expect.any(Function));
    });

    it('应该支持事务的ROLLBACK操作', async () => {
      // Act
      await service.run('BEGIN TRANSACTION');
      await service.run('ROLLBACK');

      // Assert
      expect(mockRun).toHaveBeenCalledWith('ROLLBACK', [], expect.any(Function));
    });
  });

  describe('错误处理', () => {
    beforeEach(async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      mockRun.mockImplementation(function (this: any, sql: string, params: any[], callback: any) {
        callback.call({ lastID: 1, changes: 1 }, null);
      });
      await service.onModuleInit();
    });

    it('当SQL语法错误时应该抛出异常', async () => {
      // Arrange
      const dbError = new Error('SQLITE_ERROR: syntax error');
      mockRun.mockImplementation((sql, params, callback) => {
        callback(dbError);
      });

      // Act & Assert
      await expect(service.run('INVALID SQL')).rejects.toThrow('SQLITE_ERROR: syntax error');
    });

    it('当查询不存在的表时应该抛出异常', async () => {
      // Arrange
      const dbError = new Error('SQLITE_ERROR: no such table: nonexistent');
      mockGet.mockImplementation((sql, params, callback) => {
        callback(dbError);
      });

      // Act & Assert
      await expect(service.get('SELECT * FROM nonexistent')).rejects.toThrow('no such table');
    });
  });

  describe('数据库初始化', () => {
    it('应该创建所有必要的表', async () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const executedQueries: string[] = [];
      mockRun.mockImplementation(function (this: any, sql: string, params: any[], callback: any) {
        executedQueries.push(sql);
        callback.call({ lastID: 1, changes: 1 }, null);
      });

      // Act
      await service.onModuleInit();

      // Assert
      expect(executedQueries.some((q) => q.includes('CREATE TABLE IF NOT EXISTS teams'))).toBe(
        true,
      );
      expect(executedQueries.some((q) => q.includes('CREATE TABLE IF NOT EXISTS players'))).toBe(
        true,
      );
      expect(executedQueries.some((q) => q.includes('CREATE TABLE IF NOT EXISTS matches'))).toBe(
        true,
      );
      expect(
        executedQueries.some((q) => q.includes('CREATE TABLE IF NOT EXISTS stream_info')),
      ).toBe(true);
      expect(
        executedQueries.some((q) => q.includes('CREATE TABLE IF NOT EXISTS advancement')),
      ).toBe(true);
    });

    it('应该启用WAL模式', async () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const executedQueries: string[] = [];
      mockRun.mockImplementation(function (this: any, sql: string, params: any[], callback: any) {
        executedQueries.push(sql);
        callback.call({ lastID: 1, changes: 1 }, null);
      });

      // Act
      await service.onModuleInit();

      // Assert
      expect(executedQueries).toContain('PRAGMA journal_mode = WAL');
      expect(executedQueries).toContain('PRAGMA synchronous = NORMAL');
      expect(executedQueries).toContain('PRAGMA temp_store = MEMORY');
    });

    it('应该初始化默认数据', async () => {
      // Arrange
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const executedQueries: string[] = [];
      mockRun.mockImplementation(function (this: any, sql: string, params: any[], callback: any) {
        executedQueries.push(sql);
        callback.call({ lastID: 1, changes: 1 }, null);
      });

      // Act
      await service.onModuleInit();

      // Assert
      expect(executedQueries.some((q) => q.includes('INSERT OR IGNORE INTO stream_info'))).toBe(
        true,
      );
      expect(executedQueries.some((q) => q.includes('INSERT OR IGNORE INTO advancement'))).toBe(
        true,
      );
    });
  });

  describe('数据库关闭', () => {
    beforeEach(async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      mockRun.mockImplementation(function (this: any, sql: string, params: any[], callback: any) {
        callback.call({ lastID: 1, changes: 1 }, null);
      });
      await service.onModuleInit();
    });

    it('应该在模块销毁时关闭数据库连接', () => {
      // Arrange
      mockClose.mockImplementation((callback) => {
        callback(null);
      });

      // Act
      service.onModuleDestroy();

      // Assert
      expect(mockClose).toHaveBeenCalled();
    });

    it('当关闭出错时应该记录错误但不抛出', () => {
      // Arrange
      const closeError = new Error('Close error');
      mockClose.mockImplementation((callback) => {
        callback(closeError);
      });

      // Act & Assert - 不应该抛出异常
      expect(() => service.onModuleDestroy()).not.toThrow();
      expect(mockClose).toHaveBeenCalled();
    });
  });
});
