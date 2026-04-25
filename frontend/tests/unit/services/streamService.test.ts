import { describe, it, expect, beforeEach, vi } from 'vitest';
import { streamService } from '@/services/streamService';
import * as streamApi from '@/api/streams';
import { requestCache } from '@/utils/requestCache';

vi.mock('@/api/streams', () => ({
  get: vi.fn(),
  getAll: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/utils/requestCache', () => ({
  requestCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
  CACHE_TTL: { stream: 60000 },
}));

const mockStream = {
  id: 'stream-1',
  title: '测试直播',
  url: 'https://example.com/stream',
  isLive: true,
};

describe('streamService 缓存清除测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    streamService.resetState();
  });

  describe('update() 成功后清除缓存', () => {
    it('更新直播成功后，应该清除 stream_current 缓存', async () => {
      (streamApi.update as ReturnType<typeof vi.fn>).mockResolvedValue(mockStream);

      await streamService.update({
        id: 'stream-1',
        title: '更新后的标题',
        url: 'https://example.com/new-stream',
        isLive: true,
      });

      expect(requestCache.clear).toHaveBeenCalledWith('stream_current');
    });

    it('更新直播失败时，不应该清除缓存', async () => {
      (streamApi.update as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('更新失败'));

      await expect(
        streamService.update({
          id: 'stream-1',
          title: '更新后的标题',
          url: 'https://example.com/new-stream',
          isLive: true,
        })
      ).rejects.toThrow('更新失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('get() 缓存行为', () => {
    it('没有缓存时，应该调用 API 并设置缓存', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (streamApi.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockStream);

      const result = await streamService.get();

      expect(streamApi.get).toHaveBeenCalled();
      expect(requestCache.set).toHaveBeenCalledWith('stream_current', mockStream);
      expect(result).toEqual(mockStream);
    });

    it('有缓存时，应该直接返回缓存数据而不请求 API', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(mockStream);

      const result = await streamService.get();

      expect(streamApi.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockStream);
    });
  });
});
