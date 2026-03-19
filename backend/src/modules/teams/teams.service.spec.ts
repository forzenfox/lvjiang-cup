import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../cache/cache.service';
import { NotFoundException } from '@nestjs/common';

describe('TeamsService', () => {
  let service: TeamsService;
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

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(service.findAll).toBeDefined();
    });

    it('should return teams from cache', async () => {
      const mockTeams = [{ id: '1', name: 'Team 1', players: [] }];
      mockCacheService.get.mockReturnValue(mockTeams);

      const result = await service.findAll();

      expect(result).toEqual(mockTeams);
      expect(mockCacheService.get).toHaveBeenCalledWith('teams:all');
    });

    it('should return teams from database when cache is empty', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all
        .mockResolvedValueOnce([{ id: '1', name: 'Team 1' }])
        .mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(mockDatabaseService.all).toHaveBeenCalledTimes(2);
    });
  });

  describe('findOne', () => {
    it('should be defined', () => {
      expect(service.findOne).toBeDefined();
    });

    it('should return a team from cache', async () => {
      const mockTeam = { id: '1', name: 'Team 1', players: [] };
      mockCacheService.get.mockReturnValue(mockTeam);

      const result = await service.findOne('1');

      expect(result).toEqual(mockTeam);
      expect(mockCacheService.get).toHaveBeenCalledWith('team:1');
    });

    it('should throw NotFoundException for non-existent team', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(service.create).toBeDefined();
    });
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(service.update).toBeDefined();
    });

    it('should throw NotFoundException for non-existent team', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      const updateDto = { name: 'Updated Name' };
      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should be defined', () => {
      expect(service.remove).toBeDefined();
    });

    it('should throw NotFoundException for non-existent team', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
