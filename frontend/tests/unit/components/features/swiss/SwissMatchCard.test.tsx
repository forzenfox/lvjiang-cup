import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SwissMatchCard from '@/components/features/swiss/SwissMatchCard';
import { SWISS_THEME } from '@/constants/swissTheme';
import type { Match, Team } from '@/types';

const mockTeams: Team[] = [
  { id: 'team1', name: '驴酱', logo: '/logo1.png', players: [], battleCry: '' },
  { id: 'team2', name: '雨酱', logo: '/logo2.png', players: [], battleCry: '' },
];

const createMockMatch = (overrides: Partial<Match> = {}): Match => ({
  id: 'match1',
  teamAId: 'team1',
  teamBId: 'team2',
  scoreA: 3,
  scoreB: 2,
  winnerId: 'team1',
  round: 'Round 1',
  status: 'finished',
  startTime: '2026-01-01T10:00:00',
  stage: 'swiss',
  ...overrides,
});

describe('SwissMatchCard', () => {
  it('应该正确显示两队信息', () => {
    const match = createMockMatch();
    render(<SwissMatchCard match={match} teams={mockTeams} />);

    expect(screen.getByText('驴酱')).toBeInTheDocument();
    expect(screen.getByText('雨酱')).toBeInTheDocument();
  });

  it('应该显示比赛状态', () => {
    const match = createMockMatch({ status: 'upcoming' });
    render(<SwissMatchCard match={match} teams={mockTeams} />);

    // upcoming 状态显示队伍名称
    expect(screen.getByText('驴酱')).toBeInTheDocument();
    expect(screen.getByText('雨酱')).toBeInTheDocument();
  });

  it('应该高亮显示胜者', () => {
    const match = createMockMatch({ winnerId: 'team1' });
    render(<SwissMatchCard match={match} teams={mockTeams} />);

    // 胜者应该显示为白色（winnerText颜色）
    const winnerName = screen.getByText('驴酱');
    expect(winnerName).toHaveStyle({ color: SWISS_THEME.winnerText });
  });

  it('应该支持点击事件', () => {
    const match = createMockMatch();
    const handleClick = vi.fn();
    const { container } = render(
      <SwissMatchCard match={match} teams={mockTeams} onClick={handleClick} />
    );

    const card = container.querySelector('.cursor-pointer');
    expect(card).toBeInTheDocument();

    fireEvent.click(card!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应该显示比赛比分', () => {
    const match = createMockMatch({ startTime: '2026-01-01T10:00:00' });
    render(<SwissMatchCard match={match} teams={mockTeams} />);

    // 比分应该显示为 3:2
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('当没有startTime时不应该显示时间', () => {
    const match = createMockMatch({ startTime: '' });
    const { container } = render(<SwissMatchCard match={match} teams={mockTeams} />);

    const timeElement = container.querySelector('.rounded-br');
    expect(timeElement).not.toBeInTheDocument();
  });

  it('应该显示正确的比分', () => {
    const match = createMockMatch({ scoreA: 3, scoreB: 2 });
    render(<SwissMatchCard match={match} teams={mockTeams} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('应该支持自定义className', () => {
    const match = createMockMatch();
    const { container } = render(
      <SwissMatchCard match={match} teams={mockTeams} className="custom-class" />
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });
});
