import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from '../../src/modules/matches/matches.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { FormatsService } from '../../src/modules/formats/formats.service';
import { NotFoundException } from '@nestjs/common';
import { MatchStatus } from '../../src/modules/matches/dto/update-match.dto';
import { BUILTIN_DEFAULT_FORMAT } from '../../src/modules/formats/format.types';

describe('MatchesService', () => {
  let service: MatchesService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;

  const mockDatabaseService = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flush: jest.fn(),
  };

  const mockFormatsService = {
    getActiveFormat: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: FormatsService,
          useValue: mockFormatsService,
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);

    jest.clearAllMocks();
    // 默认生效配置为内置默认（保持旧用例行为兼容：scope=null → format_id IS NULL）
    mockFormatsService.getActiveFormat.mockResolvedValue({
      source: 'builtin',
      id: null,
      config: BUILTIN_DEFAULT_FORMAT,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return matches from cache', async () => {
      const mockMatches = [
        { id: '1', round: 'Round 1', stage: 'swiss', scoreA: 0, scoreB: 0, status: 'upcoming' },
      ];
      mockCacheService.get.mockReturnValue(mockMatches);

      const result = await service.findAll();

      expect(result).toEqual(mockMatches);
      expect(mockCacheService.get).toHaveBeenCalledWith('matches:all');
    });

    it('should return matches from database when cache is empty', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all
        .mockResolvedValueOnce([
          { id: '1', round: 'Round 1', stage: 'swiss', score_a: 0, score_b: 0, status: 'upcoming' },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockDatabaseService.all).toHaveBeenCalledTimes(2);
    });

    it('should filter by stage', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all
        .mockResolvedValueOnce([
          { id: '1', round: 'Round 1', stage: 'swiss', score_a: 0, score_b: 0, status: 'upcoming' },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.findAll('swiss');

      expect(result.every((m) => m.stage === 'swiss')).toBe(true);
    });

    it('should cache results after database query', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      const mockMatch = {
        id: '1',
        round: 'Round 1',
        stage: 'swiss',
        score_a: 0,
        score_b: 0,
        status: 'upcoming',
      };
      mockDatabaseService.all.mockResolvedValueOnce([mockMatch]).mockResolvedValueOnce([]);

      await service.findAll();

      expect(mockCacheService.set).toHaveBeenCalledWith('matches:all', expect.any(Array));
    });
  });

  describe('findOne', () => {
    it('should return a match from cache', async () => {
      const mockMatch = {
        id: '1',
        round: 'Round 1',
        stage: 'swiss',
        scoreA: 0,
        scoreB: 0,
        status: 'upcoming',
      };
      mockCacheService.get.mockReturnValue(mockMatch);

      const result = await service.findOne('1');

      expect(result).toEqual(mockMatch);
      expect(mockCacheService.get).toHaveBeenCalledWith('matches:1');
    });

    it('should return a match from database when cache is empty', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue({
        id: '1',
        round: 'Round 1',
        stage: 'swiss',
        score_a: 0,
        score_b: 0,
        status: 'upcoming',
      });

      const result = await service.findOne('1');

      expect(result.id).toBe('1');
      expect(mockDatabaseService.get).toHaveBeenCalledWith(expect.any(String), ['1']);
    });

    it('should throw NotFoundException for non-existent match', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should cache result after database query', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue({
        id: '1',
        round: 'Round 1',
        stage: 'swiss',
        score_a: 0,
        score_b: 0,
        status: 'upcoming',
      });

      await service.findOne('1');

      expect(mockCacheService.set).toHaveBeenCalledWith('matches:1', expect.any(Object));
    });
  });

  describe('update', () => {
    it('should update match score successfully', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // for existence check
        .mockResolvedValueOnce({
          id: '1',
          round: 'Round 1',
          stage: 'swiss',
          score_a: 2,
          score_b: 1,
          status: 'finished',
        }); // for returning updated match

      const _result = await service.update('1', {
        scoreA: 2,
        scoreB: 1,
        status: MatchStatus.FINISHED,
      });

      expect(mockDatabaseService.run).toHaveBeenCalled();
      expect(mockCacheService.del).toHaveBeenCalledWith('matches:all');
      expect(mockCacheService.del).toHaveBeenCalledWith('matches:1');
    });

    it('should update match teams successfully', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' }).mockResolvedValueOnce({
        id: '1',
        team_a_id: 'team-a',
        team_b_id: 'team-b',
      });

      await service.update('1', { teamAId: 'team-a', teamBId: 'team-b' });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('team_a_id'),
        expect.any(Array),
      );
    });

    it('should throw NotFoundException for non-existent match', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      const updateDto = { scoreA: 2 };
      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should not update when no fields provided', async () => {
      mockDatabaseService.get.mockResolvedValue({ id: '1' });

      await service.update('1', {});

      expect(mockDatabaseService.run).not.toHaveBeenCalled();
    });

    it('当更新状态为 upcoming 时，应自动清空 winner_id', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        status: 'upcoming',
        winner_id: null,
      });

      await service.update('1', { status: MatchStatus.UPCOMING });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('winner_id = NULL'),
        expect.any(Array),
      );
    });

    it('当更新状态为 ongoing 时，应自动清空 winner_id', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        status: 'ongoing',
        winner_id: null,
      });

      await service.update('1', { status: MatchStatus.ONGOING });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('winner_id = NULL'),
        expect.any(Array),
      );
    });

    it('当更新状态为 finished 时，不应自动清空 winner_id', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        status: 'finished',
        winner_id: 'team-a',
      });

      await service.update('1', { status: MatchStatus.FINISHED, winnerId: 'team-a' });

      const runCall = mockDatabaseService.run.mock.calls[0];
      expect(runCall[0]).not.toContain('winner_id = NULL');
    });
  });

  describe('clearScores', () => {
    it('should clear match scores successfully', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // for existence check
        .mockResolvedValueOnce({
          id: '1',
          score_a: 0,
          score_b: 0,
          status: 'upcoming',
        }); // for returning cleared match

      const _result = await service.clearScores('1');

      expect(mockDatabaseService.run).toHaveBeenCalledWith(expect.stringContaining('score_a = 0'), [
        '1',
      ]);
      expect(mockCacheService.del).toHaveBeenCalledWith('matches:all');
      expect(mockCacheService.del).toHaveBeenCalledWith('matches:1');
    });

    it('should throw NotFoundException for non-existent match', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.clearScores('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateSlots', () => {
    it('首次生成应创建 40 个槽位（33 瑞士轮 + 7 淘汰赛）', async () => {
      mockDatabaseService.all.mockResolvedValue([]);
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      const result = await service.generateSlots();

      // 验证插入了33个瑞士轮槽位 + 7个淘汰赛槽位 = 40次调用
      expect(mockDatabaseService.run).toHaveBeenCalledTimes(40);
      expect(result).toEqual({ created: 40, skipped: 0, total: 40 });
    });

    it('槽位已存在时应零新增（幂等）', async () => {
      // 现有槽位自然键齐全（33 瑞士轮 + 7 淘汰赛）
      const existingRows: any[] = [];
      const swissDistribution: Array<[number, string, number]> = [
        [1, '0-0', 8],
        [2, '1-0', 4],
        [2, '0-1', 4],
        [3, '2-0', 2],
        [3, '1-1', 4],
        [3, '0-2', 2],
        [4, '2-1', 3],
        [4, '1-2', 3],
        [5, '2-2', 3],
      ];
      for (const [round, record, count] of swissDistribution) {
        for (let i = 0; i < count; i++) {
          existingRows.push({
            id: `swiss-r${round}-${record}-${i}`,
            stage: 'swiss',
            swiss_round: round,
            swiss_record: record,
            elimination_game_number: null,
          });
        }
      }
      for (let n = 1; n <= 7; n++) {
        existingRows.push({
          id: `elim-game-${n}`,
          stage: 'elimination',
          swiss_round: null,
          swiss_record: null,
          elimination_game_number: n,
        });
      }
      mockDatabaseService.all.mockResolvedValue(existingRows);

      const result = await service.generateSlots();

      expect(mockDatabaseService.run).not.toHaveBeenCalled();
      expect(result).toEqual({ created: 0, skipped: 40, total: 40 });
    });

    it('should create swiss round 5 slots', async () => {
      mockDatabaseService.all.mockResolvedValue([]);
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      await service.generateSlots();

      // 验证第5轮的槽位被创建
      const calls = mockDatabaseService.run.mock.calls;
      const round5Calls = calls.filter(
        (call) => call[1] && call[1][0] && call[1][0].startsWith('swiss-r5'),
      );
      expect(round5Calls.length).toBe(3);
    });

    it('should clear cache after generation', async () => {
      mockDatabaseService.all.mockResolvedValue([]);
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      await service.generateSlots();

      expect(mockCacheService.flush).toHaveBeenCalled();
    });
  });

  describe('比赛状态转换', () => {
    it('应该支持 upcoming → in_progress → finished 状态流转', async () => {
      // 第一次调用：更新为 ongoing
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'upcoming' }) // 查询当前状态
        .mockResolvedValueOnce({
          id: '1',
          status: 'in_progress',
          score_a: 0,
          score_b: 0,
        }); // 返回更新后的数据

      const result1 = await service.update('1', { status: MatchStatus.ONGOING });

      expect(result1.status).toBe('in_progress');

      // 第二次调用：更新为 finished（同时更新比分）
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'in_progress' }) // 查询当前状态
        .mockResolvedValueOnce({
          score_a: 0,
          score_b: 0,
          team_a_id: 'team-a',
          team_b_id: 'team-b',
        }) // 查询当前比分和队伍
        .mockResolvedValueOnce({
          id: '1',
          status: 'finished',
          score_a: 2,
          score_b: 1,
          winner_id: 'team-a',
        }); // 返回更新后的数据

      const result2 = await service.update('1', {
        status: MatchStatus.FINISHED,
        scoreA: 2,
        scoreB: 1,
      });

      expect(result2.status).toBe('finished');
    });

    it('应该在状态更新时清除缓存', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'upcoming' }) // 查询当前状态
        .mockResolvedValueOnce({
          id: '1',
          status: 'in_progress',
          score_a: 0,
          score_b: 0,
        }); // 返回更新后的数据

      await service.update('1', { status: MatchStatus.ONGOING });

      expect(mockCacheService.del).toHaveBeenCalledWith('matches:all');
      expect(mockCacheService.del).toHaveBeenCalledWith('matches:1');
    });

    it('应该处理空比赛状态更新', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'upcoming' }) // 查询当前状态（但无更新字段，不会查询）
        .mockResolvedValueOnce({
          id: '1',
          status: 'upcoming',
          score_a: 0,
          score_b: 0,
        }); // 返回更新后的数据

      const result = await service.update('1', {});

      expect(result.status).toBe('upcoming');
    });
  });

  describe('比分更新业务规则', () => {
    it('应该更新比赛比分', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'upcoming' }) // 查询当前状态（非 finished，不会自动修正 winner_id）
        .mockResolvedValueOnce({
          id: '1',
          score_a: 2,
          score_b: 1,
          status: 'upcoming',
        }); // 返回更新后的数据

      const result = await service.update('1', { scoreA: 2, scoreB: 1 });

      expect(result.scoreA).toBe(2);
      expect(result.scoreB).toBe(1);
    });

    it('已结束状态修改比分后，winner_id 应根据新比分自动修正', async () => {
      // 第一次 get 用于存在性检查，第二次用于查询当前状态，第三次用于查询比分和队伍，第四次用于返回更新后的数据
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'finished' }) // 查询当前状态
        .mockResolvedValueOnce({
          score_a: 1,
          score_b: 2,
          team_a_id: 'team-a',
          team_b_id: 'team-b',
        }) // 查询当前比分和队伍
        .mockResolvedValueOnce({
          id: '1',
          score_a: 3,
          score_b: 2,
          winner_id: 'team-a',
          status: 'finished',
        }); // 返回更新后的数据

      const result = await service.update('1', { scoreA: 3 });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('winner_id = ?'),
        expect.arrayContaining(['team-a']),
      );
      expect(result.winnerId).toBe('team-a');
    });

    it('已结束状态修改比分为平局后，winner_id 应清空', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'finished' }) // 查询当前状态
        .mockResolvedValueOnce({
          score_a: 2,
          score_b: 1,
          team_a_id: 'team-a',
          team_b_id: 'team-b',
        }) // 查询当前比分和队伍
        .mockResolvedValueOnce({
          id: '1',
          score_a: 2,
          score_b: 2,
          winner_id: null,
          status: 'finished',
        }); // 返回更新后的数据

      const result = await service.update('1', { scoreB: 2 });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('winner_id = NULL'),
        expect.any(Array),
      );
      expect(result.winnerId).toBeNull();
    });

    it('应该允许相同比分（平局场景）', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'upcoming' }) // 查询当前状态（非 finished）
        .mockResolvedValueOnce({
          id: '1',
          score_a: 1,
          score_b: 1,
          status: 'upcoming',
        }); // 返回更新后的数据

      const result = await service.update('1', { scoreA: 1, scoreB: 1 });

      expect(result.scoreA).toBe(1);
      expect(result.scoreB).toBe(1);
    });

    it('应该支持清零比分', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'upcoming' }) // 查询当前状态
        .mockResolvedValueOnce({
          id: '1',
          score_a: 0,
          score_b: 0,
          status: 'upcoming',
        }); // 返回更新后的数据

      const result = await service.update('1', { scoreA: 0, scoreB: 0 });

      expect(result.scoreA).toBe(0);
      expect(result.scoreB).toBe(0);
    });

    it('应该单独更新 A 队比分', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'upcoming' }) // 查询当前状态
        .mockResolvedValueOnce({
          id: '1',
          score_a: 3,
          score_b: 0,
          status: 'upcoming',
        }); // 返回更新后的数据

      const result = await service.update('1', { scoreA: 3 });

      expect(result.scoreA).toBe(3);
    });

    it('应该单独更新 B 队比分', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'upcoming' }) // 查询当前状态
        .mockResolvedValueOnce({
          id: '1',
          score_a: 0,
          score_b: 2,
          status: 'upcoming',
        }); // 返回更新后的数据

      const result = await service.update('1', { scoreB: 2 });

      expect(result.scoreB).toBe(2);
    });
  });

  describe('边界值测试', () => {
    it('应该处理负数比分更新', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'upcoming' }) // 查询当前状态
        .mockResolvedValueOnce({
          id: '1',
          score_a: -1,
          score_b: 0,
          status: 'upcoming',
        }); // 返回更新后的数据

      await service.update('1', { scoreA: -1 });

      expect(mockDatabaseService.run).toHaveBeenCalled();
    });

    it('应该处理极大比分值', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'upcoming' }) // 查询当前状态
        .mockResolvedValueOnce({
          id: '1',
          score_a: 999999,
          score_b: 0,
          status: 'upcoming',
        }); // 返回更新后的数据

      await service.update('1', { scoreA: 999999 });

      expect(mockDatabaseService.run).toHaveBeenCalled();
    });

    it('应该处理无效的阶段过滤条件', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all.mockResolvedValue([]);

      const result = await service.findAll('invalid-stage');

      expect(result).toEqual([]);
    });

    it('应该处理空比赛 ID 的 findOne 查询', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.findOne('')).rejects.toThrow(NotFoundException);
    });

    it('应该处理小数比分值', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'upcoming' }) // 查询当前状态
        .mockResolvedValueOnce({
          id: '1',
          score_a: 1.5,
          score_b: 0,
          status: 'upcoming',
        }); // 返回更新后的数据

      await service.update('1', { scoreA: 1.5 } as any);

      expect(mockDatabaseService.run).toHaveBeenCalled();
    });

    it('应该处理零比分更新', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // 存在性检查
        .mockResolvedValueOnce({ status: 'upcoming' }) // 查询当前状态
        .mockResolvedValueOnce({
          id: '1',
          score_a: 0,
          score_b: 0,
          status: 'upcoming',
        }); // 返回更新后的数据

      const result = await service.update('1', { scoreA: 0, scoreB: 0 });

      expect(result.scoreA).toBe(0);
      expect(result.scoreB).toBe(0);
    });
  });
});
