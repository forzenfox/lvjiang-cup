import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EliminationStage from '@/components/features/EliminationStage';
import type { Match, Team } from '@/types';

const mockTeams: Team[] = [
  { id: 'team1', name: '驴酱', logo: '/logo1.png', players: [], description: '测试队伍1' },
  { id: 'team2', name: '雨酱', logo: '/logo2.png', players: [], description: '测试队伍2' },
  { id: 'team3', name: 'IC', logo: '/logo3.png', players: [], description: '测试队伍3' },
  { id: 'team4', name: '小熊', logo: '/logo4.png', players: [], description: '测试队伍4' },
  { id: 'team5', name: 'PLG', logo: '/logo5.png', players: [], description: '测试队伍5' },
  { id: 'team6', name: '69', logo: '/logo6.png', players: [], description: '测试队伍6' },
];

const createMockMatch = (gameNum: number, teamAId: string, teamBId: string, scoreA: number, scoreB: number, status: Match['status'] = 'finished'): Match => ({
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
  it('应该渲染8个比赛槽位（G1-G8）', () => {
    const mockMatches: Match[] = [
      createMockMatch(1, 'team1', 'team2', 3, 2),
      createMockMatch(2, 'team3', 'team4', 2, 3),
      createMockMatch(3, 'team1', 'team4', 3, 1),
      createMockMatch(4, 'team5', 'team6', 1, 3),
      createMockMatch(5, 'team1', 'team4', 2, 3),
      createMockMatch(6, 'team4', 'team6', 3, 2),
      createMockMatch(7, 'team4', 'team6', 3, 1),
      createMockMatch(8, 'team4', 'team6', 3, 1),
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
    const mockMatches: Match[] = [
      createMockMatch(1, 'team1', 'team2', 3, 2),
    ];

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

    // 验证胜者队伍有正确的样式类
    const winnerElements = container.querySelectorAll('.text-yellow-400');
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
    const mockMatches: Match[] = [
      createMockMatch(1, 'team1', 'team2', 3, 2),
    ];

    const { container } = render(
      <MemoryRouter>
        <EliminationStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 验证存在水平滚动容器
    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();

    // 验证有固定宽度的画布
    const board = container.querySelector('[style*="width"]');
    expect(board).toBeInTheDocument();
  });

  it('应该正确处理未开始和进行中的比赛', () => {
    const mockMatches: Match[] = [
      { ...createMockMatch(1, 'team1', 'team2', 0, 0, 'upcoming'), scoreA: 0, scoreB: 0, winnerId: null },
      { ...createMockMatch(2, 'team3', 'team4', 1, 1, 'ongoing'), winnerId: null },
    ];

    render(
      <MemoryRouter>
        <EliminationStage matches={mockMatches} teams={mockTeams} />
      </MemoryRouter>
    );

    // 验证状态标签显示（使用 getAllByText 因为空槽位也会显示状态）
    expect(screen.getAllByText('未开始').length).toBeGreaterThan(0);
    expect(screen.getAllByText('进行中').length).toBeGreaterThan(0);
  });

  describe('editable 模式', () => {
    it('应该在 editable=true 时渲染可编辑卡片', () => {
      const mockMatches: Match[] = [
        createMockMatch(1, 'team1', 'team2', 3, 2),
      ];
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

      // 验证存在可编辑卡片的特征（编辑按钮）
      const editButtons = container.querySelectorAll('button');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('应该在 editable=false 时渲染只读卡片', () => {
      const mockMatches: Match[] = [
        createMockMatch(1, 'team1', 'team2', 3, 2),
      ];

      const { container } = render(
        <MemoryRouter>
          <EliminationStage matches={mockMatches} teams={mockTeams} editable={false} />
        </MemoryRouter>
      );

      // 验证只读模式下没有可点击的编辑区域（EditableBracketMatchCard有cursor-pointer类）
      const editableCards = container.querySelectorAll('.cursor-pointer');
      // BracketMatchCard 没有 cursor-pointer，EditableBracketMatchCard 有
      // 所以只读模式下应该没有 cursor-pointer 元素
      expect(editableCards.length).toBe(0);
    });

    it('应该在 editable=true 但无 onMatchUpdate 时渲染只读卡片', () => {
      const mockMatches: Match[] = [
        createMockMatch(1, 'team1', 'team2', 3, 2),
      ];

      const { container } = render(
        <MemoryRouter>
          <EliminationStage matches={mockMatches} teams={mockTeams} editable={true} />
        </MemoryRouter>
      );

      // 验证没有 onMatchUpdate 时渲染只读卡片（没有cursor-pointer）
      const editableCards = container.querySelectorAll('.cursor-pointer');
      expect(editableCards.length).toBe(0);
    });
  });
});
