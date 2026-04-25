import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // 添加全局前缀，与生产环境保持一致
    app.setGlobalPrefix('api');
    // 添加全局管道、过滤器和拦截器
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: false,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/teams (GET) - should return empty array initially', () => {
    return request(app.getHttpServer())
      .get('/api/teams')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(0);
      });
  });

  it('/api/matches (GET) - should return empty array initially', () => {
    return request(app.getHttpServer())
      .get('/api/matches')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(0);
      });
  });

  it('/api/streams/stream (GET) - should return stream info', () => {
    return request(app.getHttpServer())
      .get('/api/streams/stream')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('title');
        expect(res.body.data).toHaveProperty('url');
        expect(res.body.data).toHaveProperty('isLive');
      });
  });

  it.skip('/api/advancement (GET) - should return advancement info', () => {
    return request(app.getHttpServer())
      .get('/api/advancement')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('winners2_0');
        expect(res.body.data).toHaveProperty('winners2_1');
        expect(res.body.data).toHaveProperty('losersBracket');
        expect(res.body.data).toHaveProperty('eliminated3rd');
        expect(res.body.data).toHaveProperty('eliminated0_3');
      });
  });
});
