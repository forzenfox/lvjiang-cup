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
    flush: jest.fn(),
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

    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS team_players (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
      )
    `);
  }

  async function cleanupTables() {
    await databaseService.run('DELETE FROM team_players');
    await databaseService.run('DELETE FROM teams');
  }

  describe('CRUD Operations', () => {
    it('should create a team and retrieve it', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        players: [],
      };

      const created = await service.create(createDto);
      expect(created.name).toBe(createDto.name);

      mockCacheService.get.mockReturnValue(undefined);
      const found = await service.findOne(created.id);
      expect(found.name).toBe(createDto.name);
    });

    it('should create a team with players', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        players: [
          { id: 'p1', name: 'Player1', position: '上单' as const },
          { id: 'p2', name: 'Player2', position: '打野' as const },
        ],
      };

      const created = await service.create(createDto);
      expect(created.players).toHaveLength(2);
    });

    it('should update a team', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Original Name',
        logo: 'logo.png',
        description: 'Original description',
        players: [],
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

    it('should delete a team and its players', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        players: [
          { id: 'p1', name: 'Player1', position: '上单' as const },
        ],
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
        players: [],
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
      mockCacheService.flush.mockReturnValue(undefined);

      const createDto = {
        id: 'team-1',
        name: 'Team 1',
        logo: 'logo.png',
        description: 'Description 1',
        players: [],
      };

      await service.create(createDto);
      expect(mockCacheService.flush).toHaveBeenCalled();
    });

    it('should clear cache after update', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Original Name',
        logo: 'logo.png',
        description: 'Original description',
        players: [],
      };

      await service.create(createDto);

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);
      mockCacheService.flush.mockReturnValue(undefined);

      await service.update(createDto.id, { name: 'Updated Name' });

      expect(mockCacheService.del).toHaveBeenCalledWith('team:team-1');
      expect(mockCacheService.flush).toHaveBeenCalled();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency after multiple operations', async () => {
      const team1 = await service.create({
        id: 'team-1',
        name: 'Team 1',
        logo: 'logo1.png',
        description: 'Description 1',
        players: [],
      });

      const team2 = await service.create({
        id: 'team-2',
        name: 'Team 2',
        logo: 'logo2.png',
        description: 'Description 2',
        players: [],
      });

      mockCacheService.get.mockReturnValue(undefined);
      let allTeams = await service.findAll();
      expect(allTeams).toHaveLength(2);

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);
      mockCacheService.flush.mockReturnValue(undefined);
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

    it('should handle player updates correctly', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        players: [
          { id: 'p1', name: 'Player1', position: '上单' as const },
          { id: 'p2', name: 'Player2', position: '打野' as const },
        ],
      };

      const created = await service.create(createDto);

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);
      mockCacheService.flush.mockReturnValue(undefined);

      const updateDto = {
        players: [
          { id: 'p1', name: 'UpdatedPlayer1', position: '上单' as const },
          { id: 'p3', name: 'Player3', position: '中单' as const },
        ],
      };

      const updated = await service.update(created.id, updateDto);
      expect(updated.players).toHaveLength(2);
      expect(updated.players[0].name).toBe('UpdatedPlayer1');
      expect(updated.players[1].name).toBe('Player3');
    });
  });
});
