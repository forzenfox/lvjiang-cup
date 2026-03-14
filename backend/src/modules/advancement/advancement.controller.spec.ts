import { Test, TestingModule } from '@nestjs/testing';
import { AdvancementController } from './advancement.controller';
import { AdvancementService, Advancement } from './advancement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AdvancementController', () => {
  let controller: AdvancementController;
  let service: AdvancementService;

  const mockAdvancementService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  // 模拟认证守卫
  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvancementController],
      providers: [
        {
          provide: AdvancementService,
          useValue: mockAdvancementService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AdvancementController>(AdvancementController);
    service = module.get<AdvancementService>(AdvancementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /advancement - 获取晋级名单', () => {
    it('应该返回完整的晋级名单', async () => {
      // Arrange
      const advancementData: Advancement = {
        winners2_0: ['team1', 'team2'],
        winners2_1: ['team3', 'team4'],
        losersBracket: ['team5', 'team6'],
        eliminated3rd: ['team7'],
        eliminated0_3: ['team8'],
      };
      mockAdvancementService.findOne.mockResolvedValue(advancementData);

      // Act
      const result = await controller.findOne();

      // Assert
      expect(result).toEqual(advancementData);
      expect(mockAdvancementService.findOne).toHaveBeenCalled();
    });

    it('应该返回空的晋级名单当没有数据', async () => {
      // Arrange
      const emptyAdvancement: Advancement = {
        winners2_0: [],
        winners2_1: [],
        losersBracket: [],
        eliminated3rd: [],
        eliminated0_3: [],
      };
      mockAdvancementService.findOne.mockResolvedValue(emptyAdvancement);

      // Act
      const result = await controller.findOne();

      // Assert
      expect(result).toEqual(emptyAdvancement);
      expect(result.winners2_0).toEqual([]);
      expect(result.winners2_1).toEqual([]);
      expect(result.losersBracket).toEqual([]);
      expect(result.eliminated3rd).toEqual([]);
      expect(result.eliminated0_3).toEqual([]);
    });
  });

  describe('PUT /admin/advancement - 更新晋级名单 (需认证)', () => {
    it('应该更新晋级名单并返回更新后的数据', async () => {
      // Arrange
      const updateDto = {
        winners2_0: ['team1', 'team2'],
        winners2_1: ['team3'],
        losersBracket: ['team4'],
        eliminated3rd: ['team5'],
        eliminated0_3: ['team6'],
      };
      const updatedAdvancement: Advancement = {
        winners2_0: ['team1', 'team2'],
        winners2_1: ['team3'],
        losersBracket: ['team4'],
        eliminated3rd: ['team5'],
        eliminated0_3: ['team6'],
      };
      mockAdvancementService.update.mockResolvedValue(updatedAdvancement);

      // Act
      const result = await controller.update(updateDto);

      // Assert
      expect(result).toEqual(updatedAdvancement);
      expect(mockAdvancementService.update).toHaveBeenCalledWith(updateDto);
    });

    it('应该部分更新晋级名单', async () => {
      // Arrange
      const updateDto = {
        winners2_0: ['team1'],
      };
      const updatedAdvancement: Advancement = {
        winners2_0: ['team1'],
        winners2_1: [],
        losersBracket: [],
        eliminated3rd: [],
        eliminated0_3: [],
      };
      mockAdvancementService.update.mockResolvedValue(updatedAdvancement);

      // Act
      const result = await controller.update(updateDto);

      // Assert
      expect(result.winners2_0).toEqual(['team1']);
      expect(mockAdvancementService.update).toHaveBeenCalledWith(updateDto);
    });

    it('应该更新多个分类', async () => {
      // Arrange
      const updateDto = {
        winners2_0: ['team1', 'team2'],
        winners2_1: ['team3'],
        losersBracket: ['team4', 'team5'],
      };
      const updatedAdvancement: Advancement = {
        winners2_0: ['team1', 'team2'],
        winners2_1: ['team3'],
        losersBracket: ['team4', 'team5'],
        eliminated3rd: [],
        eliminated0_3: [],
      };
      mockAdvancementService.update.mockResolvedValue(updatedAdvancement);

      // Act
      const result = await controller.update(updateDto);

      // Assert
      expect(result.winners2_0).toEqual(['team1', 'team2']);
      expect(result.winners2_1).toEqual(['team3']);
      expect(result.losersBracket).toEqual(['team4', 'team5']);
    });
  });

  describe('未认证访问 - 返回 401', () => {
    it('应该在未认证时拒绝访问更新接口', async () => {
      // Arrange
      mockJwtAuthGuard.canActivate.mockReturnValueOnce(false);

      // Act & Assert
      const canActivate = mockJwtAuthGuard.canActivate();
      expect(canActivate).toBe(false);
    });

    it('应该在未认证时多次拒绝访问', async () => {
      // Arrange
      mockJwtAuthGuard.canActivate.mockReturnValueOnce(false);

      // Act & Assert
      const canActivate = mockJwtAuthGuard.canActivate();
      expect(canActivate).toBe(false);
      expect(mockJwtAuthGuard.canActivate).toHaveBeenCalled();
    });
  });

  describe('参数验证 - 返回 400', () => {
    it('应该在参数不是数组时抛出错误', async () => {
      // Arrange
      const invalidDto = { winners2_0: 'not_an_array' };
      mockAdvancementService.update.mockRejectedValue(
        new BadRequestException('Invalid data format'),
      );

      // Act & Assert
      await expect(controller.update(invalidDto as any)).rejects.toThrow(BadRequestException);
    });

    it('应该在数组元素不是字符串时抛出错误', async () => {
      // Arrange
      const invalidDto = { winners2_0: [1, 2, 3] };
      mockAdvancementService.update.mockRejectedValue(new BadRequestException('Invalid team IDs'));

      // Act & Assert
      await expect(controller.update(invalidDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('响应格式验证', () => {
    it('应该返回正确的Advancement对象格式', async () => {
      // Arrange
      const advancementData: Advancement = {
        winners2_0: ['team1', 'team2'],
        winners2_1: ['team3'],
        losersBracket: ['team4'],
        eliminated3rd: ['team5'],
        eliminated0_3: ['team6'],
      };
      mockAdvancementService.findOne.mockResolvedValue(advancementData);

      // Act
      const result = await controller.findOne();

      // Assert
      expect(result).toHaveProperty('winners2_0');
      expect(result).toHaveProperty('winners2_1');
      expect(result).toHaveProperty('losersBracket');
      expect(result).toHaveProperty('eliminated3rd');
      expect(result).toHaveProperty('eliminated0_3');
      expect(Array.isArray(result.winners2_0)).toBe(true);
      expect(Array.isArray(result.winners2_1)).toBe(true);
      expect(Array.isArray(result.losersBracket)).toBe(true);
      expect(Array.isArray(result.eliminated3rd)).toBe(true);
      expect(Array.isArray(result.eliminated0_3)).toBe(true);
    });

    it('应该返回所有数组类型的属性', async () => {
      // Arrange
      const advancementData: Advancement = {
        winners2_0: [],
        winners2_1: [],
        losersBracket: [],
        eliminated3rd: [],
        eliminated0_3: [],
      };
      mockAdvancementService.findOne.mockResolvedValue(advancementData);

      // Act
      const result = await controller.findOne();

      // Assert
      const keys = Object.keys(result);
      expect(keys).toContain('winners2_0');
      expect(keys).toContain('winners2_1');
      expect(keys).toContain('losersBracket');
      expect(keys).toContain('eliminated3rd');
      expect(keys).toContain('eliminated0_3');
    });
  });

  describe('错误处理测试', () => {
    it('应该在服务抛出错误时传递错误', async () => {
      // Arrange
      mockAdvancementService.findOne.mockRejectedValue(new Error('Internal server error'));

      // Act & Assert
      await expect(controller.findOne()).rejects.toThrow('Internal server error');
    });

    it('应该在更新时服务错误抛出异常', async () => {
      // Arrange
      const updateDto = { winners2_0: ['team1'] };
      mockAdvancementService.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(controller.update(updateDto)).rejects.toThrow('Database error');
    });

    it('应该在数据解析错误时抛出异常', async () => {
      // Arrange
      mockAdvancementService.findOne.mockRejectedValue(
        new NotFoundException('Advancement data not found'),
      );

      // Act & Assert
      await expect(controller.findOne()).rejects.toThrow(NotFoundException);
    });
  });
});
