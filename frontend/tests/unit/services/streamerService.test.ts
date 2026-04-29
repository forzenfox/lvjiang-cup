import { describe, it, expect, beforeEach, vi } from 'vitest';
import { streamerService, subscribeToStreamerService } from '@/services/streamerService';
import { streamersApi } from '@/api/streamers';
import * as streamersImportApi from '@/api/streamers-import';
import { requestCache } from '@/utils/requestCache';
import { StreamerType } from '@/api/types';

vi.mock('@/api/streamers', () => ({
  streamersApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    updateSort: vi.fn(),
  },
}));

vi.mock('@/api/streamers-import', () => ({
  downloadStreamerTemplate: vi.fn(),
  importStreamers: vi.fn(),
  downloadStreamerErrorReport: vi.fn(),
}));

vi.mock('@/utils/requestCache', () => ({
  requestCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
  CACHE_TTL: { streamers: 300000 },
}));

const mockStreamer = {
  id: 'streamer-1',
  nickname: '测试主播',
  posterUrl: 'https://example.com/poster.png',
  bio: '这是一个测试主播',
  liveUrl: 'https://live.example.com/1',
  streamerType: StreamerType.INTERNAL,
  sortOrder: 1,
};

describe('streamerService 缓存清除测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    streamerService.resetState();
  });

  describe('getAll() 缓存行为', () => {
    it('没有缓存时，应该调用 API 并设置缓存', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (streamersApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([mockStreamer]);

      const result = await streamerService.getAll();

      expect(streamersApi.getAll).toHaveBeenCalled();
      expect(requestCache.set).toHaveBeenCalledWith('streamers', [mockStreamer]);
      expect(result).toEqual([mockStreamer]);
    });

    it('有缓存时，应该直接返回缓存数据而不请求 API', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue([mockStreamer]);

      const result = await streamerService.getAll();

      expect(streamersApi.getAll).not.toHaveBeenCalled();
      expect(result).toEqual([mockStreamer]);
    });
  });

  describe('create() 成功后清除缓存', () => {
    it('创建主播成功后，应该清除 streamers 缓存', async () => {
      (streamersApi.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockStreamer);

      await streamerService.create({
        nickname: '测试主播',
        posterUrl: 'https://example.com/poster.png',
        bio: '这是一个测试主播',
        liveUrl: 'https://live.example.com/1',
        streamerType: StreamerType.INTERNAL,
      });

      expect(requestCache.clear).toHaveBeenCalledWith('streamers');
    });

    it('创建主播失败时，不应该清除缓存', async () => {
      (streamersApi.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('创建失败'));

      await expect(
        streamerService.create({
          nickname: '测试主播',
          posterUrl: 'https://example.com/poster.png',
          bio: '这是一个测试主播',
          liveUrl: 'https://live.example.com/1',
          streamerType: StreamerType.INTERNAL,
        })
      ).rejects.toThrow('创建失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('update() 成功后清除缓存', () => {
    it('更新主播成功后，应该清除 streamers 缓存', async () => {
      (streamersApi.update as ReturnType<typeof vi.fn>).mockResolvedValue(mockStreamer);

      await streamerService.update('streamer-1', {
        nickname: '更新后的名称',
      });

      expect(requestCache.clear).toHaveBeenCalledWith('streamers');
    });

    it('更新主播失败时，不应该清除缓存', async () => {
      (streamersApi.update as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('更新失败'));

      await expect(streamerService.update('streamer-1', { nickname: '新名称' })).rejects.toThrow(
        '更新失败'
      );

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('remove() 成功后清除缓存', () => {
    it('删除主播成功后，应该清除 streamers 缓存', async () => {
      (streamersApi.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await streamerService.remove('streamer-1');

      expect(requestCache.clear).toHaveBeenCalledWith('streamers');
    });

    it('删除主播失败时，不应该清除缓存', async () => {
      (streamersApi.remove as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('删除失败'));

      await expect(streamerService.remove('streamer-1')).rejects.toThrow('删除失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('updateSort() 成功后清除缓存', () => {
    it('更新排序成功后，应该清除 streamers 缓存', async () => {
      (streamersApi.updateSort as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await streamerService.updateSort([
        { id: 'streamer-1', sortOrder: 2 },
        { id: 'streamer-2', sortOrder: 1 },
      ]);

      expect(requestCache.clear).toHaveBeenCalledWith('streamers');
    });

    it('更新排序失败时，不应该清除缓存', async () => {
      (streamersApi.updateSort as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('排序更新失败')
      );

      await expect(
        streamerService.updateSort([{ id: 'streamer-1', sortOrder: 2 }])
      ).rejects.toThrow('排序更新失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('importStreamers() 成功后清除缓存', () => {
    it('导入主播成功后，应该清除 streamers 缓存', async () => {
      const mockFile = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const mockImportResult = {
        total: 10,
        created: 8,
        failed: 2,
        errors: [],
      };
      (streamersImportApi.importStreamers as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockImportResult
      );

      const result = await streamerService.importStreamers(mockFile);

      expect(streamersImportApi.importStreamers).toHaveBeenCalledWith(mockFile);
      expect(requestCache.clear).toHaveBeenCalledWith('streamers');
      expect(result).toEqual(mockImportResult);
    });

    it('导入主播失败时，不应该清除缓存', async () => {
      const mockFile = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      (streamersImportApi.importStreamers as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('导入失败')
      );

      await expect(streamerService.importStreamers(mockFile)).rejects.toThrow('导入失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });
});
