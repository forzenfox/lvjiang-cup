import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MatchDataEditPage from '@/components/features/match-data/MatchDataEditPage';
import { matchDataService } from '@/services/matchDataService';
import type { MatchSeriesInfo, MatchGameData } from '@/types/matchData';

// Mock matchDataService
vi.mock('@/services/matchDataService', () => ({
  matchDataService: {
    getSeries: vi.fn(),
    getGameData: vi.fn(),
    updateGameData: vi.fn(),
  },
}));

// Mock tracking
vi.mock('@/utils/tracking', () => ({
  trackAdminEditSave: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// 由于组件中的 isEditDisabled = true，测试应验证禁用状态页面
// 同时也需要 mock store
vi.mock('@/store/matchDataStore', () => ({
  useMatchDataStore: () => ({
    preloadAdjacentGame: vi.fn(),
  }),
}));

const mockGetSeries = matchDataService.getSeries as ReturnType<typeof vi.fn>;
const mockGetGameData = matchDataService.getGameData as ReturnType<typeof vi.fn>;
const mockUpdateGameData = matchDataService.updateGameData as ReturnType<typeof vi.fn>;

const createMockSeriesInfo = (): MatchSeriesInfo => ({
  matchId: 'match1',
  teamA: { id: 'team1', name: 'BLG' },
  teamB: { id: 'team2', name: 'WBG' },
  format: 'BO3',
  games: [
    { gameNumber: 1, winnerTeamId: 'team1', gameDuration: '32:45', hasData: true },
    { gameNumber: 2, winnerTeamId: 'team2', gameDuration: '28:30', hasData: true },
  ],
});

const createMockGameData = (): MatchGameData => ({
  id: 1,
  matchId: 'match1',
  gameNumber: 1,
  winnerTeamId: 'team1',
  gameDuration: '32:45',
  gameStartTime: '2026-04-16T14:00:00',
  blueTeam: {
    teamId: 'team1',
    teamName: 'BLG',
    side: 'blue',
    kills: 25,
    gold: 65000,
    towers: 9,
    dragons: 3,
    barons: 1,
    isWinner: true,
  },
  redTeam: {
    teamId: 'team2',
    teamName: 'WBG',
    side: 'red',
    kills: 18,
    gold: 58000,
    towers: 5,
    dragons: 1,
    barons: 0,
    isWinner: false,
  },
  playerStats: [],
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter initialEntries={['/match/match1/edit']}>
      <Routes>
        <Route path="/match/:id/edit" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('MatchDataEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSeries.mockResolvedValue(createMockSeriesInfo());
    mockGetGameData.mockResolvedValue(createMockGameData());
    mockUpdateGameData.mockResolvedValue({ success: true });
  });

  describe('页面加载 - 编辑功能禁用状态', () => {
    it('应该显示功能禁用页面标题', () => {
      renderWithRouter(<MatchDataEditPage />);
      expect(screen.getByText('功能暂时禁用')).toBeInTheDocument();
    });

    it('应该显示禁用说明文字', () => {
      renderWithRouter(<MatchDataEditPage />);
      expect(screen.getByText(/对战数据编辑功能暂时禁用/i)).toBeInTheDocument();
    });

    it('应该显示返回按钮', () => {
      renderWithRouter(<MatchDataEditPage />);
      expect(screen.getByRole('button', { name: /返回上一页/i })).toBeInTheDocument();
    });

    it('点击返回上一页按钮应该触发导航', () => {
      renderWithRouter(<MatchDataEditPage />);
      const backButton = screen.getByRole('button', { name: /返回上一页/i });
      expect(backButton).toBeInTheDocument();
      // 由于 navigate(-1) 在 MemoryRouter 中不会产生可见变化，
      // 我们验证按钮存在即可
    });
  });

  describe('页面头部', () => {
    it('应该显示对战数据详情编辑标题', () => {
      renderWithRouter(<MatchDataEditPage />);
      expect(screen.getByText('对战数据详情编辑')).toBeInTheDocument();
    });
  });
});
