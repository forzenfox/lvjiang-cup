import { Test, TestingModule } from '@nestjs/testing';
import { StreamsController } from './streams.controller';
import { StreamsService, StreamInfo } from './streams.service';
import { Stream } from './entities/stream.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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

  describe('未认证访问 - 返回 401', () => {
    it('应该在未认证时拒绝访问更新接口', async () => {
      // Arrange
      mockJwtAuthGuard.canActivate.mockReturnValueOnce(false);

      // Act & Assert
      const canActivate = mockJwtAuthGuard.canActivate();
      expect(canActivate).toBe(false);
    });

    it('应该在未认证时拒绝访问创建接口', async () => {
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
  });
});
