import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Home from '@/pages/Home';

const mockFetchStream = vi.fn().mockResolvedValue(undefined);
const mockFetchTeams = vi.fn().mockResolvedValue(undefined);
const mockFetchMatches = vi.fn().mockResolvedValue(undefined);
const mockFetchVideos = vi.fn().mockResolvedValue(undefined);
const mockFetchStreamers = vi.fn().mockResolvedValue(undefined);
const mockRefresh = vi.fn().mockResolvedValue(undefined);

let mockHomeData = {
  stream: null,
  teams: [] as unknown[],
  matches: [] as unknown[],
  videos: [] as unknown[],
  streamers: [] as unknown[],
  isLoading: { stream: false, teams: false, matches: false, videos: false, streamers: false },
  fetchStream: mockFetchStream,
  fetchTeams: mockFetchTeams,
  fetchMatches: mockFetchMatches,
  fetchVideos: mockFetchVideos,
  fetchStreamers: mockFetchStreamers,
  refresh: mockRefresh,
};

vi.mock('@/context/HomeDataContext', () => ({
  useHomeData: () => mockHomeData,
  HomeDataProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/layout/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

vi.mock('@/components/features/StartBox', () => ({
  StartBox: () => <div data-testid="start-box">StartBox</div>,
}));

vi.mock('@/components/features/HeroSection', () => ({
  default: () => <div data-testid="hero-section">HeroSection</div>,
}));

vi.mock('@/components/features/ScheduleSection', () => ({
  default: () => <div data-testid="schedule-section">ScheduleSection</div>,
}));

vi.mock('@/components/features/TeamSection', () => ({
  default: () => <div data-testid="team-section">TeamSection</div>,
}));

vi.mock('@/components/features/StreamerSection', () => ({
  default: () => <div data-testid="streamer-section">StreamerSection</div>,
}));

vi.mock('@/components/features/ThanksSection', () => ({
  ThanksSection: () => <div data-testid="thanks-section">ThanksSection</div>,
}));

vi.mock('@/components/video-carousel', () => ({
  VideoCarousel: ({ videos }: { videos: unknown[] }) => (
    <div data-testid="video-carousel">Videos: {videos.length}</div>
  ),
}));

vi.mock('@/services/streamService', () => ({
  streamService: { get: vi.fn() },
}));
vi.mock('@/services/teamService', () => ({
  teamService: { getAll: vi.fn() },
}));
vi.mock('@/services/matchService', () => ({
  matchService: { getAll: vi.fn() },
}));

describe('Home', () => {
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
      fetchTeams: mockFetchTeams,
      fetchMatches: mockFetchMatches,
      fetchVideos: mockFetchVideos,
      fetchStreamers: mockFetchStreamers,
      refresh: mockRefresh,
    };
  });

  it('渲染 HomeDataProvider 包裹所有子组件', () => {
    render(<Home />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('渲染 StartBox 组件', () => {
    render(<Home />);
    expect(screen.getByTestId('start-box')).toBeInTheDocument();
  });

  it('渲染 HeroSection 组件', () => {
    render(<Home />);
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('渲染视频区域并调用 fetchVideos', () => {
    render(<Home />);
    expect(mockFetchVideos).toHaveBeenCalledTimes(1);
  });

  it('视频数据为空时显示"暂无视频"', () => {
    mockHomeData.videos = [];
    mockHomeData.isLoading.videos = false;
    render(<Home />);
    expect(screen.getByText('暂无视频')).toBeInTheDocument();
  });

  it('视频数据存在时显示视频轮播', async () => {
    mockHomeData.videos = [{ bvid: 'BV1xx', title: '视频1', page: 1 }];
    mockHomeData.isLoading.videos = false;
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByTestId('video-carousel')).toBeInTheDocument();
    });
  });
});
