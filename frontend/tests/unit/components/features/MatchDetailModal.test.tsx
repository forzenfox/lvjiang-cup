import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MatchDetailModal from '@/components/features/MatchDetailModal';
import type { Match, Team } from '@/types';

const mockTeams: Team[] = [
  {
    id: 'team1',
    name: '驴酱',
    logo: '/logo1.png',
    battleCry: '冲啊',
    players: [
      { id: 'p1', nickname: '小明', position: 'top', avatarUrl: '/avatar1.png' },
      { id: 'p2', nickname: '小红', position: 'jungle', avatarUrl: '/avatar2.png' },
      { id: 'p3', nickname: '小刚', position: 'mid' },
      { id: 'p4', nickname: '小丽', position: 'adc', avatarUrl: '/avatar4.png' },
      { id: 'p5', nickname: '小华', position: 'support' },
    ],
  },
  {
    id: 'team2',
    name: '雨酱',
    logo: '/logo2.png',
    battleCry: '加油',
    players: [
      { id: 'p6', nickname: '阿强', position: 'top' },
      { id: 'p7', nickname: '阿伟', position: 'jungle', avatarUrl: '/avatar7.png' },
      { id: 'p8', nickname: '阿杰', position: 'mid', avatarUrl: '/avatar8.png' },
      { id: 'p9', nickname: '阿美', position: 'adc' },
      { id: 'p10', nickname: '阿丽', position: 'support', avatarUrl: '/avatar10.png' },
    ],
  },
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
  startTime: '2026-01-01T14:30:00',
  stage: 'swiss',
  boFormat: 'BO5',
  ...overrides,
});

describe('MatchDetailModal', () => {
  it('当visible为false时不应该渲染', () => {
    const match = createMockMatch();
    const { container } = render(
      <MatchDetailModal
        visible={false}
        onClose={vi.fn()}
        match={match}
        teams={mockTeams}
      />
    );

    // 弹框内容不应该在文档中
    expect(screen.queryByText('对战详情')).not.toBeInTheDocument();
  });

  it('当match为null时不应该渲染', () => {
    const { container } = render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={null}
        teams={mockTeams}
      />
    );

    // 弹框内容不应该在文档中
    expect(screen.queryByText('对战详情')).not.toBeInTheDocument();
  });

  it('应该显示弹框标题', () => {
    const match = createMockMatch();
    render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={match}
        teams={mockTeams}
      />
    );

    expect(screen.getByText('对战详情')).toBeInTheDocument();
  });

  it('应该显示对战时间', () => {
    const match = createMockMatch({ startTime: '2026-01-01T14:30:00' });
    render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={match}
        teams={mockTeams}
      />
    );

    expect(screen.getByText('2026年01月01日 14:30')).toBeInTheDocument();
  });

  it('当没有startTime时应该显示待定', () => {
    const match = createMockMatch({ startTime: '' });
    render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={match}
        teams={mockTeams}
      />
    );

    expect(screen.getByText('待定')).toBeInTheDocument();
  });

  it('应该显示对战状态', () => {
    const match = createMockMatch({ status: 'ongoing' });
    render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={match}
        teams={mockTeams}
      />
    );

    expect(screen.getByText('进行中')).toBeInTheDocument();
  });

  it('应该显示不同状态的比赛', () => {
    // 测试未开始状态
    const upcomingMatch = createMockMatch({ status: 'upcoming' });
    const { rerender } = render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={upcomingMatch}
        teams={mockTeams}
      />
    );
    expect(screen.getByText('未开始')).toBeInTheDocument();

    // 测试已结束状态
    const finishedMatch = createMockMatch({ status: 'finished' });
    rerender(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={finishedMatch}
        teams={mockTeams}
      />
    );
    expect(screen.getByText('已结束')).toBeInTheDocument();
  });

  it('应该显示双方队伍名称', () => {
    const match = createMockMatch();
    render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={match}
        teams={mockTeams}
      />
    );

    expect(screen.getByText('驴酱')).toBeInTheDocument();
    expect(screen.getByText('雨酱')).toBeInTheDocument();
  });

  it('应该显示比分', () => {
    const match = createMockMatch({ scoreA: 3, scoreB: 2 });
    render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={match}
        teams={mockTeams}
      />
    );

    // 比分应该在弹框中显示
    const scores = screen.getAllByText('3');
    expect(scores.length).toBeGreaterThan(0);
    const scores2 = screen.getAllByText('2');
    expect(scores2.length).toBeGreaterThan(0);
  });

  it('应该显示胜者标签', () => {
    const match = createMockMatch({ winnerId: 'team1', status: 'finished' });
    render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={match}
        teams={mockTeams}
      />
    );

    // 应该显示"胜者"标签
    const winnerLabels = screen.getAllByText('胜者');
    expect(winnerLabels.length).toBeGreaterThan(0);
  });

  it('应该显示队员对阵信息', () => {
    const match = createMockMatch();
    render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={match}
        teams={mockTeams}
      />
    );

    // 验证队员对阵标题
    expect(screen.getByText('队员对阵')).toBeInTheDocument();

    // 验证VS标签存在
    const vsLabels = screen.getAllByText('VS');
    expect(vsLabels.length).toBeGreaterThan(0);
  });

  it('应该显示队员昵称', () => {
    const match = createMockMatch();
    render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={match}
        teams={mockTeams}
      />
    );

    // 验证队员昵称显示
    expect(screen.getByText('小明')).toBeInTheDocument();
    expect(screen.getByText('阿强')).toBeInTheDocument();
  });

  it('应该显示位置信息', () => {
    const match = createMockMatch();
    render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={match}
        teams={mockTeams}
      />
    );

    // 验证位置显示（使用 getAllByText 因为有多个相同位置）
    const topLabels = screen.getAllByText('上单');
    expect(topLabels.length).toBeGreaterThanOrEqual(2); // 双方都有上单

    const jungleLabels = screen.getAllByText('打野');
    expect(jungleLabels.length).toBeGreaterThanOrEqual(2);

    const midLabels = screen.getAllByText('中单');
    expect(midLabels.length).toBeGreaterThanOrEqual(2);

    const adcLabels = screen.getAllByText('ADC');
    expect(adcLabels.length).toBeGreaterThanOrEqual(2);

    const supportLabels = screen.getAllByText('辅助');
    expect(supportLabels.length).toBeGreaterThanOrEqual(2);
  });

  it('应该显示赛制信息', () => {
    const match = createMockMatch({ boFormat: 'BO5' });
    render(
      <MatchDetailModal
        visible={true}
        onClose={vi.fn()}
        match={match}
        teams={mockTeams}
      />
    );

    expect(screen.getByText('BO5')).toBeInTheDocument();
  });

  it('点击关闭按钮应该调用onClose', () => {
    const match = createMockMatch();
    const handleClose = vi.fn();
    render(
      <MatchDetailModal
        visible={true}
        onClose={handleClose}
        match={match}
        teams={mockTeams}
      />
    );

    // 点击关闭按钮（X按钮）
    const closeButton = screen.getByLabelText('关闭');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('点击遮罩层应该调用onClose', () => {
    const match = createMockMatch();
    const handleClose = vi.fn();
    const { container } = render(
      <MatchDetailModal
        visible={true}
        onClose={handleClose}
        match={match}
        teams={mockTeams}
      />
    );

    // 点击遮罩层（黑色背景）
    const overlay = container.querySelector('.bg-black\\/80');
    if (overlay) {
      fireEvent.click(overlay);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });
});
