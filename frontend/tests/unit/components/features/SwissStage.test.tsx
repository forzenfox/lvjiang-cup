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

    // 不应该显示"管理晋级名单"链接
    expect(screen.queryByText('管理晋级名单')).not.toBeInTheDocument();
  });

  it('应该正常显示晋级名单数据', () => {
    const advancement = {
      winners2_0: ['team1'],
      winners2_1: [],
      losersBracket: [],
      eliminated3rd: [],
      eliminated0_3: ['team2'],
    };

    render(
      <MemoryRouter>
        <SwissStage matches={mockMatches} teams={mockTeams} advancement={advancement} />
      </MemoryRouter>
    );

    // 应该显示 2-0 晋级的队伍
    expect(screen.getByText('2-0 晋级 (胜者组)')).toBeInTheDocument();
    // 驴酱在页面中可能出现多次（比赛卡片和晋级名单），使用 getAllByText
    expect(screen.getAllByText('驴酱').length).toBeGreaterThanOrEqual(1);

    // 应该显示 0-3 淘汰的队伍
    expect(screen.getByText('0-3 淘汰')).toBeInTheDocument();
    expect(screen.getAllByText('IC').length).toBeGreaterThanOrEqual(1);
  });

  it('应该显示比赛数据', () => {
    render(
      <MemoryRouter>
        <SwissStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 应该显示 Round 1 标题
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    // 应该显示 BO1 标签
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

    // 应该显示 Round 1 标题
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    // 应该显示 BO1 标签
    expect(screen.getByText('BO1')).toBeInTheDocument();
  });

  it('Round 2 High 应该显示 BO3 标签', () => {
    const round2Matches: Match[] = [
      {
        id: 'match2',
        teamAId: 'team1',
        teamBId: 'team2',
        scoreA: 2,
        scoreB: 1,
        winnerId: 'team1',
        round: 'Round 2 High',
        status: 'finished',
        stage: 'swiss',
        swissRecord: '1-0',
        startTime: '2026-01-02T10:00:00',
      },
    ];

    render(
      <MemoryRouter>
        <SwissStage matches={round2Matches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 应该显示 Round 2 High 标题
    expect(screen.getByText('Round 2 High')).toBeInTheDocument();
    // 应该显示 BO3 标签（页面中有多个 BO3，使用 getAllByText 验证至少有一个）
    expect(screen.getAllByText('BO3').length).toBeGreaterThanOrEqual(1);
  });

  it('标题不应该包含战绩文本 (0-0) 等', () => {
    render(
      <MemoryRouter>
        <SwissStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 不应该包含战绩文本
    expect(screen.queryByText('Round 1 (0-0)')).not.toBeInTheDocument();
    expect(screen.queryByText('(0-0)')).not.toBeInTheDocument();
  });
});
