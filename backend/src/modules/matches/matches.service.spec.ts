import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { NotFoundException } from '@nestjs/common';

describe('MatchesService', () => {
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
    it('should be defined', () => {
      expect(service.findAll).toBeDefined();
    });

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
  });

  describe('findOne', () => {
    it('should be defined', () => {
      expect(service.findOne).toBeDefined();
    });

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
      expect(mockCacheService.get).toHaveBeenCalledWith('match:1');
    });

    it('should throw NotFoundException for non-existent match', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(service.update).toBeDefined();
    });

    it('should throw NotFoundException for non-existent match', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      const updateDto = { scoreA: 2 };
      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearScores', () => {
    it('should be defined', () => {
      expect(service.clearScores).toBeDefined();
    });

    it('should throw NotFoundException for non-existent match', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.clearScores('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('initSlots', () => {
    it('should be defined', () => {
      expect(service.initSlots).toBeDefined();
    });
  });
});
