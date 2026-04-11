import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from '../../src/modules/teams/teams.controller';
import { TeamsService, Team } from '../../src/modules/teams/teams.service';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
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
    findMembersByTeamId: jest.fn(),
    createMember: jest.fn(),
    updateMember: jest.fn(),
    removeMember: jest.fn(),
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
        battleCry: 'A new team',
        members: [{ id: 'p1', nickname: 'Player 1', position: 'TOP' as const }],
      };
      const createdTeam: Team = {
        id: 'new-team',
        name: 'New Team',
        logo: 'logo.png',
        battleCry: 'A new team',
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

  describe('GET /teams/:id/members - 获取战队队员列表', () => {
    it('应该返回战队队员列表', async () => {
      // Arrange
      const mockMembers = [
        { id: 'member1', nickname: 'Player 1', position: 'TOP', teamId: 'team1' },
        { id: 'member2', nickname: 'Player 2', position: 'JUNGLE', teamId: 'team1' },
      ];
      mockTeamsService.findMembersByTeamId.mockResolvedValue(mockMembers);

      // Act
      const result = await controller.findMembers('team1');

      // Assert
      expect(result).toEqual(mockMembers);
      expect(mockTeamsService.findMembersByTeamId).toHaveBeenCalledWith('team1');
    });

    it('应该返回空数组当战队没有队员', async () => {
      // Arrange
      mockTeamsService.findMembersByTeamId.mockResolvedValue([]);

      // Act
      const result = await controller.findMembers('team1');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('POST /teams/:id/members - 添加队员 (需认证)', () => {
    it('应该添加队员并返回创建的队员', async () => {
      // Arrange
      const createMemberDto = {
        id: 'new-member',
        nickname: 'New Player',
        position: 'MID' as const,
      };
      const createdMember = {
        id: 'new-member',
        nickname: 'New Player',
        position: 'MID',
        teamId: 'team1',
      };
      mockTeamsService.createMember.mockResolvedValue(createdMember);

      // Act
      const result = await controller.createMember('team1', createMemberDto);

      // Assert
      expect(result).toEqual(createdMember);
      expect(mockTeamsService.createMember).toHaveBeenCalledWith('team1', createMemberDto);
    });
  });

  describe('PUT /admin/members/:id - 更新队员 (需认证)', () => {
    it('应该更新队员并返回更新后的队员', async () => {
      // Arrange
      const updateMemberDto = {
        nickname: 'Updated Player',
        position: 'ADC' as const,
      };
      const updatedMember = {
        id: 'member1',
        nickname: 'Updated Player',
        position: 'ADC',
        teamId: 'team1',
      };
      mockTeamsService.updateMember.mockResolvedValue(updatedMember);

      // Act
      const result = await controller.updateMember('member1', updateMemberDto);

      // Assert
      expect(result).toEqual(updatedMember);
      expect(mockTeamsService.updateMember).toHaveBeenCalledWith('member1', updateMemberDto);
    });
  });

  describe('DELETE /admin/members/:id - 删除队员 (需认证)', () => {
    it('应该删除队员并返回成功消息', async () => {
      // Arrange
      mockTeamsService.removeMember.mockResolvedValue(undefined);

      // Act
      const result = await controller.removeMember('member1');

      // Assert
      expect(result).toEqual({ message: 'Member deleted successfully' });
      expect(mockTeamsService.removeMember).toHaveBeenCalledWith('member1');
    });
  });

  describe('UUID 重构 - 后端生成ID', () => {
    it('should create team without providing ID and return UUID', async () => {
      // Arrange - 不传递 ID
      const createTeamDto = {
        name: 'New Team',
        logo: 'logo.png',
        battleCry: 'A new team',
        // 注意：没有 id 字段
      };

      const createdTeam: Team = {
        id: '550e8400-e29b-41d4-a716-446655440000', // UUID v4 格式
        name: 'New Team',
        logo: 'logo.png',
        battleCry: 'A new team',
        members: [],
      };
      mockTeamsService.create.mockResolvedValue(createdTeam);

      // Act
      const result = await controller.create(createTeamDto as any);

      // Assert
      expect(result).toEqual(createdTeam);
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(mockTeamsService.create).toHaveBeenCalledWith(createTeamDto);
    });

    it('should create member without providing ID and return UUID', async () => {
      // Arrange
      const createMemberDto = {
        nickname: 'New Player',
        position: 'MID' as const,
        // 注意：没有 id 字段
      };
      const createdMember = {
        id: '550e8400-e29b-41d4-a716-446655440001', // UUID v4 格式
        nickname: 'New Player',
        position: 'MID',
        teamId: 'team1',
      };
      mockTeamsService.createMember.mockResolvedValue(createdMember);

      // Act
      const result = await controller.createMember('team1', createMemberDto as any);

      // Assert
      expect(result).toEqual(createdMember);
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should reject invalid UUID format in update request', async () => {
      // Arrange
      mockTeamsService.update.mockRejectedValue(new NotFoundException('Team not found'));

      // Act & Assert
      await expect(controller.update('invalid-uuid', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
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
        battleCry: 'Description',
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

    it('应该返回正确的队员删除响应格式', async () => {
      // Arrange
      mockTeamsService.removeMember.mockResolvedValue(undefined);

      // Act
      const result = await controller.removeMember('member1');

      // Assert
      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message).toBe('Member deleted successfully');
    });
  });
});
