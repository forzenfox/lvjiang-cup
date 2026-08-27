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

// 编辑功能当前为可用状态（isEditDisabled = false），
// 断言可编辑页面正确渲染保存/取消按钮，而非「功能暂时禁用」页。
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
        <Route path="/match/:matchId/edit" element={ui} />
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

  describe('页面加载 - 编辑功能可用状态', () => {
    it('应该渲染可编辑页面并显示保存/取消按钮', async () => {
      renderWithRouter(<MatchDataEditPage />);
      // 数据异步加载完成后进入可编辑分支，出现「保存」「取消」操作按钮
      expect(await screen.findByRole('button', { name: '保存' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
    });
  });

  describe('页面头部', () => {
    it('应该显示对战数据详情编辑标题', async () => {
      renderWithRouter(<MatchDataEditPage />);
      expect(await screen.findByText('对战数据详情编辑')).toBeInTheDocument();
    });
  });
});
