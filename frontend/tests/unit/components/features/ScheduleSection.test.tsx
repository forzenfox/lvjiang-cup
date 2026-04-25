import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ScheduleSection from '@/components/features/ScheduleSection';
import { matchService } from '@/services/matchService';
import { teamService } from '@/services/teamService';

const mockFetchMatches = vi.fn().mockResolvedValue(undefined);
const mockFetchTeams = vi.fn().mockResolvedValue(undefined);
const mockRefresh = vi.fn().mockResolvedValue(undefined);

let mockHomeData = {
  stream: null,
  teams: [] as unknown[],
  matches: [] as unknown[],
  videos: [],
  streamers: [],
  isLoading: { stream: false, teams: false, matches: false, videos: false, streamers: false },
  fetchStream: vi.fn(),
  fetchTeams: mockFetchTeams,
  fetchMatches: mockFetchMatches,
  fetchVideos: vi.fn(),
  fetchStreamers: vi.fn(),
  refresh: mockRefresh,
};

vi.mock('@/context/HomeDataContext', () => ({
  useHomeData: () => mockHomeData,
  HomeDataProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/services/matchService', () => ({
  matchService: { getAll: vi.fn() },
}));

vi.mock('@/services/teamService', () => ({
  teamService: { getAll: vi.fn() },
}));

vi.mock('@/store/advancementStore', () => ({
  useAdvancementStore: () => ({ advancement: null, setAdvancement: vi.fn() }),
  calculateAdvancement: vi.fn().mockReturnValue(null),
}));

vi.mock('./SwissStageResponsive', () => ({
  default: () => <div data-testid="swiss-stage">Swiss Stage</div>,
}));

vi.mock('./EliminationStage', () => ({
  default: () => <div data-testid="elimination-stage">Elimination Stage</div>,
}));

vi.mock('./swiss/SwissEmptyState', () => ({
  default: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

describe('ScheduleSection', () => {
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
      fetchMatches: mockFetchMatches,
      fetchVideos: vi.fn(),
      fetchStreamers: vi.fn(),
      refresh: mockRefresh,
    };
  });

  it('挂载时调用 fetchMatches() 和 fetchTeams() 获取数据', () => {
    render(<ScheduleSection />);
    expect(mockFetchMatches).toHaveBeenCalledTimes(1);
    expect(mockFetchTeams).toHaveBeenCalledTimes(1);
  });

  it('数据加载中时显示骨架屏', () => {
    mockHomeData.isLoading.matches = true;
    render(<ScheduleSection />);
    expect(screen.getByTestId('schedule-skeleton')).toBeInTheDocument();
  });

  it('不直接调用 matchService.getAll() 和 teamService.getAll()', () => {
    render(<ScheduleSection />);
    expect(matchService.getAll).not.toHaveBeenCalled();
    expect(teamService.getAll).not.toHaveBeenCalled();
  });

  it('Tab 切换时不触发重新请求', () => {
    const { rerender } = render(<ScheduleSection />);
    const initialCallCount = mockFetchMatches.mock.calls.length;

    // 模拟 Tab 切换（重新渲染）
    rerender(<ScheduleSection />);

    // fetchMatches 不应被再次调用
    expect(mockFetchMatches.mock.calls.length).toBe(initialCallCount);
  });
});
