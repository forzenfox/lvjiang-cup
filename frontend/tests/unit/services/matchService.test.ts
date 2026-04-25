import { describe, it, expect, beforeEach, vi } from 'vitest';
import { matchService } from '@/services/matchService';
import * as matchApi from '@/api/matches';
import { requestCache } from '@/utils/requestCache';

vi.mock('@/api/matches', () => ({
  getAll: vi.fn(),
  getById: vi.fn(),
  update: vi.fn(),
  findByStage: vi.fn(),
  findByRound: vi.fn(),
}));

vi.mock('@/utils/requestCache', () => ({
  requestCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
  CACHE_TTL: { matches: 60000 },
}));

const mockMatch = {
  id: 'match-1',
  teamAId: 'team-1',
  teamBId: 'team-2',
  scoreA: 2,
  scoreB: 1,
  winnerId: 'team-1',
  round: 1,
  status: 'finished' as const,
  startTime: '2024-01-01T00:00:00Z',
  stage: 'swiss',
  boFormat: 'BO3',
};

describe('matchService 缓存清除测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    matchService.resetState();
  });

  describe('update() 成功后清除缓存', () => {
    it('更新比赛成功后，应该清除 matches 缓存', async () => {
      (matchApi.update as ReturnType<typeof vi.fn>).mockResolvedValue(mockMatch);

      await matchService.update({
        id: 'match-1',
        scoreA: 2,
        scoreB: 1,
        winnerId: 'team-1',
        status: 'finished',
      });

      expect(requestCache.clear).toHaveBeenCalledWith('matches');
    });

    it('更新比赛失败时，不应该清除缓存', async () => {
      (matchApi.update as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('更新失败'));

      await expect(
        matchService.update({
          id: 'match-1',
          scoreA: 2,
          scoreB: 1,
          winnerId: 'team-1',
          status: 'finished',
        })
      ).rejects.toThrow('更新失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('getAll() 缓存行为', () => {
    it('没有缓存时，应该调用 API 并设置缓存', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (matchApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([mockMatch]);

      const result = await matchService.getAll();

      expect(matchApi.getAll).toHaveBeenCalled();
      expect(requestCache.set).toHaveBeenCalledWith('matches', [mockMatch]);
      expect(result).toEqual([mockMatch]);
    });

    it('有缓存时，应该直接返回缓存数据而不请求 API', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue([mockMatch]);

      const result = await matchService.getAll();

      expect(matchApi.getAll).not.toHaveBeenCalled();
      expect(result).toEqual([mockMatch]);
    });
  });
});
