import { describe, it, expect, beforeEach, vi } from 'vitest';
import { matchDataService, subscribeToMatchDataService } from '@/services/matchDataService';
import * as matchDataApi from '@/api/matchData';
import { requestCache } from '@/utils/requestCache';

vi.mock('@/api/matchData', () => ({
  checkMatchDataExists: vi.fn(),
  getMatchSeries: vi.fn(),
  getMatchGameData: vi.fn(),
  importMatchData: vi.fn(),
  updateMatchGameData: vi.fn(),
  deleteMatchGameData: vi.fn(),
  downloadMatchDataTemplate: vi.fn(),
  downloadMatchDataErrorReport: vi.fn(),
}));

vi.mock('@/utils/requestCache', () => ({
  requestCache: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
  CACHE_TTL: { matches: 60000 },
}));

const mockMatchId = 'match-1';

const mockSeries = {
  matchId: mockMatchId,
  teamA: { id: 'team-1', name: 'Team A' },
  teamB: { id: 'team-2', name: 'Team B' },
  format: 'BO3' as const,
  games: [
    { gameNumber: 1, winnerTeamId: 'team-1', gameDuration: '30:00', hasData: true },
    { gameNumber: 2, winnerTeamId: 'team-2', gameDuration: '28:00', hasData: true },
  ],
};

const mockGameData = {
  id: 1,
  matchId: mockMatchId,
  gameNumber: 1,
  winnerTeamId: 'team-1',
  gameDuration: '30:00',
  gameStartTime: '2024-01-01T00:00:00Z',
  blueTeam: {
    teamId: 'team-1',
    teamName: 'Team A',
    side: 'blue' as const,
    kills: 15,
    gold: 50000,
    towers: 8,
    dragons: 3,
    barons: 1,
    isWinner: true,
  },
  redTeam: {
    teamId: 'team-2',
    teamName: 'Team B',
    side: 'red' as const,
    kills: 10,
    gold: 45000,
    towers: 5,
    dragons: 2,
    barons: 0,
    isWinner: false,
  },
  playerStats: [],
};

