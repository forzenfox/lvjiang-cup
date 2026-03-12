import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { MatchesModule } from '../../src/modules/matches/matches.module';
import { TeamsModule } from '../../src/modules/teams/teams.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { DatabaseModule } from '../../src/database/database.module';
import { CacheModule } from '../../src/cache/cache.module';

describe('Matches API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
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
        DatabaseModule,
        CacheModule,
        AuthModule,
        TeamsModule,
        MatchesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();

    // 登录获取 token
    const loginResponse = await request(app.getHttpServer())
      .post('/admin/auth/login')
      .send({
        username: 'admin',
        password: 'admin123',
      });
    
    authToken = loginResponse.body.access_token;

    // 创建两个战队用于比赛
    const teamAResponse = await request(app.getHttpServer())
      .post('/admin/teams')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: '战队A',
        tag: 'TEAMA',
        players: [{ name: 'PlayerA1', position: '上单' }],
      });
    teamAId = teamAResponse.body.id;

    const teamBResponse = await request(app.getHttpServer())
      .post('/admin/teams')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: '战队B',
        tag: 'TEAMB',
        players: [{ name: 'PlayerB1', position: '上单' }],
      });
    teamBId = teamBResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /matches', () => {
    it('应该返回比赛列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('应该按阶段筛选瑞士轮比赛', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches?stage=swiss')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('应该按阶段筛选淘汰赛比赛', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches?stage=elimination')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /matches/:id', () => {
    it('应该返回单个比赛', async () => {
      // 先创建一个比赛
      const createResponse = await request(app.getHttpServer())
        .post('/admin/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          round: 'Round 1',
          stage: 'swiss',
          teamAId: teamAId,
          teamBId: teamBId,
          record: '0-0',
          scheduledTime: new Date().toISOString(),
        });

      createdMatchId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/matches/${createdMatchId}`)
        .expect(200);

      expect(response.body.id).toBe(createdMatchId);
      expect(response.body.round).toBe('Round 1');
    });

    it('应该返回 404 当比赛不存在', async () => {
      await request(app.getHttpServer())
        .get('/matches/non-existent-id')
        .expect(404);
    });
  });

  describe('PUT /admin/matches/:id', () => {
    it('应该更新比赛比分（需认证）', async () => {
      const response = await request(app.getHttpServer())
        .put(`/admin/matches/${createdMatchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
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

    it('应该更新比赛状态', async () => {
      const response = await request(app.getHttpServer())
        .put(`/admin/matches/${createdMatchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'ongoing',
        })
        .expect(200);

      expect(response.body.status).toBe('ongoing');
    });

    it('应该返回 404 当比赛不存在', async () => {
      await request(app.getHttpServer())
        .put('/admin/matches/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scoreA: 2,
          scoreB: 1,
        })
        .expect(404);
    });

    it('应该拒绝未认证请求', async () => {
      await request(app.getHttpServer())
        .put(`/admin/matches/${createdMatchId}`)
        .send({
          scoreA: 2,
          scoreB: 1,
        })
        .expect(401);
    });
  });

  describe('DELETE /admin/matches/:id/scores', () => {
    it('应该清空比赛比分（需认证）', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/admin/matches/${createdMatchId}/scores`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.scoreA).toBe(0);
      expect(response.body.scoreB).toBe(0);
      expect(response.body.winnerId).toBeNull();
      expect(response.body.status).toBe('upcoming');
    });

    it('应该返回 404 当比赛不存在', async () => {
      await request(app.getHttpServer())
        .delete('/admin/matches/non-existent-id/scores')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('应该拒绝未认证请求', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/matches/${createdMatchId}/scores`)
        .expect(401);
    });
  });
});
