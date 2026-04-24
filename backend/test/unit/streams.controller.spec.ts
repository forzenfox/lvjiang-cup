import { Test, TestingModule } from '@nestjs/testing';
import { StreamsController } from '../../src/modules/streams/streams.controller';
import { StreamsService, StreamInfo } from '../../src/modules/streams/streams.service';
import { Stream } from '../../src/modules/streams/entities/stream.entity';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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

  // 模拟认证守卫
  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
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
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<StreamsController>(StreamsController);
    service = module.get<StreamsService>(StreamsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /stream - 获取直播信息', () => {
    it('应该返回直播信息', async () => {
      // Arrange
      const streamInfo: StreamInfo = {
        title: '驴酱杯直播',
        url: 'http://example.com/stream',
        isLive: true,
      };
      mockStreamsService.findOne.mockResolvedValue(streamInfo);

      // Act
      const result = await controller.findOne();

      // Assert
      expect(result).toEqual(streamInfo);
      expect(mockStreamsService.findOne).toHaveBeenCalled();
    });

    it('应该返回默认直播信息当数据库为空', async () => {
      // Arrange
      const defaultStreamInfo: StreamInfo = {
        title: '',
        url: '',
        isLive: false,
      };
      mockStreamsService.findOne.mockResolvedValue(defaultStreamInfo);

      // Act
      const result = await controller.findOne();

      // Assert
      expect(result).toEqual(defaultStreamInfo);
    });
  });

  describe('PUT /admin/stream - 更新直播信息 (需认证)', () => {
    it('应该更新直播信息并返回更新后的直播', async () => {
      // Arrange
      const updateDto = {
        title: 'Updated Stream',
        url: 'http://new-url.com',
        isLive: true,
      };
      const updatedStream: Stream = {
        id: '1',
        title: 'Updated Stream',
        url: 'http://new-url.com',
        isLive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockStreamsService.update.mockResolvedValue(updatedStream);

      // Act
      const result = await controller.update('1', updateDto);

      // Assert
      expect(result).toEqual(updatedStream);
      expect(mockStreamsService.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('应该部分更新直播信息', async () => {
      // Arrange
      const updateDto = {
        title: 'New Title Only',
      };
      const updatedStream: Stream = {
        id: '1',
        title: 'New Title Only',
        url: 'http://old-url.com',
        isLive: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockStreamsService.update.mockResolvedValue(updatedStream);

      // Act
      const result = await controller.update('1', updateDto);

      // Assert
      expect(result.title).toBe('New Title Only');
      expect(result.url).toBe('http://old-url.com');
    });
  });

  describe('参数验证 - 返回 400', () => {
    it('应该在参数无效时抛出错误', async () => {
      // Arrange
      const invalidDto = { isLive: 'not_a_boolean' };
      mockStreamsService.update.mockRejectedValue(new BadRequestException('Invalid data'));

      // Act & Assert
      await expect(controller.update('1', invalidDto as any)).rejects.toThrow(BadRequestException);
    });

    it('应该在URL格式无效时抛出错误', async () => {
      // Arrange
      const invalidDto = { url: 'invalid-url' };
      mockStreamsService.update.mockRejectedValue(new BadRequestException('Invalid URL'));

      // Act & Assert
      await expect(controller.update('1', invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('响应格式验证', () => {
    it('应该返回正确的StreamInfo格式', async () => {
      // Arrange
      const streamInfo: StreamInfo = {
        title: 'Test Stream',
        url: 'http://example.com',
        isLive: true,
      };
      mockStreamsService.findOne.mockResolvedValue(streamInfo);

      // Act
      const result = await controller.findOne();

      // Assert
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('isLive');
      expect(typeof result.title).toBe('string');
      expect(typeof result.url).toBe('string');
      expect(typeof result.isLive).toBe('boolean');
    });

    it('应该返回正确的Stream对象格式', async () => {
      // Arrange
      const stream: Stream = {
        id: '1',
        title: 'Test Stream',
        url: 'http://example.com',
        isLive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockStreamsService.findActive.mockResolvedValue(stream);

      // Act
      const result = await controller.findActive();

      // Assert
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('isLive');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('GET /streams/active - 获取当前活跃直播', () => {
    it('应该返回当前活跃直播', async () => {
      // Arrange
      const activeStream: Stream = {
        id: '1',
        title: 'Active Stream',
        url: 'http://example.com/active',
        isLive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockStreamsService.findActive.mockResolvedValue(activeStream);

      // Act
      const result = await controller.findActive();

      // Assert
      expect(result).toEqual(activeStream);
      expect(mockStreamsService.findActive).toHaveBeenCalled();
    });

    it('应该在没有活跃直播时返回null或默认值', async () => {
      // Arrange
      mockStreamsService.findActive.mockResolvedValue(null);

      // Act
      const result = await controller.findActive();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('GET /streams/:id - 获取指定直播', () => {
    it('应该返回指定ID的直播', async () => {
      // Arrange
      const stream: Stream = {
        id: '1',
        title: 'Test Stream',
        url: 'http://example.com',
        isLive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockStreamsService.findById.mockResolvedValue(stream);

      // Act
      const result = await controller.findById('1');

      // Assert
      expect(result).toEqual(stream);
      expect(mockStreamsService.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('GET /streams - 获取所有直播列表', () => {
    it('应该返回所有直播列表', async () => {
      // Arrange
      const streams: Stream[] = [
        {
          id: '1',
          title: 'Stream 1',
          url: 'http://example.com/1',
          isLive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Stream 2',
          url: 'http://example.com/2',
          isLive: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      mockStreamsService.findAll.mockResolvedValue(streams);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(streams);
      expect(mockStreamsService.findAll).toHaveBeenCalled();
    });

    it('应该返回空数组当没有直播', async () => {
      // Arrange
      mockStreamsService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('POST /streams - 创建直播 (需认证)', () => {
    it('应该创建直播并返回创建的直播', async () => {
      // Arrange
      const createStreamDto = {
        title: 'New Stream',
        url: 'http://example.com/new',
        isLive: true,
      };
      const createdStream: Stream = {
        id: '3',
        title: 'New Stream',
        url: 'http://example.com/new',
        isLive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      mockStreamsService.create.mockResolvedValue(createdStream);

      // Act
      const result = await controller.create(createStreamDto);

      // Assert
      expect(result).toEqual(createdStream);
      expect(mockStreamsService.create).toHaveBeenCalledWith(createStreamDto);
    });
  });

  describe('DELETE /streams/:id - 删除直播 (需认证)', () => {
    it('应该删除直播并返回undefined', async () => {
      // Arrange
      mockStreamsService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove('1');

      // Assert
      expect(result).toBeUndefined();
      expect(mockStreamsService.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('错误处理测试', () => {
    it('应该在直播不存在时抛出NotFoundException', async () => {
      // Arrange
      mockStreamsService.findById.mockRejectedValue(new NotFoundException('Stream not found'));

      // Act & Assert
      await expect(controller.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('应该在更新不存在的直播时抛出NotFoundException', async () => {
      // Arrange
      mockStreamsService.update.mockRejectedValue(new NotFoundException('Stream not found'));

      // Act & Assert
      await expect(controller.update('nonexistent', { title: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('应该在删除不存在的直播时抛出NotFoundException', async () => {
      // Arrange
      mockStreamsService.remove.mockRejectedValue(new NotFoundException('Stream not found'));

      // Act & Assert
      await expect(controller.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('应该在服务抛出错误时传递错误', async () => {
      // Arrange
      mockStreamsService.findAll.mockRejectedValue(new Error('Internal server error'));

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow('Internal server error');
    });

    it('应该在获取活跃直播时服务错误抛出异常', async () => {
      // Arrange
      mockStreamsService.findActive.mockRejectedValue(new Error('Service error'));

      // Act & Assert
      await expect(controller.findActive()).rejects.toThrow('Service error');
    });

    it('应该在创建直播时服务错误抛出异常', async () => {
      // Arrange
      const createStreamDto = { title: 'Test', url: 'http://example.com', isLive: true };
      mockStreamsService.create.mockRejectedValue(new Error('Creation failed'));

      // Act & Assert
      await expect(controller.create(createStreamDto)).rejects.toThrow('Creation failed');
    });
  });
});
