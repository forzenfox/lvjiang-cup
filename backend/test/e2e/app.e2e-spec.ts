import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '../../src/app.module';
import { DatabaseModule } from '../../src/database/database.module';
import { CacheModule } from '../../src/cache/cache.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { TeamsModule } from '../../src/modules/teams/teams.module';
import { MatchesModule } from '../../src/modules/matches/matches.module';
import { MatchesService } from '../../src/modules/matches/matches.service';
import { v4 as uuidv4 } from 'uuid';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  const createdTeamIds: string[] = [];
  let matchId: string;

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
        AppModule,
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

    // 初始化比赛槽位
    const matchesService = moduleFixture.get<MatchesService>(MatchesService);
    await matchesService.initSlots();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('完整赛事管理工作流', () => {
    it('1. 管理员登录 - 应该成功获取token', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('token_type');
      expect(response.body.token_type).toBe('Bearer');

      authToken = response.body.access_token;
    });

    it('2. 创建8支战队 - 应该成功创建所有战队', async () => {
      const teamNames = [
        { name: '驴酱战队', tag: 'LJ', players: ['洞主', '凯哥', '阿松', '小C', '余小C'] },
        {
          name: '小卖部战队',
          tag: 'XMB',
          players: ['小卖部老板', '店员A', '店员B', '店员C', '店员D'],
        },
        { name: '鱼酱战队', tag: 'YJ', players: ['鱼人', '水母', '鲨鱼', '鲸鱼', '海豚'] },
        { name: '胡氏集团', tag: 'HS', players: ['胡凯莉', '凯利', '凯哥', '洞主', '阿洞'] },
        { name: '银剑君战队', tag: 'YJJ', players: ['银剑君', '剑君', '银酱', '银哥', '剑哥'] },
        { name: '二抛战队', tag: 'EP', players: ['二抛', '抛抛', '二哥', '阿抛', '抛哥'] },
        { name: '小蜜蜂战队', tag: 'XMF', players: ['小蜜蜂', '蜜蜂', '蜂哥', '蜜哥', '蜂蜂'] },
        { name: '大蛋儿战队', tag: 'DDE', players: ['大蛋儿', '蛋蛋', '蛋哥', '大蛋', '阿蛋'] },
      ];

      for (const teamData of teamNames) {
        const response = await request(app.getHttpServer())
          .post('/admin/teams')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            id: uuidv4(),
            name: teamData.name,
            tag: teamData.tag,
            logo: `https://example.com/${teamData.tag.toLowerCase()}-logo.png`,
            description: `${teamData.name}是一支实力强劲的战队`,
            players: teamData.players.map((name, index) => ({
              id: uuidv4(),
              name,
              position: ['top', 'jungle', 'mid', 'bot', 'support'][index],
            })),
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(teamData.name);
        expect(response.body.players).toHaveLength(5);

        createdTeamIds.push(response.body.id);
      }

      expect(createdTeamIds).toHaveLength(8);
    });

    it('3. 验证8支战队已创建 - 应该返回8支战队', async () => {
      const response = await request(app.getHttpServer()).get('/teams').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(8);
      expect(response.body.total).toBe(8);

      // 验证战队名称
      const teamNames = response.body.data.map((team: any) => team.name);
      expect(teamNames).toContain('驴酱战队');
      expect(teamNames).toContain('小卖部战队');
      expect(teamNames).toContain('鱼酱战队');
      expect(teamNames).toContain('胡氏集团');
    });

    it('4. 获取比赛列表 - 应该返回初始化的比赛槽位', async () => {
      const response = await request(app.getHttpServer()).get('/matches').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // 保存一个比赛ID用于后续测试
      matchId = response.body.data[0].id;
    });

    it('5. 更新比赛比分 - 应该成功更新比赛结果', async () => {
      const response = await request(app.getHttpServer())
        .put(`/admin/matches/${matchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          teamAId: createdTeamIds[0],
          teamBId: createdTeamIds[1],
          scoreA: 2,
          scoreB: 1,
          status: 'finished',
          winnerId: createdTeamIds[0],
        })
        .expect(200);

      expect(response.body.scoreA).toBe(2);
      expect(response.body.scoreB).toBe(1);
      expect(response.body.status).toBe('finished');
      expect(response.body.winnerId).toBe(createdTeamIds[0]);
    });

    it('6. 更新比赛状态 - 应该成功更新比赛状态为进行中', async () => {
      // 获取另一个比赛ID
      const matchesResponse = await request(app.getHttpServer()).get('/matches').expect(200);

      const anotherMatchId = matchesResponse.body.data[1]?.id || matchId;

      const response = await request(app.getHttpServer())
        .put(`/admin/matches/${anotherMatchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          teamAId: createdTeamIds[2],
          teamBId: createdTeamIds[3],
          status: 'ongoing',
        })
        .expect(200);

      expect(response.body.status).toBe('ongoing');
    });

    it('7. 按阶段筛选比赛 - 应该正确筛选瑞士轮和淘汰赛', async () => {
      // 筛选瑞士轮
      const swissResponse = await request(app.getHttpServer())
        .get('/matches?stage=swiss')
        .expect(200);

      expect(swissResponse.body).toHaveProperty('data');
      expect(Array.isArray(swissResponse.body.data)).toBe(true);
      swissResponse.body.data.forEach((match: any) => {
        expect(match.stage).toBe('swiss');
      });

      // 筛选淘汰赛
      const eliminationResponse = await request(app.getHttpServer())
        .get('/matches?stage=elimination')
        .expect(200);

      expect(eliminationResponse.body).toHaveProperty('data');
      expect(Array.isArray(eliminationResponse.body.data)).toBe(true);
      eliminationResponse.body.data.forEach((match: any) => {
        expect(match.stage).toBe('elimination');
      });
    });

    it('8. 验证数据一致性 - 战队和比赛数据应该一致', async () => {
      // 获取所有战队
      const teamsResponse = await request(app.getHttpServer()).get('/teams').expect(200);

      // 获取所有比赛
      const matchesResponse = await request(app.getHttpServer()).get('/matches').expect(200);

      // 验证所有比赛中的战队ID都存在于战队列表中
      const teamIds = new Set(teamsResponse.body.data.map((team: any) => team.id));

      // 检查已分配战队的比赛
      matchesResponse.body.data.forEach((match: any) => {
        if (match.teamAId) {
          expect(teamIds.has(match.teamAId)).toBe(true);
        }
        if (match.teamBId) {
          expect(teamIds.has(match.teamBId)).toBe(true);
        }
      });
    });

    it('9. 清空比赛比分 - 应该成功重置比赛', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/admin/matches/${matchId}/scores`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.scoreA).toBe(0);
      expect(response.body.scoreB).toBe(0);
      expect(response.body.winnerId).toBeNull();
      expect(response.body.status).toBe('upcoming');
    });

    it('10. 更新战队信息 - 应该成功更新战队', async () => {
      const teamIdToUpdate = createdTeamIds[0];

      const response = await request(app.getHttpServer())
        .put(`/admin/teams/${teamIdToUpdate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '更新后的驴酱战队',
          description: '这是更新后的描述',
        })
        .expect(200);

      expect(response.body.name).toBe('更新后的驴酱战队');
      expect(response.body.description).toBe('这是更新后的描述');
    });

    it('11. 删除战队 - 应该成功删除战队', async () => {
      // 创建一个新的战队用于删除
      const createResponse = await request(app.getHttpServer())
        .post('/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: '待删除战队',
          tag: 'DELETE',
          players: [{ id: uuidv4(), name: 'DeletePlayer1', position: 'top' }],
        });

      const teamIdToDelete = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/admin/teams/${teamIdToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Team deleted successfully');

      // 验证战队已被删除
      await request(app.getHttpServer()).get(`/teams/${teamIdToDelete}`).expect(404);
    });
  });

  describe('404 处理', () => {
    it('应该返回 404 对于不存在的路由', async () => {
      const response = await request(app.getHttpServer()).get('/non-existent-route').expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });

    it('应该返回 404 对于不存在的API端点', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/non-existent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });

    it('应该返回 404 当战队不存在', async () => {
      const response = await request(app.getHttpServer()).get('/teams/non-existent-id').expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });

    it('应该返回 404 当比赛不存在', async () => {
      const response = await request(app.getHttpServer())
        .get('/matches/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('全局错误处理', () => {
    it('应该处理验证错误', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // 缺少必填字段 name
          id: uuidv4(),
          tag: 'TEST',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(400);
    });

    it('应该处理认证错误', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/teams')
        .send({
          id: uuidv4(),
          name: '测试战队',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('应该处理无效JSON格式', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(400);
    });

    it('应该处理未处理的HTTP方法', async () => {
      const response = await request(app.getHttpServer()).patch('/teams').expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内响应', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer()).get('/teams').expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(500);
    });

    it('并发请求应该正常处理', async () => {
      const promises = Array(10)
        .fill(null)
        .map(() => request(app.getHttpServer()).get('/teams'));

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });
});
