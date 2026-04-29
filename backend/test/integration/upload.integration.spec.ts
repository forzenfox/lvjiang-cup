import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as _path from 'path';
import * as _crypto from 'crypto';
import { UploadService } from '../../src/modules/upload/upload.service';
import { DatabaseService } from '../../src/database/database.service';

// Mock sharp 图片处理库 - 必须在 jest.mock 中使用工厂函数
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    resize: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('compressed-image-data')),
  }));
});

// Mock fs 模块
jest.mock('fs', () => {
  const mockPromises = {
    writeFile: jest.fn().mockResolvedValue(undefined),
    readdir: jest.fn().mockResolvedValue([]),
    unlink: jest.fn().mockResolvedValue(undefined),
  };
  return {
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    promises: mockPromises,
  };
});

// 导入 mock 以便在测试中使用
import * as fs from 'fs';

const mockFs = fs as any;

describe('Upload Integration Tests', () => {
  let service: UploadService;
  let databaseService: DatabaseService;
  let module: TestingModule;

  const mockDbPath = ':memory:';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UploadService,
        DatabaseService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'database.path') return mockDbPath;
              return null;
            },
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    await databaseService.onModuleInit();
    await createTables();
  });

  afterAll(async () => {
    await databaseService.onModuleDestroy();
    await module.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await cleanupTables();

    mockFs.existsSync.mockReturnValue(true);
    mockFs.promises.writeFile.mockResolvedValue(undefined);
    mockFs.promises.readdir.mockResolvedValue([]);
    mockFs.promises.unlink.mockResolvedValue(undefined);
  });

  async function createTables() {
    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        logo_url TEXT,
        logo_thumbnail_url TEXT
      )
    `);

    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        nickname TEXT NOT NULL,
        avatar_url TEXT,
        team_id TEXT
      )
    `);

    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS streamers (
        id TEXT PRIMARY KEY,
        nickname TEXT NOT NULL,
        poster_url TEXT
      )
    `);

    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        cover_url TEXT
      )
    `);

    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS file_hashes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hash TEXT UNIQUE NOT NULL,
        file_path TEXT UNIQUE NOT NULL,
        file_type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async function cleanupTables() {
    await databaseService.run('DELETE FROM file_hashes');
    await databaseService.run('DELETE FROM teams');
    await databaseService.run('DELETE FROM team_members');
    await databaseService.run('DELETE FROM streamers');
    await databaseService.run('DELETE FROM videos');
  }
});
