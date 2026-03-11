import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from '../../src/modules/teams/teams.service';
import { MatchesService } from '../../src/modules/matches/matches.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { ConfigService } from '@nestjs/config';

describe('Cross-Module Integration Tests', () => {
  let teamsService: TeamsService;
  let matchesService: MatchesService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        TeamsService,
        MatchesService,
        DatabaseService,
        CacheService,
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
    matchesService = module.get<MatchesService>(MatchesService);
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
    cacheService.flush();
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
    await databaseService.run('DELETE FROM team_players');
    await databaseService.run('DELETE FROM teams');
  }

  describe('Team-Match Data Flow', () => {
    it('should create teams and matches with correct relationships', async () => {
      // 创建两个战队
      const team1 = await teamsService.create({
        id: 'team-1',
        name: 'Team Alpha',
        logo: 'alpha.png',
        description: 'First team',
        players: [],
      });

      const team2 = await teamsService.create({
        id: 'team-2',
        name: 'Team Beta',
        logo: 'beta.png',
        description: 'Second team',
        players: [],
      });

      // 创建比赛
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', team1.id, team2.id, 'swiss', '第一轮', 'upcoming']
      );

      // 验证战队存在
      const foundTeam1 = await teamsService.findOne(team1.id);
      const foundTeam2 = await teamsService.findOne(team2.id);
      expect(foundTeam1.name).toBe('Team Alpha');
      expect(foundTeam2.name).toBe('Team Beta');

      // 验证比赛存在
      const match = await matchesService.findOne('match-1');
      expect(match.teamAId).toBe(team1.id);
      expect(match.teamBId).toBe(team2.id);
    });

    it('should update match results and reflect in data', async () => {
      // 创建战队
      const team1 = await teamsService.create({
        id: 'team-1',
        name: 'Team Alpha',
        logo: 'alpha.png',
        description: 'First team',
        players: [],
      });

      const team2 = await teamsService.create({
        id: 'team-2',
        name: 'Team Beta',
        logo: 'beta.png',
        description: 'Second team',
        players: [],
      });

      // 创建比赛
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', team1.id, team2.id, 'swiss', '第一轮', 'upcoming']
      );

      // 更新比赛结果
      const updated = await matchesService.update('match-1', {
        scoreA: 2,
        scoreB: 1,
        winnerId: team1.id,
        status: 'finished' as 'finished' as any,
      });

      expect(updated.winnerId).toBe(team1.id);
      expect(updated.status).toBe('finished');

      // 验证战队数据不受影响
      const foundTeam1 = await teamsService.findOne(team1.id);
      expect(foundTeam1.name).toBe('Team Alpha');
    });

    it('should handle team deletion with matches', async () => {
      // 创建战队
      const team1 = await teamsService.create({
        id: 'team-1',
        name: 'Team Alpha',
        logo: 'alpha.png',
        description: 'First team',
        players: [],
      });

      const team2 = await teamsService.create({
        id: 'team-2',
        name: 'Team Beta',
        logo: 'beta.png',
        description: 'Second team',
        players: [],
      });

      // 创建比赛
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', team1.id, team2.id, 'swiss', '第一轮', 'upcoming']
      );

      // 删除战队
      await teamsService.remove(team1.id);

      // 验证比赛仍然存在（外键约束为 ON DELETE SET NULL 或类似）
      const match = await matchesService.findOne('match-1');
      expect(match).toBeDefined();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistency after multiple operations', async () => {
      // 创建多个战队
      const teams = [];
      for (let i = 1; i <= 4; i++) {
        const team = await teamsService.create({
          id: `team-${i}`,
          name: `Team ${i}`,
          logo: `logo${i}.png`,
          description: `Description ${i}`,
          players: [],
        });
        teams.push(team);
      }

      // 创建多场比赛
      for (let i = 0; i < 2; i++) {
        await databaseService.run(
          `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) VALUES (?, ?, ?, ?, ?, ?)`,
          [`match-${i + 1}`, teams[i * 2].id, teams[i * 2 + 1].id, 'swiss', `第${i + 1}轮`, 'upcoming']
        );
      }

      // 验证数据一致性
      const allTeams = await teamsService.findAll();
      const allMatches = await matchesService.findAll();

      expect(allTeams).toHaveLength(4);
      expect(allMatches).toHaveLength(2);

      // 更新一场比赛
      await matchesService.update('match-1', {
        scoreA: 2,
        scoreB: 1,
        winnerId: teams[0].id,
        status: 'finished' as 'finished' as any,
      });

      // 验证更新后的数据
      const updatedMatch = await matchesService.findOne('match-1');
      expect(updatedMatch.winnerId).toBe(teams[0].id);

      // 删除一个战队
      await teamsService.remove(teams[3].id);

      // 验证删除后的数据
      const remainingTeams = await teamsService.findAll();
      expect(remainingTeams).toHaveLength(3);
    });

    it('should handle cache invalidation across modules', async () => {
      // 创建战队
      const team = await teamsService.create({
        id: 'team-1',
        name: 'Team Alpha',
        logo: 'alpha.png',
        description: 'First team',
        players: [],
      });

      // 创建比赛
      await databaseService.run(
        `INSERT INTO matches (id, team_a_id, team_b_id, stage, round, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['match-1', team.id, 'team-2', 'swiss', '第一轮', 'upcoming']
      );

      // 查询战队和比赛，写入缓存
      await teamsService.findOne(team.id);
      await matchesService.findOne('match-1');

      // 更新战队
      await teamsService.update(team.id, { name: 'Updated Team' });

      // 验证战队缓存已清除
      const updatedTeam = await teamsService.findOne(team.id);
      expect(updatedTeam.name).toBe('Updated Team');

      // 更新比赛
      await matchesService.update('match-1', { scoreA: 2 });

      // 验证比赛缓存已清除
      const updatedMatch = await matchesService.findOne('match-1');
      expect(updatedMatch.scoreA).toBe(2);
    });
  });
});
