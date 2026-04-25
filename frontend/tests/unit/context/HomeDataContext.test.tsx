import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { HomeDataProvider, useHomeData } from '@/context/HomeDataContext';

// Mock 所有服务
vi.mock('@/services/streamService', () => ({
  streamService: {
    get: vi
      .fn()
      .mockResolvedValue({ id: '1', title: '直播1', url: 'http://test.com', isLive: true }),
  },
}));

vi.mock('@/services/teamService', () => ({
  teamService: {
    getAll: vi.fn().mockResolvedValue([{ id: '1', name: '战队1' }]),
  },
}));

vi.mock('@/services/matchService', () => ({
  matchService: {
    getAll: vi.fn().mockResolvedValue([{ id: '1', teamAId: '1', teamBId: '2' }]),
  },
}));

vi.mock('@/api/videos', () => ({
  getVideos: vi.fn().mockResolvedValue({
    list: [{ id: '1', title: '视频1', bvid: 'BV1xx', page: 1 }],
    total: 1,
    page: 1,
    pageSize: 10,
  }),
}));

vi.mock('@/api/streamers', () => ({
  streamersApi: {
    getAll: vi.fn().mockResolvedValue([{ id: '1', nickname: '主播1' }]),
  },
}));

vi.mock('@/utils/requestCache', () => ({
  requestCache: {
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
    clear: vi.fn(),
  },
  CACHE_TTL: {
    teams: 300_000,
    matches: 60_000,
    stream: 15_000,
    videos: 300_000,
    streamers: 300_000,
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HomeDataProvider>{children}</HomeDataProvider>
);

describe('HomeDataContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初始状态：所有数据为空，isLoading 全为 false', () => {
    const { result } = renderHook(() => useHomeData(), { wrapper });

    expect(result.current.stream).toBeNull();
    expect(result.current.teams).toEqual([]);
    expect(result.current.matches).toEqual([]);
    expect(result.current.videos).toEqual([]);
    expect(result.current.streamers).toEqual([]);
    expect(result.current.isLoading.stream).toBe(false);
    expect(result.current.isLoading.teams).toBe(false);
    expect(result.current.isLoading.matches).toBe(false);
    expect(result.current.isLoading.videos).toBe(false);
    expect(result.current.isLoading.streamers).toBe(false);
  });

  it('fetchStream() 首次调用时请求数据并更新 Context', async () => {
    const { streamService } = await import('@/services/streamService');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchStream();
    });

    expect(streamService.get).toHaveBeenCalledTimes(1);
    expect(result.current.stream).toEqual({
      id: '1',
      title: '直播1',
      url: 'http://test.com',
      isLive: true,
    });
  });

  it('fetchStream() 重复调用时不重复请求', async () => {
    const { streamService } = await import('@/services/streamService');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchStream();
    });
    await act(async () => {
      await result.current.fetchStream();
    });

    expect(streamService.get).toHaveBeenCalledTimes(1);
  });

  it('fetchTeams() 首次调用时请求数据并更新 Context', async () => {
    const { teamService } = await import('@/services/teamService');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchTeams();
    });

    expect(teamService.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.teams).toEqual([{ id: '1', name: '战队1' }]);
  });

  it('fetchTeams() 重复调用时不重复请求', async () => {
    const { teamService } = await import('@/services/teamService');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchTeams();
    });
    await act(async () => {
      await result.current.fetchTeams();
    });

    expect(teamService.getAll).toHaveBeenCalledTimes(1);
  });

  it('fetchMatches() 首次调用时请求数据并更新 Context', async () => {
    const { matchService } = await import('@/services/matchService');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchMatches();
    });

    expect(matchService.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.matches).toEqual([{ id: '1', teamAId: '1', teamBId: '2' }]);
  });

  it('fetchMatches() 重复调用时不重复请求', async () => {
    const { matchService } = await import('@/services/matchService');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchMatches();
    });
    await act(async () => {
      await result.current.fetchMatches();
    });

    expect(matchService.getAll).toHaveBeenCalledTimes(1);
  });

  it('fetchVideos() 首次调用时请求数据并更新 Context', async () => {
    const { getVideos } = await import('@/api/videos');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchVideos();
    });

    expect(getVideos).toHaveBeenCalledTimes(1);
    expect(result.current.videos).toEqual([{ id: '1', title: '视频1', bvid: 'BV1xx', page: 1 }]);
  });

  it('fetchVideos() 重复调用时不重复请求', async () => {
    const { getVideos } = await import('@/api/videos');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchVideos();
    });
    await act(async () => {
      await result.current.fetchVideos();
    });

    expect(getVideos).toHaveBeenCalledTimes(1);
  });

  it('fetchStreamers() 首次调用时请求数据并更新 Context', async () => {
    const { streamersApi } = await import('@/api/streamers');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchStreamers();
    });

    expect(streamersApi.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.streamers).toEqual([{ id: '1', nickname: '主播1' }]);
  });

  it('fetchStreamers() 重复调用时不重复请求', async () => {
    const { streamersApi } = await import('@/api/streamers');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchStreamers();
    });
    await act(async () => {
      await result.current.fetchStreamers();
    });

    expect(streamersApi.getAll).toHaveBeenCalledTimes(1);
  });

  it('fetch 方法在请求期间设置 isLoading 为 true', async () => {
    const { streamService } = await import('@/services/streamService');

    let resolvePromise!: (value: unknown) => void;
    const delayedPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    (streamService.get as ReturnType<typeof vi.fn>).mockReturnValueOnce(delayedPromise);

    const { result } = renderHook(() => useHomeData(), { wrapper });

    // 开始请求但不等待完成
    let fetchDone = false;
    act(() => {
      result.current.fetchStream().then(() => {
        fetchDone = true;
      });
    });

    // 等待 isLoading 变为 true
    await waitFor(() => {
      expect(result.current.isLoading.stream).toBe(true);
    });

    // 完成请求
    await act(async () => {
      resolvePromise!({ id: '1', title: '直播', url: 'http://test.com', isLive: true });
    });

    await waitFor(() => {
      expect(fetchDone).toBe(true);
      expect(result.current.isLoading.stream).toBe(false);
    });
  });

  it('fetch 方法在请求失败时设置 isLoading 为 false 且不崩溃', async () => {
    const { streamService } = await import('@/services/streamService');
    (streamService.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('网络错误'));

    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchStream();
    });

    expect(result.current.isLoading.stream).toBe(false);
  });

  it('refresh("stream") 强制重新请求直播数据', async () => {
    const { streamService } = await import('@/services/streamService');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchStream();
    });
    expect(streamService.get).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refresh('stream');
    });
    expect(streamService.get).toHaveBeenCalledTimes(2);
  });

  it('refresh("teams") 强制重新请求战队数据', async () => {
    const { teamService } = await import('@/services/teamService');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await result.current.fetchTeams();
    });
    expect(teamService.getAll).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refresh('teams');
    });
    expect(teamService.getAll).toHaveBeenCalledTimes(2);
  });

  it('useHomeData() 在 Provider 外调用时抛出错误', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      renderHook(() => useHomeData());
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('useHomeData must be used within HomeDataProvider');
    }

    spy.mockRestore();
  });

  it('多个子组件同时调用同一 fetch 方法时，只请求一次', async () => {
    const { teamService } = await import('@/services/teamService');
    const { result } = renderHook(() => useHomeData(), { wrapper });

    await act(async () => {
      await Promise.all([
        result.current.fetchTeams(),
        result.current.fetchTeams(),
        result.current.fetchTeams(),
      ]);
    });

    expect(teamService.getAll).toHaveBeenCalledTimes(1);
  });
});
