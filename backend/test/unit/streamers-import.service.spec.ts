import { StreamersImportService } from '../../src/modules/streamers/services/streamers-import.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import {
  ImportStreamerDto,
  ImportErrorDto,
} from '../../src/modules/streamers/dto/streamer-import.dto';
import {
  HEADER_ROW_NUMBER,
  DATA_START_ROW_NUMBER,
} from '../../src/modules/streamers/utils/streamer-excel.util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as ExcelJS from 'exceljs';

jest.mock('fs');

describe('StreamersImportService', () => {
  let service: StreamersImportService;
  let databaseService: jest.Mocked<DatabaseService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    databaseService = {
      begin: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      run: jest.fn().mockResolvedValue(undefined),
      all: jest.fn().mockResolvedValue([]),
      get: jest.fn().mockResolvedValue(undefined),
    } as any;

    cacheService = {
      del: jest.fn().mockReturnValue(true),
      get: jest.fn().mockReturnValue(null),
      set: jest.fn().mockReturnValue(true),
    } as any;

    service = new StreamersImportService(databaseService, cacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTemplate', () => {
    it('应生成模板文件', async () => {
      const templatePath = await service.generateTemplate();
      expect(templatePath).toContain('streamer-import-template.xlsx');
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    it('应复用已存在的模板', async () => {
      const firstPath = await service.generateTemplate();
      const secondPath = await service.generateTemplate();
      expect(firstPath).toBe(secondPath);
    });

    it('refreshTemplate 应删除旧模板并重新生成', async () => {
      const firstPath = await service.generateTemplate();
      const secondPath = await service.refreshTemplate();
      expect(firstPath).toBe(secondPath);
    });
  });

  describe('validateStreamers', () => {
    it('有效数据应返回空错误列表', () => {
      const streamers: ImportStreamerDto[] = [
        {
          rowIndex: 2,
          nickname: '主播1',
          streamerType: 'internal',
          posterUrl: '',
          liveUrl: '',
          bio: '',
        },
      ];
      const errors = (service as any).validateStreamers(streamers);
      expect(errors).toHaveLength(0);
    });

    it('空昵称应返回错误', () => {
      const streamers: ImportStreamerDto[] = [
        {
          rowIndex: 2,
          nickname: '',
          streamerType: 'internal',
          posterUrl: '',
          liveUrl: '',
          bio: '',
        },
      ];
      const errors = (service as any).validateStreamers(streamers);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('nickname');
      expect(errors[0].message).toContain('不能为空');
    });

    it('超长昵称应返回错误', () => {
      const streamers: ImportStreamerDto[] = [
        {
          rowIndex: 2,
          nickname: 'a'.repeat(51),
          streamerType: 'internal',
          posterUrl: '',
          liveUrl: '',
          bio: '',
        },
      ];
      const errors = (service as any).validateStreamers(streamers);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('nickname');
      expect(errors[0].message).toContain('不能超过50个字符');
    });

    it('重复昵称应返回错误', () => {
      const streamers: ImportStreamerDto[] = [
        {
          rowIndex: 2,
          nickname: '重复主播',
          streamerType: 'internal',
          posterUrl: '',
          liveUrl: '',
          bio: '',
        },
        {
          rowIndex: 3,
          nickname: '重复主播',
          streamerType: 'guest',
          posterUrl: '',
          liveUrl: '',
          bio: '',
        },
      ];
      const errors = (service as any).validateStreamers(streamers);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('nickname');
      expect(errors[0].message).toContain('不能重复');
    });

    it('无效类型应返回错误', () => {
      const streamers: ImportStreamerDto[] = [
        {
          rowIndex: 2,
          nickname: '主播1',
          streamerType: 'invalid' as any,
          posterUrl: '',
          liveUrl: '',
          bio: '',
        },
      ];
      const errors = (service as any).validateStreamers(streamers);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('streamerType');
    });

    it('无效URL应返回错误', () => {
      const streamers: ImportStreamerDto[] = [
        {
          rowIndex: 2,
          nickname: '主播1',
          streamerType: 'internal',
          posterUrl: 'not-a-url',
          liveUrl: '',
          bio: '',
        },
      ];
      const errors = (service as any).validateStreamers(streamers);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('posterUrl');
    });

    it('超长简介应返回错误', () => {
      const streamers: ImportStreamerDto[] = [
        {
          rowIndex: 2,
          nickname: '主播1',
          streamerType: 'internal',
          posterUrl: '',
          liveUrl: '',
          bio: 'a'.repeat(501),
        },
      ];
      const errors = (service as any).validateStreamers(streamers);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('bio');
    });
  });

  describe('importFromExcel', () => {
    let testFilePath: string;

    beforeEach(() => {
      testFilePath = path.join(os.tmpdir(), `test-import-${Date.now()}.xlsx`);
    });

    afterEach(async () => {
      try {
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
        }
      } catch {}
    });

    it('全量覆盖导入应删除旧数据并插入新数据', async () => {
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
      // 数据行
      sheet.getCell(DATA_START_ROW_NUMBER, 1).value = 1;
      sheet.getCell(DATA_START_ROW_NUMBER, 2).value = '驴酱主播';
      sheet.getCell(DATA_START_ROW_NUMBER, 3).value = '洞主';
      sheet.getCell(DATA_START_ROW_NUMBER, 4).value = '';
      sheet.getCell(DATA_START_ROW_NUMBER, 5).value = 138243;
      sheet.getCell(DATA_START_ROW_NUMBER, 6).value = '简介';
      await workbook.xlsx.writeFile(testFilePath);

      const result = await service.importFromExcel(testFilePath);

      expect(databaseService.begin).toHaveBeenCalled();
      expect(databaseService.run).toHaveBeenCalledWith('DELETE FROM streamers', []);
      expect(databaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO streamers'),
        expect.arrayContaining(['洞主', 'internal', 'https://www.douyu.com/138243']),
      );
      expect(databaseService.commit).toHaveBeenCalled();
      expect(result.created).toBe(1);
      expect(result.total).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('校验失败应返回错误不操作数据库', async () => {
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
      sheet.getCell(DATA_START_ROW_NUMBER, 3).value = ''; // 空昵称
      await workbook.xlsx.writeFile(testFilePath);

      const result = await service.importFromExcel(testFilePath);

      expect(databaseService.begin).not.toHaveBeenCalled();
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('数据库异常应回滚事务', async () => {
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
      // 数据行
      sheet.getCell(DATA_START_ROW_NUMBER, 1).value = 1;
      sheet.getCell(DATA_START_ROW_NUMBER, 2).value = '驴酱主播';
      sheet.getCell(DATA_START_ROW_NUMBER, 3).value = '主播1';
      await workbook.xlsx.writeFile(testFilePath);

      databaseService.run = jest.fn().mockRejectedValue(new Error('DB Error'));

      await expect(service.importFromExcel(testFilePath)).rejects.toThrow('DB Error');
      expect(databaseService.rollback).toHaveBeenCalled();
    });

    it('空文件应返回空数据错误', async () => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('主播信息导入');
      // 模拟真实模板结构：第1行标题，第2行说明，第3行表头
      // 列结构：序号、主播类型、主播昵称、海报URL、直播间号、个人简介
      sheet.getCell(1, 1).value = '主播信息导入模板';
      sheet.getCell(2, 1).value = '说明：每行对应一个主播，请按顺序填写。';
      sheet.getCell(HEADER_ROW_NUMBER, 1).value = '序号';
      sheet.getCell(HEADER_ROW_NUMBER, 2).value = '主播类型';
      sheet.getCell(HEADER_ROW_NUMBER, 3).value = '主播昵称';
      sheet.getCell(HEADER_ROW_NUMBER, 4).value = '海报URL';
      sheet.getCell(HEADER_ROW_NUMBER, 5).value = '直播间号';
      sheet.getCell(HEADER_ROW_NUMBER, 6).value = '个人简介';
      await workbook.xlsx.writeFile(testFilePath);

      const result = await service.importFromExcel(testFilePath);

      expect(result.total).toBe(0);
      expect(result.failed).toBe(0);
    });
  });

  describe('generateErrorReport', () => {
    it('应生成正确的错误报告格式', async () => {
      const errors = [
        new ImportErrorDto(3, '', 'nickname', '主播昵称不能为空'),
        new ImportErrorDto(7, '示例主播', 'streamerType', '主播类型无效'),
      ];

      const buffer = await service.generateErrorReport(errors);
      const report = buffer.toString('utf-8');

      expect(report).toContain('主播信息导入错误报告');
      expect(report).toContain('错误总数：2');
      expect(report).toContain('第 3 行');
      expect(report).toContain('主播昵称不能为空');
      expect(report).toContain('第 7 行');
      expect(report).toContain('示例主播');
    });

    it('空错误列表应生成空报告', async () => {
      const buffer = await service.generateErrorReport([]);
      const report = buffer.toString('utf-8');

      expect(report).toContain('错误总数：0');
    });
  });

  describe('clearStreamersCache', () => {
    it('应清除主播缓存', () => {
      (service as any).clearStreamersCache();
      expect(cacheService.del).toHaveBeenCalledWith('streamers:all');
    });
  });
});
