import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from '../../src/modules/matches/matches.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

describe('Matches Integration Tests', () => {
  let service: MatchesService;
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
        MatchesService,
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

    service = module.get<MatchesService>(MatchesService);
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
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        team_a_id TEXT,
        team_b_id TEXT,
        score_a INTEGER DEFAULT 0,
        score_b INTEGER DEFAULT 0,
        winner_id TEXT,
        round TEXT,
        status TEXT DEFAULT 'upcoming',
        start_time TEXT,
        stage TEXT NOT NULL,
        swiss_record TEXT,
        swiss_day INTEGER,
        elimination_bracket TEXT,
        elimination_game_number INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async function cleanupTables() {
    await databaseService.run('DELETE FROM matches');
  }

  describe('CRUD Operations', () => {
    it('should create and retrieve a match', async () => {
      const match = {
        id: 'match-1',
        teamAId: 'team-1',
        teamBId: 'team-2',
        stage: 'swiss' as const,
        round: '第一轮',
        swissRecord: '0-0',
        swissDay: 1,
      };

      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, swiss_record, swiss_day, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [match.id, match.teamAId, match.teamBId, match.stage, match.round, match.swissRecord, match.swissDay, 'upcoming']
      );

      mockCacheService.get.mockReturnValue(undefined);
      const found = await service.findOne(match.id);
      expect(found.id).toBe(match.id);
      expect(found.stage).toBe(match.stage);
    });

    it('should update match scores', async () => {
      const match = {
        id: 'match-1',
        teamAId: 'team-1',
        teamBId: 'team-2',
        stage: 'swiss' as const,
        round: '第一轮',
      };

      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [match.id, match.teamAId, match.teamBId, match.stage, match.round, 'upcoming']
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      const updated = await service.update(match.id, {
        scoreA: 2,
        scoreB: 1,
        winnerId: 'team-1',
      });

      expect(updated.scoreA).toBe(2);
      expect(updated.scoreB).toBe(1);
      expect(updated.winnerId).toBe('team-1');
    });

    it('should throw NotFoundException for non-existent match', async () => {
      mockCacheService.get.mockReturnValue(undefined);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Cache Integration', () => {
    it('should cache matches after first retrieval', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming']
      );

      mockCacheService.get.mockReturnValue(undefined);
      const first = await service.findAll();
      expect(first).toHaveLength(1);

      mockCacheService.get.mockReturnValue(first);
      const second = await service.findAll();
      expect(second).toHaveLength(1);
    });

    it('should clear cache after update', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming']
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      await service.update('match-1', { scoreA: 2 });

      expect(mockCacheService.del).toHaveBeenCalledWith('match:match-1');
    });
  });

  describe('Match Filtering', () => {
    it('should filter by stage', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'upcoming']
      );
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-2', 'team-3', 'team-4', 'elimination', '决赛', 'upcoming']
      );

      mockCacheService.get.mockReturnValue(undefined);
      const swissMatches = await service.findAll('swiss');
      expect(swissMatches).toHaveLength(1);
      expect(swissMatches[0].stage).toBe('swiss');
    });
  });

  describe('Score Management', () => {
    it('should clear scores', async () => {
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status, score_a, score_b, winner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['match-1', 'team-1', 'team-2', 'swiss', '第一轮', 'finished', 2, 1, 'team-1']
      );

      mockCacheService.get.mockReturnValue(undefined);
      mockCacheService.del.mockReturnValue(undefined);

      const cleared = await service.clearScores('match-1');
      expect(cleared.scoreA).toBe(0);
      expect(cleared.scoreB).toBe(0);
      expect(cleared.winnerId).toBeNull();
      expect(cleared.status).toBe('upcoming');
    });
  });
});
