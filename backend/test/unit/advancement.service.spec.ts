import { Test, TestingModule } from '@nestjs/testing';
import { AdvancementService } from '../../src/modules/advancement/advancement.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';

describe('AdvancementService', () => {
  let service: AdvancementService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;

  const mockDatabaseService = {
    get: jest.fn(),
    run: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvancementService,
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

    service = module.get<AdvancementService>(AdvancementService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('应该从缓存获取晋级名单', async () => {
      const cachedAdvancement = {
        winners2_0: ['team1', 'team2'],
        winners2_1: ['team3'],
        losersBracket: ['team4'],
        eliminated3rd: ['team5'],
        eliminated0_3: ['team6'],
      };
      mockCacheService.get.mockReturnValue(cachedAdvancement);

      const result = await service.findOne();

      expect(result).toEqual(cachedAdvancement);
      expect(mockCacheService.get).toHaveBeenCalledWith('advancement:info');
      expect(mockDatabaseService.get).not.toHaveBeenCalled();
    });

    it('应该从数据库获取晋级名单（缓存未命中）', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue({
        winners2_0: JSON.stringify(['team1', 'team2']),
        winners2_1: JSON.stringify(['team3']),
        losers_bracket: JSON.stringify(['team4']),
        eliminated_3rd: JSON.stringify(['team5']),
        eliminated_0_3: JSON.stringify(['team6']),
      });

      const result = await service.findOne();

      expect(result.winners2_0).toEqual(['team1', 'team2']);
      expect(result.winners2_1).toEqual(['team3']);
      expect(result.losersBracket).toEqual(['team4']);
      expect(result.eliminated3rd).toEqual(['team5']);
      expect(result.eliminated0_3).toEqual(['team6']);
      expect(mockDatabaseService.get).toHaveBeenCalledWith(
        'SELECT * FROM advancement WHERE id = 1',
      );
      expect(mockCacheService.set).toHaveBeenCalledWith('advancement:info', expect.any(Object));
    });

    it('应该处理空数据情况', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(null);

      const result = await service.findOne();

      expect(result).toEqual({
        winners2_0: [],
        winners2_1: [],
        losersBracket: [],
        eliminated3rd: [],
        eliminated0_3: [],
      });
    });

    it('应该处理数据库返回部分数据的情况', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue({
        winners2_0: JSON.stringify(['team1']),
        winners2_1: null,
        losers_bracket: null,
        eliminated_3rd: null,
        eliminated_0_3: null,
      });

      const result = await service.findOne();

      expect(result.winners2_0).toEqual(['team1']);
      expect(result.winners2_1).toEqual([]);
      expect(result.losersBracket).toEqual([]);
    });
  });

  describe('update', () => {
    it('应该更新 winners2_0 分类', async () => {
      mockDatabaseService.run.mockResolvedValue(undefined);
      mockDatabaseService.get.mockResolvedValue({
        winners2_0: JSON.stringify(['team1', 'team2']),
        winners2_1: JSON.stringify([]),
        losers_bracket: JSON.stringify([]),
        eliminated_3rd: JSON.stringify([]),
        eliminated_0_3: JSON.stringify([]),
      });

      await service.update({ winners2_0: ['team1', 'team2'] });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE advancement SET'),
        expect.arrayContaining([JSON.stringify(['team1', 'team2'])]),
      );
      expect(mockCacheService.del).toHaveBeenCalledWith('advancement:info');
    });

    it('应该更新多个分类', async () => {
      mockDatabaseService.run.mockResolvedValue(undefined);
      mockDatabaseService.get.mockResolvedValue({
        winners2_0: JSON.stringify(['team1']),
        winners2_1: JSON.stringify(['team2']),
        losers_bracket: JSON.stringify([]),
        eliminated_3rd: JSON.stringify([]),
        eliminated_0_3: JSON.stringify([]),
      });

      await service.update({
        winners2_0: ['team1'],
        winners2_1: ['team2'],
      });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE advancement SET'),
        expect.arrayContaining([JSON.stringify(['team1']), JSON.stringify(['team2'])]),
      );
      expect(mockCacheService.del).toHaveBeenCalledWith('advancement:info');
    });

    it('应该处理空数组（清空分类）', async () => {
      mockDatabaseService.run.mockResolvedValue(undefined);
      mockDatabaseService.get.mockResolvedValue({
        winners2_0: JSON.stringify([]),
        winners2_1: JSON.stringify([]),
        losers_bracket: JSON.stringify([]),
        eliminated_3rd: JSON.stringify([]),
        eliminated_0_3: JSON.stringify([]),
      });

      await service.update({ winners2_0: [] });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE advancement SET'),
        expect.arrayContaining([JSON.stringify([])]),
      );
    });

    it('应该在更新后返回最新的晋级名单', async () => {
      mockDatabaseService.run.mockResolvedValue(undefined);
      mockDatabaseService.get.mockResolvedValue({
        winners2_0: JSON.stringify(['team1', 'team2']),
        winners2_1: JSON.stringify([]),
        losers_bracket: JSON.stringify([]),
        eliminated_3rd: JSON.stringify([]),
        eliminated_0_3: JSON.stringify([]),
      });

      const result = await service.update({ winners2_0: ['team1', 'team2'] });

      expect(result.winners2_0).toEqual(['team1', 'team2']);
    });

    it('应该在没有提供任何字段时不执行更新', async () => {
      mockDatabaseService.get.mockResolvedValue({
        winners2_0: JSON.stringify([]),
        winners2_1: JSON.stringify([]),
        losers_bracket: JSON.stringify([]),
        eliminated_3rd: JSON.stringify([]),
        eliminated_0_3: JSON.stringify([]),
      });

      await service.update({});

      expect(mockDatabaseService.run).not.toHaveBeenCalled();
    });

    it('应该更新 losersBracket 分类', async () => {
      mockDatabaseService.run.mockResolvedValue(undefined);
      mockDatabaseService.get.mockResolvedValue({
        winners2_0: JSON.stringify([]),
        winners2_1: JSON.stringify([]),
        losers_bracket: JSON.stringify(['team1']),
        eliminated_3rd: JSON.stringify([]),
        eliminated_0_3: JSON.stringify([]),
      });

      await service.update({ losersBracket: ['team1'] });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('losers_bracket = ?'),
        expect.any(Array),
      );
    });

    it('应该更新 eliminated3rd 和 eliminated0_3 分类', async () => {
      mockDatabaseService.run.mockResolvedValue(undefined);
      mockDatabaseService.get.mockResolvedValue({
        winners2_0: JSON.stringify([]),
        winners2_1: JSON.stringify([]),
        losers_bracket: JSON.stringify([]),
        eliminated_3rd: JSON.stringify(['team1']),
        eliminated_0_3: JSON.stringify(['team2']),
      });

      await service.update({
        eliminated3rd: ['team1'],
        eliminated0_3: ['team2'],
      });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('eliminated_3rd = ?'),
        expect.any(Array),
      );
    });
  });
});
