import { describe, it, expect, beforeEach, vi } from 'vitest';
import { memberService } from '@/services/memberService';
import * as membersApi from '@/api/members';
import { requestCache } from '@/utils/requestCache';

vi.mock('@/api/members', () => ({
  updateMember: vi.fn(),
  removeMember: vi.fn(),
}));

vi.mock('@/utils/requestCache', () => ({
  requestCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
  CACHE_TTL: { teams: 300000 },
}));

describe('memberService 缓存清除测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    memberService.resetState();
  });

  describe('updateMember() 成功后清除缓存', () => {
    it('更新队员成功后，应该清除 teams 缓存', async () => {
      (membersApi.updateMember as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'member-1' });

      await memberService.updateMember('member-1', { nickname: '新昵称' });

      expect(requestCache.clear).toHaveBeenCalledWith('teams');
    });

    it('更新队员失败时，不应该清除缓存', async () => {
      (membersApi.updateMember as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('更新失败')
      );

      await expect(memberService.updateMember('member-1', { nickname: '新昵称' })).rejects.toThrow(
        '更新失败'
      );

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('removeMember() 成功后清除缓存', () => {
    it('删除队员成功后，应该清除 teams 缓存', async () => {
      (membersApi.removeMember as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await memberService.removeMember('member-1');

      expect(requestCache.clear).toHaveBeenCalledWith('teams');
    });

    it('删除队员失败时，不应该清除缓存', async () => {
      (membersApi.removeMember as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('删除失败')
      );

      await expect(memberService.removeMember('member-1')).rejects.toThrow('删除失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('状态管理', () => {
    it('getState 应返回当前状态副本', () => {
      const state = memberService.getState();
      expect(state).toEqual({
        loading: false,
        error: null,
      });
    });

    it('clearError 应清除错误状态', async () => {
      (membersApi.updateMember as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('错误'));
      try {
        await memberService.updateMember('member-1', {});
      } catch {
        // ignore
      }
      expect(memberService.getState().error).toBe('错误');
      memberService.clearError();
      expect(memberService.getState().error).toBeNull();
    });

    it('resetState 应重置状态', async () => {
      (membersApi.updateMember as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'member-1' });
      await memberService.updateMember('member-1', { nickname: '新昵称' });
      expect(memberService.getState().loading).toBe(false);
      memberService.resetState();
      expect(memberService.getState()).toEqual({
        loading: false,
        error: null,
      });
    });
  });
});
