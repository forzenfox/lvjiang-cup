import { describe, it, expect, beforeEach, vi } from 'vitest';
import { teamService } from '@/services/teamService';
import * as teamApi from '@/api/teams';
import { requestCache } from '@/utils/requestCache';

vi.mock('@/api/teams', () => ({
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('@/utils/requestCache', () => ({
  requestCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
  CACHE_TTL: { teams: 60000 },
}));

const mockTeam = {
  id: 'team-1',
  name: '测试战队',
  logo: 'https://example.com/logo.png',
  logoUrl: 'https://example.com/logo.png',
  battleCry: 'fighting',
  members: [],
};

describe('teamService 缓存清除测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    teamService.resetState();
  });

  describe('create() 成功后清除缓存', () => {
    it('创建战队成功后，应该清除 teams 缓存', async () => {
      (teamApi.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockTeam);

      await teamService.create({
        name: '测试战队',
        logo: 'https://example.com/logo.png',
        battleCry: 'fighting',
      });

      expect(requestCache.clear).toHaveBeenCalledWith('teams');
    });

    it('创建战队失败时，不应该清除缓存', async () => {
      (teamApi.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('创建失败'));

      await expect(
        teamService.create({
          name: '测试战队',
          logo: 'https://example.com/logo.png',
          battleCry: 'fighting',
        })
      ).rejects.toThrow('创建失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('update() 成功后清除缓存', () => {
    it('更新战队成功后，应该清除 teams 缓存', async () => {
      (teamApi.update as ReturnType<typeof vi.fn>).mockResolvedValue(mockTeam);

      await teamService.update({
        id: 'team-1',
        name: '更新后的名称',
      });

      expect(requestCache.clear).toHaveBeenCalledWith('teams');
    });

    it('更新战队失败时，不应该清除缓存', async () => {
      (teamApi.update as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('更新失败'));

      await expect(teamService.update({ id: 'team-1', name: '新名称' })).rejects.toThrow(
        '更新失败'
      );

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('remove() 成功后清除缓存', () => {
    it('删除战队成功后，应该清除 teams 缓存', async () => {
      (teamApi.remove as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await teamService.remove('team-1');

      expect(requestCache.clear).toHaveBeenCalledWith('teams');
    });

    it('删除战队失败时，不应该清除缓存', async () => {
      (teamApi.remove as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('删除失败'));

      await expect(teamService.remove('team-1')).rejects.toThrow('删除失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('getAll() 缓存行为', () => {
    it('没有缓存时，应该调用 API 并设置缓存', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (teamApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([mockTeam]);

      const result = await teamService.getAll();

      expect(teamApi.getAll).toHaveBeenCalled();
      expect(requestCache.set).toHaveBeenCalledWith('teams', [mockTeam]);
      expect(result).toEqual([mockTeam]);
    });

    it('有缓存时，应该直接返回缓存数据而不请求 API', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue([mockTeam]);

      const result = await teamService.getAll();

      expect(teamApi.getAll).not.toHaveBeenCalled();
      expect(result).toEqual([mockTeam]);
    });
  });
});
