import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SwissMatchCardMobile from '@/components/features/swiss/SwissMatchCardMobile';
import type { Match, Team } from '@/types';

const mockTeams: Team[] = [
  { id: 'team1', name: '驴酱', logo: '/logo1.png', players: [], battleCry: '' },
  { id: 'team2', name: '雨酱', logo: '/logo2.png', players: [], battleCry: '' },
];

const createMockMatch = (overrides: Partial<Match> = {}): Match => ({
  id: 'match1',
  teamAId: 'team1',
  teamBId: 'team2',
  scoreA: 2,
  scoreB: 1,
  winnerId: 'team1',
  round: 'Round 1',
  status: 'finished',
  startTime: '2026-01-01T10:00:00',
  stage: 'swiss',
  boFormat: 'BO3',
  ...overrides,
});

describe('SwissMatchCardMobile', () => {
  const defaultProps = {
    match: createMockMatch(),
    teams: mockTeams,
  };

  it('应正确显示队伍信息（队名、队标）', () => {
    render(<SwissMatchCardMobile {...defaultProps} />);

    expect(screen.getByText('驴酱')).toBeInTheDocument();
    expect(screen.getByText('雨酱')).toBeInTheDocument();
  });

  it('当队伍不存在时应显示"待定"', () => {
    const match = createMockMatch({ teamAId: 'unknown', teamBId: 'unknown' });
    render(<SwissMatchCardMobile match={match} teams={mockTeams} />);

    const pendingTexts = screen.getAllByText('待定');
    expect(pendingTexts.length).toBe(2);
  });

  it('应正确显示比赛比分', () => {
    render(<SwissMatchCardMobile {...defaultProps} />);

    expect(screen.getByTestId('swiss-match-card-mobile-score-a')).toHaveTextContent('2');
    expect(screen.getByTestId('swiss-match-card-mobile-score-b')).toHaveTextContent('1');
  });

  it('当比分为 null 时应显示"--"', () => {
    const match = createMockMatch({
      scoreA: null as unknown as number,
      scoreB: null as unknown as number,
    });
    render(<SwissMatchCardMobile match={match} teams={mockTeams} />);

    expect(screen.getByTestId('swiss-match-card-mobile-score-a')).toHaveTextContent('--');
    expect(screen.getByTestId('swiss-match-card-mobile-score-b')).toHaveTextContent('--');
  });

  it('获胜方比分应高亮显示为品牌金色', () => {
    const match = createMockMatch({ winnerId: 'team1' });
    const { container } = render(<SwissMatchCardMobile match={match} teams={mockTeams} />);

    const scoreA = screen.getByTestId('swiss-match-card-mobile-score-a');
    expect(scoreA.classList.toString()).toContain('text-[#F59E0B]');

    const scoreB = screen.getByTestId('swiss-match-card-mobile-score-b');
    expect(scoreB.classList.toString()).not.toContain('text-[#F59E0B]');
    expect(scoreB.classList.toString()).toContain('text-white');
  });

  it('失败方比分应显示白色', () => {
    const match = createMockMatch({ winnerId: 'team2' });
    render(<SwissMatchCardMobile match={match} teams={mockTeams} />);

    const scoreA = screen.getByTestId('swiss-match-card-mobile-score-a');
    expect(scoreA.classList.toString()).toContain('text-white');
    expect(scoreA.classList.toString()).not.toContain('text-[#F59E0B]');
  });

  it('获胜方名称应显示白色', () => {
    const match = createMockMatch({ winnerId: 'team1' });
    render(<SwissMatchCardMobile match={match} teams={mockTeams} />);

    const teamAName = screen.getByTestId('swiss-match-card-mobile-team-a-name');
    expect(teamAName.classList.toString()).toContain('text-white');
  });

  it('失败方名称应显示 text-gray-400', () => {
    const match = createMockMatch({ winnerId: 'team1' });
    render(<SwissMatchCardMobile match={match} teams={mockTeams} />);

    const teamBName = screen.getByTestId('swiss-match-card-mobile-team-b-name');
    expect(teamBName.classList.toString()).toContain('text-gray-400');
  });

  it('比分字体大小应为 text-xl', () => {
    render(<SwissMatchCardMobile {...defaultProps} />);

    const scoreA = screen.getByTestId('swiss-match-card-mobile-score-a');
    expect(scoreA.classList.toString()).toContain('text-xl');
  });

  it('卡片内边距应为 p-3', () => {
    const { container } = render(<SwissMatchCardMobile {...defaultProps} />);

    const card = container.firstChild as HTMLElement;
    expect(card.classList.toString()).toContain('p-3');
  });

  it('队标大小应为 40px', () => {
    const { container } = render(<SwissMatchCardMobile {...defaultProps} />);

    const images = container.querySelectorAll('img');
    expect(images.length).toBe(2);
    images.forEach(img => {
      expect(img.style.width).toBe('40px');
      expect(img.style.height).toBe('40px');
    });
  });

  it('点击应触发 onClick', () => {
    const handleClick = vi.fn();
    render(<SwissMatchCardMobile {...defaultProps} onClick={handleClick} />);

    const card = screen.getByTestId('swiss-match-card-mobile');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('应支持自定义 data-testid', () => {
    render(<SwissMatchCardMobile {...defaultProps} data-testid="custom-card" />);

    expect(screen.getByTestId('custom-card')).toBeInTheDocument();
    expect(screen.getByTestId('custom-card-score-a')).toBeInTheDocument();
  });

  it('应支持自定义 className', () => {
    const { container } = render(
      <SwissMatchCardMobile {...defaultProps} className="custom-class" />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.classList.toString()).toContain('custom-class');
  });

  it('卡片应有 active 缩放反馈类名', () => {
    const { container } = render(<SwissMatchCardMobile {...defaultProps} />);

    const card = container.firstChild as HTMLElement;
    expect(card.classList.toString()).toContain('active:scale-[0.98]');
  });

  it('当比赛有 boFormat 时应显示赛制标识', () => {
    const match = createMockMatch({ boFormat: 'BO3' });
    render(<SwissMatchCardMobile match={match} teams={mockTeams} />);

    expect(screen.getByText('BO3')).toBeInTheDocument();
  });

  it('当比赛无 boFormat 时不显示赛制标识', () => {
    const match = createMockMatch({ boFormat: undefined });
    render(<SwissMatchCardMobile match={match} teams={mockTeams} />);

    expect(screen.queryByText('BO1')).not.toBeInTheDocument();
    expect(screen.queryByText('BO3')).not.toBeInTheDocument();
  });
});
