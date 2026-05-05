import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../src/database/database.module';
import { CacheModule } from '../../src/cache/cache.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';
import * as request from 'supertest';

/**
 * 测试应用工厂
 * 提供共享的 NestJS 应用创建和配置逻辑，消除集成测试中的重复初始化代码
 */

/**
 * 测试环境配置
 */
const testConfig = {
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
};

/**
 * 创建测试应用的选项
 */
export interface CreateTestAppOptions {
  /** 额外需要导入的模块 */
  extraModules?: Type<any>[];
  /** 是否自动登录获取 authToken（默认 true） */
  autoLogin?: boolean;
  /** 是否初始化比赛槽位（默认 false） */
  initMatchSlots?: boolean;
}

/**
 * 创建测试应用的返回结果
 */
export interface TestAppResult {
  /** 初始化完成的 NestJS 应用实例 */
  app: INestApplication;
  /** 测试模块实例（用于获取 Service 等） */
  moduleFixture: TestingModule;
  /** 管理员认证 token（autoLogin 为 true 时可用） */
  authToken: string;
}

/**
 * 创建并初始化测试用的 NestJS 应用
 * @param options 创建选项
 * @returns 测试应用结果
 */
export async function createTestApp(options: CreateTestAppOptions = {}): Promise<TestAppResult> {
  const { extraModules = [], autoLogin = true, initMatchSlots = false } = options;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [() => testConfig],
      }),
      DatabaseModule,
      CacheModule,
      AuthModule,
      ...extraModules,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
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

  // 初始化比赛槽位（如果需要）
  if (initMatchSlots) {
    const { MatchesService } = await import('../../src/modules/matches/matches.service');
    const matchesService =
      moduleFixture.get<import('../../src/modules/matches/matches.service').MatchesService>(
        MatchesService,
      );
    await matchesService.initSlots();
  }

  // 自动登录获取 token
  let authToken = '';
  if (autoLogin) {
    const loginResponse = await request(app.getHttpServer()).post('/api/admin/auth/login').send({
      username: testConfig.admin.username,
      password: testConfig.admin.password,
    });

    authToken = loginResponse.body.data?.access_token || '';
  }

  return { app, moduleFixture, authToken };
}

/**
 * 关闭测试应用
 * @param app NestJS 应用实例
 */
export async function closeTestApp(app: INestApplication): Promise<void> {
  if (app) {
    await app.close();
  }
}
