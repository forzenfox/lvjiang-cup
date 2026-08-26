import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SwissStageVisualEditor from '@/pages/admin/SwissStageVisualEditor';
import { buildSwissColumns, BUILTIN_DEFAULT_FORMAT } from '@/lib/format';
import type { SwissStageConfig } from '@/lib/format';
import type { Match, Team } from '@/types';

const mockTeams: Team[] = [
  { id: 'team1', name: '驴酱', logo: '/logo1.png', players: [], battleCry: '测试队伍1' },
  { id: 'team2', name: 'IC', logo: '/logo2.png', players: [], battleCry: '测试队伍2' },
  { id: 'team3', name: 'Team3', logo: '/logo3.png', players: [], battleCry: '测试队伍3' },
  { id: 'team4', name: 'Team4', logo: '/logo4.png', players: [], battleCry: '测试队伍4' },
];

const mockAdvancement = {
  top8: [] as string[],
  eliminated: [] as string[],
};

// 默认配置（16 队 3 胜 3 败）的视图模型
const defaultSwissStage = BUILTIN_DEFAULT_FORMAT.stages[0] as SwissStageConfig;
const defaultColumns = buildSwissColumns(defaultSwissStage);

describe('SwissStageVisualEditor 点击编辑功能', () => {
  it('点击已有比赛卡片应弹出编辑界面', () => {
    const mockMatch: Match = {
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
    };

    const onMatchUpdate = vi.fn();
    const onMatchCreate = vi.fn();

    render(
      <SwissStageVisualEditor
        matches={[mockMatch]}
        teams={mockTeams}
        columns={defaultColumns}
        stage={defaultSwissStage}
        advancement={mockAdvancement}
        onMatchUpdate={onMatchUpdate}
        onMatchCreate={onMatchCreate}
      />
    );

    // 找到比赛卡片 - 通过查找包含 "已结束" 状态的卡片
    const statusBadge = screen.getByText('已结束');
    expect(statusBadge).toBeInTheDocument();

    // 向上查找到卡片容器（带有 cursor-pointer 类的元素）
    let matchCard = statusBadge.parentElement;
    while (matchCard && !matchCard.className.includes('cursor-pointer')) {
      matchCard = matchCard.parentElement;
    }

    expect(matchCard).toBeTruthy();

    if (matchCard) {
      fireEvent.click(matchCard);

      // 应该显示编辑表单（包含保存按钮）
      expect(screen.queryByText('保存')).toBeInTheDocument();
      expect(screen.queryByText('取消')).toBeInTheDocument();
    }
  });

  it('点击空槽位且有onCreate时应弹出编辑界面', () => {
    const onMatchUpdate = vi.fn();
    const onMatchCreate = vi.fn();

    render(
      <SwissStageVisualEditor
        matches={[]} // 空比赛列表
        teams={mockTeams}
        columns={defaultColumns}
        stage={defaultSwissStage}
        advancement={mockAdvancement}
        onMatchUpdate={onMatchUpdate}
        onMatchCreate={onMatchCreate}
      />
    );

    // 找到第一个空槽位（显示"等待对阵"的元素）
    const waitingElements = screen.getAllByText('等待对阵');
    expect(waitingElements.length).toBeGreaterThan(0);

    // 向上查找到可点击的容器
    let emptySlot = waitingElements[0].parentElement;
    while (emptySlot && !emptySlot.className.includes('cursor-pointer')) {
      emptySlot = emptySlot.parentElement;
    }

    expect(emptySlot).toBeTruthy();

    if (emptySlot) {
      fireEvent.click(emptySlot);

      // 应该显示编辑表单
      expect(screen.queryByText('保存')).toBeInTheDocument();
      expect(screen.queryByText('取消')).toBeInTheDocument();
    }
  });

  it('点击空槽位但无onCreate时不应弹出编辑界面', () => {
    const onMatchUpdate = vi.fn();

    render(
      <SwissStageVisualEditor
        matches={[]} // 空比赛列表
        teams={mockTeams}
        columns={defaultColumns}
        stage={defaultSwissStage}
        advancement={mockAdvancement}
        onMatchUpdate={onMatchUpdate}
      />
    );

    // 找到第一个空槽位
    const waitingElements = screen.getAllByText('等待对阵');
    expect(waitingElements.length).toBeGreaterThan(0);

    // 向上查找到容器
    let emptySlot = waitingElements[0].parentElement;
    while (emptySlot && !emptySlot.className.includes('cursor-pointer')) {
      emptySlot = emptySlot.parentElement;
    }

    expect(emptySlot).toBeTruthy();

    if (emptySlot) {
      fireEvent.click(emptySlot);

      // 不应该显示编辑表单
      expect(screen.queryByText('保存')).not.toBeInTheDocument();
      expect(screen.queryByText('取消')).not.toBeInTheDocument();
    }
  });
});

describe('SwissStageVisualEditor 视图模型渲染', () => {
  it('默认配置下应渲染 5 个轮次列与最终结果列结构', () => {
    render(
      <SwissStageVisualEditor
        matches={[]}
        teams={mockTeams}
        columns={defaultColumns}
        stage={defaultSwissStage}
        advancement={mockAdvancement}
        onMatchUpdate={vi.fn()}
      />
    );

    // 5 个轮次标题
    expect(screen.getByText('第一轮')).toBeInTheDocument();
    expect(screen.getByText('第五轮')).toBeInTheDocument();
  });

  it('默认配置下 2-2 组应有 3 个比赛槽位（修正后场次）', () => {
    render(
      <SwissStageVisualEditor
        matches={[]}
        teams={mockTeams}
        columns={defaultColumns}
        stage={defaultSwissStage}
        advancement={mockAdvancement}
        onMatchUpdate={vi.fn()}
      />
    );

    // 第五轮列中 2-2 记录组的槽位数 = matchCount = 3（B 树推导修正值）
    const column5 = defaultColumns[4];
    const record22 = column5.records.find(r => r.record === '2-2');
    expect(record22?.matchCount).toBe(3);
  });

  it('动态列结构（8 队 2 胜制）：应渲染 3 个轮次列', () => {
    const eightTeamStage: SwissStageConfig = {
      type: 'swiss',
      name: '瑞士轮',
      teamCount: 8,
      winThreshold: 2,
      lossThreshold: 2,
      boRule: 'auto',
      advanceToStage: 1,
    };
    const eightTeamColumns = buildSwissColumns(eightTeamStage);

    render(
      <SwissStageVisualEditor
        matches={[]}
        teams={mockTeams}
        columns={eightTeamColumns}
        stage={eightTeamStage}
        advancement={mockAdvancement}
        onMatchUpdate={vi.fn()}
      />
    );

    expect(screen.getByText('第一轮')).toBeInTheDocument();
    expect(screen.getByText('第二轮')).toBeInTheDocument();
    expect(screen.getByText('第三轮')).toBeInTheDocument();
    expect(screen.queryByText('第四轮')).not.toBeInTheDocument();
    expect(screen.queryByText('第五轮')).not.toBeInTheDocument();
  });
});
