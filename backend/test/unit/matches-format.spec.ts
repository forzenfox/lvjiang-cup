import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from '../../src/modules/matches/matches.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { FormatsService } from '../../src/modules/formats/formats.service';
import { NotFoundException } from '@nestjs/common';
import { BUILTIN_DEFAULT_FORMAT, FormatConfig } from '../../src/modules/formats/format.types';

/** 8队2胜 + 4强淘汰赛配置（13 槽位） */
const FORMAT_8TEAMS: FormatConfig = {
  version: 1,
  name: '8队瑞士轮（2胜制）+ 4强',
  stages: [
    {
      type: 'swiss',
      name: '瑞士轮',
      teamCount: 8,
      winThreshold: 2,
      lossThreshold: 2,
      boRule: 'auto',
      advanceToStage: 1,
    },
    {
      type: 'elimination',
      name: '淘汰赛',
      teamCount: 4,
      advanceToStage: null,
      roundNames: ['半决赛', '决赛'],
      boFormat: 'BO3',
    },
  ],
};

/** 生成 16队3胜内置默认配置的全部现有槽位行（33 瑞士轮 + 7 淘汰赛） */
function buildBuiltinExistingRows() {
  const rows: any[] = [];
  // 瑞士轮自然键分布：R1 0-0×8; R2 1-0×4 0-1×4; R3 2-0×2 1-1×4 0-2×2; R4 2-1×3 1-2×3; R5 2-2×3
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
      rows.push({
        id: `swiss-r${round}-${record}-${i}`,
        stage: 'swiss',
        swiss_round: round,
        swiss_record: record,
        elimination_game_number: null,
      });
    }
  }
  for (let n = 1; n <= 7; n++) {
    rows.push({
      id: `elim-game-${n}`,
      stage: 'elimination',
      swiss_round: null,
      swiss_record: null,
      elimination_game_number: n,
    });
  }
  return rows;
}

/** 生成 16队3胜配置的瑞士轮现有槽位行（33 场，无淘汰赛） */
function buildBuiltinSwissOnlyRows() {
  return buildBuiltinExistingRows().filter((r) => r.stage === 'swiss');
}

