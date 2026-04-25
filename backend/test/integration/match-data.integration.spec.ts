import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { MatchDataService } from '../../src/modules/match-data/match-data.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';

describe('MatchData Integration Tests', () => {
  let matchDataService: MatchDataService;
  let databaseService: DatabaseService;
  let cacheService: jest.Mocked<CacheService>;
  let module: TestingModule;

  beforeAll(async () => {
    const cacheServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      flush: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        MatchDataService,
        DatabaseService,
        {
          provide: CacheService,
          useValue: cacheServiceMock,
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

    matchDataService = module.get<MatchDataService>(MatchDataService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get(CacheService) as jest.Mocked<CacheService>;

    await databaseService.onModuleInit();
    await createTables();
  });

  afterAll(async () => {
    await databaseService.onModuleDestroy();
    await module.close();
  });

  beforeEach(async () => {
    await cleanupTables();
    cacheService.flush.mockClear();
    cacheService.get.mockClear();
    cacheService.set.mockClear();
    cacheService.del.mockClear();
  });

  async function createTables() {
    await databaseService.run('PRAGMA foreign_keys = ON');

    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        round TEXT,
        stage TEXT,
        team_a_id TEXT,
        team_b_id TEXT,
        score_a INTEGER DEFAULT 0,
        score_b INTEGER DEFAULT 0,
        status TEXT DEFAULT 'upcoming',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_a_id) REFERENCES teams(id),
        FOREIGN KEY (team_b_id) REFERENCES teams(id)
      )
    `);

    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS match_games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id TEXT NOT NULL,
        game_number INTEGER NOT NULL,
        winner_team_id TEXT,
        game_duration TEXT,
        game_start_time TEXT,
        blue_team_id TEXT,
        red_team_id TEXT,
        blue_kills INTEGER DEFAULT 0,
        blue_gold INTEGER DEFAULT 0,
        blue_towers INTEGER DEFAULT 0,
        blue_dragons INTEGER DEFAULT 0,
        blue_barons INTEGER DEFAULT 0,
        red_kills INTEGER DEFAULT 0,
        red_gold INTEGER DEFAULT 0,
        red_towers INTEGER DEFAULT 0,
        red_dragons INTEGER DEFAULT 0,
        red_barons INTEGER DEFAULT 0,
        red_ban TEXT,
        blue_ban TEXT,
        video_bvid TEXT,
        status INTEGER DEFAULT 1,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
      )
    `);

    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS player_match_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_game_id INTEGER NOT NULL,
        player_id TEXT,
        kills INTEGER DEFAULT 0,
        deaths INTEGER DEFAULT 0,
        assists INTEGER DEFAULT 0,
        FOREIGN KEY (match_game_id) REFERENCES match_games(id) ON DELETE CASCADE
      )
    `);

    await databaseService.run(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);
  }

  async function cleanupTables() {
    await databaseService.run('DELETE FROM player_match_stats');
    await databaseService.run('DELETE FROM match_games');
    await databaseService.run('DELETE FROM matches');
    await databaseService.run('DELETE FROM teams');
  }

  describe('checkMatchDataExists', () => {
    it('当缓存命中时应该从缓存返回比赛数据存在性', async () => {
      const cachedData = { hasData: true, gameCount: 3 };
      cacheService.get.mockReturnValue(cachedData);

      const result = await matchDataService.checkMatchDataExists('match_1');

      expect(result).toEqual(cachedData);
      expect(cacheService.get).toHaveBeenCalledWith('match_data:check:match_1');
    });

    it('当缓存未命中时应该从数据库检查', async () => {
      cacheService.get.mockReturnValue(null);

      await databaseService.run('INSERT INTO matches (id, round, stage) VALUES (?, ?, ?)', [
        'match_1',
        'Round 1',
        'swiss',
      ]);

      await databaseService.run(
        'INSERT INTO match_games (match_id, game_number, winner_team_id) VALUES (?, ?, ?)',
        ['match_1', 1, 'team_a'],
      );

      await databaseService.run(
        'INSERT INTO match_games (match_id, game_number, winner_team_id) VALUES (?, ?, ?)',
        ['match_1', 2, 'team_b'],
      );

      const result = await matchDataService.checkMatchDataExists('match_1');

      expect(result.hasData).toBe(true);
      expect(result.gameCount).toBe(2);
    });

    it('当比赛不存在时应该抛出 NotFoundException', async () => {
      cacheService.get.mockReturnValue(null);

      await expect(matchDataService.checkMatchDataExists('non_existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('当比赛没有游戏数据时应该返回 hasData 为 false', async () => {
      cacheService.get.mockReturnValue(null);

      await databaseService.run('INSERT INTO matches (id, round, stage) VALUES (?, ?, ?)', [
        'match_2',
        'Round 2',
        'swiss',
      ]);

      const result = await matchDataService.checkMatchDataExists('match_2');

      expect(result.hasData).toBe(false);
      expect(result.gameCount).toBe(0);
    });
  });

  describe('getMatchSeries', () => {
    it('当缓存命中时应该从缓存返回系列赛信息', async () => {
      const cachedSeries = {
        matchId: 'match_1',
        teamA: { id: 'team_a', name: 'Team A' },
        teamB: { id: 'team_b', name: 'Team B' },
        format: 'BO3',
        games: [
          { gameNumber: 1, winnerTeamId: 'team_a', gameDuration: '30:00', hasData: true },
          { gameNumber: 2, winnerTeamId: 'team_b', gameDuration: '25:00', hasData: true },
          { gameNumber: 3, winnerTeamId: null, gameDuration: null, hasData: false },
        ],
      };
      cacheService.get.mockReturnValue(cachedSeries);

      const result = await matchDataService.getMatchSeries('match_1');

      expect(result).toEqual(cachedSeries);
    });

    it('当比赛不存在时应该抛出 NotFoundException', async () => {
      cacheService.get.mockReturnValue(null);

      await expect(matchDataService.getMatchSeries('non_existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('应该返回包含所有游戏的完整系列赛信息', async () => {
      cacheService.get.mockReturnValue(null);

      await databaseService.run(
        'INSERT INTO matches (id, round, stage, team_a_id, team_b_id, score_a, score_b) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['match_1', 'Round 1', 'swiss', 'team_a', 'team_b', 2, 1],
      );

      await databaseService.run(
        'INSERT INTO match_games (match_id, game_number, winner_team_id, game_duration) VALUES (?, ?, ?, ?)',
        ['match_1', 1, 'team_a', '30:00'],
      );

      await databaseService.run(
        'INSERT INTO match_games (match_id, game_number, winner_team_id, game_duration) VALUES (?, ?, ?, ?)',
        ['match_1', 2, 'team_b', '25:00'],
      );

      await databaseService.run(
        'INSERT INTO match_games (match_id, game_number, winner_team_id, game_duration) VALUES (?, ?, ?, ?)',
        ['match_1', 3, 'team_a', '35:00'],
      );

      const result = await matchDataService.getMatchSeries('match_1');

      expect(result.matchId).toBe('match_1');
      expect(result.games).toHaveLength(3);
      expect(result.games[0].gameNumber).toBe(1);
      expect(result.games[1].winnerTeamId).toBe('team_b');
      expect(result.games[2].gameDuration).toBe('35:00');
    });

    it('应该处理没有游戏数据的比赛', async () => {
      cacheService.get.mockReturnValue(null);

      await databaseService.run(
        'INSERT INTO matches (id, round, stage, team_a_id, team_b_id) VALUES (?, ?, ?, ?, ?)',
        ['match_2', 'Round 2', 'swiss', 'team_a', 'team_b'],
      );

      const result = await matchDataService.getMatchSeries('match_2');

      expect(result.matchId).toBe('match_2');
      expect(result.games).toHaveLength(0);
    });
  });

  describe('deleteMatchGameData', () => {
    it('应该成功删除比赛游戏数据', async () => {
      await databaseService.run('INSERT INTO matches (id, round, stage) VALUES (?, ?, ?)', [
        'match_1',
        'Round 1',
        'swiss',
      ]);

      await databaseService.run('INSERT INTO teams (id, name) VALUES (?, ?)', ['team_a', 'Team A']);

      await databaseService.run(
        'INSERT INTO match_games (match_id, game_number, winner_team_id) VALUES (?, ?, ?)',
        ['match_1', 1, 'team_a'],
      );

      const result = await matchDataService.deleteMatchGameData('match_1', 1, 'admin');

      expect(result.deleted).toBe(true);
      expect(result.gameNumber).toBe(1);

      const games = await databaseService.all(
        'SELECT * FROM match_games WHERE match_id = ? AND status = 1',
        ['match_1'],
      );
      expect(games).toHaveLength(0);
    });

    it('当比赛不存在时应该抛出 NotFoundException', async () => {
      await expect(
        matchDataService.deleteMatchGameData('non_existent', 1, 'admin'),
      ).rejects.toThrow(NotFoundException);
    });

    it('当游戏不存在时应该抛出 NotFoundException', async () => {
      await databaseService.run('INSERT INTO matches (id, round, stage) VALUES (?, ?, ?)', [
        'match_1',
        'Round 1',
        'swiss',
      ]);

      await expect(matchDataService.deleteMatchGameData('match_1', 99, 'admin')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('比赛数据生命周期', () => {
    it('应该支持创建比赛、添加游戏数据、查询完整系列的完整流程', async () => {
      cacheService.get.mockReturnValue(null);

      await databaseService.run(
        'INSERT INTO matches (id, round, stage, team_a_id, team_b_id) VALUES (?, ?, ?, ?, ?)',
        ['match_lifecycle', 'Finals', 'playoffs', 'team_a', 'team_b'],
      );

      await databaseService.run(
        'INSERT INTO match_games (match_id, game_number, winner_team_id, game_duration) VALUES (?, ?, ?, ?)',
        ['match_lifecycle', 1, 'team_a', '28:30'],
      );

      await databaseService.run(
        'INSERT INTO match_games (match_id, game_number, winner_team_id, game_duration) VALUES (?, ?, ?, ?)',
        ['match_lifecycle', 2, 'team_a', '32:15'],
      );

      await databaseService.run(
        'UPDATE matches SET score_a = 2, score_b = 0, status = ? WHERE id = ?',
        ['finished', 'match_lifecycle'],
      );

      const seriesData = await matchDataService.getMatchSeries('match_lifecycle');

      expect(seriesData.matchId).toBe('match_lifecycle');
      expect(seriesData.games).toHaveLength(2);
      expect(seriesData.games.every((g: any) => g.hasData === true)).toBe(true);

      const dataExists = await matchDataService.checkMatchDataExists('match_lifecycle');
      expect(dataExists.hasData).toBe(true);
      expect(dataExists.gameCount).toBe(2);
    });

    it('应该验证比赛数据删除后的状态', async () => {
      await databaseService.run('INSERT INTO matches (id, round, stage) VALUES (?, ?, ?)', [
        'match_delete',
        'Round 1',
        'swiss',
      ]);

      await databaseService.run(
        'INSERT INTO match_games (match_id, game_number, winner_team_id) VALUES (?, ?, ?)',
        ['match_delete', 1, 'team_a'],
      );

      await databaseService.run(
        'INSERT INTO match_games (match_id, game_number, winner_team_id) VALUES (?, ?, ?)',
        ['match_delete', 2, 'team_b'],
      );

      const beforeDelete = await matchDataService.checkMatchDataExists('match_delete');
      expect(beforeDelete.gameCount).toBe(2);

      await matchDataService.deleteMatchGameData('match_delete', 1, 'admin');

      const afterDelete = await matchDataService.checkMatchDataExists('match_delete');
      expect(afterDelete.gameCount).toBe(1);
    });
  });

  describe('数据完整性验证', () => {
    it('应该维护比赛与游戏数据的关联完整性', async () => {
      await databaseService.run('INSERT INTO matches (id, round, stage) VALUES (?, ?, ?)', [
        'match_integrity',
        'Round 1',
        'swiss',
      ]);

      await databaseService.run(
        'INSERT INTO match_games (match_id, game_number, winner_team_id) VALUES (?, ?, ?)',
        ['match_integrity', 1, 'team_a'],
      );

      const games = await databaseService.all('SELECT * FROM match_games WHERE match_id = ?', [
        'match_integrity',
      ]);
      expect(games).toHaveLength(1);
      expect((games[0] as any).match_id).toBe('match_integrity');
    });

    it('应该在删除比赛时级联删除游戏数据', async () => {
      await databaseService.run('INSERT INTO matches (id, round, stage) VALUES (?, ?, ?)', [
        'match_cascade',
        'Round 1',
        'swiss',
      ]);

      await databaseService.run(
        'INSERT INTO match_games (match_id, game_number, winner_team_id) VALUES (?, ?, ?)',
        ['match_cascade', 1, 'team_a'],
      );

      await databaseService.run('DELETE FROM matches WHERE id = ?', ['match_cascade']);

      const games = await databaseService.all('SELECT * FROM match_games WHERE match_id = ?', [
        'match_cascade',
      ]);
      expect(games).toHaveLength(0);
    });
  });
});
