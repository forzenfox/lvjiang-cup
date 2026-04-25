import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import StreamerSection from '@/components/features/StreamerSection';
import { streamersApi } from '@/api/streamers';

const mockFetchStreamers = vi.fn().mockResolvedValue(undefined);
const mockRefresh = vi.fn().mockResolvedValue(undefined);

let mockHomeData = {
  stream: null,
  teams: [],
  matches: [],
  videos: [],
  streamers: [] as unknown[],
  isLoading: { stream: false, teams: false, matches: false, videos: false, streamers: false },
  fetchStream: vi.fn(),
  fetchTeams: vi.fn(),
  fetchMatches: vi.fn(),
  fetchVideos: vi.fn(),
  fetchStreamers: mockFetchStreamers,
  refresh: mockRefresh,
};

vi.mock('@/context/HomeDataContext', () => ({
  useHomeData: () => mockHomeData,
  HomeDataProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/api/streamers', () => ({
  streamersApi: { getAll: vi.fn() },
}));

vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn().mockReturnValue(false),
}));

vi.mock('./streamer-section/hooks', () => ({
  useStreamerAutoplay: vi.fn().mockReturnValue({ pause: vi.fn() }),
  useStreamerSwipe: vi.fn().mockReturnValue({ onTouchStart: vi.fn(), onTouchEnd: vi.fn() }),
}));

describe('StreamerSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHomeData = {
      stream: null,
      teams: [],
      matches: [],
      videos: [],
      streamers: [],
      isLoading: { stream: false, teams: false, matches: false, videos: false, streamers: false },
      fetchStream: vi.fn(),
      fetchTeams: vi.fn(),
      fetchMatches: vi.fn(),
      fetchVideos: vi.fn(),
      fetchStreamers: mockFetchStreamers,
      refresh: mockRefresh,
    };
  });

  it('挂载时调用 fetchStreamers() 获取主播数据', () => {
    render(<StreamerSection />);
    expect(mockFetchStreamers).toHaveBeenCalledTimes(1);
  });

  it('主播数据加载中时显示骨架屏', () => {
    mockHomeData.isLoading.streamers = true;
    render(<StreamerSection />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('主播数据为空时显示空状态', () => {
    mockHomeData.streamers = [];
    render(<StreamerSection />);
    expect(screen.getByText('暂无主播数据')).toBeInTheDocument();
  });

  it('不直接调用 streamersApi.getAll()', () => {
    render(<StreamerSection />);
    expect(streamersApi.getAll).not.toHaveBeenCalled();
  });

  it('不存在 30 秒轮询定时器', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    render(<StreamerSection />);
    // 不应有 setInterval 调用用于轮询
    expect(setIntervalSpy).not.toHaveBeenCalled();
    setIntervalSpy.mockRestore();
  });
});