describe('MatchesService - 赛制可配置化（generateSlots / findAll formatId 过滤）', () => {
  let service: MatchesService;

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
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: FormatsService, useValue: mockFormatsService },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);

    jest.clearAllMocks();
    // 默认生效配置为内置默认
    mockFormatsService.getActiveFormat.mockResolvedValue({
      source: 'builtin',
      id: null,
      config: BUILTIN_DEFAULT_FORMAT,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSlots - 按生效配置生成槽位', () => {
    it('首次生成：builtin scope 下应创建 33+7=40 个槽位且 format_id 为 NULL', async () => {
      mockDatabaseService.all.mockResolvedValue([]); // 无现有槽位
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      const result = await service.generateSlots();

      expect(result).toEqual({ created: 40, skipped: 0, total: 40 });
      expect(mockDatabaseService.run).toHaveBeenCalledTimes(40);

      // 第一个槽位：瑞士轮 R1，id 为生成器默认 id（无前缀），format_id=NULL
      const firstCall = mockDatabaseService.run.mock.calls[0];
      expect(firstCall[1][0]).toBe('swiss-r1-1');
      expect(firstCall[0]).toContain('format_id');
      expect(firstCall[1][3]).toBeNull(); // format_id 参数位（NULL=内置默认）

      // 淘汰赛槽位 id 为 elim-r{级}-{序号}
      const allIds = mockDatabaseService.run.mock.calls.map((c) => c[1][0]);
      expect(allIds).toContain('elim-r0-1');
      expect(allIds).toContain('elim-r2-1');
      expect(allIds.filter((id: string) => id.startsWith('elim-'))).toHaveLength(7);
    });

    it('生成后应清除缓存', async () => {
      mockDatabaseService.all.mockResolvedValue([]);
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      await service.generateSlots();

      expect(mockCacheService.flush).toHaveBeenCalled();
    });

    it('重复调用：槽位已齐全时应零新增（幂等）', async () => {
      mockDatabaseService.all.mockResolvedValue(buildBuiltinExistingRows());

      const result = await service.generateSlots();

      expect(result).toEqual({ created: 0, skipped: 40, total: 40 });
      expect(mockDatabaseService.run).not.toHaveBeenCalled();
    });

    it('部分已有：只补差额，已存在槽位绝不 UPDATE/DELETE（赛果保留）', async () => {
      // 已有 33 场瑞士轮，缺 7 场淘汰赛
      mockDatabaseService.all.mockResolvedValue(buildBuiltinSwissOnlyRows());
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      const result = await service.generateSlots();

      expect(result).toEqual({ created: 7, skipped: 33, total: 40 });
      expect(mockDatabaseService.run).toHaveBeenCalledTimes(7);

      // 只允许 INSERT，不允许 UPDATE/DELETE（保护已有赛果）
      for (const call of mockDatabaseService.run.mock.calls) {
        expect(call[0]).toMatch(/^INSERT INTO matches/);
      }
      const createdIds = mockDatabaseService.run.mock.calls.map((c) => c[1][0]);
      expect(createdIds.every((id: string) => id.startsWith('elim-'))).toBe(true);
    });

    it('显式配置 scope：id 应加 formatId 前缀且 format_id 写入该配置 id', async () => {
      mockFormatsService.findById.mockResolvedValue({
        id: 'fmt-123',
        name: FORMAT_8TEAMS.name,
        config: FORMAT_8TEAMS,
        isActive: false,
      });
      mockDatabaseService.all.mockResolvedValue([]);
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      const result = await service.generateSlots('fmt-123');

      expect(result).toEqual({ created: 13, skipped: 0, total: 13 });

      const firstCall = mockDatabaseService.run.mock.calls[0];
      expect(firstCall[1][0]).toBe('fmt-123::swiss-r1-1'); // 前缀 id，与 builtin 不冲突
      expect(firstCall[1][3]).toBe('fmt-123'); // format_id 打标
    });

    it('激活配置后无参调用应按该配置生成（scope=激活 id）', async () => {
      mockFormatsService.getActiveFormat.mockResolvedValue({
        source: 'config',
        id: 'fmt-456',
        config: FORMAT_8TEAMS,
      });
      mockDatabaseService.all.mockResolvedValue([]);
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      const result = await service.generateSlots();

      expect(result).toEqual({ created: 13, skipped: 0, total: 13 });
      const firstCall = mockDatabaseService.run.mock.calls[0];
      expect(firstCall[1][0]).toBe('fmt-456::swiss-r1-1');
      expect(firstCall[1][3]).toBe('fmt-456');
    });

    it('显式传入不存在的配置 id 应抛出 NotFoundException', async () => {
      mockFormatsService.findById.mockResolvedValue(null);

      await expect(service.generateSlots('not-exist')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll - 按 formatId scope 过滤', () => {
    it('无激活配置（builtin）时应只返回 format_id 为 NULL 的行，缓存键为 matches:all', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all
        .mockResolvedValueOnce([
          {
            id: 'legacy-1',
            round: 'Round 1',
            stage: 'swiss',
            score_a: 0,
            score_b: 0,
            status: 'upcoming',
            format_id: null,
          },
          {
            id: 'fmt-slot-1',
            round: 'Round 1',
            stage: 'swiss',
            score_a: 0,
            score_b: 0,
            status: 'upcoming',
            format_id: 'fmt-123',
          },
        ])
        .mockResolvedValueOnce([]); // teams

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('legacy-1');
      expect(mockCacheService.set).toHaveBeenCalledWith('matches:all', expect.any(Array));
    });

    it('存在激活配置时应只返回该 format_id 的行，缓存键含 scope', async () => {
      mockFormatsService.getActiveFormat.mockResolvedValue({
        source: 'config',
        id: 'fmt-123',
        config: FORMAT_8TEAMS,
      });
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all
        .mockResolvedValueOnce([
          {
            id: 'legacy-1',
            round: 'Round 1',
            stage: 'swiss',
            score_a: 0,
            score_b: 0,
            status: 'upcoming',
            format_id: null,
          },
          {
            id: 'fmt-slot-1',
            round: 'Round 1',
            stage: 'swiss',
            score_a: 0,
            score_b: 0,
            status: 'upcoming',
            format_id: 'fmt-123',
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('fmt-slot-1');
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'matches:all:fmt:fmt-123',
        expect.any(Array),
      );
    });

    it('显式传 formatId 参数时应按该 id 过滤（不查激活配置）', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all
        .mockResolvedValueOnce([
          {
            id: 'legacy-1',
            round: 'Round 1',
            stage: 'swiss',
            score_a: 0,
            score_b: 0,
            status: 'upcoming',
            format_id: null,
          },
          {
            id: 'fmt-slot-1',
            round: 'Round 1',
            stage: 'swiss',
            score_a: 0,
            score_b: 0,
            status: 'upcoming',
            format_id: 'fmt-123',
          },
          {
            id: 'fmt-slot-2',
            round: '决赛',
            stage: 'elimination',
            score_a: 0,
            score_b: 0,
            status: 'upcoming',
            format_id: 'fmt-123',
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.findAll('swiss', 'fmt-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('fmt-slot-1');
      expect(mockFormatsService.getActiveFormat).not.toHaveBeenCalled();
    });
  });
});
