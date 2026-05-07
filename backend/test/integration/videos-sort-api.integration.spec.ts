import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { VideosModule } from '../../src/modules/videos/videos.module';
import { VideosService } from '../../src/modules/videos/videos.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { createTestApp, closeTestApp, TestAppResult } from '../helpers/test-app';

describe('Videos Sort API 集成测试', () => {
  let app: INestApplication;
  let authToken: string;
  let videosService: VideosService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;

  beforeAll(async () => {
    const result: TestAppResult = await createTestApp({
      extraModules: [VideosModule],
    });
    app = result.app;
    authToken = result.authToken;

    videosService = result.moduleFixture.get<VideosService>(VideosService);
    databaseService = result.moduleFixture.get<DatabaseService>(DatabaseService);
    cacheService = result.moduleFixture.get<CacheService>(CacheService);
  });

  afterAll(async () => {
    await closeTestApp(app);
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

      const videos = adminResponse.body.data;
      expect(videos.length).toBeGreaterThan(0);

      const orderedIds = videos.map((v) => v.id);

      const response = await request(app.getHttpServer())
        .put('/api/admin/videos/sort')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderedIds })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
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
