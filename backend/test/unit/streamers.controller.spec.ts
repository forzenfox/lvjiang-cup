import { Test, TestingModule } from '@nestjs/testing';
import { StreamersController } from '../../src/modules/streamers/streamers.controller';
import { StreamersService, StreamerType } from '../../src/modules/streamers/streamers.service';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('StreamersController', () => {
  let controller: StreamersController;
  let service: StreamersService;

  const mockStreamersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateSort: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => true),
  };

  const mockStreamer = {
    id: 'streamer_1',
    nickname: 'TestStreamer',
    posterUrl: '/uploads/streamers/test.jpg',
    bio: 'Test bio',
    liveUrl: 'https://test.com/live',
    streamerType: StreamerType.INTERNAL,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamersController],
      providers: [
        { provide: StreamersService, useValue: mockStreamersService },
        { provide: JwtAuthGuard, useValue: mockJwtAuthGuard },
      ],
    }).compile();

    controller = module.get<StreamersController>(StreamersController);
    service = module.get<StreamersService>(StreamersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all streamers', async () => {
      const streamers = [mockStreamer];
      mockStreamersService.findAll.mockResolvedValue(streamers);

      const result = await controller.findAll();

      expect(result).toEqual(streamers);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no streamers exist', async () => {
      mockStreamersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single streamer by id', async () => {
      mockStreamersService.findOne.mockResolvedValue(mockStreamer);

      const result = await controller.findOne('streamer_1');

      expect(result).toEqual(mockStreamer);
      expect(service.findOne).toHaveBeenCalledWith('streamer_1');
    });
  });

  describe('create', () => {
    it('should create a new streamer', async () => {
      const createDto = {
        nickname: 'NewStreamer',
        posterUrl: '/uploads/streamers/new.jpg',
        bio: 'New bio',
        liveUrl: 'https://new.com/live',
        streamerType: StreamerType.GUEST,
      };

      const createdStreamer = { id: 'streamer_2', ...createDto, sortOrder: 0 };
      mockStreamersService.create.mockResolvedValue(createdStreamer);

      const result = await controller.create(createDto);

      expect(result).toEqual(createdStreamer);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateSort', () => {
    it('should update streamer sort orders', async () => {
      const updateSortDto = {
        orders: [
          { id: 'streamer_1', sortOrder: 2 },
          { id: 'streamer_2', sortOrder: 1 },
        ],
      };

      mockStreamersService.updateSort.mockResolvedValue(undefined);

      await controller.updateSort(updateSortDto);

      expect(service.updateSort).toHaveBeenCalledWith(updateSortDto);
    });

    it('should handle empty orders array', async () => {
      const updateSortDto = { orders: [] };

      mockStreamersService.updateSort.mockResolvedValue(undefined);

      await controller.updateSort(updateSortDto);

      expect(service.updateSort).toHaveBeenCalledWith(updateSortDto);
    });
  });

  describe('update', () => {
    it('should update a streamer', async () => {
      const updateDto = {
        nickname: 'UpdatedName',
        bio: 'Updated bio',
      };

      const updatedStreamer = { ...mockStreamer, ...updateDto };
      mockStreamersService.update.mockResolvedValue(updatedStreamer);

      const result = await controller.update('streamer_1', updateDto);

      expect(result).toEqual(updatedStreamer);
      expect(service.update).toHaveBeenCalledWith('streamer_1', updateDto);
    });

    it('should partially update a streamer', async () => {
      const updateDto = { nickname: 'OnlyNameChanged' };

      const updatedStreamer = { ...mockStreamer, ...updateDto };
      mockStreamersService.update.mockResolvedValue(updatedStreamer);

      const result = await controller.update('streamer_1', updateDto);

      expect(result.nickname).toBe('OnlyNameChanged');
      expect(service.update).toHaveBeenCalledWith('streamer_1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a streamer', async () => {
      mockStreamersService.remove.mockResolvedValue(undefined);

      await controller.remove('streamer_1');

      expect(service.remove).toHaveBeenCalledWith('streamer_1');
    });
  });
});
