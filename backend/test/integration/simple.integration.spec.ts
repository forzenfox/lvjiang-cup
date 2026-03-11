import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from '../../src/modules/teams/teams.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

describe('Simple Integration Tests', () => {
  let teamsService: TeamsService;
  let databaseService: DatabaseService;
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

    teamsService = module.get<TeamsService>(TeamsService);
    databaseService = module.get<DatabaseService>(DatabaseService);

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

  describe('Teams CRUD', () => {
    it('should create and find a team', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        players: [],
      };

      const created = await teamsService.create(createDto);
      expect(created.name).toBe('Test Team');

      mockCacheService.get.mockReturnValue(undefined);
      const found = await teamsService.findOne(created.id);
      expect(found.name).toBe('Test Team');
    });

    it('should update a team', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Original Name',
        logo: 'logo.png',
        description: 'Original description',
        players: [],
      };

      await teamsService.create(createDto);

      mockCacheService.get.mockReturnValue(undefined);
      const updated = await teamsService.update('team-1', { name: 'Updated Name' });
      expect(updated.name).toBe('Updated Name');
    });

    it('should delete a team', async () => {
      const createDto = {
        id: 'team-1',
        name: 'Test Team',
        logo: 'logo.png',
        description: 'Test description',
        players: [],
      };

      await teamsService.create(createDto);
      await teamsService.remove('team-1');

      mockCacheService.get.mockReturnValue(undefined);
      await expect(teamsService.findOne('team-1')).rejects.toThrow(NotFoundException);
    });

    it('should find all teams', async () => {
      await teamsService.create({
        id: 'team-1',
        name: 'Team 1',
        logo: 'logo1.png',
        description: 'Description 1',
        players: [],
      });

      await teamsService.create({
        id: 'team-2',
        name: 'Team 2',
        logo: 'logo2.png',
        description: 'Description 2',
        players: [],
      });

      mockCacheService.get.mockReturnValue(undefined);
      const allTeams = await teamsService.findAll();
      expect(allTeams).toHaveLength(2);
    });
  });
});
