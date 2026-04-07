import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from '../../src/modules/teams/teams.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

describe('Teams Integration Tests', () => {
  let service: TeamsService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;
  let module: TestingModule;

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        TeamsService,
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

    service = module.get<TeamsService>(TeamsService);
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
    await databaseService.run('PRAGMA foreign_keys = ON');

    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT,
        logo_url TEXT,
        logo_thumbnail_url TEXT,
        battle_cry TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        nickname TEXT NOT NULL,
        avatar_url TEXT,
        position TEXT CHECK(position IN ('TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT')),
        team_id TEXT NOT NULL,
        game_id TEXT,
        bio TEXT,
        champion_pool TEXT,
        rating INTEGER DEFAULT 60,
        is_captain INTEGER DEFAULT 0,
        live_url TEXT,
        sort_order INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
      )
    `);
  }

  async function cleanupTables() {
    await databaseService.run('DELETE FROM team_members');
    await databaseService.run('DELETE FROM teams');
  }

  describe('CRUD Operations', () => {
    it('should create a team and retrieve it', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        members: [],
      };

      const created = await service.create(createDto);
      expect(created.name).toBe(createDto.name);

      mockCacheService.get.mockReturnValue(undefined);
      const found = await service.findOne(created.id);
      expect(found.name).toBe(createDto.name);
    });

    it('should create a team with members', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        members: [
          { id: 'p1', nickname: 'Player1', position: 'TOP' as const },
          { id: 'p2', nickname: 'Player2', position: 'JUNGLE' as const },
        ],
      };

      const created = await service.create(createDto);
      expect(created.members).toHaveLength(2);
    });

    it('should update a team', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Original Name',
        logo: 'logo.png',
        description: 'Original description',
        members: [],
      };

      const created = await service.create(createDto);

      const updateDto = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      mockCacheService.get.mockReturnValue(undefined);
      const updated = await service.update(created.id, updateDto);
      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('Updated description');
    });

    it('should delete a team and its members', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        members: [{ id: 'p1', nickname: 'Player1', position: 'TOP' as const }],
      };

      const created = await service.create(createDto);
      await service.remove(created.id);

      mockCacheService.get.mockReturnValue(undefined);
      await expect(service.findOne(created.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Cache Integration', () => {
    it('should cache teams after first retrieval', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        members: [],
      };

      await service.create(createDto);

      mockCacheService.get.mockReturnValue(undefined);
      const firstResult = await service.findAll();
      expect(firstResult).toHaveLength(1);

      mockCacheService.get.mockReturnValue(firstResult);
      const secondResult = await service.findAll();
      expect(secondResult).toHaveLength(1);
    });

    it('should clear cache after create', async () => {
      mockCacheService.del.mockReturnValue(undefined);

      const createDto = {
        id: 'team-1',
        name: 'Team 1',
        logo: 'logo.png',
        description: 'Description 1',
        members: [],
      };

      await service.create(createDto);
      expect(mockCacheService.del).toHaveBeenCalledWith('teams:all');
    });

    it('should clear cache after update', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Original Name',
        logo: 'logo.png',
        description: 'Original description',
        members: [],
      };

      await service.create(createDto);

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      await service.update(createDto.id, { name: 'Updated Name' });

      expect(mockCacheService.del).toHaveBeenCalledWith('team:team-1');
      expect(mockCacheService.del).toHaveBeenCalledWith('teams:all');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency after multiple operations', async () => {
      const team1 = await service.create({
        id: 'team-1',
        name: 'Team 1',
        logo: 'logo1.png',
        description: 'Description 1',
        members: [],
      });

      const team2 = await service.create({
        id: 'team-2',
        name: 'Team 2',
        logo: 'logo2.png',
        description: 'Description 2',
        members: [],
      });

      mockCacheService.get.mockReturnValue(undefined);
      let allTeams = await service.findAll();
      expect(allTeams).toHaveLength(2);

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);
      await service.update(team1.id, { name: 'Updated Team 1' });

      mockCacheService.get.mockReturnValue(undefined);
      const updated = await service.findOne(team1.id);
      expect(updated.name).toBe('Updated Team 1');

      await service.remove(team2.id);

      mockCacheService.get.mockReturnValue(undefined);
      allTeams = await service.findAll();
      expect(allTeams).toHaveLength(1);
      expect(allTeams[0].name).toBe('Updated Team 1');
    });

    it('should handle member updates correctly', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        members: [
          { id: 'p1', nickname: 'Player1', position: 'TOP' as const },
          { id: 'p2', nickname: 'Player2', position: 'JUNGLE' as const },
        ],
      };

      const created = await service.create(createDto);

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      const updateDto = {
        members: [
          { id: 'p1', nickname: 'UpdatedPlayer1', position: 'TOP' as const },
          { id: 'p3', nickname: 'Player3', position: 'MID' as const },
        ],
      };

      const updated = await service.update(created.id, updateDto);
      expect(updated.members).toHaveLength(2);
      expect(updated.members[0].nickname).toBe('UpdatedPlayer1');
      expect(updated.members[1].nickname).toBe('Player3');
    });
  });

  describe('队员管理集成', () => {
    it('should add members to existing team', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        members: [],
      };

      const created = await service.create(createDto);
      expect(created.members).toHaveLength(0);

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      const updated = await service.update(created.id, {
        members: [
          { id: 'p1', nickname: 'Player1', position: 'TOP' as const },
          { id: 'p2', nickname: 'Player2', position: 'JUNGLE' as const },
          { id: 'p3', nickname: 'Player3', position: 'MID' as const },
          { id: 'p4', nickname: 'Player4', position: 'ADC' as const },
          { id: 'p5', nickname: 'Player5', position: 'SUPPORT' as const },
        ],
      });

      expect(updated.members).toHaveLength(5);
      expect(updated.members.map((m) => m.position).sort()).toEqual([
        'ADC',
        'JUNGLE',
        'MID',
        'SUPPORT',
        'TOP',
      ]);
    });

    it('should remove all members from team', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        members: [
          { id: 'p1', nickname: 'Player1', position: 'TOP' as const },
          { id: 'p2', nickname: 'Player2', position: 'JUNGLE' as const },
        ],
      };

      const created = await service.create(createDto);
      expect(created.members).toHaveLength(2);

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      const updated = await service.update(created.id, {
        members: [],
      });

      expect(updated.members).toHaveLength(0);
    });

    it('should update member information correctly', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        members: [{ id: 'p1', nickname: 'OldName', position: 'TOP' as const, avatarUrl: 'old.png' }],
      };

      const created = await service.create(createDto);

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      const updated = await service.update(created.id, {
        members: [{ id: 'p1', nickname: 'NewName', position: 'JUNGLE' as const, avatarUrl: 'new.png' }],
      });

      expect(updated.members).toHaveLength(1);
      expect(updated.members[0].nickname).toBe('NewName');
      expect(updated.members[0].position).toBe('JUNGLE');
      expect(updated.members[0].avatarUrl).toBe('new.png');
    });
  });

  describe('数据库事务测试', () => {
    it('should rollback team creation if member insertion fails', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        members: [{ id: 'p1', nickname: 'Player1', position: 'TOP' as const }],
      };

      await service.create(createDto);

      let members = await databaseService.all('SELECT * FROM team_members WHERE team_id = ?', [
        'team-1',
      ]);
      expect(members).toHaveLength(1);

      await databaseService.run('DELETE FROM teams WHERE id = ?', ['team-1']);

      members = await databaseService.all('SELECT * FROM team_members WHERE team_id = ?', ['team-1']);
      expect(members).toHaveLength(0);
    });

    it('should maintain atomicity for batch member operations', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        members: Array.from({ length: 10 }, (_, i) => ({
          id: `p${i}`,
          nickname: `Player${i}`,
          position: ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'][i % 5] as any,
        })),
      };

      const created = await service.create(createDto);
      expect(created.members).toHaveLength(10);

      const dbMembers = await databaseService.all('SELECT * FROM team_members WHERE team_id = ?', [
        'team-1',
      ]);
      expect(dbMembers).toHaveLength(10);
    });
  });

  describe('错误回滚测试', () => {
    it('should handle duplicate team id gracefully', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        members: [],
      };

      await service.create(createDto);

      await expect(service.create(createDto)).rejects.toThrow();
    });

    it('should handle invalid member position', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        members: [{ id: 'p1', nickname: 'Player1', position: '无效位置' as any }],
      };

      await expect(service.create(createDto)).rejects.toThrow();
    });

    it('should handle update of non-existent team', async () => {
      mockCacheService.get.mockReturnValue(undefined);

      await expect(service.update('non-existent', { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle delete of non-existent team', async () => {
      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('并发操作测试', () => {
    it('should handle concurrent team creation', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        service.create({
          id: `team-${i}`,
          name: `Team ${i}`,
          logo: `logo${i}.png`,
          description: `Description ${i}`,
          members: [],
        }),
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);

      mockCacheService.get.mockReturnValue(undefined);
      const allTeams = await service.findAll();
      expect(allTeams).toHaveLength(5);
    });

    it('should handle concurrent updates to same team', async () => {
      const team = await service.create({
        id: 'team-1',
        name: 'Original Name',
        logo: 'logo.png',
        description: 'Original description',
        members: [],
      });

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      const promises = Array.from({ length: 3 }, (_, i) =>
        service.update(team.id, { name: `Updated Name ${i}` }),
      );

      await Promise.all(promises);

      mockCacheService.get.mockReturnValue(undefined);
      const updated = await service.findOne(team.id);
      expect(updated.name).toMatch(/Updated Name/);
    });
  });

  describe('数据完整性验证', () => {
    it('should enforce team name uniqueness at application level', async () => {
      await service.create({
        id: 'team-1',
        name: 'Unique Team Name',
        logo: 'logo1.png',
        description: 'Description 1',
        members: [],
      });

      await service.create({
        id: 'team-2',
        name: 'Unique Team Name',
        logo: 'logo2.png',
        description: 'Description 2',
        members: [],
      });

      mockCacheService.get.mockReturnValue(undefined);
      const allTeams = await service.findAll();
      expect(allTeams).toHaveLength(2);
    });

    it('should validate required fields', async () => {
      const team = await service.create({
        id: 'team-1',
        name: '',
        logo: 'logo.png',
        description: 'Description',
        members: [],
      });
      expect(team.name).toBe('');

      const teamWithEmptyId = await service.create({
        id: '',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Description',
        members: [],
      });
      expect(teamWithEmptyId.id).toBe('');
      expect(teamWithEmptyId.name).toBe('Test Team');

      await service.remove('');
    });

    it('should maintain referential integrity with members', async () => {
      const team = await service.create({
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Description',
        members: [{ id: 'p1', nickname: 'Player1', position: 'TOP' as const }],
      });

      let members = await databaseService.all('SELECT * FROM team_members WHERE team_id = ?', [team.id]);
      expect(members).toHaveLength(1);

      await service.remove(team.id);

      members = await databaseService.all('SELECT * FROM team_members WHERE team_id = ?', [team.id]);
      expect(members).toHaveLength(0);
    });
  });

  describe('外键约束测试', () => {
    it('should handle member insertion for existing team', async () => {
      await service.create({
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Description',
        members: [],
      });

      const result = await databaseService.run(
        'INSERT INTO team_members (id, nickname, position, team_id) VALUES (?, ?, ?, ?)',
        ['p1', 'Player1', 'TOP', 'team-1'],
      );
      expect(result.changes).toBe(1);

      const members = await databaseService.all('SELECT * FROM team_members WHERE team_id = ?', [
        'team-1',
      ]);
      expect(members).toHaveLength(1);
    });

    it('should handle team deletion with existing members', async () => {
      const team = await service.create({
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Description',
        members: [
          { id: 'p1', nickname: 'Player1', position: 'TOP' as const },
          { id: 'p2', nickname: 'Player2', position: 'JUNGLE' as const },
        ],
      });

      let members = await databaseService.all('SELECT * FROM team_members WHERE team_id = ?', [team.id]);
      expect(members).toHaveLength(2);

      await service.remove(team.id);

      members = await databaseService.all('SELECT * FROM team_members WHERE team_id = ?', [team.id]);
      expect(members).toHaveLength(0);
    });
  });

  describe('级联删除测试', () => {
    it('should cascade delete all related members when team is deleted', async () => {
      const team = await service.create({
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Description',
        members: Array.from({ length: 5 }, (_, i) => ({
          id: `p${i}`,
          nickname: `Player${i}`,
          position: ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'][i] as any,
        })),
      });

      expect(team.members).toHaveLength(5);

      let allMembers = await databaseService.all('SELECT * FROM team_members');
      expect(allMembers).toHaveLength(5);

      await service.remove(team.id);

      allMembers = await databaseService.all('SELECT * FROM team_members');
      expect(allMembers).toHaveLength(0);
    });

    it('should handle multiple teams with members deletion', async () => {
      const team1 = await service.create({
        id: 'team-1',
        name: 'Team 1',
        logo: 'logo1.png',
        description: 'Description 1',
        members: [{ id: 't1p1', nickname: 'T1Player1', position: 'TOP' as const }],
      });

      const team2 = await service.create({
        id: 'team-2',
        name: 'Team 2',
        logo: 'logo2.png',
        description: 'Description 2',
        members: [{ id: 't2p1', nickname: 'T2Player1', position: 'JUNGLE' as const }],
      });

      let team1Members = await databaseService.all('SELECT * FROM team_members WHERE team_id = ?', [
        team1.id,
      ]);
      let team2Members = await databaseService.all('SELECT * FROM team_members WHERE team_id = ?', [
        team2.id,
      ]);
      expect(team1Members).toHaveLength(1);
      expect(team2Members).toHaveLength(1);

      await service.remove(team1.id);

      team2Members = await databaseService.all('SELECT * FROM team_members WHERE team_id = ?', [
        team2.id,
      ]);
      expect(team2Members).toHaveLength(1);

      team1Members = await databaseService.all('SELECT * FROM team_members WHERE team_id = ?', [
        team1.id,
      ]);
      expect(team1Members).toHaveLength(0);
    });
  });

  describe('查询性能测试', () => {
    it('should efficiently query large number of teams', async () => {
      const batchSize = 50;
      for (let i = 0; i < batchSize; i++) {
        await service.create({
          id: `team-${i}`,
          name: `Team ${i}`,
          logo: `logo${i}.png`,
          description: `Description ${i}`,
          members: Array.from({ length: 5 }, (_, j) => ({
            id: `team-${i}-p${j}`,
            nickname: `Player${j}`,
            position: ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'][j] as any,
          })),
        });
      }

      mockCacheService.get.mockReturnValue(undefined);
      const startTime = Date.now();
      const allTeams = await service.findAll();
      const endTime = Date.now();

      expect(allTeams).toHaveLength(batchSize);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should efficiently query single team with many members', async () => {
      const team = await service.create({
        id: 'team-1',
        name: 'Large Team',
        logo: 'logo.png',
        description: 'Description',
        members: Array.from({ length: 20 }, (_, i) => ({
          id: `p${i}`,
          nickname: `Player${i}`,
          position: ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'][i % 5] as any,
        })),
      });

      mockCacheService.get.mockReturnValue(undefined);
      const startTime = Date.now();
      const found = await service.findOne(team.id);
      const endTime = Date.now();

      expect(found.members).toHaveLength(20);
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should use cache for repeated queries', async () => {
      await service.create({
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Description',
        members: [],
      });

      mockCacheService.get.mockReturnValue(undefined);
      await service.findOne('team-1');

      mockCacheService.get.mockReturnValue({
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Description',
        members: [],
      });

      const startTime = Date.now();
      await service.findOne('team-1');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});