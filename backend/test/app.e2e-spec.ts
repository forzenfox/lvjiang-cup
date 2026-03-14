import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/teams (GET) - should return empty array initially', () => {
    return request(app.getHttpServer()).get('/api/teams').expect(200).expect([]);
  });

  it('/api/matches (GET) - should return empty array initially', () => {
    return request(app.getHttpServer()).get('/api/matches').expect(200).expect([]);
  });

  it('/api/stream (GET) - should return stream info', () => {
    return request(app.getHttpServer())
      .get('/api/stream')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('title');
        expect(res.body).toHaveProperty('url');
        expect(res.body).toHaveProperty('isLive');
      });
  });

  it('/api/advancement (GET) - should return advancement info', () => {
    return request(app.getHttpServer())
      .get('/api/advancement')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('winners2_0');
        expect(res.body).toHaveProperty('winners2_1');
        expect(res.body).toHaveProperty('losersBracket');
        expect(res.body).toHaveProperty('eliminated3rd');
        expect(res.body).toHaveProperty('eliminated0_3');
      });
  });
});
