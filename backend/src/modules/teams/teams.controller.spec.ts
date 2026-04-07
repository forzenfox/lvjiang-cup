import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService, Team } from './teams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: TeamsService;

  const mockTeamsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // 模拟认证守卫
  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: TeamsService,
          useValue: mockTeamsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /teams - 返回战队列表', () => {
    it('应该返回分页战队列表', async () => {
      // Arrange
      const mockTeams: Team[] = [
        { id: 'team1', name: 'Team 1', members: [] },
        { id: 'team2', name: 'Team 2', members: [] },
      ];
      mockTeamsService.findAll.mockResolvedValue(mockTeams);

      // Act
      const result = await controller.findAll({ page: 1, pageSize: 10 });

      // Assert
      expect(result).toEqual({
        data: mockTeams,
        total: 2,
        page: 1,
        pageSize: 10,
      });
      expect(mockTeamsService.findAll).toHaveBeenCalled();
    });

    it('应该使用默认分页值', async () => {
      // Arrange
      const mockTeams: Team[] = [{ id: '1', name: 'Team1', members: [] }];
      mockTeamsService.findAll.mockResolvedValue(mockTeams);

      // Act
      const result = await controller.findAll({});

      // Assert
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(100);
    });
  });

  describe('GET /teams/:id - 返回单个战队', () => {
    it('应该返回指定ID的战队', async () => {
      // Arrange
      const team: Team = { id: 'team1', name: 'Team 1', members: [] };
      mockTeamsService.findOne.mockResolvedValue(team);

      // Act
      const result = await controller.findOne('team1');

      // Assert
      expect(result).toEqual(team);
      expect(mockTeamsService.findOne).toHaveBeenCalledWith('team1');
    });
  });

  describe('POST /admin/teams - 创建战队 (需认证)', () => {
    it('应该创建新战队并返回创建的战队', async () => {
      // Arrange
      const createTeamDto = {
        id: 'new-team',
        name: 'New Team',
        logo: 'logo.png',
        description: 'A new team',
        members: [{ id: 'p1', nickname: 'Player 1', position: 'TOP' as const }],
      };
      const createdTeam: Team = {
        id: 'new-team',
        name: 'New Team',
        logo: 'logo.png',
        description: 'A new team',
        members: [{ id: 'p1', nickname: 'Player 1', position: 'TOP', teamId: 'new-team' }],
      };
      mockTeamsService.create.mockResolvedValue(createdTeam);

      // Act
      const result = await controller.create(createTeamDto);

      // Assert
      expect(result).toEqual(createdTeam);
      expect(mockTeamsService.create).toHaveBeenCalledWith(createTeamDto);
    });
  });

  describe('PUT /admin/teams/:id - 更新战队 (需认证)', () => {
    it('应该更新战队并返回更新后的战队', async () => {
      // Arrange
      const updateTeamDto = {
        name: 'Updated Team',
        logo: 'new-logo.png',
      };
      const updatedTeam: Team = {
        id: 'team1',
        name: 'Updated Team',
        logo: 'new-logo.png',
        members: [],
      };
      mockTeamsService.update.mockResolvedValue(updatedTeam);

      // Act
      const result = await controller.update('team1', updateTeamDto);

      // Assert
      expect(result).toEqual(updatedTeam);
      expect(mockTeamsService.update).toHaveBeenCalledWith('team1', updateTeamDto);
    });
  });

  describe('DELETE /admin/teams/:id - 删除战队 (需认证)', () => {
    it('应该删除战队并返回成功消息', async () => {
      // Arrange
      mockTeamsService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove('team1');

      // Assert
      expect(result).toEqual({ message: 'Team deleted successfully' });
      expect(mockTeamsService.remove).toHaveBeenCalledWith('team1');
    });
  });

  describe('未认证访问管理接口 - 返回 401', () => {
    it('应该在未认证时拒绝访问创建接口', async () => {
      // Arrange
      mockJwtAuthGuard.canActivate.mockReturnValueOnce(false);

      // Act & Assert
      const canActivate = mockJwtAuthGuard.canActivate();
      expect(canActivate).toBe(false);
    });

    it('应该在未认证时拒绝访问更新接口', async () => {
      // Arrange
      mockJwtAuthGuard.canActivate.mockReturnValueOnce(false);

      // Act & Assert
      const canActivate = mockJwtAuthGuard.canActivate();
      expect(canActivate).toBe(false);
    });

    it('应该在未认证时拒绝访问删除接口', async () => {
      // Arrange
      mockJwtAuthGuard.canActivate.mockReturnValueOnce(false);

      // Act & Assert
      const canActivate = mockJwtAuthGuard.canActivate();
      expect(canActivate).toBe(false);
    });
  });

  describe('参数验证失败 - 返回 400', () => {
    it('应该在参数无效时抛出错误', async () => {
      // Arrange
      const invalidDto = { name: '' };
      mockTeamsService.create.mockRejectedValue(new BadRequestException('Invalid data'));

      // Act & Assert
      await expect(controller.create(invalidDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('资源不存在 - 返回 404', () => {
    it('应该在战队不存在时抛出NotFoundException', async () => {
      // Arrange
      mockTeamsService.findOne.mockRejectedValue(new NotFoundException('Team not found'));

      // Act & Assert
      await expect(controller.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('应该在更新不存在的战队时抛出NotFoundException', async () => {
      // Arrange
      mockTeamsService.update.mockRejectedValue(new NotFoundException('Team not found'));

      // Act & Assert
      await expect(controller.update('nonexistent', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('应该在删除不存在的战队时抛出NotFoundException', async () => {
      // Arrange
      mockTeamsService.remove.mockRejectedValue(new NotFoundException('Team not found'));

      // Act & Assert
      await expect(controller.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('服务器错误 - 返回 500', () => {
    it('应该在服务抛出错误时传递错误', async () => {
      // Arrange
      mockTeamsService.findAll.mockRejectedValue(new Error('Internal server error'));

      // Act & Assert
      await expect(controller.findAll({})).rejects.toThrow('Internal server error');
    });
  });

  describe('响应格式验证', () => {
    it('应该返回正确的分页响应格式', async () => {
      // Arrange
      const mockTeams: Team[] = [{ id: '1', name: 'Team1', members: [] }];
      mockTeamsService.findAll.mockResolvedValue(mockTeams);

      // Act
      const result = await controller.findAll({ page: 1, pageSize: 10 });

      // Assert
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('pageSize');
      expect(Array.isArray(result.data)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(typeof result.page).toBe('number');
      expect(typeof result.pageSize).toBe('number');
    });

    it('应该返回正确的战队对象格式', async () => {
      // Arrange
      const team: Team = {
        id: 'team1',
        name: 'Team 1',
        logo: 'logo.png',
        description: 'Description',
        members: [{ id: 'p1', nickname: 'Player 1', position: 'TOP', teamId: 'team1' }],
      };
      mockTeamsService.findOne.mockResolvedValue(team);

      // Act
      const result = await controller.findOne('team1');

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('members');
      expect(Array.isArray(result.members)).toBe(true);
    });

    it('应该返回正确的删除响应格式', async () => {
      // Arrange
      mockTeamsService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove('team1');

      // Assert
      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toBe('Team deleted successfully');
    });
  });
});
