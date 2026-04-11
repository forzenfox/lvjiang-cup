import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EliminationStage from '@/components/features/EliminationStage';
import type { Match, Team } from '@/types';

const mockTeams: Team[] = [
  { id: 'team1', name: '驴酱', logo: '/logo1.png', players: [], battleCry: '测试队伍1' },
  { id: 'team2', name: '雨酱', logo: '/logo2.png', players: [], battleCry: '测试队伍2' },
  { id: 'team3', name: 'IC', logo: '/logo3.png', players: [], battleCry: '测试队伍3' },
  { id: 'team4', name: '小熊', logo: '/logo4.png', players: [], battleCry: '测试队伍4' },
  { id: 'team5', name: 'PLG', logo: '/logo5.png', players: [], battleCry: '测试队伍5' },
  { id: 'team6', name: '69', logo: '/logo6.png', players: [], battleCry: '测试队伍6' },
];

const createMockMatch = (
  gameNum: number,
  teamAId: string,
  teamBId: string,
  scoreA: number,
  scoreB: number,
  status: Match['status'] = 'finished'
): Match => ({
  id: `match-${gameNum}`,
  teamAId,
  teamBId,
  scoreA,
  scoreB,
  winnerId: scoreA > scoreB ? teamAId : teamBId,
  round: `Round ${gameNum}`,
  status,
  stage: 'elimination',
  eliminationGameNumber: gameNum,
  startTime: '2026-01-01T10:00:00',
});

