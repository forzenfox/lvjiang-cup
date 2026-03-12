import { Test, TestingModule } from '@nestjs/testing';
import { AdvancementController } from './advancement.controller';
import { AdvancementService } from './advancement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('AdvancementController', () => {
  let controller: AdvancementController;
  let service: AdvancementService;

  const mockAdvancementService = {
    findOne: jest.fn(),
    update: jest.fn(),
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
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdvancementController>(AdvancementController);
    service = module.get<AdvancementService>(AdvancementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('GET /advancement - 应该返回晋级名单', async () => {
      const advancementData = {
        winners2_0: ['team1', 'team2'],
        winners2_1: ['team3'],
        losersBracket: ['team4'],
        eliminated3rd: ['team5'],
        eliminated0_3: ['team6'],
      };
      mockAdvancementService.findOne.mockResolvedValue(advancementData);

      const result = await controller.findOne();

      expect(result).toEqual(advancementData);
      expect(mockAdvancementService.findOne).toHaveBeenCalled();
    });

    it('应该返回空晋级名单', async () => {
      const emptyAdvancement = {
        winners2_0: [],
        winners2_1: [],
        losersBracket: [],
        eliminated3rd: [],
        eliminated0_3: [],
      };
      mockAdvancementService.findOne.mockResolvedValue(emptyAdvancement);

      const result = await controller.findOne();

      expect(result).toEqual(emptyAdvancement);
    });
  });

  describe('update', () => {
    it('PUT /admin/advancement - 应该更新晋级名单（需认证）', async () => {
      const updateDto = {
        winners2_0: ['team1', 'team2'],
        winners2_1: ['team3'],
      };
      const updatedAdvancement = {
        winners2_0: ['team1', 'team2'],
        winners2_1: ['team3'],
        losersBracket: [],
        eliminated3rd: [],
        eliminated0_3: [],
      };
      mockAdvancementService.update.mockResolvedValue(updatedAdvancement);

      const result = await controller.update(updateDto);

      expect(result).toEqual(updatedAdvancement);
      expect(mockAdvancementService.update).toHaveBeenCalledWith(updateDto);
    });

    it('应该更新单个分类', async () => {
      const updateDto = {
        winners2_0: ['team1'],
      };
      const updatedAdvancement = {
        winners2_0: ['team1'],
        winners2_1: [],
        losersBracket: [],
        eliminated3rd: [],
        eliminated0_3: [],
      };
      mockAdvancementService.update.mockResolvedValue(updatedAdvancement);

      const result = await controller.update(updateDto);

      expect(result.winners2_0).toEqual(['team1']);
    });

    it('应该清空分类', async () => {
      const updateDto = {
        winners2_0: [],
      };
      const updatedAdvancement = {
        winners2_0: [],
        winners2_1: [],
        losersBracket: [],
        eliminated3rd: [],
        eliminated0_3: [],
      };
      mockAdvancementService.update.mockResolvedValue(updatedAdvancement);

      const result = await controller.update(updateDto);

      expect(result.winners2_0).toEqual([]);
    });

    it('应该更新多个分类', async () => {
      const updateDto = {
        winners2_0: ['team1'],
        winners2_1: ['team2'],
        losersBracket: ['team3'],
      };
      const updatedAdvancement = {
        winners2_0: ['team1'],
        winners2_1: ['team2'],
        losersBracket: ['team3'],
        eliminated3rd: [],
        eliminated0_3: [],
      };
      mockAdvancementService.update.mockResolvedValue(updatedAdvancement);

      const result = await controller.update(updateDto);

      expect(result.winners2_0).toEqual(['team1']);
      expect(result.winners2_1).toEqual(['team2']);
      expect(result.losersBracket).toEqual(['team3']);
    });
  });
});
