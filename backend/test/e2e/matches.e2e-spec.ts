import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { MatchesModule } from '../../src/modules/matches/matches.module';
import { TeamsModule } from '../../src/modules/teams/teams.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { DatabaseModule } from '../../src/database/database.module';
import { CacheModule } from '../../src/cache/cache.module';
import { MatchesService } from '../../src/modules/matches/matches.service';
import { v4 as uuidv4 } from 'uuid';

describe('Matches API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let matchId: string;
  let teamAId: string;
  let teamBId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              jwt: {
                secret: 'test-secret-key-for-jwt-signing-in-test-environment',
                expiresIn: '1h',
              },
              database: {
                path: ':memory:',
              },
              cache: {
                ttl: 60,
              },
              admin: {
                username: 'admin',
                password: 'admin123',
              },
            }),
          ],
        }),
        DatabaseModule,
        CacheModule,
        AuthModule,
        TeamsModule,
        MatchesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // 登录获取 token
    const loginResponse = await request(app.getHttpServer()).post('/admin/auth/login').send({
      username: 'admin',
      password: 'admin123',
    });

    authToken = loginResponse.body.access_token;

    // 创建两个战队用于比赛
    const teamAResponse = await request(app.getHttpServer())
      .post('/admin/teams')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        id: uuidv4(),
        name: '战队A',
        tag: 'TEAMA',
        players: [{ id: uuidv4(), name: 'PlayerA1', position: 'TOP' }],
      });
    teamAId = teamAResponse.body.id;

    const teamBResponse = await request(app.getHttpServer())
      .post('/admin/teams')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        id: uuidv4(),
        name: '战队B',
        tag: 'TEAMB',
        players: [{ id: uuidv4(), name: 'PlayerB1', position: 'TOP' }],
      });
    teamBId = teamBResponse.body.id;

    // 初始化比赛槽位
    const matchesService = moduleFixture.get<MatchesService>(MatchesService);
    await matchesService.initSlots();

    // 获取一个比赛ID用于测试
    const matchesResponse = await request(app.getHttpServer()).get('/matches').expect(200);

    if (matchesResponse.body.data && matchesResponse.body.data.length > 0) {
      matchId = matchesResponse.body.data[0].id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/matches', () => {
    it('列表查询 - 应该返回比赛列表', async () => {
      const response = await request(app.getHttpServer()).get('/matches').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('pageSize');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('筛选查询 - 应该按阶段筛选瑞士轮比赛', async () => {
      const response = await request(app.getHttpServer()).get('/matches?stage=swiss').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((match: any) => {
        expect(match.stage).toBe('swiss');
      });
    });

    it('筛选查询 - 应该按阶段筛选淘汰赛比赛', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches?stage=elimination')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach((match: any) => {
        expect(match.stage).toBe('elimination');
      });
    });
  });

  describe('GET /api/matches/:id', () => {
    it('单个比赛 - 应该返回单个比赛', async () => {
      const response = await request(app.getHttpServer()).get(`/matches/${matchId}`).expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(matchId);
      expect(response.body).toHaveProperty('round');
      expect(response.body).toHaveProperty('stage');
    });

    it('未找到 - 应该返回 404 当比赛不存在', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('PUT /api/admin/matches/:id', () => {
    it('更新比分 - 应该更新比赛比分（需认证）', async () => {
      const response = await request(app.getHttpServer())
        .put(`/admin/matches/${matchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          teamAId: teamAId,
          teamBId: teamBId,
          scoreA: 2,
          scoreB: 1,
          status: 'finished',
          winnerId: teamAId,
        })
        .expect(200);

      expect(response.body.scoreA).toBe(2);
      expect(response.body.scoreB).toBe(1);
      expect(response.body.status).toBe('finished');
      expect(response.body.winnerId).toBe(teamAId);
    });

    it('更新状态 - 应该更新比赛状态', async () => {
      // 先获取另一个比赛ID
      const matchesResponse = await request(app.getHttpServer()).get('/matches').expect(200);

      const anotherMatchId = matchesResponse.body.data[1]?.id || matchId;

      const response = await request(app.getHttpServer())
        .put(`/admin/matches/${anotherMatchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'ongoing',
        })
        .expect(200);

      expect(response.body.status).toBe('ongoing');
    });

    it('未找到 - 应该返回 404 当比赛不存在', async () => {
      const response = await request(app.getHttpServer())
        .put('/admin/matches/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scoreA: 2,
          scoreB: 1,
        })
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });

    it('认证失败 - 应该拒绝未认证请求', async () => {
      const response = await request(app.getHttpServer())
        .put(`/admin/matches/${matchId}`)
        .send({
          scoreA: 2,
          scoreB: 1,
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('认证失败 - 应该拒绝无效token', async () => {
      const response = await request(app.getHttpServer())
        .put(`/admin/matches/${matchId}`)
        .set('Authorization', 'Bearer invalid-token')
        .send({
          scoreA: 2,
          scoreB: 1,
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('认证失败 - 应该拒绝过期token', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const response = await request(app.getHttpServer())
        .put(`/admin/matches/${matchId}`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          scoreA: 2,
          scoreB: 1,
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('认证失败 - 应该拒绝错误格式的Authorization头', async () => {
      const response = await request(app.getHttpServer())
        .put(`/admin/matches/${matchId}`)
        .set('Authorization', 'Basic admin:admin123')
        .send({
          scoreA: 2,
          scoreB: 1,
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('认证失败 - 应该拒绝缺少Authorization头', async () => {
      const response = await request(app.getHttpServer())
        .put(`/admin/matches/${matchId}`)
        .send({
          scoreA: 2,
          scoreB: 1,
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/admin/matches/:id/scores', () => {
    it('清空比分 - 应该清空比赛比分（需认证）', async () => {
      // 先设置比分
      await request(app.getHttpServer())
        .put(`/admin/matches/${matchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scoreA: 2,
          scoreB: 1,
          status: 'finished',
          winnerId: teamAId,
        });

      // 清空比分
      const response = await request(app.getHttpServer())
        .delete(`/admin/matches/${matchId}/scores`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.scoreA).toBe(0);
      expect(response.body.scoreB).toBe(0);
      expect(response.body.winnerId).toBeNull();
      expect(response.body.status).toBe('upcoming');
    });

    it('未找到 - 应该返回 404 当比赛不存在', async () => {
      const response = await request(app.getHttpServer())
        .delete('/admin/matches/non-existent-id/scores')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });

    it('认证失败 - 应该拒绝未认证请求', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/admin/matches/${matchId}/scores`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('认证失败 - 应该拒绝无效token', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/admin/matches/${matchId}/scores`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('认证失败 - 应该拒绝过期token', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const response = await request(app.getHttpServer())
        .delete(`/admin/matches/${matchId}/scores`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('认证失败 - 应该拒绝错误格式的Authorization头', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/admin/matches/${matchId}/scores`)
        .set('Authorization', 'Basic admin:admin123')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('认证失败 - 应该拒绝缺少Authorization头', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/admin/matches/${matchId}/scores`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });
  });
});
