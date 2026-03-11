import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of teams', async () => {
      const mockTeams = [{ id: '1', name: 'Team1' }];
      mockTeamsService.findAll.mockResolvedValue(mockTeams);

      const result = await controller.findAll();

      expect(result).toEqual(mockTeams);
      expect(mockTeamsService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no teams', async () => {
      mockTeamsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a team', async () => {
      const team = { id: '1', name: 'Team1' };
      mockTeamsService.findOne.mockResolvedValue(team);

      const result = await controller.findOne('1');

      expect(result).toEqual(team);
      expect(mockTeamsService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw error when team not found', async () => {
      mockTeamsService.findOne.mockRejectedValue(new Error('Team not found'));

      await expect(controller.findOne('999')).rejects.toThrow('Team not found');
    });
  });

  describe('create', () => {
    it('should create a team', async () => {
      const createTeamDto = {
        id: 'new-team-id',
        name: 'New Team',
        logo: 'logo.png',
        description: 'Test team',
        players: [],
      };

      const createdTeam = { id: '1', ...createTeamDto };
      mockTeamsService.create.mockResolvedValue(createdTeam);

      const result = await controller.create(createTeamDto);

      expect(result).toEqual(createdTeam);
      expect(mockTeamsService.create).toHaveBeenCalledWith(createTeamDto);
    });

    it('should create a team with players', async () => {
      const createTeamDto = {
        id: 'new-team-id',
        name: 'New Team',
        logo: 'logo.png',
        description: 'Test team',
        players: [
          { id: 'p1', name: 'Player1', position: '上单' as const },
          { id: 'p2', name: 'Player2', position: '打野' as const },
        ],
      };

      const createdTeam = { id: '1', ...createTeamDto };
      mockTeamsService.create.mockResolvedValue(createdTeam);

      const result = await controller.create(createTeamDto);

      expect(result.players).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update a team', async () => {
      const updateTeamDto = {
        name: 'Updated Team',
        logo: 'new-logo.png',
      };

      const updatedTeam = { id: '1', ...updateTeamDto };
      mockTeamsService.update.mockResolvedValue(updatedTeam);

      const result = await controller.update('1', updateTeamDto);

      expect(result).toEqual(updatedTeam);
      expect(mockTeamsService.update).toHaveBeenCalledWith('1', updateTeamDto);
    });

    it('should throw error when team not found', async () => {
      const updateTeamDto = { name: 'Updated Team' };

      mockTeamsService.update.mockRejectedValue(new Error('Team not found'));

      await expect(controller.update('999', updateTeamDto)).rejects.toThrow('Team not found');
    });
  });

  describe('remove', () => {
    it('should delete a team', async () => {
      mockTeamsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockTeamsService.remove).toHaveBeenCalledWith('1');
    });

    it('should throw error when team not found', async () => {
      mockTeamsService.remove.mockRejectedValue(new Error('Team not found'));

      await expect(controller.remove('999')).rejects.toThrow('Team not found');
    });
  });
});
