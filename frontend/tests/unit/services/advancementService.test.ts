import { describe, it, expect, beforeEach, vi } from 'vitest';
import { advancementService, subscribeToAdvancementService } from '@/services/advancementService';
import * as advancementApi from '@/api/advancement';
import { requestCache } from '@/utils/requestCache';

vi.mock('@/api/advancement', () => ({
  get: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/utils/requestCache', () => ({
  requestCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
  CACHE_TTL: { advancement: 300000 },
}));

const mockAdvancement = {
  top8: ['team-1', 'team-2'],
  eliminated: ['team-3', 'team-4'],
  rankings: [
    { teamId: 'team-1', record: '3-0', rank: 1 },
    { teamId: 'team-2', record: '2-1', rank: 2 },
  ],
};

describe('advancementService 缓存行为测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    advancementService.resetState();
  });

  describe('get() 缓存行为', () => {
    it('没有缓存时，应该调用 API 并设置缓存', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (advancementApi.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdvancement);

      const result = await advancementService.get();

      expect(advancementApi.get).toHaveBeenCalled();
      expect(requestCache.set).toHaveBeenCalledWith('advancement', mockAdvancement);
      expect(result).toEqual(mockAdvancement);
    });

    it('有缓存时，应该直接返回缓存数据而不请求 API', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(mockAdvancement);

      const result = await advancementService.get();

      expect(advancementApi.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockAdvancement);
    });
  });

  describe('update() 成功后清除缓存', () => {
    it('更新晋级名单成功后，应该清除 advancement 缓存', async () => {
      (advancementApi.update as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdvancement);

      await advancementService.update({ top8: ['team-1'] });

      expect(requestCache.clear).toHaveBeenCalledWith('advancement');
    });

    it('更新晋级名单失败时，不应该清除缓存', async () => {
      (advancementApi.update as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('更新失败'));

      await expect(advancementService.update({ top8: ['team-1'] })).rejects.toThrow('更新失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('状态管理', () => {
    it('getState 应返回当前状态', () => {
      const state = advancementService.getState();
      expect(state).toEqual({
        advancement: null,
        loading: false,
        error: null,
      });
    });

    it('clearError 应清除错误状态', () => {
      // 先触发一个错误
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (advancementApi.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('请求失败'));

      // 使用 try/catch 因为我们期望它抛出
      return advancementService.get().catch(() => {
        expect(advancementService.getState().error).toBe('请求失败');
        advancementService.clearError();
        expect(advancementService.getState().error).toBeNull();
      });
    });

    it('resetState 应重置状态到初始值', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (advancementApi.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdvancement);

      await advancementService.get();
      expect(advancementService.getState().advancement).toEqual(mockAdvancement);

      advancementService.resetState();
      expect(advancementService.getState()).toEqual({
        advancement: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('subscribeToAdvancementService', () => {
    it('订阅后应立即收到当前状态', () => {
      const callback = vi.fn();
      subscribeToAdvancementService(callback);
      expect(callback).toHaveBeenCalledWith({
        advancement: null,
        loading: false,
        error: null,
      });
    });

    it('状态变化时应通知订阅者', async () => {
      const callback = vi.fn();
      subscribeToAdvancementService(callback);
      callback.mockClear();

      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (advancementApi.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdvancement);

      await advancementService.get();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          advancement: mockAdvancement,
          loading: false,
          error: null,
        })
      );
    });

    it('取消订阅后不应再收到通知', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToAdvancementService(callback);
      callback.mockClear();

      unsubscribe();

      // 触发状态变化
      advancementService.clearError();

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
