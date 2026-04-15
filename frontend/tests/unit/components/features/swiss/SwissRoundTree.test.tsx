import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SwissRoundTree from '@/components/features/swiss/SwissRoundTree';
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

describe('SwissRoundTree 间隔一致性测试', () => {
  it('BO1/BO3 切换标签区域应该使用 mb-2 与下方内容保持间隔一致', () => {
    const { container } = render(
      <SwissRoundTree
        matches={mockMatches}
        teams={mockTeams}
        activeTab="bo1"
        onTabChange={() => {}}
      />
    );

    // 查找标签容器
    const tabContainer = container.querySelector('.mb-2');
    expect(tabContainer).toBeInTheDocument();
  });

  it('不应该再使用 mb-4 作为间隔', () => {
    const { container } = render(
      <SwissRoundTree
        matches={mockMatches}
        teams={mockTeams}
        activeTab="bo1"
        onTabChange={() => {}}
      />
    );

    // 确保没有使用 mb-4
    const mb4Element = container.querySelector('.mb-4');
    expect(mb4Element).not.toBeInTheDocument();
  });
});

describe('SwissRoundTree 渲染测试', () => {
  it('应该正确渲染 BO1 标签', () => {
    render(
      <SwissRoundTree
        matches={mockMatches}
        teams={mockTeams}
        activeTab="bo1"
        onTabChange={() => {}}
      />
    );

    expect(screen.getByText('BO1')).toBeInTheDocument();
    expect(screen.getByText('BO3')).toBeInTheDocument();
  });

  it('应该正确渲染轮次标题', () => {
    render(
      <SwissRoundTree
        matches={mockMatches}
        teams={mockTeams}
        activeTab="bo1"
        onTabChange={() => {}}
      />
    );

    expect(screen.getByText('第一轮')).toBeInTheDocument();
  });
});
