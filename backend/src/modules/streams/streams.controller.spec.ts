import { Test, TestingModule } from '@nestjs/testing';
import { StreamsController } from './streams.controller';
import { StreamsService } from './streams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('StreamsController', () => {
  let controller: StreamsController;
  let service: StreamsService;

  const mockStreamsService = {
    findOne: jest.fn(),
    findActive: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamsController],
      providers: [
        {
          provide: StreamsService,
          useValue: mockStreamsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StreamsController>(StreamsController);
    service = module.get<StreamsService>(StreamsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('GET /stream - 应该返回直播信息', async () => {
      const streamInfo = {
        title: 'Test Stream',
        url: 'http://example.com',
        isLive: true,
      };
      mockStreamsService.findOne.mockResolvedValue(streamInfo);

      const result = await controller.findOne();

      expect(result).toEqual(streamInfo);
      expect(mockStreamsService.findOne).toHaveBeenCalled();
    });

    it('应该返回默认直播信息', async () => {
      const defaultStreamInfo = {
        title: '',
        url: '',
        isLive: false,
      };
      mockStreamsService.findOne.mockResolvedValue(defaultStreamInfo);

      const result = await controller.findOne();

      expect(result).toEqual(defaultStreamInfo);
    });
  });

  describe('findActive', () => {
    it('GET /streams/active - 应该返回活跃直播', async () => {
      const activeStream = {
        id: '1',
        title: 'Active Stream',
        url: 'http://example.com',
        isLive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockStreamsService.findActive.mockResolvedValue(activeStream);

      const result = await controller.findActive();

      expect(result).toEqual(activeStream);
      expect(mockStreamsService.findActive).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('GET /streams/:id - 应该返回指定直播', async () => {
      const stream = {
        id: '1',
        title: 'Test Stream',
        url: 'http://example.com',
        isLive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockStreamsService.findById.mockResolvedValue(stream);

      const result = await controller.findById('1');

      expect(result).toEqual(stream);
      expect(mockStreamsService.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('findAll', () => {
    it('GET /streams - 应该返回所有直播', async () => {
      const streams = [
        {
          id: '1',
          title: 'Stream 1',
          url: 'http://example1.com',
          isLive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Stream 2',
          url: 'http://example2.com',
          isLive: false,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ];
      mockStreamsService.findAll.mockResolvedValue(streams);

      const result = await controller.findAll();

      expect(result).toEqual(streams);
      expect(mockStreamsService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('POST /streams - 应该创建直播（需认证）', async () => {
      const createDto = {
        title: 'New Stream',
        url: 'http://new.com',
        isLive: true,
      };
      const createdStream = {
        id: '1',
        title: 'New Stream',
        url: 'http://new.com',
        isLive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockStreamsService.create.mockResolvedValue(createdStream);

      const result = await controller.create(createDto);

      expect(result).toEqual(createdStream);
      expect(mockStreamsService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('PATCH /streams/:id - 应该更新直播信息（需认证）', async () => {
      const updateDto = {
        title: 'New Title',
        url: 'http://new.com',
        isLive: true,
      };
      const updatedStream = {
        id: '1',
        title: 'New Title',
        url: 'http://new.com',
        isLive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockStreamsService.update.mockResolvedValue(updatedStream);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updatedStream);
      expect(mockStreamsService.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('应该部分更新直播信息', async () => {
      const updateDto = {
        title: 'Updated Title',
      };
      const updatedStream = {
        id: '1',
        title: 'Updated Title',
        url: 'http://old.com',
        isLive: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockStreamsService.update.mockResolvedValue(updatedStream);

      const result = await controller.update('1', updateDto);

      expect(result.title).toBe('Updated Title');
    });

    it('应该更新直播状态', async () => {
      const updateDto = {
        isLive: true,
      };
      const updatedStream = {
        id: '1',
        title: 'Test',
        url: 'http://test.com',
        isLive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockStreamsService.update.mockResolvedValue(updatedStream);

      const result = await controller.update('1', updateDto);

      expect(result.isLive).toBe(true);
    });
  });

  describe('remove', () => {
    it('DELETE /streams/:id - 应该删除直播（需认证）', async () => {
      mockStreamsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockStreamsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
