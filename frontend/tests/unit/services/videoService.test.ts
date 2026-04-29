import { describe, it, expect, beforeEach, vi } from 'vitest';
import { videoService } from '@/services/videoService';
import * as videoApi from '@/api/videos';
import { requestCache } from '@/utils/requestCache';

vi.mock('@/api/videos', () => ({
  getVideos: vi.fn(),
  getAdminVideos: vi.fn(),
  getVideo: vi.fn(),
  createVideo: vi.fn(),
  updateVideo: vi.fn(),
  deleteVideo: vi.fn(),
  toggleVideoEnabled: vi.fn(),
  reorderVideos: vi.fn(),
}));

vi.mock('@/utils/requestCache', () => ({
  requestCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
  CACHE_TTL: { videos: 300000 },
}));

const mockVideo = {
  id: 'video-1',
  bvid: 'BV1xx411c7mD',
  title: '测试视频',
  order: 1,
  isEnabled: true,
};

const mockPaginatedData = {
  list: [mockVideo],
  total: 1,
  page: 1,
  pageSize: 10,
};

describe('videoService 缓存清除测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    videoService.resetState();
  });

  describe('getVideos() 不缓存', () => {
    it('前台获取视频列表不应使用缓存', async () => {
      (videoApi.getVideos as ReturnType<typeof vi.fn>).mockResolvedValue(mockPaginatedData);

      const result = await videoService.getVideos();

      expect(videoApi.getVideos).toHaveBeenCalled();
      expect(requestCache.get).not.toHaveBeenCalled();
      expect(requestCache.set).not.toHaveBeenCalled();
      expect(result).toEqual(mockPaginatedData);
    });
  });

  describe('getAdminVideos() 不缓存', () => {
    it('管理后台获取视频列表不应使用缓存', async () => {
      (videoApi.getAdminVideos as ReturnType<typeof vi.fn>).mockResolvedValue([mockVideo]);

      const result = await videoService.getAdminVideos();

      expect(videoApi.getAdminVideos).toHaveBeenCalled();
      expect(requestCache.get).not.toHaveBeenCalled();
      expect(requestCache.set).not.toHaveBeenCalled();
      expect(result).toEqual([mockVideo]);
    });
  });

  describe('createVideo() 成功后清除缓存', () => {
    it('创建视频成功后，应该清除 videos 缓存', async () => {
      (videoApi.createVideo as ReturnType<typeof vi.fn>).mockResolvedValue(mockVideo);

      await videoService.createVideo({
        url: 'https://www.bilibili.com/video/BV1xx411c7mD',
      });

      expect(requestCache.clear).toHaveBeenCalledWith('videos');
    });

    it('创建视频失败时，不应该清除缓存', async () => {
      (videoApi.createVideo as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('创建失败'));

      await expect(
        videoService.createVideo({
          url: 'https://www.bilibili.com/video/BV1xx411c7mD',
        })
      ).rejects.toThrow('创建失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('updateVideo() 成功后清除缓存', () => {
    it('更新视频成功后，应该清除 videos 缓存', async () => {
      (videoApi.updateVideo as ReturnType<typeof vi.fn>).mockResolvedValue(mockVideo);

      await videoService.updateVideo({
        id: 'video-1',
        customTitle: '更新后的标题',
      });

      expect(requestCache.clear).toHaveBeenCalledWith('videos');
    });

    it('更新视频失败时，不应该清除缓存', async () => {
      (videoApi.updateVideo as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('更新失败'));

      await expect(
        videoService.updateVideo({ id: 'video-1', customTitle: '新标题' })
      ).rejects.toThrow('更新失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('deleteVideo() 成功后清除缓存', () => {
    it('删除视频成功后，应该清除 videos 缓存', async () => {
      (videoApi.deleteVideo as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await videoService.deleteVideo('video-1');

      expect(requestCache.clear).toHaveBeenCalledWith('videos');
    });

    it('删除视频失败时，不应该清除缓存', async () => {
      (videoApi.deleteVideo as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('删除失败'));

      await expect(videoService.deleteVideo('video-1')).rejects.toThrow('删除失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('toggleEnabled() 成功后清除缓存', () => {
    it('切换启用状态成功后，应该清除 videos 缓存', async () => {
      (videoApi.toggleVideoEnabled as ReturnType<typeof vi.fn>).mockResolvedValue(mockVideo);

      await videoService.toggleEnabled('video-1', false);

      expect(requestCache.clear).toHaveBeenCalledWith('videos');
    });

    it('切换启用状态失败时，不应该清除缓存', async () => {
      (videoApi.toggleVideoEnabled as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('切换失败')
      );

      await expect(videoService.toggleEnabled('video-1', false)).rejects.toThrow('切换失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('reorderVideos() 成功后清除缓存', () => {
    it('视频排序成功后，应该清除 videos 缓存', async () => {
      (videoApi.reorderVideos as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await videoService.reorderVideos(['video-2', 'video-1']);

      expect(requestCache.clear).toHaveBeenCalledWith('videos');
    });

    it('视频排序失败时，不应该清除缓存', async () => {
      (videoApi.reorderVideos as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('排序失败'));

      await expect(videoService.reorderVideos(['video-2', 'video-1'])).rejects.toThrow('排序失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });
});
