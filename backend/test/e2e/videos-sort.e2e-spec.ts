import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { VideosModule } from '../../src/modules/videos/videos.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { DatabaseModule } from '../../src/database/database.module';
import { CacheModule } from '../../src/cache/cache.module';
import { VideosService } from '../../src/modules/videos/videos.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';

describe('Videos Sort API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let videosService: VideosService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
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
        VideosModule,
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
    app.setGlobalPrefix('api');
    await app.init();

    videosService = moduleFixture.get<VideosService>(VideosService);
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
    cacheService = moduleFixture.get<CacheService>(CacheService);

    const loginResponse = await request(app.getHttpServer()).post('/api/admin/auth/login').send({
      username: 'admin',
      password: 'admin123',
    });

    authToken = loginResponse.body.data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await databaseService.run('DELETE FROM videos');
    cacheService.flush();
  });

  describe('PUT /api/admin/videos/sort - 批量排序', () => {
    const TEST_BV_IDS = ['BV1swD9BEE7S', 'BV1C8QhB9EMX', 'BV1ctDXBkEuV'];

    beforeEach(async () => {
      for (let i = 0; i < 3; i++) {
        await videosService.create({
          url: `https://www.bilibili.com/video/${TEST_BV_IDS[i]}`,
          status: 'enabled',
        });
      }
    });

    it('需要JWT认证', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/admin/videos/sort')
        .send({ orderedIds: ['id1', 'id2'] })
        .expect(401);

      expect(response.body.statusCode).toBe(401);
    });

    it('批量排序成功', async () => {
      const adminResponse = await request(app.getHttpServer())
        .get('/api/admin/videos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const videos = adminResponse.body.data || adminResponse.body;
      expect(videos.length).toBe(3);

      const orderedIds = videos.map((v) => v.id);

      const response = await request(app.getHttpServer())
        .put('/api/admin/videos/sort')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderedIds });

      expect(response.status).toBe(200);
    });

    it('空数组应返回验证错误', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/admin/videos/sort')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderedIds: [] });

      expect(response.status).toBe(400);
    });
  });
});