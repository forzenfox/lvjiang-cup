import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { User } from '../../src/modules/users/entities/user.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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
          entities: [User],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([User]),
        AuthModule,
        UsersModule,
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

  describe('用户注册流程', () => {
    it('POST /auth/register - 应该成功注册新用户', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          email: 'test@example.com',
          nickname: '测试用户',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('testuser');
      expect(response.body).not.toHaveProperty('password');
    });

    it('POST /auth/register - 应该拒绝重复用户名', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'duplicateuser',
          password: 'password123',
          email: 'dup@example.com',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'duplicateuser',
          password: 'password123',
          email: 'dup2@example.com',
        })
        .expect(409);
    });

    it('POST /auth/register - 应该拒绝无效邮箱格式', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'invalidemail',
          password: 'password123',
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('POST /auth/register - 应该拒绝短密码', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'shortpass',
          password: '123',
          email: 'short@example.com',
        })
        .expect(400);
    });

    it('POST /auth/register - 应该拒绝缺少必填字段', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'missingfields',
        })
        .expect(400);
    });
  });

  describe('用户登录流程', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'logintest',
          password: 'password123',
          email: 'login@example.com',
        });
    });

    it('POST /auth/login - 应该成功登录', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'logintest',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('logintest');
      authToken = response.body.access_token;
    });

    it('POST /auth/login - 应该拒绝错误密码', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'logintest',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('POST /auth/login - 应该拒绝不存在的用户', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        })
        .expect(401);
    });

    it('POST /auth/login - 应该拒绝缺少凭证', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('获取当前用户信息', () => {
    it('GET /auth/profile - 应该返回当前用户信息', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('id');
    });

    it('GET /auth/profile - 应该拒绝无令牌请求', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('GET /auth/profile - 应该拒绝无效令牌', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('密码修改流程', () => {
    it('POST /auth/change-password - 应该成功修改密码', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'logintest',
          password: 'password123',
        });

      const token = loginResponse.body.access_token;

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'password123',
          newPassword: 'newpassword456',
        })
        .expect(200);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'logintest',
          password: 'newpassword456',
        })
        .expect(200);
    });

    it('POST /auth/change-password - 应该拒绝错误的旧密码', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'logintest',
          password: 'newpassword456',
        });

      const token = response.body.access_token;

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          oldPassword: 'wrongpassword',
          newPassword: 'anotherpassword',
        })
        .expect(400);
    });
  });

  describe('登出流程', () => {
    it('POST /auth/logout - 应该成功登出', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });
});
