import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MatchDataEditPage from '@/components/features/match-data/MatchDataEditPage';
import * as matchDataApi from '@/api/matchData';
import type { MatchSeriesInfo, MatchGameData } from '@/types/matchData';

vi.mock('@/api/matchData', () => ({
  getMatchSeries: vi.fn(),
  getMatchGameData: vi.fn(),
  updateMatchGameData: vi.fn(),
}));

const mockGetMatchSeries = matchDataApi.getMatchSeries as ReturnType<typeof vi.fn>;
const mockGetMatchGameData = matchDataApi.getMatchGameData as ReturnType<typeof vi.fn>;
const mockUpdateMatchGameData = matchDataApi.updateMatchGameData as ReturnType<typeof vi.fn>;

const createMockSeriesInfo = (): MatchSeriesInfo => ({
  matchId: 'match1',
  teamA: {
    id: 'team1',
    name: 'BLG',
  },
  teamB: {
    id: 'team2',
    name: 'WBG',
  },
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
  playerStats: [
    {
      id: 1,
      playerId: 'p1',
      playerName: 'Bin',
      teamId: 'team1',
      teamName: 'BLG',
      position: 'TOP',
      championName: '格温',
      kills: 8,
      deaths: 2,
      assists: 12,
      kda: '8/2/12',
      cs: 349,
      gold: 18500,
      damageDealt: 45000,
      damageTaken: 28000,
      visionScore: 25,
      wardsPlaced: 15,
      level: 18,
      firstBlood: false,
      mvp: true,
    },
    {
      id: 2,
      playerId: 'p6',
      playerName: 'Zika',
      teamId: 'team2',
      teamName: 'WBG',
      position: 'TOP',
      championName: '赛恩',
      kills: 1,
      deaths: 5,
      assists: 9,
      kda: '1/5/9',
      cs: 267,
      gold: 15200,
      damageDealt: 32000,
      damageTaken: 45000,
      visionScore: 18,
      wardsPlaced: 10,
      level: 16,
      firstBlood: false,
      mvp: false,
    },
  ],
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
    mockGetMatchSeries.mockResolvedValue(createMockSeriesInfo());
    mockGetMatchGameData.mockResolvedValue(createMockGameData());
    mockUpdateMatchGameData.mockResolvedValue({ success: true });
  });

  describe('页面加载', () => {
    it('应该显示对战数据详情', async () => {
      renderWithRouter(<MatchDataEditPage />);

      await waitFor(() => {
        expect(screen.getByText('对战数据详情')).toBeInTheDocument();
      });
    });

    it('应该显示队名和比分', async () => {
      renderWithRouter(<MatchDataEditPage />);

      await waitFor(() => {
        expect(screen.getByText('BLG vs WBG - BO3')).toBeInTheDocument();
      });
    });
  });

  describe('编辑按钮显示', () => {
    it('应该显示编辑按钮', async () => {
      renderWithRouter(<MatchDataEditPage />);

      await waitFor(() => {
        expect(screen.getByText('编辑')).toBeInTheDocument();
      });
    });
  });

  describe('编辑模式进入', () => {
    it('点击编辑按钮进入编辑模式显示保存和取消按钮', async () => {
      renderWithRouter(<MatchDataEditPage />);

      await waitFor(() => {
        expect(screen.getByText('编辑')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('编辑'));

      await waitFor(() => {
        expect(screen.getByText('保存')).toBeInTheDocument();
        expect(screen.getByText('取消')).toBeInTheDocument();
      });
    });
  });

  describe('取消功能', () => {
    it('点击取消返回只读模式（编辑按钮出现）', async () => {
      renderWithRouter(<MatchDataEditPage />);

      await waitFor(() => {
        expect(screen.getByText('编辑')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('编辑'));

      await waitFor(() => {
        expect(screen.getByText('取消')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('取消'));

      await waitFor(() => {
        expect(screen.getByText('编辑')).toBeInTheDocument();
      });
    });
  });
});
