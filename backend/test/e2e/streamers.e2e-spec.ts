import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { StreamersModule } from '../../src/modules/streamers/streamers.module';
import { StreamerType } from '../../src/modules/streamers/streamers.service';

describe('StreamersController E2E (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StreamersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /streamers', () => {
    it('should return all streamers', async () => {
      const response = await request(app.getHttpServer()).get('/streamers').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /streamers/:id', () => {
    it('should return 404 for non-existent streamer', async () => {
      await request(app.getHttpServer()).get('/streamers/non_existent_id').expect(404);
    });
  });

  describe('POST /streamers', () => {
    it('should return 404 without auth', async () => {
      const createDto = {
        nickname: 'NewStreamer',
        posterUrl: '/new.jpg',
        bio: 'New Bio',
        liveUrl: 'https://new.com',
        streamerType: StreamerType.GUEST,
      };

      await request(app.getHttpServer()).post('/streamers').send(createDto).expect(404);
    });
  });
});
