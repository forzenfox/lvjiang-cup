import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HeroSection from '@/components/features/HeroSection';
import { streamService } from '@/services/streamService';

// 直接 mock useHomeData
const mockFetchStream = vi.fn().mockResolvedValue(undefined);
const mockRefresh = vi.fn().mockResolvedValue(undefined);

let mockHomeData = {
  stream: null as unknown,
  teams: [],
  matches: [],
  videos: [],
  streamers: [],
  isLoading: { stream: false, teams: false, matches: false, videos: false, streamers: false },
  fetchStream: mockFetchStream,
  fetchTeams: vi.fn(),
  fetchMatches: vi.fn(),
  fetchVideos: vi.fn(),
  fetchStreamers: vi.fn(),
  refresh: mockRefresh,
};

vi.mock('@/context/HomeDataContext', () => ({
  useHomeData: () => mockHomeData,
  HomeDataProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/services/streamService', () => ({
  streamService: { get: vi.fn() },
}));

describe('HeroSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHomeData = {
      stream: null,
      teams: [],
      matches: [],
      videos: [],
      streamers: [],
      isLoading: { stream: false, teams: false, matches: false, videos: false, streamers: false },
      fetchStream: mockFetchStream,
      fetchTeams: vi.fn(),
      fetchMatches: vi.fn(),
      fetchVideos: vi.fn(),
      fetchStreamers: vi.fn(),
      refresh: mockRefresh,
    };
  });

  it('挂载时调用 fetchStream() 获取直播数据', () => {
    render(<HeroSection />);
    expect(mockFetchStream).toHaveBeenCalledTimes(1);
  });

  it('直播数据加载中时显示加载状态', () => {
    mockHomeData.isLoading.stream = true;
    render(<HeroSection />);
    expect(screen.getByText('正在加载直播信息...')).toBeInTheDocument();
  });

  it('正在直播时显示"观看直播"按钮', () => {
    mockHomeData.stream = {
      id: '1',
      title: '驴酱杯直播',
      url: 'http://live.test.com',
      isLive: true,
    };
    render(<HeroSection />);
    expect(screen.getByText('观看直播')).toBeInTheDocument();
    expect(screen.getByText(/正在直播：驴酱杯直播/)).toBeInTheDocument();
  });

  it('未直播时显示"比赛即将开始"', () => {
    mockHomeData.stream = {
      id: '1',
      title: '驴酱杯直播',
      url: 'http://live.test.com',
      isLive: false,
    };
    render(<HeroSection />);
    expect(screen.getByText('比赛即将开始')).toBeInTheDocument();
  });

  it('不直接调用 streamService.get()', () => {
    render(<HeroSection />);
    expect(streamService.get).not.toHaveBeenCalled();
  });
});

describe('HeroSection PrizePool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHomeData = {
      stream: {
        id: '1',
        title: '驴酱杯直播',
        url: 'http://live.test.com',
        isLive: true,
      },
      teams: [],
      matches: [],
      videos: [],
      streamers: [],
      isLoading: { stream: false, teams: false, matches: false, videos: false, streamers: false },
      fetchStream: mockFetchStream,
      fetchTeams: vi.fn(),
      fetchMatches: vi.fn(),
      fetchVideos: vi.fn(),
      fetchStreamers: vi.fn(),
      refresh: mockRefresh,
    };
    // Mock global window.PRIZE_POOL_DATA
    (window as any).PRIZE_POOL_DATA = {
      prizePoolTotal: 125600,
      regular: { total: 109000, championRatio: 0.7, runnerUpRatio: 0.3 },
      specialAwards: [{ id: 1, content: '测试奖项' }],
    };
  });

  afterEach(() => {
    // Clean up mock
    delete (window as any).PRIZE_POOL_DATA;
  });

  it('有配置时渲染奖金池区域', () => {
    render(<HeroSection />);
    expect(screen.getByText('赛事奖金池')).toBeInTheDocument();
  });

  it('无配置时不渲染奖金池区域', () => {
    // Clean up mock
    delete (window as any).PRIZE_POOL_DATA;
    render(<HeroSection />);
    expect(screen.queryByText('赛事奖金池')).not.toBeInTheDocument();
  });
});
