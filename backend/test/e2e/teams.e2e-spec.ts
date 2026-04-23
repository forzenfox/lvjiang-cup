import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { TeamsModule } from '../../src/modules/teams/teams.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { DatabaseModule } from '../../src/database/database.module';
import { CacheModule } from '../../src/cache/cache.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';
import { v4 as uuidv4 } from 'uuid';

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
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // 添加全局前缀与生产环境一致
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: false,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );
    // 添加全局过滤器和拦截器
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();

    // 登录获取 token
    const loginResponse = await request(app.getHttpServer()).post('/api/admin/auth/login').send({
      username: 'admin',
      password: 'admin123',
    });

    authToken = loginResponse.body.data.access_token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/teams', () => {
    it('空列表 - 应该返回空数组当没有战队', async () => {
      const response = await request(app.getHttpServer()).get('/api/teams').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('有数据 - 应该返回战队列表', async () => {
      // 先创建一个战队
      await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: '测试战队1',
          tag: 'TEST1',
          players: [{ id: uuidv4(), nickname: 'Player1', position: 'TOP' }],
        });

      const response = await request(app.getHttpServer()).get('/api/teams').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/teams/:id', () => {
    it('单个战队 - 应该返回单个战队', async () => {
      // 先创建一个战队
      const createResponse = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: '测试战队GET',
          tag: 'TESTGET',
          logo: 'https://example.com/logo.png',
          battleCry: '测试战队描述',
          players: [
            { id: uuidv4(), nickname: 'Player1', position: 'TOP' },
            { id: uuidv4(), nickname: 'Player2', position: 'JUNGLE' },
          ],
        });

      createdTeamId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .get(`/api/teams/${createdTeamId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdTeamId);
      expect(response.body.data.name).toBe('测试战队GET');
      expect(response.body.data).toHaveProperty('members');
      expect(Array.isArray(response.body.data.members)).toBe(true);
    });

    it('未找到 - 应该返回 404 当战队不存在', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/teams/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('POST /api/admin/teams', () => {
    it('创建成功 - 应该创建新战队（需认证）', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: '新测试战队POST',
          tag: 'NEWPOST',
          logo: 'https://example.com/new-logo.png',
          battleCry: '新测试战队描述',
          players: [
            { id: uuidv4(), nickname: 'NewPlayer1', position: 'TOP' },
            { id: uuidv4(), nickname: 'NewPlayer2', position: 'JUNGLE' },
            { id: uuidv4(), nickname: 'NewPlayer3', position: 'MID' },
            { id: uuidv4(), nickname: 'NewPlayer4', position: 'ADC' },
            { id: uuidv4(), nickname: 'NewPlayer5', position: 'SUPPORT' },
          ],
        })
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('新测试战队POST');
    });

    it('验证失败 - 应该验证必填字段', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // 缺少 name
          id: uuidv4(),
          tag: 'TEST',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(400);
    });

    it('认证失败 - 应该拒绝未认证请求', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .send({
          id: uuidv4(),
          name: '未授权战队',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('认证失败 - 应该拒绝无效token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          id: uuidv4(),
          name: '无效token战队',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('认证失败 - 应该拒绝过期token', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          id: uuidv4(),
          name: '过期token战队',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('认证失败 - 应该拒绝错误格式的Authorization头', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', 'Basic admin:admin123')
        .send({
          id: uuidv4(),
          name: '错误格式战队',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('认证失败 - 应该拒绝缺少Authorization头', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .send({
          id: uuidv4(),
          name: '缺少头战队',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('PUT /api/admin/teams/:id', () => {
    it('更新成功 - 应该更新战队信息（需认证）', async () => {
      // 先创建一个战队用于更新
      const createResponse = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: '待更新战队',
          tag: 'UPDATE',
          players: [{ id: uuidv4(), nickname: 'DeletePlayer1', position: 'TOP' }],
        });

      const teamIdToUpdate = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .put(`/api/admin/teams/${teamIdToUpdate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '更新后的战队',
          battleCry: '更新后的描述',
        })
        .expect(200);

      expect(response.body.data.name).toBe('更新后的战队');
      expect(response.body.data.battleCry).toBe('更新后的描述');
    });

    it('未找到 - 应该返回 404 当战队不存在', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/admin/teams/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '不存在的战队',
        })
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });

    it('认证失败 - 应该拒绝未认证请求', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/admin/teams/${createdTeamId}`)
        .send({
          name: '未授权更新',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/admin/teams/:id', () => {
    it('删除成功 - 应该删除战队（需认证）', async () => {
      // 先创建一个用于删除的战队
      const createResponse = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: '待删除战队',
          tag: 'DELETE',
          players: [{ id: uuidv4(), nickname: 'DeletePlayer1', position: 'TOP' }],
        });

      const teamIdToDelete = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/api/admin/teams/${teamIdToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data.message).toBe('Team deleted successfully');

      // 验证战队已被删除
      await request(app.getHttpServer()).get(`/api/teams/${teamIdToDelete}`).expect(404);
    });

    it('未找到 - 应该返回 404 当战队不存在', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/admin/teams/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(404);
    });

    it('认证失败 - 应该拒绝未认证请求', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/admin/teams/${createdTeamId}`)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('Response Format - 响应格式验证', () => {
    it('应该返回正确的成功响应格式', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: '格式测试战队',
          tag: 'FORMAT',
          players: [{ id: uuidv4(), nickname: 'Player1', position: 'TOP' }],
        })
        .expect(201);

      // 验证响应包含必要的字段
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('members');
      expect(typeof response.body.data.id).toBe('string');
      expect(typeof response.body.data.name).toBe('string');
      expect(Array.isArray(response.body.data.members)).toBe(true);
    });

    it('应该返回正确的错误响应格式', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // 缺少必填字段
          id: uuidv4(),
          tag: 'TEST',
        })
        .expect(400);

      // 验证错误响应格式
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('Performance - 性能测试', () => {
    it('应该在100ms内响应', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer()).get('/api/teams').expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(100);
    });

    it('创建战队应该在200ms内响应', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: '性能测试战队',
          tag: 'PERF',
          players: [{ id: uuidv4(), nickname: 'Player1', position: 'TOP' }],
        })
        .expect(201);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(200);
    });
  });

  describe('Concurrent - 并发请求测试', () => {
    it('应该处理并发读取请求', async () => {
      // 先创建一些测试数据
      await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: '并发测试战队1',
          tag: 'CONC1',
          players: [{ id: uuidv4(), nickname: 'Player1', position: 'TOP' }],
        });

      // 并发发起多个读取请求
      const promises = Array(10)
        .fill(null)
        .map(() => request(app.getHttpServer()).get('/api/teams'));

      const responses = await Promise.all(promises);

      // 所有请求都应该成功
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    it('应该处理并发创建请求', async () => {
      const promises = Array(5)
        .fill(null)
        .map((_, index) =>
          request(app.getHttpServer())
            .post('/api/admin/teams')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              id: uuidv4(),
              name: `并发创建战队${index}`,
              tag: `CONC${index}`,
              players: [{ id: uuidv4(), nickname: `Player${index}`, position: 'TOP' }],
            }),
        );

      const responses = await Promise.all(promises);

      // 所有请求都应该成功
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.name).toBe(`并发创建战队${index}`);
      });
    });
  });

  describe('Boundary - 边界值测试', () => {
    it('应该处理最小长度战队名', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: 'A', // 单个字符
          tag: 'MIN',
          players: [{ id: uuidv4(), nickname: 'Player1', position: 'TOP' }],
        })
        .expect(201);

      expect(response.body.data.name).toBe('A');
    });

    it('应该处理较长战队名', async () => {
      const longName = '这是一个非常长的战队名称用于测试边界值情况';
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: longName,
          tag: 'LONG',
          players: [{ id: uuidv4(), nickname: 'Player1', position: 'TOP' }],
        })
        .expect(201);

      expect(response.body.data.name).toBe(longName);
    });

    it('应该处理特殊字符战队名', async () => {
      const specialName = '战队@#$%^&*()_+测试';
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: specialName,
          tag: 'SPEC',
          players: [{ id: uuidv4(), nickname: 'Player1', position: 'TOP' }],
        })
        .expect(201);

      expect(response.body.data.name).toBe(specialName);
    });

    it('应该处理空选手列表', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: '无选手战队',
          tag: 'NOPLY',
          players: [],
        })
        .expect(201);

      // 服务会自动创建 5 个默认队员（上单、打野、中单、ADC、辅助）
      expect(response.body.data.members).toHaveLength(5);
    });

    it('应该处理较多选手', async () => {
      const players = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: uuidv4(),
          nickname: `Player${i}`,
          position: i < 5 ? 'TOP' : 'JUNGLE',
        }));

      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id: uuidv4(),
          name: '多选手战队',
          tag: 'MANY',
          players,
        })
        .expect(201);

      // 服务目前只会自动创建 5 个默认队员，不处理请求中的队员列表
      expect(response.body.data.members).toHaveLength(5);
    });
  });
});
