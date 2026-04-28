import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { StreamersModule } from '../../src/modules/streamers/streamers.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { DatabaseModule } from '../../src/database/database.module';
import { CacheModule } from '../../src/cache/cache.module';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import {
  HEADER_ROW_NUMBER,
  DATA_START_ROW_NUMBER,
} from '../../src/modules/streamers/utils/streamer-excel.util';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

describe('StreamersImport Integration', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  let cacheService: CacheService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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
        StreamersModule,
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

    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
    cacheService = moduleFixture.get<CacheService>(CacheService);

    // Create streamers table in memory database
    await databaseService.run(
      `
      CREATE TABLE IF NOT EXISTS streamers (
        id TEXT PRIMARY KEY,
        nickname TEXT NOT NULL,
        poster_url TEXT,
        bio TEXT,
        live_url TEXT,
        streamer_type TEXT CHECK(streamer_type IN ('internal', 'guest')),
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
      [],
    );

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await databaseService.run('DELETE FROM streamers', []);
    cacheService.flush();
  });

  describe('GET /api/admin/streamers/import/template', () => {
    it('应返回模板文件', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/admin/streamers/import/template')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(response.headers['content-disposition']).toContain('%E9%A9%B4%E9%85%B1%E6%9D%AF');
    });

    it('未认证应返回401', async () => {
      await request(app.getHttpServer()).get('/api/admin/streamers/import/template').expect(401);
    });
  });

  describe('POST /api/admin/streamers/import', () => {
    it('应全量覆盖导入主播数据', async () => {
      // Pre-insert some streamers
      await databaseService.run(
        `INSERT INTO streamers (id, nickname, streamer_type, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['old-1', 'OldStreamer', 'internal', 0, new Date().toISOString(), new Date().toISOString()],
      );

      // Create test Excel file
      const testFilePath = path.join(os.tmpdir(), `integration-test-${Date.now()}.xlsx`);
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('主播信息导入');
      // 模拟真实模板结构：第1行标题，第2行说明，第3行表头，第4行起数据
      // 列结构：序号、主播类型、主播昵称、海报URL、直播间号、个人简介
      sheet.getCell(1, 1).value = '主播信息导入模板';
      sheet.getCell(2, 1).value = '说明：每行对应一个主播，请按顺序填写。';
      sheet.getCell(HEADER_ROW_NUMBER, 1).value = '序号';
      sheet.getCell(HEADER_ROW_NUMBER, 2).value = '主播类型';
      sheet.getCell(HEADER_ROW_NUMBER, 3).value = '主播昵称';
      sheet.getCell(HEADER_ROW_NUMBER, 4).value = '海报URL';
      sheet.getCell(HEADER_ROW_NUMBER, 5).value = '直播间号';
      sheet.getCell(HEADER_ROW_NUMBER, 6).value = '个人简介';
      // 数据行1
      sheet.getCell(DATA_START_ROW_NUMBER, 1).value = 1;
      sheet.getCell(DATA_START_ROW_NUMBER, 2).value = '驴酱主播';
      sheet.getCell(DATA_START_ROW_NUMBER, 3).value = '洞主';
      sheet.getCell(DATA_START_ROW_NUMBER, 4).value = '';
      sheet.getCell(DATA_START_ROW_NUMBER, 5).value = 138243;
      sheet.getCell(DATA_START_ROW_NUMBER, 6).value = '简介';
      // 数据行2
      sheet.getCell(DATA_START_ROW_NUMBER + 1, 1).value = 2;
      sheet.getCell(DATA_START_ROW_NUMBER + 1, 2).value = '嘉宾主播';
      sheet.getCell(DATA_START_ROW_NUMBER + 1, 3).value = '嘉宾1';
      sheet.getCell(DATA_START_ROW_NUMBER + 1, 4).value = '';
      sheet.getCell(DATA_START_ROW_NUMBER + 1, 5).value = '';
      sheet.getCell(DATA_START_ROW_NUMBER + 1, 6).value = '';
      await workbook.xlsx.writeFile(testFilePath);

      const response = await request(app.getHttpServer())
        .post('/api/admin/streamers/import')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath)
        .expect(201);

      expect(response.body.data.total).toBe(2);
      expect(response.body.data.created).toBe(2);
      expect(response.body.data.failed).toBe(0);

      // Verify database: old streamer should be gone
      const result = (await databaseService.all(
        'SELECT * FROM streamers ORDER BY sort_order',
      )) as any[];
      expect(result).toHaveLength(2);
      expect(result[0].nickname).toBe('洞主');
      expect(result[0].streamer_type).toBe('internal');
      expect(result[0].live_url).toBe('https://www.douyu.com/138243');
      expect(result[1].nickname).toBe('嘉宾1');
      expect(result[1].streamer_type).toBe('guest');

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    it('校验失败应不修改数据库', async () => {
      // Pre-insert a streamer
      await databaseService.run(
        `INSERT INTO streamers (id, nickname, streamer_type, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'existing-1',
          'ExistingStreamer',
          'internal',
          0,
          new Date().toISOString(),
          new Date().toISOString(),
        ],
      );

      // Create invalid Excel file (empty nickname)
      const testFilePath = path.join(os.tmpdir(), `integration-test-invalid-${Date.now()}.xlsx`);
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('主播信息导入');
      // 模拟真实模板结构：第1行标题，第2行说明，第3行表头，第4行起数据
      // 列结构：序号、主播类型、主播昵称、海报URL、直播间号、个人简介
      sheet.getCell(1, 1).value = '主播信息导入模板';
      sheet.getCell(2, 1).value = '说明：每行对应一个主播，请按顺序填写。';
      sheet.getCell(HEADER_ROW_NUMBER, 1).value = '序号';
      sheet.getCell(HEADER_ROW_NUMBER, 2).value = '主播类型';
      sheet.getCell(HEADER_ROW_NUMBER, 3).value = '主播昵称';
      sheet.getCell(HEADER_ROW_NUMBER, 4).value = '海报URL';
      sheet.getCell(HEADER_ROW_NUMBER, 5).value = '直播间号';
      sheet.getCell(HEADER_ROW_NUMBER, 6).value = '个人简介';
      // 数据行：空昵称
      sheet.getCell(DATA_START_ROW_NUMBER, 1).value = 1;
      sheet.getCell(DATA_START_ROW_NUMBER, 2).value = '驴酱主播';
      sheet.getCell(DATA_START_ROW_NUMBER, 3).value = ''; // Empty nickname
      await workbook.xlsx.writeFile(testFilePath);

      const response = await request(app.getHttpServer())
        .post('/api/admin/streamers/import')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath)
        .expect(201);

      expect(response.body.data.failed).toBe(1);
      expect(response.body.data.errors).toHaveLength(1);

      // Verify database: existing streamer should still be there
      const result = (await databaseService.all('SELECT * FROM streamers')) as any[];
      expect(result).toHaveLength(1);
      expect(result[0].nickname).toBe('ExistingStreamer');

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    it('未认证应返回401', async () => {
      await request(app.getHttpServer()).post('/api/admin/streamers/import').expect(401);
    });
  });

  describe('POST /api/admin/streamers/import/error-report', () => {
    it('应返回错误报告文件', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/admin/streamers/import/error-report')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          errors: [{ row: 3, nickname: '', field: 'nickname', message: '主播昵称不能为空' }],
        })
        .expect(201);

      expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
      expect(response.text).toContain('主播信息导入错误报告');
      expect(response.text).toContain('主播昵称不能为空');
    });

    it('空错误列表应返回500', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/streamers/import/error-report')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ errors: [] })
        .expect(500);
    });
  });
});
