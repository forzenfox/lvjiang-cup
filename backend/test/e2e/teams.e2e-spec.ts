import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TeamsModule } from '../../src/modules/teams/teams.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { Team } from '../../src/modules/teams/entities/team.entity';
import { User } from '../../src/modules/users/entities/user.entity';

describe('TeamsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let adminToken: string;
  let createdTeamId: string;

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
          entities: [Team, User],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([Team, User]),
        TeamsModule,
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

    // 创建普通用户并登录
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'teamuser',
        password: 'password123',
        email: 'team@example.com',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'teamuser',
        password: 'password123',
      });
    authToken = loginResponse.body.access_token;

    // 创建管理员用户
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'adminuser',
        password: 'password123',
        email: 'admin@example.com',
        role: 'admin',
      });

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'adminuser',
        password: 'password123',
      });
    adminToken = adminLoginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('队伍创建流程', () => {
    it('POST /teams - 应该成功创建队伍', async () => {
      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '测试队伍',
          description: '这是一个测试队伍',
          logo: 'https://example.com/logo.png',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('测试队伍');
      expect(response.body).toHaveProperty('createdAt');
      createdTeamId = response.body.id;
    });

    it('POST /teams - 应该拒绝无授权请求', () => {
      return request(app.getHttpServer())
        .post('/teams')
        .send({
          name: '未授权队伍',
        })
        .expect(401);
    });

    it('POST /teams - 应该拒绝缺少队伍名称', () => {
      return request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: '缺少名称的队伍',
        })
        .expect(400);
    });

    it('POST /teams - 应该拒绝过长的队伍名称', () => {
      return request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'a'.repeat(101),
        })
        .expect(400);
    });
  });

  describe('队伍查询流程', () => {
    it('GET /teams - 应该返回队伍列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /teams - 应该支持分页', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams?page=1&limit=10')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /teams/:id - 应该返回特定队伍', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}`)
        .expect(200);

      expect(response.body.id).toBe(createdTeamId);
      expect(response.body.name).toBe('测试队伍');
    });

    it('GET /teams/:id - 应该处理不存在的队伍', () => {
      return request(app.getHttpServer())
        .get('/teams/999999')
        .expect(404);
    });

    it('GET /teams/:id - 应该处理无效ID格式', () => {
      return request(app.getHttpServer())
        .get('/teams/invalid-id')
        .expect(400);
    });
  });

  describe('队伍更新流程', () => {
    it('PUT /teams/:id - 应该成功更新队伍', async () => {
      const response = await request(app.getHttpServer())
        .put(`/teams/${createdTeamId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '更新后的队伍',
          description: '更新后的描述',
        })
        .expect(200);

      expect(response.body.name).toBe('更新后的队伍');
      expect(response.body.description).toBe('更新后的描述');
    });

    it('PUT /teams/:id - 应该拒绝无授权请求', () => {
      return request(app.getHttpServer())
        .put(`/teams/${createdTeamId}`)
        .send({
          name: '未授权更新',
        })
        .expect(401);
    });

    it('PUT /teams/:id - 应该拒绝更新不存在的队伍', () => {
      return request(app.getHttpServer())
        .put('/teams/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '不存在的队伍',
        })
        .expect(404);
    });
  });

  describe('队伍删除流程', () => {
    it('DELETE /teams/:id - 应该成功删除队伍', async () => {
      // 先创建一个新队伍用于删除测试
      const createResponse = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '待删除队伍',
        });

      const teamIdToDelete = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/teams/${teamIdToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 验证队伍已被删除
      await request(app.getHttpServer())
        .get(`/teams/${teamIdToDelete}`)
        .expect(404);
    });

    it('DELETE /teams/:id - 应该拒绝无授权请求', () => {
      return request(app.getHttpServer())
        .delete(`/teams/${createdTeamId}`)
        .expect(401);
    });
  });

  describe('队伍成员管理流程', () => {
    let memberTeamId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '成员测试队伍',
        });
      memberTeamId = response.body.id;
    });

    it('POST /teams/:id/members - 应该添加成员到队伍', async () => {
      const response = await request(app.getHttpServer())
        .post(`/teams/${memberTeamId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: 'test-user-id',
          role: 'member',
        })
        .expect(201);

      expect(response.body).toHaveProperty('members');
    });

    it('GET /teams/:id/members - 应该获取队伍成员列表', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/${memberTeamId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('DELETE /teams/:id/members/:userId - 应该移除队伍成员', async () => {
      await request(app.getHttpServer())
        .delete(`/teams/${memberTeamId}/members/test-user-id`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('队伍统计信息', () => {
    it('GET /teams/:id/stats - 应该返回队伍统计', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/${createdTeamId}/stats`)
        .expect(200);

      expect(response.body).toHaveProperty('totalMatches');
      expect(response.body).toHaveProperty('wins');
      expect(response.body).toHaveProperty('losses');
    });
  });

  describe('队伍搜索功能', () => {
    it('GET /teams/search - 应该支持按名称搜索', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams/search?q=更新后的队伍')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /teams/search - 应该处理空搜索词', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams/search?q=')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
