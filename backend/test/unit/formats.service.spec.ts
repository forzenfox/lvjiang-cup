import { Test, TestingModule } from '@nestjs/testing';
import { FormatsService } from '../../src/modules/formats/formats.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BUILTIN_DEFAULT_FORMAT, FormatConfig } from '../../src/modules/formats/format.types';

/** 构造 8队2胜 + 4强淘汰赛的合法配置 */
function makeValidConfig(): FormatConfig {
  return {
    version: 1,
    name: '8队瑞士轮（2胜制）+ 4强',
    stages: [
      {
        type: 'swiss',
        name: '瑞士轮',
        teamCount: 8,
        winThreshold: 2,
        lossThreshold: 2,
        boRule: 'auto',
        advanceToStage: 1,
      },
      {
        type: 'elimination',
        name: '淘汰赛',
        teamCount: 4,
        advanceToStage: null,
        roundNames: ['半决赛', '决赛'],
        boFormat: 'BO3',
      },
    ],
  };
}

/** 构造非法配置（8队3胜制，结构不合法） */
function makeInvalidConfig(): FormatConfig {
  return {
    version: 1,
    name: '非法配置',
    stages: [
      {
        type: 'swiss',
        name: '瑞士轮',
        teamCount: 8,
        winThreshold: 3,
        lossThreshold: 3,
        boRule: 'auto',
        advanceToStage: 1,
      },
      {
        type: 'elimination',
        name: '淘汰赛',
        teamCount: 4,
        advanceToStage: null,
        roundNames: ['半决赛', '决赛'],
        boFormat: 'BO3',
      },
    ],
  };
}

describe('FormatsService', () => {
  let service: FormatsService;

  const mockDatabaseService = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormatsService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<FormatsService>(FormatsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveFormat - 生效配置解析', () => {
    it('无激活配置时应返回内置默认配置（source=builtin）', async () => {
      mockDatabaseService.get.mockResolvedValue(undefined);

      const result = await service.getActiveFormat();

      expect(result.source).toBe('builtin');
      expect(result.id).toBeNull();
      expect(result.config).toEqual(BUILTIN_DEFAULT_FORMAT);
    });

    it('存在激活配置时应返回该配置（source=config）', async () => {
      const config = makeValidConfig();
      mockDatabaseService.get.mockResolvedValue({
        id: 'fmt-1',
        name: '8队配置',
        config_json: JSON.stringify(config),
        is_active: 1,
      });

      const result = await service.getActiveFormat();

      expect(result.source).toBe('config');
      expect(result.id).toBe('fmt-1');
      expect(result.config).toEqual(config);
    });
  });

  describe('listFormats - 配置列表', () => {
    it('应返回全部配置并解析 config_json', async () => {
      const config = makeValidConfig();
      mockDatabaseService.all.mockResolvedValue([
        {
          id: 'fmt-1',
          name: '8队配置',
          config_json: JSON.stringify(config),
          is_active: 1,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
      ]);

      const result = await service.listFormats();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('fmt-1');
      expect(result[0].config).toEqual(config);
      expect(result[0].isActive).toBe(true);
    });
  });

  describe('createFormat - 保存新配置', () => {
    it('非法配置应抛出 BadRequestException 并包含错误明细', async () => {
      await expect(service.createFormat(makeInvalidConfig())).rejects.toThrow(BadRequestException);
      expect(mockDatabaseService.run).not.toHaveBeenCalled();
    });

    it('合法配置应落库（config_json 为 JSON 序列化）', async () => {
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      const config = makeValidConfig();
      const record = await service.createFormat(config);

      expect(mockDatabaseService.run).toHaveBeenCalledTimes(1);
      const [sql, params] = mockDatabaseService.run.mock.calls[0];
      expect(sql).toContain('INSERT INTO format_configs');
      expect(params[0]).toEqual(expect.any(String)); // uuid v4
      expect(params[2]).toBe(JSON.stringify(config));
      expect(record.id).toEqual(expect.any(String));
      expect(record.config).toEqual(config);
    });

    it('显式传入 name 时应覆盖 config.name 存储', async () => {
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      await service.createFormat(makeValidConfig(), '自定义名称');

      const [, params] = mockDatabaseService.run.mock.calls[0];
      expect(params[1]).toBe('自定义名称');
    });
  });

  describe('updateFormat - 编辑配置', () => {
    it('非法配置应抛出 BadRequestException', async () => {
      await expect(service.updateFormat('fmt-1', makeInvalidConfig())).rejects.toThrow(
        BadRequestException,
      );
      expect(mockDatabaseService.run).not.toHaveBeenCalled();
    });

    it('不存在的配置应抛出 NotFoundException', async () => {
      mockDatabaseService.get.mockResolvedValue(undefined);
      mockDatabaseService.run.mockResolvedValue({ changes: 0, lastID: 1 });

      await expect(service.updateFormat('not-exist', makeValidConfig())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteFormat - 删除配置', () => {
    it('已激活的配置应拒绝删除并提示先停用', async () => {
      mockDatabaseService.get.mockResolvedValue({ id: 'fmt-1', is_active: 1 });

      await expect(service.deleteFormat('fmt-1')).rejects.toThrow(BadRequestException);
      expect(mockDatabaseService.run).not.toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM format_configs'),
      );
    });

    it('未激活的配置应正常删除', async () => {
      mockDatabaseService.get.mockResolvedValue({ id: 'fmt-1', is_active: 0 });
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      await service.deleteFormat('fmt-1');

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM format_configs'),
        ['fmt-1'],
      );
    });
  });

  describe('activateFormat - 激活配置', () => {
    it('应先清除全部激活指针再置目标为 1，并 flush 缓存', async () => {
      mockDatabaseService.get.mockResolvedValue({ id: 'fmt-1', is_active: 0 });
      mockDatabaseService.run.mockResolvedValue({ changes: 1, lastID: 1 });

      await service.activateFormat('fmt-1');

      // 两次 UPDATE：全部置 0 + 目标置 1
      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE format_configs SET is_active = 0'),
      );
      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('is_active = 1'),
        expect.arrayContaining(['fmt-1']),
      );
      expect(mockCacheService.flush).toHaveBeenCalled();
    });

    it('激活不存在的配置应抛出 NotFoundException', async () => {
      mockDatabaseService.get.mockResolvedValue(undefined);

      await expect(service.activateFormat('not-exist')).rejects.toThrow(NotFoundException);
      expect(mockCacheService.flush).not.toHaveBeenCalled();
    });
  });

  describe('deactivateFormat - 切回内置默认', () => {
    it('应将全部配置 is_active 置 0 并 flush 缓存', async () => {
      mockDatabaseService.run.mockResolvedValue({ changes: 0, lastID: 1 });

      await service.deactivateFormat();

      expect(mockDatabaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE format_configs SET is_active = 0'),
      );
      expect(mockCacheService.flush).toHaveBeenCalled();
    });
  });

  describe('findById - 按主键查询配置', () => {
    it('应返回解析后的配置记录', async () => {
      const config = makeValidConfig();
      mockDatabaseService.get.mockResolvedValue({
        id: 'fmt-1',
        name: '8队配置',
        config_json: JSON.stringify(config),
        is_active: 0,
      });

      const record = await service.findById('fmt-1');

      expect(record?.id).toBe('fmt-1');
      expect(record?.config).toEqual(config);
    });

    it('不存在时返回 null', async () => {
      mockDatabaseService.get.mockResolvedValue(undefined);

      expect(await service.findById('not-exist')).toBeNull();
    });
  });
});
