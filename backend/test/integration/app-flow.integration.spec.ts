import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TeamsModule } from '../../src/modules/teams/teams.module';
import { MatchesModule } from '../../src/modules/matches/matches.module';
import { createTestApp, closeTestApp, TestAppResult } from '../helpers/test-app';
import { v4 as uuidv4 } from 'uuid';

describe('完整赛事管理工作流程 集成测试', () => {
  let app: INestApplication;
  let authToken: string;
  const createdTeamIds: string[] = [];
  let matchId: string;

  beforeAll(async () => {
    const result: TestAppResult = await createTestApp({
      extraModules: [TeamsModule, MatchesModule],
      initMatchSlots: true,
    });
    app = result.app;
    authToken = result.authToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('完整赛事管理工作流程', () => {
    it('1. 管理员登录 - 应该成功获取token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('token_type');
      expect(response.body.data.token_type).toBe('Bearer');

      authToken = response.body.data.access_token;
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
        { name: '胡氏集团', tag: 'HS', players: ['胡凯利', '凯利', '凯哥', '洞主', '阿洞'] },
        { name: '银剑君战队', tag: 'YJJ', players: ['银剑君', '剑君', '银酱', '银哥', '剑哥'] },
        { name: '二抛战队', tag: 'EP', players: ['二抛', '抛抛', '二哥', '阿抛', '抛哥'] },
        { name: '小蜜蜂战队', tag: 'XMF', players: ['小蜜蜂', '蜜蜂', '蜂哥', '蜜哥', '蜂蜂'] },
        { name: '大蛋儿战队', tag: 'DDE', players: ['大蛋', '蛋蛋', '蛋哥', '大蛋', '阿蛋'] },
      ];

      for (const teamData of teamNames) {
        const response = await request(app.getHttpServer())
          .post('/api/admin/teams')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            id: uuidv4(),
            name: teamData.name,
            tag: teamData.tag,
            logo: `https://example.com/${teamData.tag.toLowerCase()}-logo.png`,
            battleCry: `${teamData.name}是一支实力强劲的战队`,
            players: teamData.players.map((nickname, index) => ({
              id: uuidv4(),
              nickname,
              position: ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'][index],
            })),
          })
          .expect(201);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.name).toBe(teamData.name);

        createdTeamIds.push(response.body.data.id);
      }

      expect(createdTeamIds).toHaveLength(8);
    });

    it('3. 验证8支战队已创建 - 应该返回8支战队', async () => {
      const response = await request(app.getHttpServer()).get('/api/teams').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(8);

      const teamNames = response.body.data.map((team: any) => team.name);
      expect(teamNames).toContain('驴酱战队');
      expect(teamNames).toContain('小卖部战队');
      expect(teamNames).toContain('鱼酱战队');
      expect(teamNames).toContain('胡氏集团');
    });

    it('4. 获取比赛列表 - 应该返回初始化的比赛槽位', async () => {
      const response = await request(app.getHttpServer()).get('/api/matches').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      matchId = response.body.data[0].id;
    });

    it('5. 更新比赛比分 - 应该成功更新比赛结果', async () => {
      let teamAId = createdTeamIds[0];
      let teamBId = createdTeamIds[1];

      if (!teamAId || !teamBId) {
        const teamAResponse = await request(app.getHttpServer())
          .post('/api/admin/teams')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            id: uuidv4(),
            name: '比赛战队A',
            tag: 'MATCHA',
            players: [{ id: uuidv4(), nickname: 'PlayerA', position: 'TOP' }],
          })
          .expect(201);
        teamAId = teamAResponse.body.data.id;

        const teamBResponse = await request(app.getHttpServer())
          .post('/api/admin/teams')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            id: uuidv4(),
            name: '比赛战队B',
            tag: 'MATCHB',
            players: [{ id: uuidv4(), nickname: 'PlayerB', position: 'TOP' }],
          })
          .expect(201);
        teamBId = teamBResponse.body.data.id;
      }

      const response = await request(app.getHttpServer())
        .put(`/api/admin/matches/${matchId}`)
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

      expect(response.body.data.scoreA).toBe(2);
      expect(response.body.data.scoreB).toBe(1);
      expect(response.body.data.status).toBe('finished');
      expect(response.body.data.winnerId).toBe(teamAId);
    });

    it('6. 更新比赛状态 - 应该成功更新比赛状态为进行中', async () => {
      const matchesResponse = await request(app.getHttpServer()).get('/api/matches').expect(200);

      const anotherMatchId = matchesResponse.body.data[1]?.id || matchId;

      const response = await request(app.getHttpServer())
        .put(`/api/admin/matches/${anotherMatchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          teamAId: createdTeamIds[2],
          teamBId: createdTeamIds[3],
          status: 'ongoing',
        })
        .expect(200);

      expect(response.body.data.status).toBe('ongoing');
    });

    it('7. 按阶段筛选比赛 - 应该正确筛选瑞士轮和淘汰赛', async () => {
      const swissResponse = await request(app.getHttpServer())
        .get('/api/matches?stage=swiss')
        .expect(200);

      expect(swissResponse.body).toHaveProperty('data');
      expect(Array.isArray(swissResponse.body.data)).toBe(true);
      swissResponse.body.data.forEach((match: any) => {
        expect(match.stage).toBe('swiss');
      });

      const eliminationResponse = await request(app.getHttpServer())
        .get('/api/matches?stage=elimination')
        .expect(200);

      expect(eliminationResponse.body).toHaveProperty('data');
      expect(Array.isArray(eliminationResponse.body.data)).toBe(true);
      eliminationResponse.body.data.forEach((match: any) => {
        expect(match.stage).toBe('elimination');
      });
    });

    it('8. 验证数据一致性 - 战队和比赛数据应该一致', async () => {
      const teamsResponse = await request(app.getHttpServer()).get('/api/teams').expect(200);

      const matchesResponse = await request(app.getHttpServer()).get('/api/matches').expect(200);

      const teamIds = new Set(teamsResponse.body.data.map((team: any) => team.id));

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
        .delete(`/api/admin/matches/${matchId}/scores`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.scoreA).toBe(0);
      expect(response.body.data.scoreB).toBe(0);
      expect(response.body.data.winnerId).toBeNull();
      expect(response.body.data.status).toBe('upcoming');
    });

    it('10. 更新战队信息 - 应该成功更新战队', async () => {
      let teamIdToUpdate = createdTeamIds[0];

      if (!teamIdToUpdate) {
        const createResponse = await request(app.getHttpServer())
          .post('/api/admin/teams')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            id: uuidv4(),
            name: '待更新测试战队',
            tag: 'UPDATE',
            players: [{ id: uuidv4(), nickname: 'UpdatePlayer', position: 'TOP' }],
          })
          .expect(201);
        teamIdToUpdate = createResponse.body.data.id;
      }

      const response = await request(app.getHttpServer())
        .put(`/api/admin/teams/${teamIdToUpdate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '更新后的驴酱战队',
          battleCry: '这是更新后的描述',
        })
        .expect(200);

      expect(response.body.data.name).toBe('更新后的驴酱战队');
      expect(response.body.data.battleCry).toBe('这是更新后的描述');
    });

    it('11. 删除战队 - 应该成功删除战队', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: '待删除战队',
          tag: 'DELETE',
          players: [{ id: uuidv4(), nickname: 'DeletePlayer1', position: 'TOP' }],
        })
        .expect(201);

      const teamIdToDelete = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/api/admin/teams/${teamIdToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data.message).toBe('Team deleted successfully');

      await request(app.getHttpServer()).get(`/api/teams/${teamIdToDelete}`).expect(404);
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
      const response = await request(app.getHttpServer())
        .get('/api/teams/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });

    it('应该返回 404 当比赛不存在', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/matches/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('全局错误处理', () => {
    it('应该处理验证错误', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          tag: 'TEST',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(400);
    });

    it('应该处理认证错误', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
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
        .post('/api/admin/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(400);
    });

    it('应该处理未处理的HTTP方法', async () => {
      const response = await request(app.getHttpServer()).patch('/api/teams').expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内响应', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer()).get('/api/teams').expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(500);
    });

    it('并发请求应该正常处理', async () => {
      const promises = Array(10)
        .fill(null)
        .map(() => request(app.getHttpServer()).get('/api/teams'));

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });
});