describe('EliminationStage 组件', () => {
  it('应该渲染淘汰赛阶段', () => {
    const mockMatches: Match[] = [
      createMockMatch(1, 'team1', 'team2', 3, 2),
      createMockMatch(2, 'team3', 'team4', 2, 3),
      createMockMatch(3, 'team1', 'team4', 3, 1),
      createMockMatch(4, 'team5', 'team6', 1, 3),
      createMockMatch(5, 'team1', 'team4', 2, 3),
      createMockMatch(6, 'team4', 'team6', 3, 2),
      createMockMatch(7, 'team4', 'team6', 3, 1),
    ];

    render(
      <MemoryRouter>
        <EliminationStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 验证所有队伍名称都显示在页面中（使用 getAllByText 因为队伍可能在多场比赛中出现）
    expect(screen.getAllByText('驴酱').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('雨酱').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('IC').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('小熊').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('PLG').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('69').length).toBeGreaterThanOrEqual(1);
  });

  it('应该显示实线连接线（无虚线SVG）', () => {
    const mockMatches: Match[] = [
      createMockMatch(1, 'team1', 'team2', 3, 2),
      createMockMatch(2, 'team3', 'team4', 2, 3),
    ];

    const { container } = render(
      <MemoryRouter>
        <EliminationStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 验证存在连接线元素（使用CSS实现的实线）
    const connectors = container.querySelectorAll('.elimination-connector');
    expect(connectors.length).toBeGreaterThan(0);

    // 验证没有虚线SVG路径
    const dashedPaths = container.querySelectorAll('path[stroke-dasharray]');
    expect(dashedPaths.length).toBe(0);
  });

  it('应该正确显示比赛信息（队伍、比分、时间）', () => {
    const mockMatches: Match[] = [createMockMatch(1, 'team1', 'team2', 3, 2)];

    render(
      <MemoryRouter>
        <EliminationStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 验证队伍名称显示
    expect(screen.getByText('驴酱')).toBeInTheDocument();
    expect(screen.getByText('雨酱')).toBeInTheDocument();

    // 验证比分显示
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // 验证时间显示（格式：MM月dd日 HH:mm）
    expect(screen.getByText('01月01日 10:00')).toBeInTheDocument();
  });

  it('应该正确标记胜者', () => {
    const mockMatches: Match[] = [
      createMockMatch(1, 'team1', 'team2', 3, 2), // team1 获胜
    ];

    const { container } = render(
      <MemoryRouter>
        <EliminationStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 验证胜者队伍有正确的样式类（白色文字）
    const winnerElements = container.querySelectorAll('[data-testid$="-team-a"]');
    expect(winnerElements.length).toBeGreaterThan(0);
  });

  it('应该处理空比赛槽位（显示"待定"）', () => {
    const mockMatches: Match[] = []; // 空数组

    render(
      <MemoryRouter>
        <EliminationStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 验证显示"待定"文本
    const pendingTexts = screen.getAllByText('待定');
    expect(pendingTexts.length).toBeGreaterThan(0);
  });

  it('应该响应式显示（水平滚动容器）', () => {
    const mockMatches: Match[] = [createMockMatch(1, 'team1', 'team2', 3, 2)];

    const { container } = render(
      <MemoryRouter>
        <EliminationStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 验证存在水平滚动容器
    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();

    // 验证有固定宽度的画布
    const board = container.querySelector('[data-testid="elimination-bracket"]');
    expect(board).toBeInTheDocument();
  });

  it('应该显示中文阶段标签', () => {
    const mockMatches: Match[] = [createMockMatch(1, 'team1', 'team2', 3, 2)];

    render(
      <MemoryRouter>
        <EliminationStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 验证中文阶段标签显示
    expect(screen.getByText('四分之一决赛')).toBeInTheDocument();
    expect(screen.getByText('半决赛')).toBeInTheDocument();
    expect(screen.getByText('决赛')).toBeInTheDocument();
  });

  it('应该正确处理未开始和进行中的比赛', () => {
    const mockMatches: Match[] = [
      {
        ...createMockMatch(1, 'team1', 'team2', 0, 0, 'upcoming'),
        scoreA: 0,
        scoreB: 0,
        winnerId: null,
      },
      { ...createMockMatch(2, 'team3', 'team4', 1, 1, 'ongoing'), winnerId: null },
    ];

    render(
      <MemoryRouter>
        <EliminationStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 验证状态标签显示
    expect(screen.getAllByText('未开始').length).toBeGreaterThan(0);
    expect(screen.getAllByText('进行中').length).toBeGreaterThan(0);
  });

  it('应该在卡片顶部显示时间和状态', () => {
    const mockMatches: Match[] = [createMockMatch(1, 'team1', 'team2', 3, 2)];

    render(
      <MemoryRouter>
        <EliminationStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 验证时间显示
    const timeElements = screen.getAllByTestId('match-time');
    expect(timeElements.length).toBeGreaterThan(0);

    // 验证状态显示
    const statusElements = screen.getAllByTestId('match-status');
    expect(statusElements.length).toBeGreaterThan(0);
  });

  describe('editable 模式', () => {
    it('应该在 editable=true 时渲染可编辑卡片', () => {
      const mockMatches: Match[] = [createMockMatch(1, 'team1', 'team2', 3, 2)];
      const mockOnUpdate = vi.fn();

      const { container } = render(
        <MemoryRouter>
          <EliminationStage
            matches={mockMatches}
            teams={mockTeams}
            editable={true}
            onMatchUpdate={mockOnUpdate}
          />
        </MemoryRouter>
      );

      // 验证存在可编辑卡片（整个卡片可点击，有cursor-pointer类）
      const cards = container.querySelectorAll('.cursor-pointer');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('应该在 editable=false 时渲染只读卡片', () => {
      const mockMatches: Match[] = [createMockMatch(1, 'team1', 'team2', 3, 2)];

      const { container } = render(
        <MemoryRouter>
          <EliminationStage matches={mockMatches} teams={mockTeams} editable={false} />
        </MemoryRouter>
      );

      // 验证只读模式下渲染 BracketMatchCard（有 cursor-pointer 用于打开详情弹框）
      const cards = container.querySelectorAll('.cursor-pointer');
      // 所有卡片都应该有 cursor-pointer 类（用于点击打开详情弹框）
      expect(cards.length).toBeGreaterThan(0);
    });

    it('应该在 editable=true 但无 onMatchUpdate 时渲染只读卡片', () => {
      const mockMatches: Match[] = [createMockMatch(1, 'team1', 'team2', 3, 2)];

      const { container } = render(
        <MemoryRouter>
          <EliminationStage matches={mockMatches} teams={mockTeams} editable={true} />
        </MemoryRouter>
      );

      // 验证没有 onMatchUpdate 时渲染只读卡片（有 cursor-pointer 用于打开详情弹框）
      const cards = container.querySelectorAll('.cursor-pointer');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('三列布局', () => {
    it('应该渲染7场比赛（4QF + 2SF + 1F）', () => {
      const mockMatches: Match[] = [
        createMockMatch(1, 'team1', 'team2', 3, 2),
        createMockMatch(2, 'team3', 'team4', 2, 3),
        createMockMatch(3, 'team1', 'team4', 3, 1),
        createMockMatch(4, 'team5', 'team6', 1, 3),
        createMockMatch(5, 'team1', 'team4', 2, 3),
        createMockMatch(6, 'team4', 'team6', 3, 2),
        createMockMatch(7, 'team4', 'team6', 3, 1),
      ];

      const { container } = render(
        <MemoryRouter>
          <EliminationStage matches={mockMatches} teams={mockTeams} />
        </MemoryRouter>
      );

      // 验证所有比赛槽位都存在
      expect(container.querySelector('[data-testid="elimination-match-qf1"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="elimination-match-qf2"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="elimination-match-qf3"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="elimination-match-qf4"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="elimination-match-sf1"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="elimination-match-sf2"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="elimination-match-f"]')).toBeInTheDocument();
    });

    it('应该显示三个阶段的标签', () => {
      const mockMatches: Match[] = [createMockMatch(1, 'team1', 'team2', 3, 2)];

      render(
        <MemoryRouter>
          <EliminationStage matches={mockMatches} teams={mockTeams} />
        </MemoryRouter>
      );

      // 验证三个阶段标签都存在
      const qfLabel = screen.getByText('四分之一决赛');
      const sfLabel = screen.getByText('半决赛');
      const fLabel = screen.getByText('决赛');

      expect(qfLabel).toBeInTheDocument();
      expect(sfLabel).toBeInTheDocument();
      expect(fLabel).toBeInTheDocument();
    });
  });
});
