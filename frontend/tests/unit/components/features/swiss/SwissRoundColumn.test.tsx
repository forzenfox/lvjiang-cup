import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SwissRoundColumn from '@/components/features/swiss/SwissRoundColumn';
import { SWISS_THEME } from '@/constants/swissTheme';
import type { Match, Team } from '@/types';

const mockTeams: Team[] = [
  { id: 'team1', name: '队伍A', logo: '/logo1.png', players: [], battleCry: '' },
  { id: 'team2', name: '队伍B', logo: '/logo2.png', players: [], battleCry: '' },
  { id: 'team3', name: '队伍C', logo: '/logo3.png', players: [], battleCry: '' },
  { id: 'team4', name: '队伍D', logo: '/logo4.png', players: [], battleCry: '' },
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
  swissRecord: '0-0',
  ...overrides,
});

describe('SwissRoundColumn', () => {
  it('应该正确显示标题和战绩', () => {
    const matches = [createMockMatch()];
    render(<SwissRoundColumn title="Round 1" record="0-0" matches={matches} teams={mockTeams} />);

    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('0-0')).toBeInTheDocument();
  });

  it('应该使用正确的主题颜色渲染标题栏', () => {
    const matches = [createMockMatch()];
    const { getByTestId } = render(
      <SwissRoundColumn
        title="Round 1"
        record="0-0"
        matches={matches}
        teams={mockTeams}
        data-testid="test-column"
      />
    );

    const header = getByTestId('test-column-header');
    expect(header).toHaveStyle({
      backgroundColor: SWISS_THEME.titleBg,
    });
  });

  it('应该正确渲染比赛卡片列表', () => {
    const matches = [
      createMockMatch({ id: 'match1' }),
      createMockMatch({ id: 'match2', teamAId: 'team3', teamBId: 'team4' }),
    ];
    render(
      <SwissRoundColumn
        title="Round 1"
        record="0-0"
        matches={matches}
        teams={mockTeams}
        data-testid="test-column"
      />
    );

    const matchesContainer = screen.getByTestId('test-column-matches');
    expect(matchesContainer.children).toHaveLength(2);
  });

  it('当没有比赛时应该渲染空状态', () => {
    render(<SwissRoundColumn title="Round 1" record="0-0" matches={[]} teams={mockTeams} />);

    const matchesContainer = screen.getByTestId('swiss-round-column-matches');
    expect(matchesContainer.children).toHaveLength(0);
  });

  it('应该支持点击比赛卡片', () => {
    const match = createMockMatch();
    const handleClick = vi.fn();
    render(
      <SwissRoundColumn
        title="Round 1"
        record="0-0"
        matches={[match]}
        teams={mockTeams}
        onMatchClick={handleClick}
        data-testid="test-column"
      />
    );

    const matchCard = screen.getByTestId('test-column-match-0');
    fireEvent.click(matchCard);

    expect(handleClick).toHaveBeenCalledWith(match);
  });

  it('应该支持自定义className', () => {
    const matches = [createMockMatch()];
    render(
      <SwissRoundColumn
        title="Round 1"
        record="0-0"
        matches={matches}
        teams={mockTeams}
        className="custom-class"
        data-testid="test-column"
      />
    );

    const column = screen.getByTestId('test-column');
    expect(column).toHaveClass('custom-class');
  });

  it('应该使用flex布局属性', () => {
    const matches = [createMockMatch()];
    const { getByTestId } = render(
      <SwissRoundColumn
        title="Round 1"
        record="0-0"
        matches={matches}
        teams={mockTeams}
        data-testid="test-column"
      />
    );

    const column = getByTestId('test-column');
    expect(column).toHaveClass('flex', 'flex-col', 'flex-shrink-0');
  });

  it('应该正确设置data-record属性', () => {
    const matches = [createMockMatch()];
    const { getByTestId } = render(
      <SwissRoundColumn
        title="Round 1"
        record="1-0"
        matches={matches}
        teams={mockTeams}
        data-testid="test-column"
      />
    );

    const column = getByTestId('test-column');
    expect(column).toHaveAttribute('data-record', '1-0');
  });
});
