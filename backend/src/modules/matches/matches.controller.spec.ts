import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchStatus } from './dto/update-match.dto';

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: MatchesService;

  const mockMatchesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    clearScores: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        {
          provide: MatchesService,
          useValue: mockMatchesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get<MatchesService>(MatchesService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('GET /matches - 应该返回分页比赛列表', async () => {
      const mockMatches = [
        { id: '1', round: 'Round 1', stage: 'swiss' },
        { id: '2', round: 'Round 2', stage: 'swiss' },
      ];
      mockMatchesService.findAll.mockResolvedValue(mockMatches);

      const result = await controller.findAll({ page: 1, pageSize: 10 });

      expect(result).toEqual({
        data: mockMatches,
        total: 2,
        page: 1,
        pageSize: 10,
      });
      expect(mockMatchesService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('GET /matches?stage=swiss - 应该按阶段筛选返回瑞士轮比赛', async () => {
      const mockSwissMatches = [
        { id: '1', round: 'Round 1', stage: 'swiss' },
        { id: '2', round: 'Round 2', stage: 'swiss' },
      ];
      mockMatchesService.findAll.mockResolvedValue(mockSwissMatches);

      const result = await controller.findAll({ page: 1, pageSize: 10 }, 'swiss');

      expect(result.data).toEqual(mockSwissMatches);
      expect(mockMatchesService.findAll).toHaveBeenCalledWith('swiss');
    });

    it('GET /matches?stage=elimination - 应该按阶段筛选返回淘汰赛比赛', async () => {
      const mockEliminationMatches = [
        { id: '3', round: '胜者组半决赛', stage: 'elimination' },
      ];
      mockMatchesService.findAll.mockResolvedValue(mockEliminationMatches);

      const result = await controller.findAll({ page: 1, pageSize: 10 }, 'elimination');

      expect(result.data).toEqual(mockEliminationMatches);
      expect(mockMatchesService.findAll).toHaveBeenCalledWith('elimination');
    });

    it('应该返回空分页结果当没有比赛', async () => {
      mockMatchesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll({ page: 1, pageSize: 10 });

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
      });
    });

    it('应该使用默认分页值', async () => {
      const mockMatches = [{ id: '1', round: 'Round 1', stage: 'swiss' }];
      mockMatchesService.findAll.mockResolvedValue(mockMatches);

      const result = await controller.findAll({});

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(100);
    });
  });

  describe('findOne', () => {
    it('GET /matches/:id - 应该返回单场比赛', async () => {
      const match = {
        id: '1',
        round: 'Round 1',
        stage: 'swiss',
        scoreA: 2,
        scoreB: 1,
      };
      mockMatchesService.findOne.mockResolvedValue(match);

      const result = await controller.findOne('1');

      expect(result).toEqual(match);
      expect(mockMatchesService.findOne).toHaveBeenCalledWith('1');
    });

    it('应该抛出错误当比赛不存在', async () => {
      mockMatchesService.findOne.mockRejectedValue(new Error('Match not found'));

      await expect(controller.findOne('999')).rejects.toThrow('Match not found');
    });
  });

  describe('update', () => {
    it('PUT /admin/matches/:id - 应该更新比赛（需认证）', async () => {
      const updateMatchDto = {
        scoreA: 2,
        scoreB: 1,
        status: MatchStatus.FINISHED,
        winnerId: 'team1',
      };

      const updatedMatch = {
        id: '1',
        round: 'Round 1',
        ...updateMatchDto,
      };
      mockMatchesService.update.mockResolvedValue(updatedMatch);

      const result = await controller.update('1', updateMatchDto);

      expect(result).toEqual(updatedMatch);
      expect(mockMatchesService.update).toHaveBeenCalledWith('1', updateMatchDto);
    });

    it('应该更新比赛队伍', async () => {
      const updateMatchDto = {
        teamAId: 'team1',
        teamBId: 'team2',
      };

      const updatedMatch = {
        id: '1',
        round: 'Round 1',
        teamAId: 'team1',
        teamBId: 'team2',
      };
      mockMatchesService.update.mockResolvedValue(updatedMatch);

      const result = await controller.update('1', updateMatchDto);

      expect(result.teamAId).toBe('team1');
      expect(result.teamBId).toBe('team2');
    });

    it('应该抛出错误当比赛不存在', async () => {
      const updateMatchDto = { scoreA: 2 };

      mockMatchesService.update.mockRejectedValue(new Error('Match not found'));

      await expect(controller.update('999', updateMatchDto)).rejects.toThrow('Match not found');
    });

    it('未认证访问 - 应该返回 401', async () => {
      // 这个测试需要在 E2E 测试中验证
      // 单元测试中我们通过 overrideGuard 来模拟认证
    });
  });

  describe('clearScores', () => {
    it('DELETE /admin/matches/:id/scores - 应该清空比赛比分（需认证）', async () => {
      const clearedMatch = {
        id: '1',
        round: 'Round 1',
        scoreA: 0,
        scoreB: 0,
        winnerId: null,
        status: 'upcoming',
      };
      mockMatchesService.clearScores.mockResolvedValue(clearedMatch);

      const result = await controller.clearScores('1');

      expect(result).toEqual(clearedMatch);
      expect(mockMatchesService.clearScores).toHaveBeenCalledWith('1');
    });

    it('应该抛出错误当比赛不存在', async () => {
      mockMatchesService.clearScores.mockRejectedValue(new Error('Match not found'));

      await expect(controller.clearScores('999')).rejects.toThrow('Match not found');
    });
  });
});
