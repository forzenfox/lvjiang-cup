import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SwissFinalResultMobile from '@/components/features/swiss/SwissFinalResultMobile';
import type { Team } from '@/types';

describe('SwissFinalResultMobile', () => {
  const mockTeams: Team[] = [
    { id: 'team1', name: '洞主队', logo: 'logo1.png', players: [], battleCry: '加油' },
    { id: 'team2', name: '余小C队', logo: 'logo2.png', players: [], battleCry: '必胜' },
    { id: 'team3', name: '二抛队', logo: 'logo3.png', players: [], battleCry: '冲鸭' },
    { id: 'team4', name: '小龙虾队', logo: 'logo4.png', players: [], battleCry: '战斗' },
  ];

  const mockRankings = [
    { teamId: 'team1', record: '3-0', rank: 1 },
    { teamId: 'team2', record: '3-2', rank: 2 },
    { teamId: 'team3', record: '3-1', rank: 3 },
    { teamId: 'team4', record: '3-2', rank: 4 },
  ];

  it('应该根据rankings显示正确的战绩', () => {
    render(
      <SwissFinalResultMobile
        qualifiedTeams={mockTeams}
        eliminatedTeams={[]}
        rankings={mockRankings}
      />
    );

    // 验证战绩显示正确（使用getAllByText因为可能有重复战绩）
    expect(screen.getByText('3-0')).toBeInTheDocument();
    expect(screen.getAllByText('3-2').length).toBeGreaterThanOrEqual(2); // 余小C队和小龙虾队都是3-2
    expect(screen.getByText('3-1')).toBeInTheDocument();
  });

  it('当rankings未提供时应该显示问号', () => {
    render(<SwissFinalResultMobile qualifiedTeams={mockTeams} eliminatedTeams={[]} />);

    // 所有战绩应该显示为?
    const questionMarks = screen.getAllByText('?');
    expect(questionMarks.length).toBeGreaterThan(0);
  });

  it('应该按rank排序显示晋级队伍', () => {
    render(
      <SwissFinalResultMobile
        qualifiedTeams={mockTeams}
        eliminatedTeams={[]}
        rankings={mockRankings}
      />
    );

    // 获取所有战绩元素
    const records = screen.getAllByText(/\d-\d/);

    // 验证排序：3-0, 3-2, 3-1, 3-2 (按rank顺序)
    expect(records[0].textContent).toBe('3-0');
    expect(records[1].textContent).toBe('3-2');
  });

  it('应该正确显示淘汰队伍的战绩', () => {
    const eliminatedTeams: Team[] = [
      { id: 'team5', name: '孙悟空队', logo: 'logo5.png', players: [], battleCry: '奋斗' },
      { id: 'team6', name: 'PIGFF队', logo: 'logo6.png', players: [], battleCry: '努力' },
    ];

    const rankingsWithEliminated = [
      ...mockRankings,
      { teamId: 'team5', record: '0-3', rank: 5 },
      { teamId: 'team6', record: '1-3', rank: 6 },
    ];

    render(
      <SwissFinalResultMobile
        qualifiedTeams={mockTeams}
        eliminatedTeams={eliminatedTeams}
        rankings={rankingsWithEliminated}
      />
    );

    // 验证淘汰队伍战绩显示正确
    expect(screen.getByText('0-3')).toBeInTheDocument();
    expect(screen.getByText('1-3')).toBeInTheDocument();
  });
});
