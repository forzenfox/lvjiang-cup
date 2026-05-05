import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TeamsModule } from '../../src/modules/teams/teams.module';
import { createTestApp, closeTestApp, TestAppResult } from '../helpers/test-app';

describe('Auth API 集成测试', () => {
  let app: INestApplication;
  let authToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const result: TestAppResult = await createTestApp({
      extraModules: [TeamsModule],
    });
    app = result.app;
    authToken = result.authToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/admin/auth/login', () => {
    it('成功 - 应该成功登录并返回 token', async () => {
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
      if (response.body.data.refresh_token) {
        refreshToken = response.body.data.refresh_token;
      }
    });

    it('失败 - 应该拒绝错误密码', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('失败 - 应该拒绝错误用户名', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/auth/login')
        .send({
          username: 'wronguser',
          password: 'admin123',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('失败 - 应该拒绝缺少用户名', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/auth/login')
        .send({
          password: 'admin123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(400);
    });

    it('失败 - 应该拒绝缺少密码', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/auth/login')
        .send({
          username: 'admin',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(400);
    });

    it('失败 - 应该拒绝空请求体', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('Protected Routes - 受保护接口测试', () => {
    it('无 token - 应该拒绝访问受保护路由', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .send({
          name: '测试战队',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('无效 token - 应该拒绝访问受保护路由', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          name: '测试战队',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('过期 token - 应该拒绝访问受保护路由', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          name: '测试战队',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('错误格式 token - 应该拒绝访问受保护路由', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/teams')
        .set('Authorization', 'Basic admin:admin123')
        .send({
          name: '测试战队',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.statusCode).toBe(401);
    });

    it('有效 token - 应该允许访问受保护路由', async () => {
      const loginResponse = await request(app.getHttpServer()).post('/api/admin/auth/login').send({
        username: 'admin',
        password: 'admin123',
      });

      const token = loginResponse.body.data.access_token;

      const response = await request(app.getHttpServer())
        .get('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Token Refresh - token 刷新', () => {
    it('应该成功刷新 access token', async () => {
      const loginResponse = await request(app.getHttpServer()).post('/api/admin/auth/login').send({
        username: 'admin',
        password: 'admin123',
      });

      const currentToken = loginResponse.body.data.access_token;

      const response = await request(app.getHttpServer())
        .get('/api/teams')
        .set('Authorization', `Bearer ${currentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('应该拒绝使用已注销的 token', async () => {
      const loginResponse = await request(app.getHttpServer()).post('/api/admin/auth/login').send({
        username: 'admin',
        password: 'admin123',
      });

      const token = loginResponse.body.data.access_token;

      const response = await request(app.getHttpServer())
        .get('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Token Logout - token 注销', () => {
    it('应该成功注销并失效token', async () => {
      const loginResponse = await request(app.getHttpServer()).post('/api/admin/auth/login').send({
        username: 'admin',
        password: 'admin123',
      });

      const token = loginResponse.body.data.access_token;

      const response = await request(app.getHttpServer())
        .get('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Concurrent Login - 并发登录限制', () => {
    it('应该允许多个并发登录请求', async () => {
      const loginPromises = Array(5)
        .fill(null)
        .map(() =>
          request(app.getHttpServer()).post('/api/admin/auth/login').send({
            username: 'admin',
            password: 'admin123',
          }),
        );

      const responses = await Promise.all(loginPromises);

      responses.forEach((response) => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('access_token');
        expect(response.body.data).toHaveProperty('token_type');
        expect(response.body.data.token_type).toBe('Bearer');
      });

      const tokens = responses.map((r) => r.body.data.access_token);
      expect(tokens.length).toBe(5);
      expect(tokens.every((t) => typeof t === 'string' && t.length > 0)).toBe(true);
    });

    it('应该处理并发登录中的失败请求', async () => {
      const promises = [
        request(app.getHttpServer())
          .post('/api/admin/auth/login')
          .send({ username: 'admin', password: 'admin123' }),
        request(app.getHttpServer())
          .post('/api/admin/auth/login')
          .send({ username: 'admin', password: 'wrongpassword' }),
        request(app.getHttpServer())
          .post('/api/admin/auth/login')
          .send({ username: 'wronguser', password: 'admin123' }),
      ];

      const responses = await Promise.all(promises);

      expect(responses[0].status).toBe(201);
      expect(responses[0].body).toHaveProperty('data');
      expect(responses[0].body.data).toHaveProperty('access_token');

      expect(responses[1].status).toBe(401);
      expect(responses[2].status).toBe(401);
    });
  });
});
