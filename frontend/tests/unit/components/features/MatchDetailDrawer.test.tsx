import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MatchDetailDrawer from '@/components/features/MatchDetailDrawer';
import type { Match, Team } from '@/types';

vi.mock('@/api/matchData', () => ({
  checkMatchDataExists: vi.fn(),
}));

import { checkMatchDataExists } from '@/api/matchData';
const mockCheckMatchDataExists = checkMatchDataExists as ReturnType<typeof vi.fn>;

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      style,
      onClick,
      role,
      ...rest
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} style={style} onClick={onClick} role={role} {...rest}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockTeams: Team[] = [
  {
    id: 'team1',
    name: '驴酱',
    logo: '/logo1.png',
    battleCry: '冲啊',
    players: [{ id: 'p1', nickname: '小明', position: 'TOP', avatarUrl: '/avatar1.png' }],
  },
  {
    id: 'team2',
    name: '雨酱',
    logo: '/logo2.png',
    battleCry: '加油',
    players: [{ id: 'p6', nickname: '阿强', position: 'TOP' }],
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

describe('MatchDetailDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckMatchDataExists.mockResolvedValue({ hasData: false, gameCount: 0 });
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('match 为 null 时不渲染', () => {
    const { container } = render(
      <MatchDetailDrawer match={null} teams={mockTeams} onClose={vi.fn()} />
    );

    expect(container.innerHTML).toBe('');
  });

  it('应渲染抽屉标题"对战详情"', () => {
    const match = createMockMatch();
    render(<MatchDetailDrawer match={match} teams={mockTeams} onClose={vi.fn()} />);

    expect(screen.getByText('对战详情')).toBeInTheDocument();
  });

  it('应渲染遮罩层', () => {
    const match = createMockMatch();
    render(<MatchDetailDrawer match={match} teams={mockTeams} onClose={vi.fn()} />);

    expect(screen.getByTestId('drawer-overlay')).toBeInTheDocument();
  });

  it('点击遮罩层应调用 onClose', () => {
    const handleClose = vi.fn();
    const match = createMockMatch();
    render(<MatchDetailDrawer match={match} teams={mockTeams} onClose={handleClose} />);

    const overlay = screen.getByTestId('drawer-overlay');
    fireEvent.click(overlay);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('点击关闭按钮应调用 onClose', () => {
    const handleClose = vi.fn();
    const match = createMockMatch();
    render(<MatchDetailDrawer match={match} teams={mockTeams} onClose={handleClose} />);

    const closeButton = screen.getByTestId('close-drawer-button');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('应渲染 MatchDetailContent 内容', () => {
    const match = createMockMatch();
    render(<MatchDetailDrawer match={match} teams={mockTeams} onClose={vi.fn()} />);

    expect(screen.getByText('队员对阵')).toBeInTheDocument();
    expect(screen.getByText('驴酱')).toBeInTheDocument();
    expect(screen.getByText('雨酱')).toBeInTheDocument();
  });

  it('抽屉内容区域应支持滚动', () => {
    const match = createMockMatch();
    const { container } = render(
      <MatchDetailDrawer match={match} teams={mockTeams} onClose={vi.fn()} />
    );

    const scrollableArea = container.querySelector('.flex-1.overflow-y-auto');
    expect(scrollableArea).toBeInTheDocument();
  });

  it('应添加 role="dialog" 和 aria-modal="true"', () => {
    const match = createMockMatch();
    render(<MatchDetailDrawer match={match} teams={mockTeams} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('应添加 body 滚动锁定', () => {
    const match = createMockMatch();
    render(<MatchDetailDrawer match={match} teams={mockTeams} onClose={vi.fn()} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('关闭后应恢复 body 滚动', () => {
    const match = createMockMatch();
    const { unmount } = render(
      <MatchDetailDrawer match={match} teams={mockTeams} onClose={vi.fn()} />
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
