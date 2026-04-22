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

  describe('基类集成', () => {
    it('应该继承 BaseCachedService', () => {
      // 验证服务继承了基类方法
      expect(service['getCachePrefix']).toBeDefined();
      expect(service['findAllFromDb']).toBeDefined();
      expect(service['findOneFromDb']).toBeDefined();
      expect(service['getOrSetAll']).toBeDefined();
      expect(service['getOrSetOne']).toBeDefined();
      expect(service['clearAllCache']).toBeDefined();
      expect(service['clearRelatedCache']).toBeDefined();
    });

    it('应该使用正确的缓存前缀', () => {
      expect(service['getCachePrefix']()).toBe('teams');
    });
  });

  describe('findAll', () => {
    it('should return teams from cache', async () => {
      const mockTeams = [{ id: '1', name: 'Team 1', members: [] }];
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

    it('should cache results after database query', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.all
        .mockResolvedValueOnce([{ id: '1', name: 'Team 1' }])
        .mockResolvedValueOnce([]);

      await service.findAll();

      expect(mockCacheService.set).toHaveBeenCalledWith('teams:all', expect.any(Array));
    });
  });

  describe('findOne', () => {
    it('should return a team from cache', async () => {
      const mockTeam = { id: '1', name: 'Team 1', members: [] };
      mockCacheService.get.mockReturnValue(mockTeam);

      const result = await service.findOne('1');

      expect(result).toEqual(mockTeam);
      expect(mockCacheService.get).toHaveBeenCalledWith('teams:1');
    });

    it('should return a team from database when cache is empty', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue({ id: '1', name: 'Team 1' });
      mockDatabaseService.all.mockResolvedValue([]);

      const result = await service.findOne('1');

      expect(result.id).toBe('1');
      expect(mockDatabaseService.get).toHaveBeenCalledWith(expect.any(String), ['1']);
    });

    it('should cache result after database query', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue({ id: '1', name: 'Team 1' });
      mockDatabaseService.all.mockResolvedValue([]);

      await service.findOne('1');

      expect(mockCacheService.set).toHaveBeenCalledWith('teams:1', expect.any(Object));
    });

    it('should throw NotFoundException for non-existent team', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      mockDatabaseService.get.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create team with auto-generated UUID', async () => {
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });
      mockDatabaseService.get.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Team',
        logo: 'logo.png',
        battle_cry: 'Test',
      });

      const result = await service.create({
        name: 'Test Team',
        logo: 'logo.png',
        battleCry: 'Test',
      });

      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(result.name).toBe('Test Team');
    });

    it('should create team with auto-generated UUID when id not provided', async () => {
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });
      mockDatabaseService.get.mockResolvedValue({
        id: 'team-1',
        name: 'Test Team',
      });

      const result = await service.create({
        name: 'Test Team',
      });

      // 验证创建了战队 + 5 个默认队员 = 6 次调用
      expect(mockDatabaseService.run).toHaveBeenCalledTimes(6);
      expect(result.id).toBe('team-1');
    });

    it('should create default 5 players when not provided', async () => {
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });
      mockDatabaseService.get.mockResolvedValue({
        id: 'team-1',
        name: 'Test Team',
      });

      await service.create({
        name: 'Test Team',
      });

      // 验证插入了 5 个默认队员
      expect(mockDatabaseService.run).toHaveBeenCalledTimes(6); // 1 team + 5 players
    });

    it('should clear cache after creation', async () => {
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });
      mockDatabaseService.get.mockResolvedValue({
        id: 'team-1',
        name: 'Test Team',
      });

      await service.create({ name: 'Test Team' });

      expect(mockCacheService.del).toHaveBeenCalledWith('teams:all');
    });
  });

  describe('update', () => {
    it('should update team successfully', async () => {
      mockDatabaseService.get
        .mockResolvedValueOnce({ id: '1' }) // existence check
        .mockResolvedValue({
          id: '1',
          name: 'Updated Name',
          logo: 'new-logo.png',
        });

      const result = await service.update('1', { name: 'Updated Name', logo: 'new-logo.png' });

      expect(mockDatabaseService.run).toHaveBeenCalled();
      expect(result.name).toBe('Updated Name');
    });

    it('should update team with players', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });

      await service.update('1', {
        members: [{ id: 'p1', nickname: 'NewPlayer', position: 'MID' }],
      });

      // 验证删除了旧队员并插入了新队员
      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        'DELETE FROM team_members WHERE team_id = ?',
        ['1'],
      );
    });

    it('should clear cache after update', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: '1' });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });

      await service.update('1', { name: 'Updated' });

      expect(mockCacheService.del).toHaveBeenCalledWith('teams:all');
      expect(mockCacheService.del).toHaveBeenCalledWith('teams:1');
    });

    it('should throw NotFoundException for non-existent team', async () => {
      mockDatabaseService.get.mockResolvedValue(null);

      const updateDto = { name: 'Updated Name' };
      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should not update when no fields provided', async () => {
      mockDatabaseService.get.mockResolvedValue({ id: '1' });

      await service.update('1', {});

      expect(mockDatabaseService.run).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove team successfully', async () => {
      mockDatabaseService.get.mockResolvedValue({ id: '1' });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });

      await service.remove('1');

      expect(mockDatabaseService.run).toHaveBeenCalledWith('DELETE FROM teams WHERE id = ?', ['1']);
    });

    it('should delete team and rely on database cascade', async () => {
      mockDatabaseService.get.mockResolvedValue({ id: '1' });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });

      await service.remove('1');

      // 验证只删除了战队（数据库外键约束会级联删除队员）
      expect(mockDatabaseService.run).toHaveBeenCalledWith('DELETE FROM teams WHERE id = ?', ['1']);
    });

    it('should clear cache after removal', async () => {
      mockDatabaseService.get.mockResolvedValue({ id: '1' });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });

      await service.remove('1');

      expect(mockCacheService.del).toHaveBeenCalledWith('teams:all');
      expect(mockCacheService.del).toHaveBeenCalledWith('teams:1');
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
      expect(mockCacheService.del).toHaveBeenCalledWith('teams:team1');
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

      await expect(service.updateCaptain('non-existent', 'm1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for non-existent member in team', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: 'team1' }).mockResolvedValueOnce(null);

      await expect(service.updateCaptain('team1', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('边界值测试', () => {
    it('should handle very long team name', async () => {
      mockDatabaseService.get.mockResolvedValue({ id: '1' });
      const longName = 'A'.repeat(500);
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });

      await service.update('1', { name: longName });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('name'),
        expect.arrayContaining([longName]),
      );
    });

    it('should handle special characters in team name', async () => {
      mockDatabaseService.get.mockResolvedValue({ id: '1' });
      const specialName = "Team <script>alert('xss')</script> ' OR 1=1--";
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });

      await service.update('1', { name: specialName });

      expect(mockDatabaseService.run).toHaveBeenCalled();
    });

    it('should handle empty string as team name in update', async () => {
      mockDatabaseService.get.mockResolvedValue({ id: '1' });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });

      await service.update('1', { name: '' });

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('name'),
        expect.arrayContaining(['']),
      );
    });

    it('should handle invalid UUID format', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: 'invalid-uuid' });
      mockDatabaseService.get.mockResolvedValue({
        id: 'invalid-uuid',
        name: 'Test',
      });

      const result = await service.findOne('invalid-uuid');

      expect(result.id).toBe('invalid-uuid');
    });

    it('should handle member with empty nickname', async () => {
      mockDatabaseService.get.mockResolvedValueOnce({ id: 'team1' });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });
      mockDatabaseService.get.mockResolvedValue({
        id: 'm1',
        team_id: 'team1',
        nickname: '',
        position: 'MID',
        is_captain: 0,
      });

      const result = await service.createMember('team1', { nickname: '', position: 'MID' });

      expect(mockDatabaseService.run).toHaveBeenCalled();
      expect(result.nickname).toBe('');
    });

    it('should handle team with maximum players count', async () => {
      mockDatabaseService.get.mockResolvedValue({ id: '1' });
      mockDatabaseService.run.mockResolvedValue({ changes: 1 });

      const manyMembers = Array.from({ length: 20 }, (_, i) => ({
        id: `p${i}`,
        nickname: `Player${i}`,
        position: 'TOP' as const,
      }));

      await service.update('1', { members: manyMembers });

      expect(mockDatabaseService.run).toHaveBeenCalled();
    });
  });
});
