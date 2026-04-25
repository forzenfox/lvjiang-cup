import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MatchDataManagement from '@/pages/admin/MatchDataManagement';
import * as matchDataApi from '@/api/matchData';
import { toast } from 'sonner';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ matchId: 'test-match-123' }),
  };
});

vi.mock('@/api/matchData', () => ({
  getMatchSeries: vi.fn(),
  getMatchGameData: vi.fn(),
  checkMatchDataExists: vi.fn(),
  deleteMatchGameData: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

const mockSeriesInfo = {
  matchId: 'test-match-123',
  teamA: { id: 'team-a', name: 'Team A' },
  teamB: { id: 'team-b', name: 'Team B' },
  format: 'BO3' as const,
  games: [
    { gameNumber: 1, winnerTeamId: 'team-a', gameDuration: '32:45', hasData: true },
    { gameNumber: 2, winnerTeamId: 'team-b', gameDuration: '28:30', hasData: true },
    { gameNumber: 3, winnerTeamId: null, gameDuration: null, hasData: false },
  ],
};

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MatchDataManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue(mockSeriesInfo);

    renderWithRouter(<MatchDataManagement />);

    expect(screen.getByText(/比赛数据管理/i)).toBeInTheDocument();
  });

  it('displays series information when loaded', async () => {
    vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue(mockSeriesInfo);

    renderWithRouter(<MatchDataManagement />);

    await waitFor(() => {
      expect(screen.getByText(/Team A vs Team B - BO3/i)).toBeInTheDocument();
    });
  });

  it('displays game cards for each game in the series', async () => {
    vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue(mockSeriesInfo);

    renderWithRouter(<MatchDataManagement />);

    await waitFor(() => {
      expect(screen.getByText(/第 1 局/i)).toBeInTheDocument();
      expect(screen.getByText(/第 2 局/i)).toBeInTheDocument();
      expect(screen.getByText(/第 3 局/i)).toBeInTheDocument();
    });
  });

  it('shows data status badges for each game', async () => {
    vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue(mockSeriesInfo);

    renderWithRouter(<MatchDataManagement />);

    await waitFor(() => {
      expect(screen.getAllByText(/已有数据/i).length).toBe(2);
      expect(screen.getByText(/无数据/i)).toBeInTheDocument();
    });
  });

  it('displays winner information for games with data', async () => {
    vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue(mockSeriesInfo);

    renderWithRouter(<MatchDataManagement />);

    await waitFor(() => {
      expect(screen.getByText(/获胜方: Team A/i)).toBeInTheDocument();
      expect(screen.getByText(/时长: 32:45/i)).toBeInTheDocument();
    });
  });

  it('disables edit button for games without data', async () => {
    vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue(mockSeriesInfo);

    renderWithRouter(<MatchDataManagement />);

    await waitFor(() => {
      const editButtons = screen.getAllByText('编辑');
      const lastEditButton = editButtons[editButtons.length - 1];
      expect(lastEditButton).toBeDisabled();
    });
  });

  it('disables delete button for games without data', async () => {
    vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue(mockSeriesInfo);

    renderWithRouter(<MatchDataManagement />);

    await waitFor(() => {
      const deleteBtn = screen.getByRole('button', { name: /删除第 3 局数据/i });
      expect(deleteBtn).toBeDisabled();
    });
  });

  it('opens delete confirmation dialog when delete button is clicked', async () => {
    vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue(mockSeriesInfo);

    renderWithRouter(<MatchDataManagement />);

    await waitFor(() => {
      expect(screen.getByText(/第 1 局/i)).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', { name: /删除第 1 局数据/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByText(/确认删除游戏数据？/i)).toBeInTheDocument();
    });
  });

  it('calls delete API and reloads data when delete is confirmed', async () => {
    vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue(mockSeriesInfo);
    vi.mocked(matchDataApi.deleteMatchGameData).mockResolvedValue({ deleted: true, gameNumber: 1 });

    renderWithRouter(<MatchDataManagement />);

    await waitFor(() => {
      expect(screen.getByText(/第 1 局/i)).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', { name: /删除第 1 局数据/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByText(/确认删除游戏数据？/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('删除');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(matchDataApi.deleteMatchGameData).toHaveBeenCalledWith('test-match-123', 1);
      expect(toast.success).toHaveBeenCalledWith('删除成功');
    });
  });

  it('shows error toast when delete API fails', async () => {
    vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue(mockSeriesInfo);
    vi.mocked(matchDataApi.deleteMatchGameData).mockRejectedValue(new Error('删除失败'));

    renderWithRouter(<MatchDataManagement />);

    await waitFor(() => {
      expect(screen.getByText(/第 1 局/i)).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', { name: /删除第 1 局数据/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByText(/确认删除游戏数据？/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('删除');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('删除游戏数据失败');
    });
  });

  it('calls refresh function when refresh button is clicked', async () => {
    vi.mocked(matchDataApi.getMatchSeries).mockResolvedValue(mockSeriesInfo);

    renderWithRouter(<MatchDataManagement />);

    await waitFor(() => {
      expect(screen.getByText(/第 1 局/i)).toBeInTheDocument();
    });

    const refreshButton = screen.getByText(/刷新/i);
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(matchDataApi.getMatchSeries).toHaveBeenCalledTimes(2);
    });
  });

  it('shows loading state while initial data is loading', () => {
    vi.mocked(matchDataApi.getMatchSeries).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithRouter(<MatchDataManagement />);

    expect(screen.getByText(/加载中\.\.\./i)).toBeInTheDocument();
  });
});
