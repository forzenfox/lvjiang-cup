import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { StreamsModule } from '../../src/modules/streams/streams.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { DatabaseModule } from '../../src/database/database.module';
import { CacheModule } from '../../src/cache/cache.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';

describe('StreamsController E2E (e2e)', () => {
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
        StreamsModule,
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

  describe('GET /api/streams', () => {
    it('无需鉴权 - 应该返回所有直播列表', async () => {
      const response = await request(app.getHttpServer()).get('/api/streams').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/streams/active', () => {
    it('无需鉴权 - 应该返回活跃直播或404', async () => {
      const response = await request(app.getHttpServer()).get('/api/streams/active');
      // 可能返回200（有数据）或404（无数据）
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/streams/:id', () => {
    it('无需鉴权 - 应该返回 404 当直播不存在', async () => {
      await request(app.getHttpServer()).get('/api/streams/non_existent_id').expect(404);
    });
  });

  describe('POST /api/admin/streams', () => {
    const createDto = {
      title: '测试直播',
      url: 'https://example.com/stream',
      isLive: true,
    };

    it('无 token - 应该返回 401', async () => {
      await request(app.getHttpServer()).post('/api/admin/streams').send(createDto).expect(401);
    });

    it('无效 token - 应该返回 401', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/streams')
        .set('Authorization', 'Bearer invalid-token')
        .send(createDto)
        .expect(401);
    });
  });

  describe('PATCH /api/admin/streams/:id', () => {
    const updateDto = {
      title: '更新后的直播',
    };

    it('无 token - 应该返回 401', async () => {
      await request(app.getHttpServer())
        .patch('/api/admin/streams/test-id')
        .send(updateDto)
        .expect(401);
    });
  });

  describe('DELETE /api/admin/streams/:id', () => {
    it('无 token - 应该返回 401', async () => {
      await request(app.getHttpServer()).delete('/api/admin/streams/test-id').expect(401);
    });
  });

  describe('Response Format - 响应格式验证', () => {
    it('应该返回正确的错误响应格式', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/streams')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          title: '错误格式直播',
        })
        .expect(401);

      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });
  });
});
