import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TeamSection from '@/components/features/TeamSection';
import { teamService } from '@/services/teamService';

const mockFetchTeams = vi.fn().mockResolvedValue(undefined);
const mockRefresh = vi.fn().mockResolvedValue(undefined);

let mockHomeData = {
  stream: null,
  teams: [] as unknown[],
  matches: [],
  videos: [],
  streamers: [],
  isLoading: { stream: false, teams: false, matches: false, videos: false, streamers: false },
  fetchStream: vi.fn(),
  fetchTeams: mockFetchTeams,
  fetchMatches: vi.fn(),
  fetchVideos: vi.fn(),
  fetchStreamers: vi.fn(),
  refresh: mockRefresh,
};

vi.mock('@/context/HomeDataContext', () => ({
  useHomeData: () => mockHomeData,
  HomeDataProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/services/teamService', () => ({
  teamService: { getAll: vi.fn() },
}));

vi.mock('../team/PlayerDetailModal', () => ({
  PlayerDetailModal: () => null,
}));

vi.mock('../team/TeamMemberModal', () => ({
  TeamMemberModal: () => null,
}));

vi.mock('../team/PlayerDetailDrawer', () => ({
  default: () => null,
}));

describe('TeamSection', () => {
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
      fetchTeams: mockFetchTeams,
      fetchMatches: vi.fn(),
      fetchVideos: vi.fn(),
      fetchStreamers: vi.fn(),
      refresh: mockRefresh,
    };
  });

  it('挂载时调用 fetchTeams() 获取战队数据', () => {
    render(<TeamSection />);
    expect(mockFetchTeams).toHaveBeenCalledTimes(1);
  });

  it('不直接调用 teamService.getAll()', () => {
    render(<TeamSection />);
    expect(teamService.getAll).not.toHaveBeenCalled();
  });

  it('战队数据加载中时显示骨架屏', () => {
    mockHomeData.isLoading.teams = true;
    render(<TeamSection />);
    expect(screen.getAllByTestId('team-card-skeleton').length).toBeGreaterThan(0);
  });

  it('战队数据为空时显示空状态', () => {
    mockHomeData.teams = [];
    render(<TeamSection />);
    expect(screen.getByTestId('empty-teams')).toBeInTheDocument();
  });
});