describe('matchDataService 缓存行为测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    matchDataService.resetState();
  });

  describe('getSeries() 缓存行为', () => {
    it('没有缓存时，应该调用 API 并设置缓存', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (matchDataApi.getMatchSeries as ReturnType<typeof vi.fn>).mockResolvedValue(mockSeries);

      const result = await matchDataService.getSeries(mockMatchId);

      expect(matchDataApi.getMatchSeries).toHaveBeenCalledWith(mockMatchId);
      expect(requestCache.set).toHaveBeenCalledWith(`matchSeries_${mockMatchId}`, mockSeries);
      expect(result).toEqual(mockSeries);
    });

    it('有缓存时，应该直接返回缓存数据而不请求 API', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(mockSeries);

      const result = await matchDataService.getSeries(mockMatchId);

      expect(matchDataApi.getMatchSeries).not.toHaveBeenCalled();
      expect(result).toEqual(mockSeries);
    });
  });

  describe('getGameData() 缓存行为', () => {
    it('没有缓存时，应该调用 API 并设置缓存', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (matchDataApi.getMatchGameData as ReturnType<typeof vi.fn>).mockResolvedValue(mockGameData);

      const result = await matchDataService.getGameData(mockMatchId, 1);

      expect(matchDataApi.getMatchGameData).toHaveBeenCalledWith(mockMatchId, 1);
      expect(requestCache.set).toHaveBeenCalledWith(`matchGame_${mockMatchId}_1`, mockGameData);
      expect(result).toEqual(mockGameData);
    });

    it('有缓存时，应该直接返回缓存数据而不请求 API', async () => {
      (requestCache.get as ReturnType<typeof vi.fn>).mockReturnValue(mockGameData);

      const result = await matchDataService.getGameData(mockMatchId, 1);

      expect(matchDataApi.getMatchGameData).not.toHaveBeenCalled();
      expect(result).toEqual(mockGameData);
    });
  });

  describe('importMatchData() 成功后清除缓存', () => {
    it('导入成功后，应该清除 matchSeries 和所有 matchGame 缓存', async () => {
      const mockFile = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const mockResponse = {
        imported: true,
        gameNumber: 1,
        playerCount: 10,
      };
      (matchDataApi.importMatchData as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      await matchDataService.importMatchData(mockMatchId, mockFile);

      expect(requestCache.clear).toHaveBeenCalledWith(`matchSeries_${mockMatchId}`);
      for (let i = 1; i <= 10; i++) {
        expect(requestCache.clear).toHaveBeenCalledWith(`matchGame_${mockMatchId}_${i}`);
      }
    });

    it('导入失败时，不应该清除缓存', async () => {
      const mockFile = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      (matchDataApi.importMatchData as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('导入失败')
      );

      await expect(matchDataService.importMatchData(mockMatchId, mockFile)).rejects.toThrow(
        '导入失败'
      );

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('updateGameData() 成功后清除缓存', () => {
    it('更新成功后，应该清除相关缓存', async () => {
      const mockResponse = { updated: true, gameId: 1 };
      (matchDataApi.updateMatchGameData as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse
      );

      await matchDataService.updateGameData(mockMatchId, 1, { winnerTeamId: 'team-2' });

      expect(requestCache.clear).toHaveBeenCalledWith(`matchSeries_${mockMatchId}`);
      expect(requestCache.clear).toHaveBeenCalledWith(`matchGame_${mockMatchId}_1`);
    });

    it('更新失败时，不应该清除缓存', async () => {
      (matchDataApi.updateMatchGameData as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('更新失败')
      );

      await expect(matchDataService.updateGameData(mockMatchId, 1, {})).rejects.toThrow('更新失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('deleteGameData() 成功后清除缓存', () => {
    it('删除成功后，应该清除相关缓存', async () => {
      const mockResponse = { deleted: true, gameNumber: 1 };
      (matchDataApi.deleteMatchGameData as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse
      );

      await matchDataService.deleteGameData(mockMatchId, 1);

      expect(requestCache.clear).toHaveBeenCalledWith(`matchSeries_${mockMatchId}`);
      expect(requestCache.clear).toHaveBeenCalledWith(`matchGame_${mockMatchId}_1`);
    });

    it('删除失败时，不应该清除缓存', async () => {
      (matchDataApi.deleteMatchGameData as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('删除失败')
      );

      await expect(matchDataService.deleteGameData(mockMatchId, 1)).rejects.toThrow('删除失败');

      expect(requestCache.clear).not.toHaveBeenCalled();
    });
  });

  describe('checkExists()', () => {
    it('应该调用 API 并返回结果', async () => {
      const mockResponse = { hasData: true, gameCount: 2 };
      (matchDataApi.checkMatchDataExists as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse
      );

      const result = await matchDataService.checkExists(mockMatchId);

      expect(matchDataApi.checkMatchDataExists).toHaveBeenCalledWith(mockMatchId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('downloadTemplate()', () => {
    it('应该调用 API 并返回结果', async () => {
      const mockBlob = new Blob(['template']);
      const mockResponse = { blob: mockBlob, fileName: 'template.xlsx' };
      (matchDataApi.downloadMatchDataTemplate as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse
      );

      const result = await matchDataService.downloadTemplate(mockMatchId);

      expect(matchDataApi.downloadMatchDataTemplate).toHaveBeenCalledWith(mockMatchId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('downloadErrorReport()', () => {
    it('应该调用 API 并返回结果', async () => {
      const mockBlob = new Blob(['errors']);
      (matchDataApi.downloadMatchDataErrorReport as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockBlob
      );

      const errors = [{ row: 1, message: 'error' }];
      const result = await matchDataService.downloadErrorReport(errors);

      expect(matchDataApi.downloadMatchDataErrorReport).toHaveBeenCalledWith(errors);
      expect(result).toEqual(mockBlob);
    });
  });

  describe('状态管理', () => {
    it('getState 应该返回当前状态', () => {
      const state = matchDataService.getState();
      expect(state).toEqual({
        series: null,
        currentGame: null,
        loading: false,
        error: null,
      });
    });

    it('clearError 应该清除错误状态', () => {
      matchDataService.getState();
      // 先触发一个错误
      (matchDataApi.checkMatchDataExists as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('test')
      );

      matchDataService.checkExists(mockMatchId).catch(() => {
        matchDataService.clearError();
        expect(matchDataService.getState().error).toBeNull();
      });
    });

    it('resetState 应该重置状态到初始值', () => {
      matchDataService.resetState();
      const state = matchDataService.getState();
      expect(state).toEqual({
        series: null,
        currentGame: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('subscribeToMatchDataService', () => {
    it('应该立即通知当前状态并支持取消订阅', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToMatchDataService(callback);

      expect(callback).toHaveBeenCalledWith(matchDataService.getState());

      unsubscribe();

      // 触发状态变化，确认不再收到通知
      matchDataService.clearError();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
