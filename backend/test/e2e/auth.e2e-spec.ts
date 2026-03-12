import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { TeamsModule } from '../../src/modules/teams/teams.module';
import { DatabaseModule } from '../../src/database/database.module';
import { CacheModule } from '../../src/cache/cache.module';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /admin/auth/login', () => {
    it('应该成功登录并返回 token', async () => {
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

    it('应该拒绝错误密码', async () => {
      await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('应该拒绝错误用户名', async () => {
      await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          username: 'wronguser',
          password: 'admin123',
        })
        .expect(401);
    });

    it('应该拒绝缺少用户名', async () => {
      await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          password: 'admin123',
        })
        .expect(400);
    });

    it('应该拒绝缺少密码', async () => {
      await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          username: 'admin',
        })
        .expect(400);
    });

    it('应该拒绝空请求体', async () => {
      await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('Protected Routes', () => {
    it('应该允许访问受保护路由（带有效token）', async () => {
      // 先登录获取 token
      const loginResponse = await request(app.getHttpServer())
        .post('/admin/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        });
      
      const token = loginResponse.body.access_token;

      // 访问受保护的路由（例如 teams）
      await request(app.getHttpServer())
        .get('/teams')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('应该拒绝访问受保护路由（无token）', async () => {
      await request(app.getHttpServer())
        .post('/admin/teams')
        .send({
          name: '测试战队',
        })
        .expect(401);
    });

    it('应该拒绝访问受保护路由（无效token）', async () => {
      await request(app.getHttpServer())
        .post('/admin/teams')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          name: '测试战队',
        })
        .expect(401);
    });

    it('应该拒绝访问受保护路由（过期token）', async () => {
      // 使用一个伪造的过期 token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      await request(app.getHttpServer())
        .post('/admin/teams')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          name: '测试战队',
        })
        .expect(401);
    });

    it('应该拒绝访问受保护路由（错误的token格式）', async () => {
      await request(app.getHttpServer())
        .post('/admin/teams')
        .set('Authorization', 'Basic admin:admin123')
        .send({
          name: '测试战队',
        })
        .expect(401);
    });
  });
});
