import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { StreamersModule } from '../../src/modules/streamers/streamers.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { DatabaseModule } from '../../src/database/database.module';
import { CacheModule } from '../../src/cache/cache.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';
import { StreamerType } from '../../src/modules/streamers/streamers.service';

describe('StreamersController E2E (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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
        StreamersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: false,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );
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

  describe('GET /api/streamers', () => {
    it('无需鉴权 - 应该返回所有主播', async () => {
      const response = await request(app.getHttpServer()).get('/api/streamers').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/streamers/:id', () => {
    it('无需鉴权 - 应该返回 404 当主播不存在', async () => {
      await request(app.getHttpServer()).get('/api/streamers/non_existent_id').expect(404);
    });
  });

  describe('POST /api/admin/streamers', () => {
    const createDto = {
      nickname: '新主播',
      posterUrl: '/new.jpg',
      bio: '新主播简介',
      liveUrl: 'https://new.com',
      streamerType: StreamerType.GUEST,
    };

    it('无 token - 应该返回 401', async () => {
      await request(app.getHttpServer()).post('/api/admin/streamers').send(createDto).expect(401);
    });

    it('有 token - 应该创建主播成功', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/streamers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.nickname).toBe('新主播');
    });

    it('无效 token - 应该返回 401', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/streamers')
        .set('Authorization', 'Bearer invalid-token')
        .send(createDto)
        .expect(401);
    });
  });

  describe('PATCH /api/admin/streamers/:id', () => {
    const updateDto = {
      nickname: '更新后的主播',
      bio: '更新后的简介',
    };

    it('无 token - 应该返回 401', async () => {
      await request(app.getHttpServer())
        .patch('/api/admin/streamers/test-id')
        .send(updateDto)
        .expect(401);
    });

    it('有 token - 应该更新主播成功', async () => {
      // 先创建主播
      const createResponse = await request(app.getHttpServer())
        .post('/api/admin/streamers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: '待更新主播',
          posterUrl: '/update.jpg',
          bio: '待更新简介',
          liveUrl: 'https://update.com',
          streamerType: StreamerType.GUEST,
        });

      const streamerId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .patch(`/api/admin/streamers/${streamerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.data.nickname).toBe('更新后的主播');
    });
  });

  describe('DELETE /api/admin/streamers/:id', () => {
    it('无 token - 应该返回 401', async () => {
      await request(app.getHttpServer()).delete('/api/admin/streamers/test-id').expect(401);
    });

    it('有 token - 应该删除主播成功', async () => {
      // 先创建主播
      const createResponse = await request(app.getHttpServer())
        .post('/api/admin/streamers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: '待删除主播',
          posterUrl: '/delete.jpg',
          bio: '待删除简介',
          liveUrl: 'https://delete.com',
          streamerType: StreamerType.GUEST,
        });

      const streamerId = createResponse.body.data.id;

      await request(app.getHttpServer())
        .delete(`/api/admin/streamers/${streamerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // 验证主播已被删除
      await request(app.getHttpServer()).get(`/api/streamers/${streamerId}`).expect(404);
    });
  });

  describe('PATCH /api/admin/streamers/sort', () => {
    it('无 token - 应该返回 401', async () => {
      await request(app.getHttpServer())
        .patch('/api/admin/streamers/sort')
        .send({ orders: [] })
        .expect(401);
    });

    it('有 token - 应该批量更新排序成功', async () => {
      // 先创建两个主播
      const createResponse1 = await request(app.getHttpServer())
        .post('/api/admin/streamers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: '排序主播1',
          posterUrl: '/sort1.jpg',
          bio: '主播1简介',
          liveUrl: 'https://sort1.com',
          streamerType: StreamerType.GUEST,
        });

      const createResponse2 = await request(app.getHttpServer())
        .post('/api/admin/streamers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: '排序主播2',
          posterUrl: '/sort2.jpg',
          bio: '主播2简介',
          liveUrl: 'https://sort2.com',
          streamerType: StreamerType.GUEST,
        });

      const streamerId1 = createResponse1.body.data.id;
      const streamerId2 = createResponse2.body.data.id;

      const response = await request(app.getHttpServer())
        .patch('/api/admin/streamers/sort')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orders: [
            { id: streamerId2, sortOrder: 1 },
            { id: streamerId1, sortOrder: 2 },
          ],
        })
        .expect(200);

      // updateSort 返回 void，响应中 data 为 undefined 是正常的
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Response Format - 响应格式验证', () => {
    it('应该返回正确的成功响应格式', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/streamers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nickname: '格式测试主播',
          posterUrl: '/format.jpg',
          bio: '格式测试简介',
          liveUrl: 'https://format.com',
          streamerType: StreamerType.GUEST,
        })
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('nickname');
      expect(typeof response.body.data.id).toBe('string');
    });

    it('应该返回正确的错误响应格式', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/streamers')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          nickname: '错误格式主播',
        })
        .expect(401);

      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });
  });
});
