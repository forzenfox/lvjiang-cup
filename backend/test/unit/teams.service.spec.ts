import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from '../../src/modules/teams/teams.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
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

  describe('findMembersByTeamId', () => {
    it('should return members for a team', async () => {
      const mockMembers = [
        { id: 'm1', team_id: 'team1', nickname: 'Player1', position: 'MID', is_captain: 1 },
        { id: 'm2', team_id: 'team1', nickname: 'Player2', position: 'ADC', is_captain: 0 },
      ];
      mockDatabaseService.get.mockResolvedValue({ id: 'team1' });
      mockDatabaseService.all.mockResolvedValue(mockMembers);

      const result = await service.findMembersByTeamId('team1');

      expect(result).toHaveLength(2);
      expect(result[0].nickname).toBe('Player1');
      expect(result[0].isCaptain).toBe(true);
    });

    it('should throw NotFoundException for non-existent team', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.findMembersByTeamId('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMemberById', () => {
    it('should return a member', async () => {
      const mockMember = {
        id: 'm1',
        team_id: 'team1',
        nickname: 'Player1',
        position: 'MID',
        is_captain: 1,
        champion_pool: '["Ahri","Zed"]',
      };
      mockDatabaseService.get.mockResolvedValue(mockMember);

      const result = await service.findMemberById('m1');

      expect(result.nickname).toBe('Player1');
      expect(result.championPool).toEqual(['Ahri', 'Zed']);
    });

    it('should throw NotFoundException for non-existent member', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.findMemberById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createMember', () => {
    it('should create a new member', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: 'team1' });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });
      mockDatabaseService.get.mockResolvedValue({
        id: 'm1',
        team_id: 'team1',
        nickname: 'NewPlayer',
        position: 'TOP',
        is_captain: 0,
      });

      const result = await service.createMember('team1', {
        nickname: 'NewPlayer',
        position: 'TOP',
      });

      expect(mockDatabaseService.run).toHaveBeenCalled();
      expect(result.nickname).toBe('NewPlayer');
    });

    it('should throw NotFoundException for non-existent team', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(
        service.createMember('non-existent', { nickname: 'Player', position: 'MID' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should clear cache after creating member', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: 'team1' });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });
      mockDatabaseService.get.mockResolvedValue({
        id: 'm1',
        team_id: 'team1',
        nickname: 'Player',
        position: 'MID',
        is_captain: 0,
      });

      await service.createMember('team1', { nickname: 'Player', position: 'MID' });

      expect(mockCacheService.del).toHaveBeenCalledWith('teams:all');
      expect(mockCacheService.del).toHaveBeenCalledWith('team:team1');
    });
  });

  describe('updateMember', () => {
    it('should update a member', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({
        id: 'm1',
        team_id: 'team1',
        nickname: 'OldName',
        position: 'MID',
        is_captain: 0,
      });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });
      mockDatabaseService.get.mockResolvedValue({
        id: 'm1',
        team_id: 'team1',
        nickname: 'NewName',
        position: 'MID',
        is_captain: 0,
      });

      const result = await service.updateMember('m1', { nickname: 'NewName' });

      expect(result.nickname).toBe('NewName');
    });

    it('should throw NotFoundException for non-existent member', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.updateMember('non-existent', { nickname: 'Name' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update captain status and clear other captains', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({
        id: 'm1',
        team_id: 'team1',
        nickname: 'Player',
        position: 'MID',
        is_captain: 0,
      });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });
      mockDatabaseService.get.mockResolvedValue({
        id: 'm1',
        team_id: 'team1',
        nickname: 'Player',
        position: 'MID',
        is_captain: 1,
      });

      await service.updateMember('m1', { isCaptain: true });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE team_members SET is_captain = 0'),
        expect.any(Array),
      );
    });
  });

  describe('removeMember', () => {
    it('should remove a member', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({
        id: 'm1',
        team_id: 'team1',
        nickname: 'Player',
        position: 'MID',
        is_captain: 0,
      });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });

      await service.removeMember('m1');

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        'DELETE FROM team_members WHERE id = ?',
        ['m1'],
      );
      expect(mockCacheService.del).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent member', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.removeMember('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCaptain', () => {
    it('should update team captain', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: 'team1' })
        .mockResolvedValueOnce({ id: 'm1', team_id: 'team1', nickname: 'Player' });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });
      mockDatabaseService.get.mockResolvedValue({
        id: 'm1',
        team_id: 'team1',
        nickname: 'Player',
        is_captain: 1,
      });

      const result = await service.updateCaptain('team1', 'm1');

      expect(result.isCaptain).toBe(true);
    });

    it('should throw NotFoundException for non-existent team', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.updateCaptain('non-existent', 'm1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for non-existent member in team', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: 'team1' }).mockResolvedValueOnce(null);

      await expect(service.updateCaptain('team1', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
