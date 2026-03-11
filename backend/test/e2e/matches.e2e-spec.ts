import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MatchesModule } from '../../src/modules/matches/matches.module';
import { TeamsModule } from '../../src/modules/teams/teams.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { Match } from '../../src/modules/matches/entities/match.entity';
import { Team } from '../../src/modules/teams/entities/team.entity';
import { User } from '../../src/modules/users/entities/user.entity';

describe('MatchesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let adminToken: string;
  let createdMatchId: string;
  let teamAId: string;
  let teamBId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Match, Team, User],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([Match, Team, User]),
        MatchesModule,
        TeamsModule,
        AuthModule,
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();

    // 创建用户并登录
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'matchuser',
        password: 'password123',
        email: 'match@example.com',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'matchuser',
        password: 'password123',
      });
    authToken = loginResponse.body.access_token;

    // 创建管理员
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'matchadmin',
        password: 'password123',
        email: 'matchadmin@example.com',
        role: 'admin',
      });

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'matchadmin',
        password: 'password123',
      });
    adminToken = adminLoginResponse.body.access_token;

    // 创建两个测试队伍
    const teamAResponse = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: '队伍A',
      });
    teamAId = teamAResponse.body.id;

    const teamBResponse = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: '队伍B',
      });
    teamBId = teamBResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('比赛创建流程', () => {
    it('POST /matches - 应该成功创建比赛', async () => {
      const response = await request(app.getHttpServer())
        .post('/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeTeamId: teamAId,
          awayTeamId: teamBId,
          scheduledTime: new Date(Date.now() + 86400000).toISOString(),
          location: '测试场地',
          description: '测试比赛',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('homeTeamId');
      expect(response.body).toHaveProperty('awayTeamId');
      createdMatchId = response.body.id;
    });

    it('POST /matches - 应该拒绝相同的队伍', () => {
      return request(app.getHttpServer())
        .post('/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeTeamId: teamAId,
          awayTeamId: teamAId,
          scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(400);
    });

    it('POST /matches - 应该拒绝过去的时间', () => {
      return request(app.getHttpServer())
        .post('/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeTeamId: teamAId,
          awayTeamId: teamBId,
          scheduledTime: new Date(Date.now() - 86400000).toISOString(),
        })
        .expect(400);
    });

    it('POST /matches - 应该拒绝无授权请求', () => {
      return request(app.getHttpServer())
        .post('/matches')
        .send({
          homeTeamId: teamAId,
          awayTeamId: teamBId,
          scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(401);
    });
  });

  describe('比赛查询流程', () => {
    it('GET /matches - 应该返回比赛列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /matches - 应该支持状态过滤', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches?status=SCHEDULED')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /matches - 应该支持日期范围过滤', async () => {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const response = await request(app.getHttpServer())
        .get(`/matches?startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /matches/:id - 应该返回特定比赛', async () => {
      const response = await request(app.getHttpServer())
        .get(`/matches/${createdMatchId}`)
        .expect(200);

      expect(response.body.id).toBe(createdMatchId);
      expect(response.body).toHaveProperty('homeTeam');
      expect(response.body).toHaveProperty('awayTeam');
    });

    it('GET /matches/:id - 应该处理不存在的比赛', () => {
      return request(app.getHttpServer())
        .get('/matches/999999')
        .expect(404);
    });
  });

  describe('比赛更新流程', () => {
    it('PUT /matches/:id - 应该成功更新比赛', async () => {
      const response = await request(app.getHttpServer())
        .put(`/matches/${createdMatchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          location: '更新后的场地',
          description: '更新后的描述',
        })
        .expect(200);

      expect(response.body.location).toBe('更新后的场地');
    });

    it('PUT /matches/:id - 应该拒绝更新已结束的比赛', async () => {
      // 创建一个已结束的比赛
      const finishedMatch = await request(app.getHttpServer())
        .post('/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeTeamId: teamAId,
          awayTeamId: teamBId,
          scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        });

      // 先更新比赛状态为已结束
      await request(app.getHttpServer())
        .patch(`/matches/${finishedMatch.body.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'FINISHED',
        });

      // 尝试更新已结束的比赛
      await request(app.getHttpServer())
        .put(`/matches/${finishedMatch.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          location: '新场地',
        })
        .expect(400);
    });
  });

  describe('比赛状态管理', () => {
    it('PATCH /matches/:id/status - 应该更新比赛状态', async () => {
      // 创建新比赛用于状态测试
      const newMatch = await request(app.getHttpServer())
        .post('/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeTeamId: teamAId,
          awayTeamId: teamBId,
          scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        });

      const response = await request(app.getHttpServer())
        .patch(`/matches/${newMatch.body.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'IN_PROGRESS',
        })
        .expect(200);

      expect(response.body.status).toBe('IN_PROGRESS');
    });

    it('PATCH /matches/:id/status - 应该拒绝无效的状态转换', async () => {
      await request(app.getHttpServer())
        .patch(`/matches/${createdMatchId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'INVALID_STATUS',
        })
        .expect(400);
    });
  });

  describe('比赛结果录入', () => {
    it('POST /matches/:id/result - 应该录入比赛结果', async () => {
      // 创建新比赛并设置为进行中
      const match = await request(app.getHttpServer())
        .post('/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeTeamId: teamAId,
          awayTeamId: teamBId,
          scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        });

      await request(app.getHttpServer())
        .patch(`/matches/${match.body.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'IN_PROGRESS',
        });

      const response = await request(app.getHttpServer())
        .post(`/matches/${match.body.id}/result`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          homeScore: 3,
          awayScore: 1,
          homeStats: { shots: 15, possession: 55 },
          awayStats: { shots: 8, possession: 45 },
        })
        .expect(200);

      expect(response.body.homeScore).toBe(3);
      expect(response.body.awayScore).toBe(1);
      expect(response.body.status).toBe('FINISHED');
    });

    it('POST /matches/:id/result - 应该拒绝负数比分', async () => {
      await request(app.getHttpServer())
        .post(`/matches/${createdMatchId}/result`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          homeScore: -1,
          awayScore: 0,
        })
        .expect(400);
    });
  });

  describe('比赛删除流程', () => {
    it('DELETE /matches/:id - 应该成功删除比赛', async () => {
      // 创建新比赛用于删除
      const matchToDelete = await request(app.getHttpServer())
        .post('/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeTeamId: teamAId,
          awayTeamId: teamBId,
          scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        });

      await request(app.getHttpServer())
        .delete(`/matches/${matchToDelete.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/matches/${matchToDelete.body.id}`)
        .expect(404);
    });

    it('DELETE /matches/:id - 应该拒绝删除已结束的比赛', async () => {
      await request(app.getHttpServer())
        .delete(`/matches/${createdMatchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('比赛统计', () => {
    it('GET /matches/stats/overview - 应该返回比赛统计概览', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches/stats/overview')
        .expect(200);

      expect(response.body).toHaveProperty('totalMatches');
      expect(response.body).toHaveProperty('upcomingMatches');
      expect(response.body).toHaveProperty('finishedMatches');
    });

    it('GET /matches/stats/team/:teamId - 应该返回队伍比赛统计', async () => {
      const response = await request(app.getHttpServer())
        .get(`/matches/stats/team/${teamAId}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalMatches');
      expect(response.body).toHaveProperty('wins');
      expect(response.body).toHaveProperty('draws');
      expect(response.body).toHaveProperty('losses');
    });
  });

  describe('即将到来的比赛', () => {
    it('GET /matches/upcoming - 应该返回即将开始的比赛', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches/upcoming')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /matches/upcoming - 应该支持限制数量', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches/upcoming?limit=5')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });
  });
});
