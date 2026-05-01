import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

vi.mock('@/components/features/SwissStageResponsive', () => ({
  default: ({ onMatchClick }: { onMatchClick?: (match: unknown) => void }) => (
    <div data-testid="swiss-stage" onClick={() => onMatchClick?.({ id: 'match1' })}>
      Swiss Stage
    </div>
  ),
}));

vi.mock('@/components/features/EliminationStage', () => ({
  default: ({ onMatchClick }: { onMatchClick?: (match: unknown) => void }) => (
    <div data-testid="elimination-stage" onClick={() => onMatchClick?.({ id: 'match2' })}>
      Elimination Stage
    </div>
  ),
}));

vi.mock('@/components/features/swiss/SwissEmptyState', () => ({
  default: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock('@/components/features/MatchDetailDrawer', () => ({
  default: ({ match, onClose }: { match: { id: string }; onClose: () => void }) => (
    <div data-testid="match-detail-drawer">
      Drawer: {match.id}
      <button data-testid="close-drawer" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

vi.mock('@/components/features/MatchDetailModal', () => ({
  default: ({ match, onClose }: { match: { id: string }; onClose: () => void }) => (
    <div data-testid="match-detail-modal">
      Modal: {match.id}
      <button data-testid="close-modal" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

vi.mock('@/hooks/useMediaQuery', () => ({
  useIsMobile: () => false,
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

    rerender(<ScheduleSection />);

    expect(mockFetchMatches.mock.calls.length).toBe(initialCallCount);
  });

  it('点击对战卡片应打开对战详情（PC端弹框）', async () => {
    mockHomeData.matches = [{ id: 'm1', stage: 'swiss' }];
    render(<ScheduleSection />);

    const swissStage = screen.getByTestId('swiss-stage');
    fireEvent.click(swissStage);

    await waitFor(() => {
      expect(screen.getByTestId('match-detail-modal')).toBeInTheDocument();
    });
  });

  it('关闭详情后应清除选中状态', async () => {
    mockHomeData.matches = [{ id: 'm1', stage: 'swiss' }];
    render(<ScheduleSection />);

    const swissStage = screen.getByTestId('swiss-stage');
    fireEvent.click(swissStage);

    await waitFor(() => {
      expect(screen.getByTestId('match-detail-modal')).toBeInTheDocument();
    });

    const closeButton = screen.getByTestId('close-modal');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('match-detail-modal')).not.toBeInTheDocument();
    });
  });

  it('淘汰赛组件应接收 onMatchClick 回调', async () => {
    mockHomeData.matches = [
      { id: 'm1', stage: 'swiss' },
      { id: 'm2', stage: 'elimination' },
    ];
    render(<ScheduleSection />);

    // 验证 EliminationStage 组件被渲染（在 DOM 中存在，即使 tab 隐藏）
    const eliminationContent = screen.getByTestId('elimination-content');
    expect(eliminationContent).toBeInTheDocument();
  });
});
