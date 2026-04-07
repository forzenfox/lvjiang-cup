import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from '../../src/modules/matches/matches.controller';
import { MatchesService, Match } from '../../src/modules/matches/matches.service';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { UpdateMatchDto, MatchStatus } from '../../src/modules/matches/dto/update-match.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: MatchesService;

  const mockMatchesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    clearScores: jest.fn(),
  };

  // 模拟认证守卫
  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
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
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get<MatchesService>(MatchesService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /matches - 获取比赛列表', () => {
    it('应该返回分页比赛列表', async () => {
      // Arrange
      const mockMatches: Match[] = [
        {
          id: 'match1',
          round: 'Round 1',
          stage: 'swiss',
          scoreA: 0,
          scoreB: 0,
          status: 'upcoming',
        },
        {
          id: 'match2',
          round: 'Round 2',
          stage: 'swiss',
          scoreA: 2,
          scoreB: 1,
          status: 'finished',
        },
      ];
      mockMatchesService.findAll.mockResolvedValue(mockMatches);

      // Act
      const result = await controller.findAll({ page: 1, pageSize: 10 });

      // Assert
      expect(result).toEqual({
        data: mockMatches,
        total: 2,
        page: 1,
        pageSize: 10,
      });
      expect(mockMatchesService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('应该按阶段筛选返回比赛列表', async () => {
      // Arrange
      const mockSwissMatches: Match[] = [
        {
          id: 'match1',
          round: 'Round 1',
          stage: 'swiss',
          scoreA: 0,
          scoreB: 0,
          status: 'upcoming',
        },
      ];
      mockMatchesService.findAll.mockResolvedValue(mockSwissMatches);

      // Act
      const result = await controller.findAll({ page: 1, pageSize: 10 }, 'swiss');

      // Assert
      expect(result.data).toEqual(mockSwissMatches);
      expect(mockMatchesService.findAll).toHaveBeenCalledWith('swiss');
    });

    it('应该使用默认分页值', async () => {
      // Arrange
      const mockMatches: Match[] = [
        { id: '1', round: 'Round 1', stage: 'swiss', scoreA: 0, scoreB: 0, status: 'upcoming' },
      ];
      mockMatchesService.findAll.mockResolvedValue(mockMatches);

      // Act
      const result = await controller.findAll({});

      // Assert
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(100);
    });
  });

  describe('GET /matches/:id - 获取单场比赛', () => {
    it('应该返回指定ID的比赛', async () => {
      // Arrange
      const match: Match = {
        id: 'match1',
        round: 'Round 1',
        stage: 'swiss',
        scoreA: 2,
        scoreB: 1,
        status: 'finished',
      };
      mockMatchesService.findOne.mockResolvedValue(match);

      // Act
      const result = await controller.findOne('match1');

      // Assert
      expect(result).toEqual(match);
      expect(mockMatchesService.findOne).toHaveBeenCalledWith('match1');
    });
  });

  describe('POST /admin/matches - 创建比赛 (需认证)', () => {
    it('应该创建新比赛并返回创建的比赛', async () => {
      // Arrange
      const createMatchDto = {
        teamAId: 'team1',
        teamBId: 'team2',
        scoreA: 0,
        scoreB: 0,
        status: MatchStatus.UPCOMING,
        startTime: '2024-01-01T10:00:00Z',
      };
      const createdMatch: Match = {
        id: 'new-match',
        round: 'Round 1',
        stage: 'swiss',
        ...createMatchDto,
      };
      mockMatchesService.update.mockResolvedValue(createdMatch);

      // Act
      const result = await controller.update('new-match', createMatchDto);

      // Assert
      expect(result).toEqual(createdMatch);
    });
  });

  describe('PUT /admin/matches/:id - 更新比赛 (需认证)', () => {
    it('应该更新比赛并返回更新后的比赛', async () => {
      // Arrange
      const updateMatchDto: UpdateMatchDto = {
        scoreA: 2,
        scoreB: 1,
        status: MatchStatus.FINISHED,
        winnerId: 'team1',
      };
      const updatedMatch: Match = {
        id: 'match1',
        round: 'Round 1',
        stage: 'swiss',
        scoreA: 2,
        scoreB: 1,
        status: 'finished',
        winnerId: 'team1',
      };
      mockMatchesService.update.mockResolvedValue(updatedMatch);

      // Act
      const result = await controller.update('match1', updateMatchDto);

      // Assert
      expect(result).toEqual(updatedMatch);
      expect(mockMatchesService.update).toHaveBeenCalledWith('match1', updateMatchDto);
    });

    it('应该更新比赛队伍信息', async () => {
      // Arrange
      const updateMatchDto: UpdateMatchDto = {
        teamAId: 'team1',
        teamBId: 'team2',
      };
      const updatedMatch: Match = {
        id: 'match1',
        round: 'Round 1',
        stage: 'swiss',
        teamAId: 'team1',
        teamBId: 'team2',
        scoreA: 0,
        scoreB: 0,
        status: 'upcoming',
      };
      mockMatchesService.update.mockResolvedValue(updatedMatch);

      // Act
      const result = await controller.update('match1', updateMatchDto);

      // Assert
      expect(result.teamAId).toBe('team1');
      expect(result.teamBId).toBe('team2');
    });
  });

  describe('DELETE /admin/matches/:id/scores - 删除比赛比分 (需认证)', () => {
    it('应该清空比赛比分并返回更新后的比赛', async () => {
      // Arrange
      const clearedMatch: Match = {
        id: 'match1',
        round: 'Round 1',
        stage: 'swiss',
        scoreA: 0,
        scoreB: 0,
        winnerId: undefined,
        status: 'upcoming',
      };
      mockMatchesService.clearScores.mockResolvedValue(clearedMatch);

      // Act
      const result = await controller.clearScores('match1');

      // Assert
      expect(result).toEqual(clearedMatch);
      expect(mockMatchesService.clearScores).toHaveBeenCalledWith('match1');
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

    it('应该在未认证时拒绝访问清空比分接口', async () => {
      // Arrange
      mockJwtAuthGuard.canActivate.mockReturnValueOnce(false);

      // Act & Assert
      const canActivate = mockJwtAuthGuard.canActivate();
      expect(canActivate).toBe(false);
    });
  });

  describe('参数验证 - 返回 400', () => {
    it('应该在参数无效时抛出错误', async () => {
      // Arrange
      const invalidDto = { scoreA: 'invalid' };
      mockMatchesService.update.mockRejectedValue(new BadRequestException('Invalid data'));

      // Act & Assert
      await expect(controller.update('match1', invalidDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('应该在状态值无效时抛出错误', async () => {
      // Arrange
      const invalidDto = { status: 'invalid_status' };
      mockMatchesService.update.mockRejectedValue(new BadRequestException('Invalid status'));

      // Act & Assert
      await expect(controller.update('match1', invalidDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('资源不存在 - 返回 404', () => {
    it('应该在比赛不存在时抛出NotFoundException', async () => {
      // Arrange
      mockMatchesService.findOne.mockRejectedValue(new NotFoundException('Match not found'));

      // Act & Assert
      await expect(controller.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('应该在更新不存在的比赛时抛出NotFoundException', async () => {
      // Arrange
      mockMatchesService.update.mockRejectedValue(new NotFoundException('Match not found'));

      // Act & Assert
      await expect(controller.update('nonexistent', { scoreA: 2 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('应该在清空不存在比赛的比分时抛出NotFoundException', async () => {
      // Arrange
      mockMatchesService.clearScores.mockRejectedValue(new NotFoundException('Match not found'));

      // Act & Assert
      await expect(controller.clearScores('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
