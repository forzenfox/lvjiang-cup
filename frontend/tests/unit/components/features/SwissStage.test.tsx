import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SwissStage from '@/components/features/SwissStage';
import type { Match, Team } from '@/types';

const mockTeams: Team[] = [
  { id: 'team1', name: '驴酱', logo: '/logo1.png', players: [], battleCry: '测试队伍1' },
  { id: 'team2', name: 'IC', logo: '/logo2.png', players: [], battleCry: '测试队伍2' },
];

const mockMatches: Match[] = [
  {
    id: 'match1',
    teamAId: 'team1',
    teamBId: 'team2',
    scoreA: 1,
    scoreB: 0,
    winnerId: 'team1',
    round: 'Round 1',
    status: 'finished',
    stage: 'swiss',
    swissRecord: '0-0',
    startTime: '2026-01-01T10:00:00',
  },
];

describe('SwissStage 组件', () => {
  it('不应该显示管理晋级名单按钮', () => {
    render(
      <MemoryRouter>
        <SwissStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    expect(screen.queryByText('管理晋级名单')).not.toBeInTheDocument();
  });

  it('应该显示比赛数据', () => {
    render(
      <MemoryRouter>
        <SwissStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('BO1')).toBeInTheDocument();
  });
});

describe('SwissStage 轮次标题显示', () => {
  it('Round 1 应该显示 BO1 标签', () => {
    render(
      <MemoryRouter>
        <SwissStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('BO1')).toBeInTheDocument();
  });
});