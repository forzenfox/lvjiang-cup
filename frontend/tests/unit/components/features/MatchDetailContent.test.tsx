import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MatchDetailContent from '@/components/features/MatchDetailContent';
import type { Match, Team } from '@/types';

let mockIsMobile = false;

vi.mock('@/hooks/useMediaQuery', () => ({
  useIsMobile: () => mockIsMobile,
}));

vi.mock('@/api/matchData', () => ({
  checkMatchDataExists: vi.fn(),
}));

import { checkMatchDataExists } from '@/api/matchData';
const mockCheckMatchDataExists = checkMatchDataExists as ReturnType<typeof vi.fn>;

const mockTeams: Team[] = [
  {
    id: 'team1',
    name: '驴酱',
    logo: '/logo1.png',
    battleCry: '冲啊',
    players: [
      { id: 'p1', nickname: '小明', position: 'TOP', avatarUrl: '/avatar1.png' },
      { id: 'p2', nickname: '小红', position: 'JUNGLE', avatarUrl: '/avatar2.png' },
      { id: 'p3', nickname: '小刚', position: 'MID' },
      { id: 'p4', nickname: '小丽', position: 'ADC', avatarUrl: '/avatar4.png' },
      { id: 'p5', nickname: '小华', position: 'SUPPORT' },
    ],
  },
  {
    id: 'team2',
    name: '雨酱',
    logo: '/logo2.png',
    battleCry: '加油',
    players: [
      { id: 'p6', nickname: '阿强', position: 'TOP' },
      { id: 'p7', nickname: '阿伟', position: 'JUNGLE', avatarUrl: '/avatar7.png' },
      { id: 'p8', nickname: '阿杰', position: 'MID', avatarUrl: '/avatar8.png' },
      { id: 'p9', nickname: '阿美', position: 'ADC' },
      { id: 'p10', nickname: '阿丽', position: 'SUPPORT', avatarUrl: '/avatar10.png' },
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

describe('MatchDetailContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMobile = false;
  });

  it('应显示对战时间', () => {
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: false, gameCount: 0 });
    const match = createMockMatch({ startTime: '2026-01-01T14:30:00' });
    render(<MatchDetailContent match={match} teams={mockTeams} />);

    expect(screen.getByText('2026年01月01日 14:30')).toBeInTheDocument();
  });

  it('无 startTime 时应显示"待定"', () => {
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: false, gameCount: 0 });
    const match = createMockMatch({ startTime: '' });
    render(<MatchDetailContent match={match} teams={mockTeams} />);

    expect(screen.getByText('待定')).toBeInTheDocument();
  });

  it('应显示对战状态（未开始/进行中/已结束）', () => {
    mockCheckMatchDataExists.mockResolvedValue({ hasData: false, gameCount: 0 });

    const { rerender } = render(
      <MatchDetailContent match={createMockMatch({ status: 'upcoming' })} teams={mockTeams} />
    );
    expect(screen.getByText('未开始')).toBeInTheDocument();

    rerender(
      <MatchDetailContent match={createMockMatch({ status: 'ongoing' })} teams={mockTeams} />
    );
    expect(screen.getByText('进行中')).toBeInTheDocument();

    rerender(
      <MatchDetailContent match={createMockMatch({ status: 'finished' })} teams={mockTeams} />
    );
    expect(screen.getByText('已结束')).toBeInTheDocument();
  });

  it('应显示双方队伍名称', () => {
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: false, gameCount: 0 });
    const match = createMockMatch();
    render(<MatchDetailContent match={match} teams={mockTeams} />);

    expect(screen.getByText('驴酱')).toBeInTheDocument();
    expect(screen.getByText('雨酱')).toBeInTheDocument();
  });

  it('应显示比分', () => {
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: false, gameCount: 0 });
    const match = createMockMatch({ scoreA: 3, scoreB: 2 });
    render(<MatchDetailContent match={match} teams={mockTeams} />);

    const scores3 = screen.getAllByText('3');
    expect(scores3.length).toBeGreaterThan(0);
    const scores2 = screen.getAllByText('2');
    expect(scores2.length).toBeGreaterThan(0);
  });

  it('已结束比赛胜者队名应为金色，败者队名应为灰色', () => {
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: false, gameCount: 0 });
    const match = createMockMatch({ winnerId: 'team1', status: 'finished' });
    const { container } = render(<MatchDetailContent match={match} teams={mockTeams} />);

    // 胜者队名（team1 - 驴酱）应为金色 rgb(200, 170, 110)
    const winnerName = screen.getByText('驴酱');
    expect(winnerName).toHaveStyle({ color: 'rgb(200, 170, 110)' });

    // 败者队名（team2 - 雨酱）应为灰色
    const loserName = screen.getByText('雨酱');
    expect(loserName).toHaveStyle({ color: 'rgb(150, 150, 150)' });

    // 不应再显示"胜者"文本标签
    expect(screen.queryByText('胜者')).not.toBeInTheDocument();
  });

  it('应显示队员对阵信息', () => {
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: false, gameCount: 0 });
    const match = createMockMatch();
    render(<MatchDetailContent match={match} teams={mockTeams} />);

    expect(screen.getByText('队员对阵')).toBeInTheDocument();

    const positionIcons = document.querySelectorAll('div[style*="background-image"]');
    expect(positionIcons.length).toBeGreaterThanOrEqual(5);
  });

  it('应显示队员昵称', () => {
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: false, gameCount: 0 });
    const match = createMockMatch();
    render(<MatchDetailContent match={match} teams={mockTeams} />);

    expect(screen.getByText('小明')).toBeInTheDocument();
    expect(screen.getByText('阿强')).toBeInTheDocument();
  });

  it('队员昵称为空时应显示"待定"', () => {
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: false, gameCount: 0 });
    const teamsWithEmptyNickname: Team[] = [
      {
        id: 'team1',
        name: '驴酱',
        logo: '/logo1.png',
        battleCry: '冲啊',
        players: [
          { id: 'p1', nickname: '', position: 'TOP', avatarUrl: '/avatar1.png' },
          { id: 'p2', nickname: '小红', position: 'JUNGLE', avatarUrl: '/avatar2.png' },
        ],
      },
      {
        id: 'team2',
        name: '雨酱',
        logo: '/logo2.png',
        battleCry: '加油',
        players: [
          { id: 'p6', nickname: '阿强', position: 'TOP' },
          { id: 'p7', nickname: '', position: 'JUNGLE', avatarUrl: '/avatar7.png' },
        ],
      },
    ];

    const match = createMockMatch();
    render(<MatchDetailContent match={match} teams={teamsWithEmptyNickname} />);

    const pendingLabels = screen.getAllByText('待定');
    expect(pendingLabels.length).toBeGreaterThanOrEqual(2);
  });

  it('应显示赛制信息', () => {
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: false, gameCount: 0 });
    const match = createMockMatch({ boFormat: 'BO5' });
    render(<MatchDetailContent match={match} teams={mockTeams} />);

    expect(screen.getByText('BO5')).toBeInTheDocument();
  });

  it('已上传数据时应显示"对战数据"按钮', async () => {
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: true, gameCount: 3 });

    const match = createMockMatch({ status: 'finished' });
    render(<MatchDetailContent match={match} teams={mockTeams} />);

    await waitFor(() => {
      expect(screen.getByText('对战数据')).toBeInTheDocument();
    });
  });

  it('无队员信息时应显示"暂无队员信息"', () => {
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: false, gameCount: 0 });
    const teamsWithoutPlayers: Team[] = [
      { id: 'team1', name: '驴酱', logo: '/logo1.png', battleCry: '冲啊', players: [] },
      { id: 'team2', name: '雨酱', logo: '/logo2.png', battleCry: '加油', players: [] },
    ];

    const match = createMockMatch();
    render(<MatchDetailContent match={match} teams={teamsWithoutPlayers} />);

    expect(screen.getByText('暂无队员信息')).toBeInTheDocument();
  });

  it('PC端点击对战数据按钮应打开新页面', async () => {
    mockIsMobile = false;
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: true, gameCount: 1 });

    const match = createMockMatch({ id: 'match123', status: 'finished' });
    render(<MatchDetailContent match={match} teams={mockTeams} />);

    await waitFor(() => {
      const button = screen.getByText('对战数据');
      fireEvent.click(button);
    });

    expect(openSpy).toHaveBeenCalledWith('/match/match123/games', '_blank');
    openSpy.mockRestore();
  });

  it('移动端应始终显示PC端查看提示', () => {
    mockIsMobile = true;
    render(<MatchDetailContent match={createMockMatch()} teams={mockTeams} />);

    expect(screen.getByText('完整对战数据请前往 PC 端查看')).toBeInTheDocument();
  });

  it('移动端应隐藏对战数据按钮', async () => {
    mockIsMobile = true;
    mockCheckMatchDataExists.mockResolvedValueOnce({ hasData: true, gameCount: 1 });

    const match = createMockMatch({ status: 'finished' });
    render(<MatchDetailContent match={match} teams={mockTeams} />);

    await waitFor(() => {
      expect(screen.queryByText('对战数据')).not.toBeInTheDocument();
    });
  });
});
