import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SwissStageMobile from '@/components/features/swiss/SwissStageMobile';
import type { Match, Team } from '@/types';

const mockTeams: Team[] = [
  { id: 'team1', name: '驴酱', logo: '/logo1.png', players: [], battleCry: '' },
  { id: 'team2', name: '雨酱', logo: '/logo2.png', players: [], battleCry: '' },
  { id: 'team3', name: '狗酱', logo: '/logo3.png', players: [], battleCry: '' },
  { id: 'team4', name: '猫酱', logo: '/logo4.png', players: [], battleCry: '' },
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
  swissRecord: '0-0',
  swissRound: 1,
  boFormat: 'BO1',
  ...overrides,
});

describe('SwissStageMobile', () => {
  const defaultProps = {
    matches: [createMockMatch()],
    teams: mockTeams,
  };

  it('应渲染 SwissRoundTabs 组件', () => {
    render(<SwissStageMobile {...defaultProps} />);

    expect(screen.getByTestId('swiss-round-tabs')).toBeInTheDocument();
  });

  it('默认应显示第一轮内容', () => {
    render(<SwissStageMobile {...defaultProps} />);

    expect(screen.getByTestId('swiss-stage-mobile-content')).toBeInTheDocument();
  });

  it('点击轮次标签应切换显示内容', () => {
    render(<SwissStageMobile {...defaultProps} />);

    const secondRoundTab = screen.getByText('第二轮');
    fireEvent.click(secondRoundTab);

    // 验证内容区域仍然渲染（第二轮可能没有比赛，但组件应该正常渲染）
    expect(screen.getByTestId('swiss-stage-mobile')).toBeInTheDocument();
  });

  it('第三轮应显示 2-0 和 0-2 分组标题', () => {
    const matches = [
      createMockMatch({ id: 'm1', swissRound: 3, swissRecord: '2-0' }),
      createMockMatch({ id: 'm2', swissRound: 3, swissRecord: '0-2' }),
    ];
    render(<SwissStageMobile matches={matches} teams={mockTeams} />);

    const thirdRoundTab = screen.getByText('第三轮');
    fireEvent.click(thirdRoundTab);

    expect(screen.getByText('第三轮 2-0')).toBeInTheDocument();
    expect(screen.getByText('第三轮 0-2')).toBeInTheDocument();
  });

  it('第四轮应显示 2-1 和 1-2 分组标题', () => {
    const matches = [
      createMockMatch({ id: 'm1', swissRound: 4, swissRecord: '2-1' }),
      createMockMatch({ id: 'm2', swissRound: 4, swissRecord: '1-2' }),
    ];
    render(<SwissStageMobile matches={matches} teams={mockTeams} />);

    const fourthRoundTab = screen.getByText('第四轮');
    fireEvent.click(fourthRoundTab);

    expect(screen.getByText('第四轮 2-1')).toBeInTheDocument();
    expect(screen.getByText('第四轮 1-2')).toBeInTheDocument();
  });

  it('第五轮应显示 2-2 分组标题', () => {
    const matches = [createMockMatch({ id: 'm1', swissRound: 5, swissRecord: '2-2' })];
    render(<SwissStageMobile matches={matches} teams={mockTeams} />);

    const fifthRoundTab = screen.getByText('第五轮');
    fireEvent.click(fifthRoundTab);

    expect(screen.getByText('第五轮 2-2')).toBeInTheDocument();
  });

  it('第六轮（最终结果）应渲染 SwissFinalResultMobile', () => {
    const advancement = {
      top8: ['team1', 'team2'],
      eliminated: ['team3', 'team4'],
    };
    render(<SwissStageMobile {...defaultProps} advancement={advancement} />);

    const finalResultTab = screen.getByText('最终结果');
    fireEvent.click(finalResultTab);

    expect(screen.getByTestId('swiss-stage-mobile-final-result')).toBeInTheDocument();
  });

  it('战绩分组标题应有左侧金色边框', () => {
    render(<SwissStageMobile {...defaultProps} />);

    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);

    headings.forEach(heading => {
      expect(heading.classList.toString()).toContain('border-l-2');
      expect(heading.classList.toString()).toContain('border-[#F59E0B]');
    });
  });

  it('应支持自定义 data-testid', () => {
    render(<SwissStageMobile {...defaultProps} data-testid="custom-stage" />);

    expect(screen.getByTestId('custom-stage')).toBeInTheDocument();
  });

  it('应支持自定义 className', () => {
    const { container } = render(<SwissStageMobile {...defaultProps} className="custom-class" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.toString()).toContain('custom-class');
  });

  it('点击比赛卡片应触发 onMatchClick', () => {
    const handleMatchClick = vi.fn();
    render(<SwissStageMobile {...defaultProps} onMatchClick={handleMatchClick} />);

    const matchCard = screen.getByTestId('swiss-stage-mobile-match-0');
    fireEvent.click(matchCard);

    expect(handleMatchClick).toHaveBeenCalledTimes(1);
  });

  it('应正确按轮次分组显示比赛', () => {
    const matches = [
      createMockMatch({ id: 'm1', swissRound: 1, swissRecord: '0-0' }),
      createMockMatch({ id: 'm2', swissRound: 1, swissRecord: '0-0' }),
    ];
    render(<SwissStageMobile matches={matches} teams={mockTeams} />);

    // 使用精确匹配，避免匹配到最终结果页面的 row 元素
    const matchCards = screen.getAllByTestId(/^swiss-stage-mobile-match-\d+$/);
    expect(matchCards.length).toBe(2);
  });
});
