import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SwissRoundTree from '@/components/features/swiss/SwissRoundTree';
import { buildSwissColumns, getSwissViewConfig, BUILTIN_DEFAULT_FORMAT } from '@/lib/format';
import type { SwissStageConfig } from '@/lib/format';
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

// 默认配置（16 队 3 胜 3 败）的视图模型
const defaultSwissStage = BUILTIN_DEFAULT_FORMAT.stages[0] as SwissStageConfig;
const defaultColumns = buildSwissColumns(defaultSwissStage);
const defaultViewConfig = getSwissViewConfig(defaultColumns, defaultSwissStage);

// 8 队 2 胜 2 败配置的视图模型（4 列：三轮 + 最终结果）
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
const eightTeamViewConfig = getSwissViewConfig(eightTeamColumns, eightTeamStage);

describe('SwissRoundTree 间隔一致性测试', () => {
  it('BO1/BO3 切换标签区域应该使用 mb-2 与下方内容保持间隔一致', () => {
    const { container } = render(
      <SwissRoundTree
        matches={mockMatches}
        teams={mockTeams}
        columns={defaultColumns}
        viewConfig={defaultViewConfig}
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
        columns={defaultColumns}
        viewConfig={defaultViewConfig}
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
        columns={defaultColumns}
        viewConfig={defaultViewConfig}
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
        columns={defaultColumns}
        viewConfig={defaultViewConfig}
        activeTab="bo1"
        onTabChange={() => {}}
      />
    );

    expect(screen.getByText('第一轮')).toBeInTheDocument();
  });
});

describe('SwissRoundTree 默认配置回归测试（16 队 3 胜 3 败）', () => {
  it('应该渲染 6 列且列名与现状一致（第一轮…最终结果）', () => {
    render(
      <SwissRoundTree
        matches={mockMatches}
        teams={mockTeams}
        columns={defaultColumns}
        viewConfig={defaultViewConfig}
        activeTab="bo1"
        onTabChange={() => {}}
      />
    );

    // 6 个列容器（与旧 SWISS_COLUMNS 一致的 data-testid 命名）
    for (let columnId = 1; columnId <= 6; columnId++) {
      expect(screen.getByTestId(`swiss-round-tree-column-${columnId}`)).toBeInTheDocument();
    }
    expect(screen.queryByTestId('swiss-round-tree-column-7')).not.toBeInTheDocument();

    // 列名与现状一致
    expect(screen.getByText('第一轮')).toBeInTheDocument();
    expect(screen.getByText('第二轮')).toBeInTheDocument();
    expect(screen.getByText('第三轮')).toBeInTheDocument();
    expect(screen.getByText('第四轮')).toBeInTheDocument();
    expect(screen.getByText('第五轮')).toBeInTheDocument();
    expect(screen.getByText('最终结果')).toBeInTheDocument();
  });

  it('列容器宽度应按 6 列计算（保持滑动布局）', () => {
    const { container } = render(
      <SwissRoundTree
        matches={mockMatches}
        teams={mockTeams}
        columns={defaultColumns}
        viewConfig={defaultViewConfig}
        activeTab="bo1"
        onTabChange={() => {}}
      />
    );

    // 全列容器的宽度 = 6 列宽 + 5 个列间距（与旧硬编码 6 列一致）
    const allColumnsContainer = container.querySelector('.transition-transform');
    expect(allColumnsContainer).toBeInTheDocument();
    const width = allColumnsContainer?.getAttribute('style')?.match(/width:\s*(\d+)px/)?.[1];
    expect(width).toBeDefined();
    if (width) {
      // 列宽 = min(视口可用宽度/4, SWISS_THEME.columnWidth * 1.3)，间距 = SWISS_THEME.gap(60)
      const columnWidth = Math.min(Math.floor((window.innerWidth - 80) / 4), Math.floor(220 * 1.3));
      expect(Number(width)).toBe(6 * columnWidth + 5 * 60);
    }
  });
});

describe('SwissRoundTree 动态渲染测试（8 队 2 胜 2 败，4 列）', () => {
  it('应该渲染 4 个列容器与列名（第一轮/第二轮/第三轮/最终结果）', () => {
    const { container } = render(
      <SwissRoundTree
        matches={mockMatches}
        teams={mockTeams}
        columns={eightTeamColumns}
        viewConfig={eightTeamViewConfig}
        activeTab="bo1"
        onTabChange={() => {}}
      />
    );

    const columns = container.querySelectorAll('[data-testid^="swiss-round-tree-column-"]');
    expect(columns.length).toBe(4);

    expect(screen.getByText('第一轮')).toBeInTheDocument();
    expect(screen.getByText('第二轮')).toBeInTheDocument();
    expect(screen.getByText('第三轮')).toBeInTheDocument();
    expect(screen.getByText('最终结果')).toBeInTheDocument();
    // 8 队 2 胜制只有 3 轮，不应出现第四轮/第五轮
    expect(screen.queryByText('第四轮')).not.toBeInTheDocument();
    expect(screen.queryByText('第五轮')).not.toBeInTheDocument();
  });

  it('列内记录组数量应与推导结果一致（列1:1组/列2:2组/列3:3组/列4:2组）', () => {
    const { container } = render(
      <SwissRoundTree
        matches={mockMatches}
        teams={mockTeams}
        columns={eightTeamColumns}
        viewConfig={eightTeamViewConfig}
        activeTab="bo1"
        onTabChange={() => {}}
      />
    );

    // 列1: 0-0（1 个比赛组）；列2: 1-0 / 0-1（2 个比赛组）；列3: 2-0 晋级 + 1-1 + 0-2 淘汰（3 组）；列4: 2-1 晋级 + 1-2 淘汰（2 组）
    const column1Records = container.querySelectorAll(
      '[data-testid="swiss-round-tree-column-1"] [data-type]'
    );
    expect(column1Records.length).toBe(1);

    const column2Records = container.querySelectorAll(
      '[data-testid="swiss-round-tree-column-2"] [data-type]'
    );
    expect(column2Records.length).toBe(2);

    const column3Records = container.querySelectorAll(
      '[data-testid="swiss-round-tree-column-3"] [data-type]'
    );
    expect(column3Records.length).toBe(3);

    const column4Records = container.querySelectorAll(
      '[data-testid="swiss-round-tree-column-4"] [data-type]'
    );
    expect(column4Records.length).toBe(2);
  });

  it('4 列时 BO3 视图偏移应为 0（N ≤ 4 无需滑动）', () => {
    const { container } = render(
      <SwissRoundTree
        matches={mockMatches}
        teams={mockTeams}
        columns={eightTeamColumns}
        viewConfig={eightTeamViewConfig}
        activeTab="bo3"
        onTabChange={() => {}}
      />
    );

    const allColumnsContainer = container.querySelector('.transition-transform');
    expect(allColumnsContainer).toBeInTheDocument();
    const transform = allColumnsContainer
      ?.getAttribute('style')
      ?.match(/transform:\s*translateX\((-?\d+(?:\.\d+)?)px\)/)?.[1];
    expect(transform).toBe('0');
  });
});
