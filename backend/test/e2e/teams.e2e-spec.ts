import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TeamsModule } from '../../src/modules/teams/teams.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { DatabaseModule } from '../../src/database/database.module';
import { CacheModule } from '../../src/cache/cache.module';

describe('Teams API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdTeamId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({
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
          })],
        }),
        DatabaseModule,
        CacheModule,
        AuthModule,
        TeamsModule,
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
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /teams', () => {
    it('应该返回战队列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('应该返回空数组当没有战队', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /teams/:id', () => {
    it('应该返回单个战队', async () => {
      // 先创建一个战队
      const createResponse = await request(app.getHttpServer())
        .post('/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '测试战队',
          tag: 'TEST',
          logo: 'https://example.com/logo.png',
          description: '测试战队描述',
          players: [
            { name: 'Player1', position: '上单' },
            { name: 'Player2', position: '打野' },
          ],
        });

      createdTeamId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}`)
        .expect(200);

      expect(response.body.id).toBe(createdTeamId);
      expect(response.body.name).toBe('测试战队');
    });

    it('应该返回 404 当战队不存在', async () => {
      await request(app.getHttpServer())
        .get('/teams/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /admin/teams', () => {
    it('应该创建新战队（需认证）', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '新测试战队',
          tag: 'NEW',
          logo: 'https://example.com/new-logo.png',
          description: '新测试战队描述',
          players: [
            { name: 'NewPlayer1', position: '上单' },
            { name: 'NewPlayer2', position: '打野' },
            { name: 'NewPlayer3', position: '中单' },
            { name: 'NewPlayer4', position: 'ADC' },
            { name: 'NewPlayer5', position: '辅助' },
          ],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('新测试战队');
      expect(response.body.players).toHaveLength(5);
    });

    it('应该拒绝未认证请求', async () => {
      await request(app.getHttpServer())
        .post('/admin/teams')
        .send({
          name: '未授权战队',
        })
        .expect(401);
    });

    it('应该验证必填字段', async () => {
      await request(app.getHttpServer())
        .post('/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // 缺少 name
          tag: 'TEST',
        })
        .expect(400);
    });
  });

  describe('PUT /admin/teams/:id', () => {
    it('应该更新战队信息（需认证）', async () => {
      const response = await request(app.getHttpServer())
        .put(`/admin/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '更新后的战队名',
          description: '更新后的描述',
        })
        .expect(200);

      expect(response.body.name).toBe('更新后的战队名');
      expect(response.body.description).toBe('更新后的描述');
    });

    it('应该返回 404 当战队不存在', async () => {
      await request(app.getHttpServer())
        .put('/admin/teams/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '不存在的战队',
        })
        .expect(404);
    });

    it('应该拒绝未认证请求', async () => {
      await request(app.getHttpServer())
        .put(`/admin/teams/${createdTeamId}`)
        .send({
          name: '未授权更新',
        })
        .expect(401);
    });
  });

  describe('DELETE /admin/teams/:id', () => {
    it('应该删除战队（需认证）', async () => {
      // 先创建一个用于删除的战队
      const createResponse = await request(app.getHttpServer())
        .post('/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '待删除战队',
          tag: 'DELETE',
          players: [
            { name: 'DeletePlayer1', position: '上单' },
          ],
        });

      const teamIdToDelete = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/admin/teams/${teamIdToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 验证战队已被删除
      await request(app.getHttpServer())
        .get(`/teams/${teamIdToDelete}`)
        .expect(404);
    });

    it('应该返回 404 当战队不存在', async () => {
      await request(app.getHttpServer())
        .delete('/admin/teams/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('应该拒绝未认证请求', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/teams/${createdTeamId}`)
        .expect(401);
    });
  });
});
