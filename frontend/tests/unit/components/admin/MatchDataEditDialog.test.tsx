import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MatchDataEditDialog from '@/components/admin/MatchDataEditDialog';
import * as matchDataApi from '@/api/matchData';

// Mock API
vi.mock('@/api/matchData', () => ({
  updateMatchGameData: vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockMatchId = 'test-match-123';
const mockGameId = 1;

const mockGameData = {
  id: mockGameId,
  matchId: mockMatchId,
  gameNumber: 1,
  winnerTeamId: 'team-a',
  gameDuration: '32:45',
  gameStartTime: '2024-01-01T10:00:00Z',
  blueTeam: {
    teamId: 'team-a',
    teamName: 'Team A',
    side: 'blue' as const,
    kills: 15,
    gold: 55000,
    towers: 8,
    dragons: 3,
    barons: 1,
    isWinner: true,
  },
  redTeam: {
    teamId: 'team-b',
    teamName: 'Team B',
    side: 'red' as const,
    kills: 10,
    gold: 48000,
    towers: 3,
    dragons: 1,
    barons: 0,
    isWinner: false,
  },
  playerStats: [
    {
      id: 1,
      playerId: 'player-1',
      playerName: 'Player1',
      teamId: 'team-a',
      teamName: 'Team A',
      position: 'MID' as const,
      championName: 'Ahri',
      kills: 5,
      deaths: 2,
      assists: 8,
      kda: '5/2/8',
      cs: 250,
      gold: 12000,
      damageDealt: 25000,
      damageTaken: 15000,
      visionScore: 25,
      wardsPlaced: 10,
      level: 16,
      firstBlood: false,
      mvp: true,
    },
  ],
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  matchId: mockMatchId,
  gameId: mockGameId,
  gameData: mockGameData,
};

describe('MatchDataEditDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when open is false', () => {
    render(<MatchDataEditDialog {...defaultProps} open={false} />);
    expect(screen.queryByText(/编辑比赛数据/i)).not.toBeInTheDocument();
  });

  it('renders dialog with game data when open is true', () => {
    render(<MatchDataEditDialog {...defaultProps} />);
    expect(screen.getByText(/编辑比赛数据/i)).toBeInTheDocument();
    expect(screen.getByText(/第 1 局/i)).toBeInTheDocument();
  });

  it('displays game duration field', () => {
    render(<MatchDataEditDialog {...defaultProps} />);
    expect(screen.getByLabelText(/游戏时长/i)).toBeInTheDocument();
  });

  it('displays team stats section', () => {
    render(<MatchDataEditDialog {...defaultProps} />);
    expect(screen.getByText(/蓝色方/i)).toBeInTheDocument();
    expect(screen.getByText(/红色方/i)).toBeInTheDocument();
  });

  it('displays player stats section', () => {
    render(<MatchDataEditDialog {...defaultProps} />);
    expect(screen.getByText(/选手数据/i)).toBeInTheDocument();
    expect(screen.getByText(/Player1/i)).toBeInTheDocument();
  });

  it('shows loading state on save button when saving', async () => {
    vi.mocked(matchDataApi.updateMatchGameData).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<MatchDataEditDialog {...defaultProps} />);
    const saveButton = screen.getByText(/保存修改/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/保存中/i)).toBeInTheDocument();
    });
  });

  it('calls updateMatchGameData API when save is clicked', async () => {
    vi.mocked(matchDataApi.updateMatchGameData).mockResolvedValue({
      updated: true,
      gameId: mockGameId,
    });

    render(<MatchDataEditDialog {...defaultProps} />);
    const saveButton = screen.getByText(/保存修改/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(matchDataApi.updateMatchGameData).toHaveBeenCalled();
    });
  });

  it('calls onSuccess after successful save', async () => {
    vi.mocked(matchDataApi.updateMatchGameData).mockResolvedValue({
      updated: true,
      gameId: mockGameId,
    });

    const onSuccess = vi.fn();
    render(<MatchDataEditDialog {...defaultProps} onSuccess={onSuccess} />);
    const saveButton = screen.getByText(/保存修改/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows error message when save fails', async () => {
    vi.mocked(matchDataApi.updateMatchGameData).mockRejectedValue(new Error('保存失败'));

    render(<MatchDataEditDialog {...defaultProps} />);
    const saveButton = screen.getByText(/保存修改/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/保存失败/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<MatchDataEditDialog {...defaultProps} />);
    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('allows editing game duration', () => {
    render(<MatchDataEditDialog {...defaultProps} />);
    const durationInput = screen.getByLabelText(/游戏时长/i) as HTMLInputElement;

    fireEvent.change(durationInput, { target: { value: '35:20' } });
    expect(durationInput.value).toBe('35:20');
  });

  it('allows editing team kills', () => {
    render(<MatchDataEditDialog {...defaultProps} />);
    const killsInputs = screen.getAllByLabelText(/击杀/i);

    // First one should be blue team
    fireEvent.change(killsInputs[0], { target: { value: '20' } });
    expect((killsInputs[0] as HTMLInputElement).value).toBe('20');
  });
});
