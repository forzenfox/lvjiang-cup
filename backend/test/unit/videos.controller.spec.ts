import { Test, TestingModule } from '@nestjs/testing';
import { VideosController } from '../../src/modules/videos/videos.controller';
import { VideosService, SortItem } from '../../src/modules/videos/videos.service';
import { Video } from '../../src/modules/videos/entities/video.entity';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { NotFoundException } from '@nestjs/common';

describe('VideosController', () => {
  let controller: VideosController;
  let service: VideosService;

  const mockVideosService = {
    findAll: jest.fn(),
    findAllAdmin: jest.fn(),
    findAllAdminPaginated: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    sort: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockVideo: Video = {
    id: '1',
    title: 'Test Video',
    bvid: 'BV1234567890',
    page: 1,
    coverUrl: 'http://example.com/cover.jpg',
    order: 0,
    status: 'enabled',
    isEnabled: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideosController],
      providers: [
        {
          provide: VideosService,
          useValue: mockVideosService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<VideosController>(VideosController);
    service = module.get<VideosService>(VideosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('认证守卫测试', () => {
    it('GET /api/videos无需认证', async () => {
      const mockVideos: Video[] = [mockVideo];
      mockVideosService.findAll.mockResolvedValue(mockVideos);

      const result = await controller.findAll();

      expect(result).toEqual(mockVideos);
      expect(mockVideosService.findAll).toHaveBeenCalledWith(false);
    });

    it('GET /api/admin/videos需要认证', async () => {
      const mockPaginatedResult = {
        list: [mockVideo],
        total: 1,
        page: 1,
        pageSize: 10,
      };
      mockVideosService.findAllAdminPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAllAdmin({ page: 1, pageSize: 10 } as any);

      expect(result).toEqual(mockPaginatedResult);
      expect(mockVideosService.findAllAdminPaginated).toHaveBeenCalled();
    });

    it('POST /api/admin/videos需要认证', async () => {
      const createDto = {
        url: 'https://www.bilibili.com/video/BV1234567890',
        customTitle: 'New Video',
        order: 0,
        status: 'enabled',
      };
      mockVideosService.create.mockResolvedValue(mockVideo);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockVideo);
      expect(mockVideosService.create).toHaveBeenCalledWith(createDto);
    });

    it('PUT /api/admin/videos/:id需要认证', async () => {
      const updateDto = { customTitle: 'Updated Title' };
      const updatedVideo = { ...mockVideo, title: 'Updated Title' };
      mockVideosService.update.mockResolvedValue(updatedVideo);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(updatedVideo);
      expect(mockVideosService.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('DELETE /api/admin/videos/:id需要认证', async () => {
      mockVideosService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockVideosService.remove).toHaveBeenCalledWith('1');
    });

    it('PUT /api/admin/videos/sort需要认证', async () => {
      const sortItems: SortItem[] = [
        { id: '1', order: 1 },
        { id: '2', order: 2 },
      ];
      const sortedVideos: Video[] = [
        { ...mockVideo, id: '1', order: 1 },
        { ...mockVideo, id: '2', order: 2 },
      ];
      mockVideosService.sort.mockResolvedValue(sortedVideos);

      const result = await controller.sort(sortItems);

      expect(result).toEqual(sortedVideos);
      expect(mockVideosService.sort).toHaveBeenCalledWith(sortItems);
    });
  });

  describe('GET /api/videos - 获取前端视频列表', () => {
    it('应该返回启用状态的视频列表', async () => {
      const mockVideos: Video[] = [
        mockVideo,
        { ...mockVideo, id: '2', title: 'Video 2' },
      ];
      mockVideosService.findAll.mockResolvedValue(mockVideos);

      const result = await controller.findAll();

      expect(result).toEqual(mockVideos);
      expect(mockVideosService.findAll).toHaveBeenCalledWith(false);
    });

    it('应该在没有视频时返回空数组', async () => {
      mockVideosService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('GET /api/admin/videos - 获取后台视频列表', () => {
    it('应该返回所有视频（包括禁用的）', async () => {
      const mockPaginatedResult = {
        list: [
          mockVideo,
          { ...mockVideo, id: '2', status: 'disabled', isEnabled: false },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      };
      mockVideosService.findAllAdminPaginated.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAllAdmin({ page: 1, pageSize: 10 } as any);

      expect(result.list).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockVideosService.findAllAdminPaginated).toHaveBeenCalled();
    });
  });

  describe('POST /api/admin/videos - 创建视频', () => {
    it('应该创建视频并返回创建的视频', async () => {
      const createDto = {
        url: 'https://www.bilibili.com/video/BV1234567890',
        customTitle: 'New Video',
        order: 0,
        status: 'enabled',
      };
      const createdVideo = { ...mockVideo, id: '3', title: 'New Video' };
      mockVideosService.create.mockResolvedValue(createdVideo);

      const result = await controller.create(createDto);

      expect(result).toEqual(createdVideo);
      expect(mockVideosService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('PUT /api/admin/videos/:id - 更新视频', () => {
    it('应该更新视频并返回更新后的视频', async () => {
      const updateDto = { customTitle: 'Updated Title' };
      const updatedVideo = { ...mockVideo, title: 'Updated Title' };
      mockVideosService.update.mockResolvedValue(updatedVideo);

      const result = await controller.update('1', updateDto);

      expect(result.title).toBe('Updated Title');
      expect(mockVideosService.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('应该部分更新视频', async () => {
      const updateDto = { status: 'disabled' };
      const updatedVideo = { ...mockVideo, status: 'disabled' };
      mockVideosService.update.mockResolvedValue(updatedVideo);

      const result = await controller.update('1', updateDto);

      expect(result.status).toBe('disabled');
      expect(result.title).toBe(mockVideo.title);
    });
  });

  describe('DELETE /api/admin/videos/:id - 删除视频', () => {
    it('应该删除视频并返回undefined', async () => {
      mockVideosService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(mockVideosService.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('PUT /api/admin/videos/sort - 批量排序视频', () => {
    it('应该批量排序视频并返回排序后的视频列表', async () => {
      const sortItems: SortItem[] = [
        { id: '1', order: 2 },
        { id: '2', order: 1 },
      ];
      const sortedVideos: Video[] = [
        { ...mockVideo, id: '1', order: 2 },
        { ...mockVideo, id: '2', order: 1 },
      ];
      mockVideosService.sort.mockResolvedValue(sortedVideos);

      const result = await controller.sort(sortItems);

      expect(result).toEqual(sortedVideos);
      expect(mockVideosService.sort).toHaveBeenCalledWith(sortItems);
    });
  });

  describe('错误处理测试', () => {
    it('应该在更新不存在的视频时抛出NotFoundException', async () => {
      mockVideosService.update.mockRejectedValue(new NotFoundException('视频不存在: 999'));

      await expect(controller.update('999', { customTitle: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('应该在删除不存在的视频时抛出NotFoundException', async () => {
      mockVideosService.remove.mockRejectedValue(new NotFoundException('视频不存在: 999'));

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
