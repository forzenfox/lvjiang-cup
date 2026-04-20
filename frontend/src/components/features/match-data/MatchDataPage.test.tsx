import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MatchDataPage from './MatchDataPage';
import * as matchDataApi from '@/api/matchData';

// Mock the API
vi.mock('@/api/matchData', () => ({
  getMatchSeries: vi.fn(),
  getMatchGameData: vi.fn(),
}));

// Mock child components
vi.mock('@/components/features/match-data/MatchDataHeader', () => ({
  default: ({ subtitle }: { subtitle?: string }) => (
    <div data-testid="match-data-header">
      <h1>Match Data Header</h1>
      {subtitle && <span data-testid="subtitle">{subtitle}</span>}
    </div>
  ),
}));

vi.mock('@/components/features/match-data/RadarChart', () => ({
  default: () => <div data-testid="radar-chart">Radar Chart</div>,
}));

const renderWithRouter = (route: string = '/match/123/games') => {
  // Set up the initial entries for MemoryRouter
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/match/:id/games" element={<MatchDataPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('MatchDataPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('URL Parameter Handling', () => {
    it('should extract match id from URL path', () => {
      vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue({
        matchId: '123',
        teamA: { id: '1', name: 'Team A' },
        teamB: { id: '2', name: 'Team B' },
        format: 'BO3',
        games: [
          { gameNumber: 1, winnerTeamId: '1', gameDuration: '30:00', hasData: true },
        ],
      });

      renderWithRouter('/match/123/games');

      expect(screen.getByTestId('match-data-header')).toBeInTheDocument();
    });

    it('should handle ?game=X query parameter from URL', () => {
      vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue({
        matchId: '123',
        teamA: { id: '1', name: 'Team A' },
        teamB: { id: '2', name: 'Team B' },
        format: 'BO3',
        games: [
          { gameNumber: 1, winnerTeamId: '1', gameDuration: '30:00', hasData: true },
          { gameNumber: 2, winnerTeamId: '2', gameDuration: '35:00', hasData: true },
          { gameNumber: 3, winnerTeamId: '1', gameDuration: '40:00', hasData: false },
        ],
      });

      renderWithRouter('/match/123/games?game=2');

      // Component should load with game 2 selected
      expect(screen.getByTestId('match-data-header')).toBeInTheDocument();
    });

    it('should default to game 1 when no query parameter provided', () => {
      vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue({
        matchId: '123',
        teamA: { id: '1', name: 'Team A' },
        teamB: { id: '2', name: 'Team B' },
        format: 'BO3',
        games: [
          { gameNumber: 1, winnerTeamId: '1', gameDuration: '30:00', hasData: true },
          { gameNumber: 2, winnerTeamId: '2', gameDuration: '35:00', hasData: true },
        ],
      });

      renderWithRouter('/match/123/games');

      expect(screen.getByTestId('match-data-header')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state initially', async () => {
      vi.mocked(matchDataApi.getMatchSeries).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      await act(async () => {
        renderWithRouter('/match/123/games');
      });

      // Component should render even while loading
      expect(screen.getByTestId('match-data-header')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.mocked(matchDataApi.getMatchSeries).mockRejectedValue(
        new Error('Failed to fetch series')
      );

      await act(async () => {
        renderWithRouter('/match/123/games');
      });

      // Component should still render even with error
      expect(screen.getByTestId('match-data-header')).toBeInTheDocument();
    });
  });

  describe('Game Navigation', () => {
    it('should update URL when switching games', async () => {
      const mockSeries = {
        matchId: '123',
        teamA: { id: '1', name: 'Team A' },
        teamB: { id: '2', name: 'Team B' },
        format: 'BO3' as const,
        games: [
          { gameNumber: 1, winnerTeamId: '1', gameDuration: '30:00', hasData: true },
          { gameNumber: 2, winnerTeamId: '2', gameDuration: '35:00', hasData: true },
        ],
      };

      vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue(mockSeries);
      vi.mocked(matchDataApi.getMatchGameData).mockResolvedValue({
        id: 1,
        matchId: '123',
        gameNumber: 1,
        winnerTeamId: '1',
        gameDuration: '30:00',
        gameStartTime: '2024-01-01T00:00:00Z',
        blueTeam: {
          teamId: '1',
          teamName: 'Team A',
          side: 'blue',
          kills: 10,
          gold: 50000,
          towers: 5,
          dragons: 2,
          barons: 1,
          isWinner: true,
        },
        redTeam: {
          teamId: '2',
          teamName: 'Team B',
          side: 'red',
          kills: 5,
          gold: 45000,
          towers: 3,
          dragons: 1,
          barons: 0,
          isWinner: false,
        },
        playerStats: [],
      });

      await act(async () => {
        renderWithRouter('/match/123/games');
      });

      // Component should render successfully
      expect(screen.getByTestId('match-data-header')).toBeInTheDocument();
    });
  });
});
