# 后端测试指南

> 版本：v1.0  
> 创建日期：2026-03-11  
> 适用项目：驴酱杯赛事网站后端

---

## 📚 目录

1. [快速开始](#快速开始)
2. [测试命令](#测试命令)
3. [测试架构](#测试架构)
4. [编写测试](#编写测试)
5. [Mock 数据](#mock 数据)
6. [数据库测试](#数据库测试)
7. [最佳实践](#最佳实践)
8. [常见问题](#常见问题)

---

## 快速开始

### 环境准备

```bash
# 安装依赖
cd backend
npm install

# 验证安装
npm run test --version
```

### 运行第一个测试

```bash
# 运行所有测试
npm run test

# 运行特定测试文件
npm run test teams.service.spec.ts

# 监听模式 (文件变更自动重跑)
npm run test:watch
```

---

## 测试命令

### 基础命令

```bash
# 运行所有测试
npm run test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行 E2E 测试
npm run test:e2e

# 运行测试并生成覆盖率报告
npm run test:cov

# 监听模式
npm run test:watch

# UI 模式 (可视化测试报告)
npm run test:ui
```

### 高级命令

```bash
# 运行特定测试文件
npm run test <filename>

# 运行匹配的测试用例
npm run test -t "should return all teams"

# 只运行失败的测试
npm run test --onlyFailures

# 生成 JUnit 报告
npm run test --reporters=jest-junit

# 调试模式
npm run test --debug
```

---

## 测试架构

### 测试分层

```
backend/test/
├── helpers/           # 测试辅助工具
│   ├── test-database.ts    # 测试数据库配置
│   ├── mock-data.ts        # Mock 数据工厂
│   └── test-utils.ts       # 通用测试工具
├── fixtures/          # 测试数据文件
│   ├── teams.json
│   ├── matches.json
│   └── users.json
├── integration/       # 集成测试
│   ├── teams.integration.spec.ts
│   ├── matches.integration.spec.ts
│   └── ...
├── api/              # API E2E 测试
│   ├── teams.api.e2e-spec.ts
│   ├── matches.api.e2e-spec.ts
│   └── ...
└── e2e/              # 完整工作流测试
    └── complete-workflow.e2e-spec.ts

backend/src/
├── modules/
│   ├── teams/
│   │   ├── teams.service.spec.ts    # Service 测试
│   │   └── teams.controller.spec.ts # Controller 测试
│   └── ...
├── database/
│   └── database.service.spec.ts     # 数据库测试
└── cache/
    └── cache.service.spec.ts        # 缓存测试
```

### 测试工具

| 工具 | 用途 | 示例 |
|------|------|------|
| **Jest** | 测试框架 | describe, it, expect |
| **Supertest** | HTTP 请求测试 | request(app).get('/teams') |
| **@nestjs/testing** | NestJS 测试工具 | Test.createTestingModule() |
| **sqlite3** | 内存数据库 | new sqlite3.Database(':memory:') |

---

## 编写测试

### Service 测试示例

```typescript
// teams.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { DatabaseService } from '../database/database.service';
import { CacheService } from '../cache/cache.service';
import { NotFoundException } from '@nestjs/common';

describe('TeamsService', () => {
  let service: TeamsService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;

  const mockDatabaseService = {
    get: jest.fn(),
    all: jest.fn(),
    run: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);

    // 重置所有 mock
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return teams from cache', async () => {
      // Arrange
      const cachedTeams = [{ id: '1', name: 'Team1' }];
      mockCacheService.get.mockResolvedValue(cachedTeams);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(cachedTeams);
      expect(cacheService.get).toHaveBeenCalledWith('teams');
      expect(databaseService.all).not.toHaveBeenCalled();
    });

    it('should return teams from database when cache is empty', async () => {
      // Arrange
      mockCacheService.get.mockResolvedValue(null);
      mockDatabaseService.all.mockResolvedValue([
        { id: '1', name: 'Team1' },
      ]);
      mockCacheService.set.mockResolvedValue(undefined);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(databaseService.all).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith(
        'teams',
        expect.any(Array),
      );
    });
  });

  describe('findOne', () => {
    it('should return a team', async () => {
      // Arrange
      const mockTeam = { id: '1', name: 'Team1' };
      mockCacheService.get.mockResolvedValue(mockTeam);

      // Act
      const result = await service.findOne('1');

      // Assert
      expect(result).toEqual(mockTeam);
    });

    it('should throw NotFoundException when team not found', async () => {
      // Arrange
      mockCacheService.get.mockResolvedValue(null);
      mockDatabaseService.get.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a team with players', async () => {
      // Arrange
      const createTeamDto = {
        name: 'New Team',
        logo: 'logo.png',
        description: 'Test team',
        players: [
          { name: 'Player1', role: 'top' },
          { name: 'Player2', role: 'jungle' },
        ],
      };

      mockDatabaseService.run.mockResolvedValue({ lastInsertRowid: 1 });
      mockCacheService.clear.mockResolvedValue(undefined);

      // Act
      const result = await service.create(createTeamDto);

      // Assert
      expect(result.id).toBe('1');
      expect(result.name).toBe(createTeamDto.name);
      expect(mockDatabaseService.run).toHaveBeenCalledTimes(
        1 + createTeamDto.players.length,
      );
      expect(mockCacheService.clear).toHaveBeenCalled();
    });
  });
});
```

### Controller 测试示例

```typescript
// teams.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { AuthGuard } from '@nestjs/guards';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: TeamsService;

  const mockTeamsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: TeamsService,
          useValue: mockTeamsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of teams', async () => {
      // Arrange
      const teams = [{ id: '1', name: 'Team1' }];
      mockTeamsService.findAll.mockResolvedValue(teams);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(teams);
    });
  });

  describe('findOne', () => {
    it('should return a team', async () => {
      // Arrange
      const team = { id: '1', name: 'Team1' };
      mockTeamsService.findOne.mockResolvedValue(team);

      // Act
      const result = await controller.findOne('1');

      // Assert
      expect(result).toEqual(team);
    });
  });
});
```

### E2E 测试示例

```typescript
// teams.api.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DatabaseService } from '../database/database.service';

describe('Teams API (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);

    // 获取认证 token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'admin123' })
      .expect(201);

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // 清空测试数据
    await databaseService.run('DELETE FROM matches');
    await databaseService.run('DELETE FROM team_players');
    await databaseService.run('DELETE FROM teams');
  });

  describe('GET /api/teams', () => {
    it('should return empty array when no teams', async () => {
      return request(app.getHttpServer())
        .get('/api/teams')
        .expect(200)
        .expect([]);
    });

    it('should return array of teams', async () => {
      // 准备数据
      await databaseService.run(
        `INSERT INTO teams (id, name, logo, description) VALUES (?, ?, ?, ?)`,
        ['1', 'Team1', 'logo.png', 'Test team'],
      );

      return request(app.getHttpServer())
        .get('/api/teams')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].name).toBe('Team1');
        });
    });
  });

  describe('POST /api/admin/teams', () => {
    it('should create a team (authenticated)', () => {
      const newTeam = {
        name: 'New Team',
        logo: 'logo.png',
        description: 'Test team',
        players: [
          { name: 'Player1', role: 'top' },
          { name: 'Player2', role: 'jungle' },
        ],
      };

      return request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTeam)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe(newTeam.name);
        });
    });

    it('should reject unauthenticated request', () => {
      const newTeam = { name: 'New Team' };

      return request(app.getHttpServer())
        .post('/api/admin/teams')
        .send(newTeam)
        .expect(401);
    });

    it('should reject invalid data', () => {
      const invalidTeam = { name: '' }; // 空名称

      return request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTeam)
        .expect(400);
    });
  });
});
```

---

## Mock 数据

### Mock 数据工厂

```typescript
// test/helpers/mock-data.ts
export const mockTeams = [
  {
    id: '1',
    name: 'Team Alpha',
    logo: 'alpha.png',
    description: 'Champion team',
  },
  {
    id: '2',
    name: 'Team Beta',
    logo: 'beta.png',
    description: 'Runner-up team',
  },
];

export const mockPlayers = [
  {
    id: '1',
    teamId: '1',
    name: 'Player1',
    role: 'top',
  },
  {
    id: '2',
    teamId: '1',
    name: 'Player2',
    role: 'jungle',
  },
];

export const mockMatches = [
  {
    id: '1',
    teamAId: '1',
    teamBId: '2',
    scoreA: 2,
    scoreB: 1,
    winnerId: '1',
    stage: 'swiss',
    round: '第一轮',
    status: 'finished',
  },
];

export function createMockTeam(overrides?: Partial<any>) {
  return {
    id: `team-${Date.now()}`,
    name: 'Test Team',
    logo: 'test.png',
    description: 'Test description',
    ...overrides,
  };
}

export function createMockMatch(overrides?: Partial<any>) {
  return {
    id: `match-${Date.now()}`,
    teamAId: '1',
    teamBId: '2',
    scoreA: 0,
    scoreB: 0,
    winnerId: null,
    stage: 'swiss',
    round: '第一轮',
    status: 'upcoming',
    startTime: new Date().toISOString(),
    ...overrides,
  };
}
```

### 使用 Mock 数据

```typescript
import { mockTeams, createMockTeam } from '../test/helpers/mock-data';

describe('TeamsService', () => {
  it('should use mock data', async () => {
    const mockTeam = createMockTeam({ name: 'Custom Team' });
    expect(mockTeam.name).toBe('Custom Team');
    expect(mockTeam.id).toBeDefined();
  });
});
```

---

## 数据库测试

### 测试数据库配置

```typescript
// test/helpers/test-database.ts
import * as sqlite3 from 'sqlite3';

export class TestDatabase {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(':memory:');
  }

  async init() {
    // 创建测试表
    await this.run(`
      CREATE TABLE teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT,
        description TEXT
      )
    `);

    await this.run(`
      CREATE TABLE team_players (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        FOREIGN KEY (team_id) REFERENCES teams(id)
      )
    `);

    await this.run(`
      CREATE TABLE matches (
        id TEXT PRIMARY KEY,
        team_a_id TEXT NOT NULL,
        team_b_id TEXT NOT NULL,
        score_a INTEGER DEFAULT 0,
        score_b INTEGER DEFAULT 0,
        winner_id TEXT,
        stage TEXT NOT NULL,
        round TEXT,
        status TEXT DEFAULT 'upcoming',
        start_time TEXT,
        FOREIGN KEY (team_a_id) REFERENCES teams(id),
        FOREIGN KEY (team_b_id) REFERENCES teams(id)
      )
    `);
  }

  async run(sql: string, params?: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params || [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async get(sql: string, params?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params || [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql: string, params?: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params || [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async cleanup() {
    await this.run('DELETE FROM matches');
    await this.run('DELETE FROM team_players');
    await this.run('DELETE FROM teams');
  }

  async close() {
    await new Promise<void>((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
```

### 数据库测试示例

```typescript
// database.service.spec.ts
import { TestDatabase } from '../test/helpers/test-database';

describe('DatabaseService', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = new TestDatabase();
    await testDb.init();
  });

  afterAll(async () => {
    await testDb.close();
  });

  beforeEach(async () => {
    await testDb.cleanup();
  });

  it('should insert and retrieve data', async () => {
    // Insert
    await testDb.run(
      `INSERT INTO teams (id, name, logo) VALUES (?, ?, ?)`,
      ['1', 'Team1', 'logo.png'],
    );

    // Retrieve
    const team = await testDb.get(
      `SELECT * FROM teams WHERE id = ?`,
      ['1'],
    );

    expect(team).toEqual({
      id: '1',
      name: 'Team1',
      logo: 'logo.png',
      description: null,
    });
  });

  it('should handle transactions', async () => {
    // 测试事务处理
    await testDb.run('BEGIN TRANSACTION');

    try {
      await testDb.run(
        `INSERT INTO teams (id, name) VALUES (?, ?)`,
        ['1', 'Team1'],
      );
      await testDb.run('COMMIT');
    } catch (error) {
      await testDb.run('ROLLBACK');
      throw error;
    }

    const teams = await testDb.all(`SELECT * FROM teams`);
    expect(teams).toHaveLength(1);
  });
});
```

---

## 最佳实践

### 1. 测试命名规范

```typescript
// ✅ 好的命名
describe('TeamsService', () => {
  describe('findAll', () => {
    it('should return teams from cache', async () => {});
    it('should return teams from database when cache is empty', async () => {});
  });
});

// ❌ 避免模糊命名
it('should work', async () => {}); // 太模糊
it('test1', async () => {}); // 无意义
```

### 2. 测试结构 (AAA 模式)

```typescript
it('should create a team with players', async () => {
  // Arrange - 准备数据
  const createTeamDto = { name: 'New Team', players: [...] };
  mockDatabaseService.run.mockResolvedValue({ lastInsertRowid: 1 });

  // Act - 执行操作
  const result = await service.create(createTeamDto);

  // Assert - 验证结果
  expect(result.id).toBe('1');
  expect(result.name).toBe('New Team');
  expect(mockDatabaseService.run).toHaveBeenCalledTimes(3);
});
```

### 3. Mock 最佳实践

```typescript
// ✅ 精确 Mock
const mockService = {
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockImplementation((id) => {
    if (id === '1') return Promise.resolve({ id: '1', name: 'Team1' });
    return Promise.reject(new NotFoundException());
  }),
};

// ❌ 避免过度 Mock
const mockService = {}; // 没有定义方法
mockService.findAll = jest.fn(); // 动态添加，容易出错
```

### 4. 测试隔离

```typescript
// ✅ 每个测试独立
beforeEach(() => {
  jest.clearAllMocks(); // 清除 mock 调用记录
});

afterEach(async () => {
  await testDb.cleanup(); // 清理数据库
});

// ❌ 测试间依赖
let sharedData = []; // 避免共享状态
it('test1', () => { sharedData.push(1); });
it('test2', () => { expect(sharedData).toContain(1); }); // 依赖 test1
```

### 5. 异步测试

```typescript
// ✅ 正确处理异步
it('should fetch data', async () => {
  const result = await service.getData();
  expect(result).toBeDefined();
});

// ❌ 忘记 await
it('should fetch data', () => {
  service.getData(); // 缺少 await
  expect(result).toBeDefined();
});
```

### 6. 错误处理测试

```typescript
// ✅ 测试异常
it('should throw NotFoundException', async () => {
  mockService.findOne.mockResolvedValue(null);
  
  await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
  await expect(service.findOne('999')).rejects.toThrow('Team not found');
});

// ❌ 不验证异常信息
it('should throw', async () => {
  await expect(service.findOne('999')).rejects.toThrow(); // 太模糊
});
```

---

## 常见问题

### Q1: 如何测试需要认证接口的接口？

```typescript
// 方法 1: Mock Guard
.overrideGuard(AuthGuard)
.useValue({ canActivate: () => true })

// 方法 2: 使用真实 Token
const response = await request(app.getHttpServer())
  .post('/api/admin/teams')
  .set('Authorization', `Bearer ${authToken}`)
  .send(teamData);
```

### Q2: 如何处理测试数据库？

```typescript
// 使用内存数据库
const db = new sqlite3.Database(':memory:');

// 每个测试前重置
beforeEach(async () => {
  await db.run('DELETE FROM teams');
  await db.run('DELETE FROM matches');
});
```

### Q3: 如何测试定时任务或延迟？

```typescript
// 使用 Jest 的假定时器
jest.useFakeTimers();

it('should clear cache after TTL', () => {
  service.setCache('key', 'value', 5000);
  
  jest.advanceTimersByTime(5000);
  
  expect(cacheService.del).toHaveBeenCalledWith('key');
});

// 恢复真实定时器
jest.useRealTimers();
```

### Q4: 如何调试失败的测试？

```bash
# 只运行失败的测试
npm run test --onlyFailures

# 添加调试日志
it('should create team', () => {
  console.log('Team data:', teamData);
  debugger; // 使用 node --inspect
  expect(result).toBeDefined();
});

# 使用 --verbose 输出详细信息
npm run test --verbose
```

### Q5: 如何提高测试覆盖率？

```typescript
// 测试所有分支
it('should handle both success and failure cases', async () => {
  // 成功场景
  mockService.getData.mockResolvedValue({ data: 'success' });
  await expect(service.getData()).resolves.toBeDefined();
  
  // 失败场景
  mockService.getData.mockRejectedValue(new Error('Network error'));
  await expect(service.getData()).rejects.toThrow();
});

// 测试边界条件
it('should handle edge cases', () => {
  expect(service.validate('')).toBe(false); // 空字符串
  expect(service.validate(null)).toBe(false); // null
  expect(service.validate(undefined)).toBe(false); // undefined
  expect(service.validate('valid')).toBe(true); // 有效值
});
```

---

## 参考资料

- [NestJS 测试文档](https://docs.nestjs.com/techniques/testing)
- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Supertest 文档](https://github.com/ladjs/supertest)
- [Testing Library](https://testing-library.com/)
- [测试最佳实践](https://martinfowler.com/articles/practical-test-pyramid.html)

---

**文档版本**: v1.0  
**创建日期**: 2026-03-11  
**维护者**: AI (资深测试工程师)  
**最后更新**: 2026-03-11
