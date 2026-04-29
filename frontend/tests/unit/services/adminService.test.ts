import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminService, subscribeToAdminService } from '@/services/adminService';
import * as adminApi from '@/api/admin';
import { requestCache } from '@/utils/requestCache';

vi.mock('@/api/admin', () => ({
  initSlots: vi.fn(),
}));

vi.mock('@/utils/requestCache', () => ({
  requestCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
  CACHE_TTL: { matches: 60000 },
}));

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.resetState();
  });

  describe('initSlots', () => {
    it('初始化比赛槽位成功后，应该清除 matches 缓存', async () => {
      (adminApi.initSlots as ReturnType<typeof vi.fn>).mockResolvedValue({
        message: '初始化成功',
        count: 10,
      });

      await adminService.initSlots();

      expect(requestCache.clear).toHaveBeenCalledWith('matches');
    });

    it('初始化比赛槽位失败时，不应该清除缓存', async () => {
      (adminApi.initSlots as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('初始化失败'));

      await expect(adminService.initSlots()).rejects.toThrow('初始化失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('状态管理', () => {
    it('getState 应返回当前状态副本', () => {
      const state = adminService.getState();
      expect(state).toEqual({
        loading: false,
        error: null,
      });
    });

    it('clearError 应清除错误状态', async () => {
      (adminApi.initSlots as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('测试错误'));

      try {
        await adminService.initSlots();
      } catch {
        // 忽略错误
      }

      expect(adminService.getState().error).not.toBeNull();

      adminService.clearError();
      expect(adminService.getState().error).toBeNull();
    });

    it('resetState 应重置状态到初始值', () => {
      adminService.resetState();
      const state = adminService.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('subscribeToAdminService', () => {
    it('订阅后应立即收到当前状态', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToAdminService(callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          loading: false,
          error: null,
        })
      );

      unsubscribe();
    });

    it('状态变化时应通知订阅者', async () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToAdminService(callback);

      callback.mockClear();

      (adminApi.initSlots as ReturnType<typeof vi.fn>).mockResolvedValue({
        message: '初始化成功',
        count: 10,
      });

      await adminService.initSlots();

      expect(callback).toHaveBeenCalled();

      unsubscribe();
    });

    it('取消订阅后不应再收到通知', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToAdminService(callback);

      unsubscribe();
      callback.mockClear();

      adminService.clearError();

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
