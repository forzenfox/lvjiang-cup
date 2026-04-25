import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from '../../src/modules/matches/matches.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { NotFoundException } from '@nestjs/common';
import { MatchStatus } from '../../src/modules/matches/dto/update-match.dto';

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
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);

    jest.clearAllMocks();
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

  describe('initSlots', () => {
    it('should initialize 36 swiss stage slots', async () => {
      mockDatabaseService.get.mockResolvedValue({ count: 0 });
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      await service.initSlots();

      // 验证插入了33个瑞士轮槽位 + 7个淘汰赛槽位 = 40次调用
      expect(mockDatabaseService.run).toHaveBeenCalledTimes(40);
    });

    it('should not initialize if slots already exist', async () => {
      mockDatabaseService.get.mockResolvedValue({ count: 10 });

      await service.initSlots();

      expect(mockDatabaseService.run).not.toHaveBeenCalled();
    });

    it('should create swiss round 5 slots', async () => {
      mockDatabaseService.get.mockResolvedValue({ count: 0 });
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      await service.initSlots();

      // 验证第5轮的槽位被创建
      const calls = mockDatabaseService.run.mock.calls;
      const round5Calls = calls.filter(
        (call) => call[1] && call[1][0] && call[1][0].startsWith('swiss-r5'),
      );
      expect(round5Calls.length).toBe(3);
    });

    it('should clear cache after initialization', async () => {
      mockDatabaseService.get.mockResolvedValue({ count: 0 });
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      await service.initSlots();

      expect(mockCacheService.del).toHaveBeenCalledWith('matches:all');
    });
  });

  describe('比赛状态转换', () => {
    it('应该支持 upcoming → in_progress → finished 状态流转', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1', status: 'upcoming' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        status: 'in_progress',
        score_a: 0,
        score_b: 0,
      });

      const result1 = await service.update('1', { status: MatchStatus.ONGOING });

      expect(result1.status).toBe('in_progress');

      mockDatabaseService.get.mockResolvedValueOnce({ id: '1', status: 'in_progress' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        status: 'finished',
        score_a: 2,
        score_b: 1,
      });

      const result2 = await service.update('1', {
        status: MatchStatus.FINISHED,
        scoreA: 2,
        scoreB: 1,
      });

      expect(result2.status).toBe('finished');
    });

    it('应该在状态更新时清除缓存', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1', status: 'upcoming' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        status: 'in_progress',
        score_a: 0,
        score_b: 0,
      });

      await service.update('1', { status: MatchStatus.ONGOING });

      expect(mockCacheService.del).toHaveBeenCalledWith('matches:all');
      expect(mockCacheService.del).toHaveBeenCalledWith('matches:1');
    });

    it('应该处理空比赛状态更新', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1', status: 'upcoming' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        status: 'upcoming',
        score_a: 0,
        score_b: 0,
      });

      const result = await service.update('1', {});

      expect(result.status).toBe('upcoming');
    });
  });

  describe('比分更新业务规则', () => {
    it('应该更新比赛比分', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        score_a: 2,
        score_b: 1,
        status: 'finished',
      });

      const result = await service.update('1', { scoreA: 2, scoreB: 1 });

      expect(result.scoreA).toBe(2);
      expect(result.scoreB).toBe(1);
    });

    it('应该允许相同比分（平局场景）', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        score_a: 1,
        score_b: 1,
        status: 'finished',
      });

      const result = await service.update('1', { scoreA: 1, scoreB: 1 });

      expect(result.scoreA).toBe(1);
      expect(result.scoreB).toBe(1);
    });

    it('应该支持清零比分', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        score_a: 0,
        score_b: 0,
        status: 'upcoming',
      });

      const result = await service.update('1', { scoreA: 0, scoreB: 0 });

      expect(result.scoreA).toBe(0);
      expect(result.scoreB).toBe(0);
    });

    it('应该单独更新 A 队比分', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        score_a: 3,
        score_b: 0,
        status: 'upcoming',
      });

      const result = await service.update('1', { scoreA: 3 });

      expect(result.scoreA).toBe(3);
    });

    it('应该单独更新 B 队比分', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        score_a: 0,
        score_b: 2,
        status: 'upcoming',
      });

      const result = await service.update('1', { scoreB: 2 });

      expect(result.scoreB).toBe(2);
    });
  });

  describe('边界值测试', () => {
    it('应该处理负数比分更新', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        score_a: -1,
        score_b: 0,
        status: 'upcoming',
      });

      await service.update('1', { scoreA: -1 });

      expect(mockDatabaseService.run).toHaveBeenCalled();
    });

    it('应该处理极大比分值', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        score_a: 999999,
        score_b: 0,
        status: 'upcoming',
      });

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
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        score_a: 1.5,
        score_b: 0,
        status: 'upcoming',
      });

      await service.update('1', { scoreA: 1.5 } as any);

      expect(mockDatabaseService.run).toHaveBeenCalled();
    });

    it('应该处理零比分更新', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.get.mockResolvedValueOnce({
        id: '1',
        score_a: 0,
        score_b: 0,
        status: 'upcoming',
      });

      const result = await service.update('1', { scoreA: 0, scoreB: 0 });

      expect(result.scoreA).toBe(0);
      expect(result.scoreB).toBe(0);
    });
  });
});
