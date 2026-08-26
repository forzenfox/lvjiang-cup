import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/modules/admin/admin.controller';
import { MatchesService } from '../../src/modules/matches/matches.service';
import { DatabaseService } from '../../src/database/database.service';
import { CacheService } from '../../src/cache/cache.service';
import { FormatsService } from '../../src/modules/formats/formats.service';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';

describe('AdminController', () => {
  let controller: AdminController;
  let databaseService: DatabaseService;
  let cacheService: CacheService;

  const mockMatchesService = {
    generateSlots: jest.fn(),
  };

  const mockDatabaseService = {
    get: jest.fn(),
    resetMatchSlots: jest.fn(),
    clearAllData: jest.fn(),
  };

  const mockCacheService = {
    flush: jest.fn(),
  };

  const mockFormatsService = {
    getActiveFormat: jest.fn(),
  };

  // 模拟认证守卫
  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: MatchesService,
          useValue: mockMatchesService,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: FormatsService,
          useValue: mockFormatsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AdminController>(AdminController);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /admin/init-slots - 初始化比赛槽位（按生效配置生成）', () => {
    it('应该按生效配置生成槽位并返回 created/skipped/total', async () => {
      // Arrange
      mockMatchesService.generateSlots.mockResolvedValue({
        created: 40,
        skipped: 0,
        total: 40,
      });

      // Act
      const result = await controller.initSlots();

      // Assert
      expect(result).toEqual({
        message: 'Match slots initialized successfully',
        created: 40,
        skipped: 0,
        total: 40,
      });
      expect(mockMatchesService.generateSlots).toHaveBeenCalledWith();
    });

    it('应该在生成失败时抛出错误', async () => {
      // Arrange
      mockMatchesService.generateSlots.mockRejectedValue(new Error('Initialization failed'));

      // Act & Assert
      await expect(controller.initSlots()).rejects.toThrow('Initialization failed');
    });
  });

  describe('POST /admin/slots/generate - 按赛制配置生成槽位', () => {
    it('应该调用 generateSlots 并返回统计结果', async () => {
      // Arrange
      mockMatchesService.generateSlots.mockResolvedValue({
        created: 13,
        skipped: 0,
        total: 13,
      });

      // Act
      const result = await controller.generateSlots({ formatId: 'fmt-123' });

      // Assert
      expect(mockMatchesService.generateSlots).toHaveBeenCalledWith('fmt-123');
      expect(result).toEqual({
        message: 'Match slots generated successfully',
        created: 13,
        skipped: 0,
        total: 13,
      });
    });

    it('应该在未传 formatId 时按生效配置生成', async () => {
      // Arrange
      mockMatchesService.generateSlots.mockResolvedValue({
        created: 40,
        skipped: 0,
        total: 40,
      });

      // Act
      const result = await controller.generateSlots({});

      // Assert
      expect(mockMatchesService.generateSlots).toHaveBeenCalledWith(undefined);
      expect(result.created).toBe(40);
    });
  });

  describe('POST /admin/reset-slots - 重置槽位', () => {
    it('应该重置槽位并返回成功消息', async () => {
      // Arrange
      mockDatabaseService.resetMatchSlots.mockResolvedValue(undefined);
      mockCacheService.flush.mockResolvedValue(undefined);

      // Act
      const result = await controller.resetSlots();

      // Assert
      expect(result).toEqual({
        message: 'Match slots reset successfully',
      });
      expect(mockDatabaseService.resetMatchSlots).toHaveBeenCalled();
      expect(mockCacheService.flush).toHaveBeenCalled();
    });

    it('应该在重置失败时抛出错误', async () => {
      // Arrange
      mockDatabaseService.resetMatchSlots.mockRejectedValue(new Error('Reset failed'));

      // Act & Assert
      await expect(controller.resetSlots()).rejects.toThrow('Reset failed');
    });
  });

  describe('DELETE /admin/data - 清空所有数据', () => {
    it('应该清空所有数据并返回成功消息', async () => {
      // Arrange
      mockDatabaseService.clearAllData.mockResolvedValue(undefined);
      mockCacheService.flush.mockResolvedValue(undefined);

      // Act
      const result = await controller.clearAllData();

      // Assert
      expect(result).toEqual({
        message: 'All data cleared successfully',
      });
      expect(mockDatabaseService.clearAllData).toHaveBeenCalled();
      expect(mockCacheService.flush).toHaveBeenCalled();
    });

    it('应该在清空失败时抛出错误', async () => {
      // Arrange
      mockDatabaseService.clearAllData.mockRejectedValue(new Error('Clear failed'));

      // Act & Assert
      await expect(controller.clearAllData()).rejects.toThrow('Clear failed');
    });
  });
});
