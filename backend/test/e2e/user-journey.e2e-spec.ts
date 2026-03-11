import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { TeamsModule } from '../../src/modules/teams/teams.module';
import { MatchesModule } from '../../src/modules/matches/matches.module';
import { User } from '../../src/modules/users/entities/user.entity';
import { Team } from '../../src/modules/teams/entities/team.entity';
import { Match } from '../../src/modules/matches/entities/match.entity';

/**
 * 端到端用户旅程测试
 * 模拟完整用户操作流程
 */
describe('用户旅程测试 (e2e)', () => {
  let app: INestApplication;

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
          entities: [User, Team, Match],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([User, Team, Match]),
        AuthModule,
        UsersModule,
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('完整用户注册到创建比赛流程', () => {
    let authToken: string;
    let userId: string;
    let teamAId: string;
    let teamBId: string;
    let matchId: string;

    it('步骤 1: 用户注册', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'journeyuser',
          password: 'password123',
          email: 'journey@example.com',
          nickname: '旅程测试用户',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('journeyuser');
      userId = response.body.id;
    });

    it('步骤 2: 用户登录', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'journeyuser',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      authToken = response.body.access_token;
    });

    it('步骤 3: 获取用户信息', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.username).toBe('journeyuser');
    });

    it('步骤 4: 创建第一支队伍', async () => {
      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '红队',
          description: '红色阵营的队伍',
          logo: 'https://example.com/red-logo.png',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('红队');
      teamAId = response.body.id;
    });

    it('步骤 5: 创建第二支队伍', async () => {
      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '蓝队',
          description: '蓝色阵营的队伍',
          logo: 'https://example.com/blue-logo.png',
        })
        .expect(201);

      teamBId = response.body.id;
    });

    it('步骤 6: 查看队伍列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('步骤 7: 更新队伍信息', async () => {
      const response = await request(app.getHttpServer())
        .put(`/teams/${teamAId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: '更新后的红队描述',
        })
        .expect(200);

      expect(response.body.description).toBe('更新后的红队描述');
    });

    it('步骤 8: 创建比赛', async () => {
      const response = await request(app.getHttpServer())
        .post('/matches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          homeTeamId: teamAId,
          awayTeamId: teamBId,
          scheduledTime: new Date(Date.now() + 86400000).toISOString(),
          location: '主体育场',
          description: '红队 vs 蓝队',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      matchId = response.body.id;
    });

    it('步骤 9: 查看比赛详情', async () => {
      const response = await request(app.getHttpServer())
        .get(`/matches/${matchId}`)
        .expect(200);

      expect(response.body.id).toBe(matchId);
      expect(response.body.homeTeamId).toBe(teamAId);
      expect(response.body.awayTeamId).toBe(teamBId);
    });

    it('步骤 10: 查看即将到来的比赛', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches/upcoming')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('步骤 11: 修改密码', async () => {
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'password123',
          newPassword: 'newpassword456',
        })
        .expect(200);
    });

    it('步骤 12: 使用新密码重新登录', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'journeyuser',
          password: 'newpassword456',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      authToken = response.body.access_token;
    });

    it('步骤 13: 用户登出', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('管理员完整赛事管理流程', () => {
    let adminToken: string;
    let team1Id: string;
    let team2Id: string;
    let matchId: string;

    it('管理员登录', async () => {
      // 先注册管理员
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'adminjourney',
          password: 'admin123',
          email: 'adminjourney@example.com',
          role: 'admin',
        });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'adminjourney',
          password: 'admin123',
        })
        .expect(200);

      adminToken = response.body.access_token;
    });

    it('创建参赛队伍', async () => {
      const team1 = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '冠军队',
          description: '卫冕冠军',
        });
      team1Id = team1.body.id;

      const team2 = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '挑战者队',
          description: '新晋强队',
        });
      team2Id = team2.body.id;
    });

    it('安排比赛', async () => {
      const response = await request(app.getHttpServer())
        .post('/matches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          homeTeamId: team1Id,
          awayTeamId: team2Id,
          scheduledTime: new Date(Date.now() + 3600000).toISOString(),
          location: '决赛场地',
          description: '决赛',
        })
        .expect(201);

      matchId = response.body.id;
    });

    it('开始比赛', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/matches/${matchId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'IN_PROGRESS',
        })
        .expect(200);

      expect(response.body.status).toBe('IN_PROGRESS');
    });

    it('录入比赛结果', async () => {
      const response = await request(app.getHttpServer())
        .post(`/matches/${matchId}/result`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          homeScore: 2,
          awayScore: 1,
          homeStats: {
            shots: 12,
            shotsOnTarget: 5,
            possession: 52,
          },
          awayStats: {
            shots: 8,
            shotsOnTarget: 3,
            possession: 48,
          },
        })
        .expect(200);

      expect(response.body.homeScore).toBe(2);
      expect(response.body.awayScore).toBe(1);
      expect(response.body.status).toBe('FINISHED');
    });

    it('查看比赛统计', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches/stats/overview')
        .expect(200);

      expect(response.body).toHaveProperty('totalMatches');
      expect(response.body).toHaveProperty('finishedMatches');
    });

    it('查看队伍统计', async () => {
      const response = await request(app.getHttpServer())
        .get(`/matches/stats/team/${team1Id}`)
        .expect(200);

      expect(response.body).toHaveProperty('wins');
      expect(response.body.wins).toBeGreaterThanOrEqual(1);
    });
  });

  describe('错误场景测试', () => {
    it('未授权访问受保护资源', async () => {
      await request(app.getHttpServer())
        .post('/teams')
        .send({
          name: '未授权队伍',
        })
        .expect(401);
    });

    it('使用无效令牌', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('访问不存在的资源', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'journeyuser',
          password: 'newpassword456',
        });

      const token = loginResponse.body.access_token;

      await request(app.getHttpServer())
        .get('/teams/999999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('提交无效数据', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'journeyuser',
          password: 'newpassword456',
        });

      const token = loginResponse.body.access_token;

      await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '',
        })
        .expect(400);
    });
  });
});
