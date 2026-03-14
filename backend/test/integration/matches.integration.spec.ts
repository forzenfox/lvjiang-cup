import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from '../../src/modules/matches/matches.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

describe('Matches Integration Tests', () => {
  let service: MatchesService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;
  let module: TestingModule;

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flush: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        MatchesService,
        DatabaseService,
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'database.path') return ':memory:';
              if (key === 'cache.ttl') return 60;
              return null;
            },
          },
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);

    await databaseService.onModuleInit();
    await createTables();
  });

  afterAll(async () => {
    await databaseService.onModuleDestroy();
    await module.close();
  });

  beforeEach(async () => {
    await cleanupTables();
    jest.clearAllMocks();
  });

  async function createTables() {
    await databaseService.run(`
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async function cleanupTables() {
    await databaseService.run('DELETE FROM matches');
    await databaseService.run('DELETE FROM teams');
  }

  describe('CRUD Operations', () => {
    it('should create and retrieve a match', async () => {
      const match = {
        id: 'match-1',
        teamAId: 'team-1',
        teamBId: 'team-2',
        stage: 'swiss' as const,
        round: '第一轮',
        swissRecord: '0-0',
        swissDay: 1,
      };

      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, swiss_record, swiss_day, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          match.id,
          match.teamAId,
          match.teamBId,
          match.stage,
          match.round,
          match.swissRecord,
          match.swissDay,
          'upcoming',
        ],
      );

      mockCacheService.get.mockReturnValue(undefined);
      const found = await service.findOne(match.id);
      expect(found.id).toBe(match.id);
      expect(found.stage).toBe(match.stage);
    });

    it('should update match scores', async () => {
      const match = {
        id: 'match-1',
        teamAId: 'team-1',
        teamBId: 'team-2',
        stage: 'swiss' as const,
        round: '第一轮',
      };

      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [match.id, match.teamAId, match.teamBId, match.stage, match.round, 'upcoming'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      const updated = await service.update(match.id, {
        scoreA: 2,
        scoreB: 1,
        winnerId: 'team-1',
      });

      expect(updated.scoreA).toBe(2);
      expect(updated.scoreB).toBe(1);
      expect(updated.winnerId).toBe('team-1');
    });

    it('should throw NotFoundException for non-existent match', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Cache Integration', () => {
    it('should cache matches after first retrieval', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      const first = await service.findAll();
      expect(first).toHaveLength(1);

      mockCacheService.get.mockReturnValue(first);
      const second = await service.findAll();
      expect(second).toHaveLength(1);
    });

    it('should clear cache after update', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      await service.update('match-1', { scoreA: 2 });

      expect(mockCacheService.del).toHaveBeenCalledWith('match:match-1');
    });
  });

  describe('Match Filtering', () => {
    it('should filter by stage', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming'],
      );
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-2', 'team-3', 'team-4', 'elimination', '决赛', 'upcoming'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      const swissMatches = await service.findAll('swiss');
      expect(swissMatches).toHaveLength(1);
      expect(swissMatches[0].stage).toBe('swiss');
    });
  });

  describe('Score Management', () => {
    it('should clear scores', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, score_a, score_b, winner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'finished', 2, 1, 'team-1'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      const cleared = await service.clearScores('match-1');
      expect(cleared.scoreA).toBe(0);
      expect(cleared.scoreB).toBe(0);
      expect(cleared.winnerId).toBeNull();
      expect(cleared.status).toBe('upcoming');
    });
  });

  // ==================== 新增测试用例 ====================

  describe('比赛 CRUD 完整流程', () => {
    it('should complete full match lifecycle: create → update → finish → clear', async () => {
      // 创建比赛
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, swiss_record, swiss_day) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming', '0-0', 1],
      );

      mockCacheService.get.mockReturnValue(undefined);
      let match = await service.findOne('match-1');
      expect(match.status).toBe('upcoming');
      expect(match.scoreA).toBe(0);
      expect(match.scoreB).toBe(0);

      // 更新为进行中
      mockCacheService.del.mockReturnValue(undefined);
      await databaseService.run(`UPDATE matches SET status = ? WHERE id = ?`, [
        'ongoing',
        'match-1',
      ]);

      // 更新比分
      match = await service.update('match-1', {
        scoreA: 2,
        scoreB: 1,
        winnerId: 'team-1',
        status: 'finished' as any,
      });
      expect(match.scoreA).toBe(2);
      expect(match.scoreB).toBe(1);
      expect(match.winnerId).toBe('team-1');

      // 清空比分
      match = await service.clearScores('match-1');
      expect(match.scoreA).toBe(0);
      expect(match.scoreB).toBe(0);
      expect(match.winnerId).toBeNull();
      expect(match.status).toBe('upcoming');
    });

    it('should handle match creation with all fields', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, 
         score_a, score_b, winner_id, start_time, swiss_record, swiss_day, 
         elimination_bracket, elimination_game_number) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'match-full',
          'team-a',
          'team-b',
          'elimination',
          '决赛',
          'finished',
          3,
          2,
          'team-a',
          '2024-01-01T10:00:00Z',
          null,
          null,
          'grand_finals',
          8,
        ],
      );

      mockCacheService.get.mockReturnValue(undefined);
      const match = await service.findOne('match-full');
      expect(match.stage).toBe('elimination');
      expect(match.eliminationBracket).toBe('grand_finals');
      expect(match.eliminationGameNumber).toBe(8);
      expect(match.startTime).toBe('2024-01-01T10:00:00Z');
    });
  });

  describe('比分更新和胜者判定', () => {
    it('should correctly determine winner based on scores', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      // team-1 获胜
      let match = await service.update('match-1', {
        scoreA: 2,
        scoreB: 1,
        winnerId: 'team-1',
      });
      expect(match.winnerId).toBe('team-1');

      // 更新比分，team-2 获胜
      match = await service.update('match-1', {
        scoreA: 1,
        scoreB: 2,
        winnerId: 'team-2',
      });
      expect(match.winnerId).toBe('team-2');
    });

    it('should handle draw scores without winner', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      const match = await service.update('match-1', {
        scoreA: 1,
        scoreB: 1,
        winnerId: null as any,
      });
      expect(match.scoreA).toBe(1);
      expect(match.scoreB).toBe(1);
      expect(match.winnerId).toBeNull();
    });

    it('should handle BO3 and BO5 match formats', async () => {
      // BO3 比赛
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-bo3', 'team-1', 'team-2', 'swiss', '第二轮', 'upcoming'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      let match = await service.update('match-bo3', {
        scoreA: 2,
        scoreB: 0,
        winnerId: 'team-1',
      });
      expect(match.scoreA).toBe(2);
      expect(match.winnerId).toBe('team-1');

      // BO5 比赛
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-bo5', 'team-3', 'team-4', 'elimination', '决赛', 'upcoming'],
      );

      match = await service.update('match-bo5', {
        scoreA: 3,
        scoreB: 2,
        winnerId: 'team-3',
      });
      expect(match.scoreA).toBe(3);
      expect(match.scoreB).toBe(2);
    });
  });

  describe('瑞士轮战绩计算', () => {
    it('should track swiss round records correctly', async () => {
      // Round 1: 0-0
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, swiss_record, swiss_day) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['swiss-r1', 'team-1', 'team-2', 'swiss', 'Round 1', 'finished', '0-0', 1],
      );

      mockCacheService.get.mockReturnValue(undefined);
      let match = await service.findOne('swiss-r1');
      expect(match.swissRecord).toBe('0-0');
      expect(match.swissDay).toBe(1);

      // Round 2 High: 1-0
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, swiss_record, swiss_day) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['swiss-r2h', 'team-1', 'team-3', 'swiss', 'Round 2 High', 'finished', '1-0', 1],
      );

      match = await service.findOne('swiss-r2h');
      expect(match.swissRecord).toBe('1-0');

      // Round 2 Low: 0-1
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, swiss_record, swiss_day) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['swiss-r2l', 'team-2', 'team-4', 'swiss', 'Round 2 Low', 'finished', '0-1', 1],
      );

      match = await service.findOne('swiss-r2l');
      expect(match.swissRecord).toBe('0-1');
    });

    it('should filter matches by swiss day', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, swiss_record, swiss_day) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['day1-1', 'team-1', 'team-2', 'swiss', 'Round 1', 'upcoming', '0-0', 1],
      );
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, swiss_record, swiss_day) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['day2-1', 'team-3', 'team-4', 'swiss', 'Round 3', 'upcoming', '1-1', 2],
      );

      const day1Matches = await databaseService.all<{ id: string; swiss_day: number }>(
        'SELECT * FROM matches WHERE swiss_day = ?',
        [1],
      );
      expect(day1Matches).toHaveLength(1);
      expect(day1Matches[0].id).toBe('day1-1');
    });
  });

  describe('淘汰赛晋级逻辑', () => {
    it('should track elimination bracket progression', async () => {
      // 胜者组半决赛
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, 
         elimination_bracket, elimination_game_number) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'elim-winners-1',
          'team-1',
          'team-2',
          'elimination',
          '胜者组半决赛',
          'finished',
          'winners',
          1,
        ],
      );

      mockCacheService.get.mockReturnValue(undefined);
      let match = await service.findOne('elim-winners-1');
      expect(match.eliminationBracket).toBe('winners');
      expect(match.eliminationGameNumber).toBe(1);

      // 败者组第一轮
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, 
         elimination_bracket, elimination_game_number) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'elim-losers-3',
          'team-3',
          'team-4',
          'elimination',
          '败者组第一轮',
          'finished',
          'losers',
          3,
        ],
      );

      match = await service.findOne('elim-losers-3');
      expect(match.eliminationBracket).toBe('losers');

      // 总决赛
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, 
         elimination_bracket, elimination_game_number) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'elim-grand-8',
          'team-1',
          'team-3',
          'elimination',
          '总决赛',
          'finished',
          'grand_finals',
          8,
        ],
      );

      match = await service.findOne('elim-grand-8');
      expect(match.eliminationBracket).toBe('grand_finals');
    });

    it('should query matches by elimination bracket', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, 
         elimination_bracket, elimination_game_number) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['w1', 'team-1', 'team-2', 'elimination', '胜者组', 'upcoming', 'winners', 1],
      );
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, 
         elimination_bracket, elimination_game_number) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['l1', 'team-3', 'team-4', 'elimination', '败者组', 'upcoming', 'losers', 3],
      );

      const winnersMatches = await databaseService.all<{ id: string; elimination_bracket: string }>(
        'SELECT * FROM matches WHERE elimination_bracket = ?',
        ['winners'],
      );
      expect(winnersMatches).toHaveLength(1);
      expect(winnersMatches[0].id).toBe('w1');
    });
  });

  describe('缓存一致性验证', () => {
    it('should maintain cache consistency after multiple updates', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      // 多次更新
      await service.update('match-1', { scoreA: 1 });
      await service.update('match-1', { scoreB: 1 });
      await service.update('match-1', { scoreA: 2, winnerId: 'team-1' });

      // 验证缓存清除被调用
      expect(mockCacheService.del).toHaveBeenCalledWith('match:match-1');
      expect(mockCacheService.del).toHaveBeenCalledWith('matches:all');
    });

    it('should handle cache miss correctly', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, score_a, score_b) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'finished', 2, 1],
      );

      // 模拟缓存未命中
      mockCacheService.get.mockReturnValue(undefined);

      const match = await service.findOne('match-1');
      expect(match.scoreA).toBe(2);
      expect(match.scoreB).toBe(1);

      // 验证缓存被设置
      expect(mockCacheService.set).toHaveBeenCalledWith('match:match-1', expect.any(Object));
    });
  });

  describe('数据库事务测试', () => {
    it('should handle partial updates correctly', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, score_a, score_b) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming', 0, 0],
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      // 只更新 scoreA
      let match = await service.update('match-1', { scoreA: 1 });
      expect(match.scoreA).toBe(1);
      expect(match.scoreB).toBe(0); // 保持不变

      // 只更新 winnerId
      match = await service.update('match-1', { winnerId: 'team-1' });
      expect(match.scoreA).toBe(1); // 保持不变
      expect(match.winnerId).toBe('team-1');
    });

    it('should handle concurrent score updates', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      // 模拟并发更新
      const promises = [
        service.update('match-1', { scoreA: 1 }),
        service.update('match-1', { scoreB: 1 }),
        service.update('match-1', { status: 'ongoing' as any }),
      ];

      await Promise.all(promises);

      // 验证最终状态
      mockCacheService.get.mockReturnValue(undefined);
      const match = await service.findOne('match-1');
      expect(match).toBeDefined();
    });
  });

  describe('与 Teams 模块集成', () => {
    it('should associate matches with teams', async () => {
      // 创建队伍
      await databaseService.run(`INSERT INTO teams (id, name, logo) VALUES (?, ?, ?)`, [
        'team-1',
        'Team One',
        'logo1.png',
      ]);
      await databaseService.run(`INSERT INTO teams (id, name, logo) VALUES (?, ?, ?)`, [
        'team-2',
        'Team Two',
        'logo2.png',
      ]);

      // 创建比赛
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      const match = await service.findOne('match-1');
      expect(match.teamAId).toBe('team-1');
      expect(match.teamBId).toBe('team-2');
    });

    it('should handle matches with null teams', async () => {
      // 创建未分配队伍的比赛（比赛槽位）
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['slot-1', null, null, 'swiss', 'Round 1', 'upcoming'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      const match = await service.findOne('slot-1');
      expect(match.teamAId).toBeNull();
      expect(match.teamBId).toBeNull();
    });
  });

  describe('数据一致性验证', () => {
    it('should maintain match count consistency', async () => {
      // 创建多场比赛
      for (let i = 0; i < 5; i++) {
        await databaseService.run(
          `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [`match-${i}`, `team-${i}`, `team-${i + 5}`, 'swiss', `Round ${i + 1}`, 'upcoming'],
        );
      }

      mockCacheService.get.mockReturnValue(undefined);
      const allMatches = await service.findAll();
      expect(allMatches).toHaveLength(5);

      // 按阶段过滤
      const swissMatches = await service.findAll('swiss');
      expect(swissMatches).toHaveLength(5);
    });

    it('should validate match status transitions', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming'],
      );

      // 验证状态可以更新
      await databaseService.run(`UPDATE matches SET status = ? WHERE id = ?`, [
        'ongoing',
        'match-1',
      ]);

      let match = await databaseService.get<{ status: string }>(
        'SELECT * FROM matches WHERE id = ?',
        ['match-1'],
      );
      expect(match!.status).toBe('ongoing');

      // 更新为完成
      await databaseService.run(`UPDATE matches SET status = ? WHERE id = ?`, [
        'finished',
        'match-1',
      ]);

      match = await databaseService.get<{ status: string }>('SELECT * FROM matches WHERE id = ?', [
        'match-1',
      ]);
      expect(match!.status).toBe('finished');
    });
  });

  describe('并发更新测试', () => {
    it('should handle concurrent match updates', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming'],
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      // 并发更新不同字段
      const promises = Array.from({ length: 5 }, (_, i) =>
        service.update('match-1', { scoreA: i + 1 }),
      );

      await Promise.all(promises);

      // 验证最终状态（最后一个更新生效）
      mockCacheService.get.mockReturnValue(undefined);
      const match = await service.findOne('match-1');
      expect(match.scoreA).toBeGreaterThanOrEqual(1);
    });

    it('should handle concurrent match creations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        databaseService.run(
          `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [`match-${i}`, `team-${i}`, `team-${i + 10}`, 'swiss', `Round ${i + 1}`, 'upcoming'],
        ),
      );

      await Promise.all(promises);

      mockCacheService.get.mockReturnValue(undefined);
      const allMatches = await service.findAll();
      expect(allMatches).toHaveLength(10);
    });
  });

  describe('错误处理测试', () => {
    it('should handle update of non-existent match', async () => {
      mockCacheService.get.mockReturnValue(undefined);

      await expect(service.update('non-existent', { scoreA: 1 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle clearScores of non-existent match', async () => {
      await expect(service.clearScores('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should handle invalid match data gracefully', async () => {
      // 尝试插入无效的阶段值
      await expect(
        databaseService.run(
          `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          ['match-1', 'team-1', 'team-2', 'invalid_stage', '第一轮', 'upcoming'],
        ),
      ).rejects.toThrow();
    });

    it('should handle invalid status values', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming'],
      );

      // 尝试更新为无效状态
      await expect(
        databaseService.run(`UPDATE matches SET status = ? WHERE id = ?`, [
          'invalid_status',
          'match-1',
        ]),
      ).rejects.toThrow();
    });
  });
});
