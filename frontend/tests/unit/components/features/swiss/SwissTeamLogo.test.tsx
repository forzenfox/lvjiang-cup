import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SwissTeamLogo from '@/components/features/swiss/SwissTeamLogo';
import type { Team } from '@/types';

const mockTeam: Team = {
  id: 'team1',
  name: '测试队伍',
  logo: '/test-logo.png',
  players: [],
  battleCry: '测试描述',
};

describe('SwissTeamLogo', () => {
  it('应该正确渲染队伍Logo', () => {
    const { container } = render(<SwissTeamLogo team={mockTeam} />);

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-logo.png');
    expect(img).toHaveAttribute('alt', '测试队伍');
  });

  it('当没有Logo时应该渲染占位符', () => {
    const teamWithoutLogo = { ...mockTeam, logo: '' };
    const { container } = render(<SwissTeamLogo team={teamWithoutLogo} />);

    const placeholder = container.querySelector('div');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveClass('bg-gray-700');
  });

  it('当team为undefined时应该渲染占位符', () => {
    const { container } = render(<SwissTeamLogo />);

    const placeholder = container.querySelector('div');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveClass('bg-gray-700');
  });

  it('应该支持不同尺寸', () => {
    const { container: smContainer } = render(<SwissTeamLogo team={mockTeam} size="sm" />);
    const { container: mdContainer } = render(<SwissTeamLogo team={mockTeam} size="md" />);
    const { container: lgContainer } = render(<SwissTeamLogo team={mockTeam} size="lg" />);

    expect(smContainer.querySelector('img')).toHaveClass('w-4', 'h-4');
    expect(mdContainer.querySelector('img')).toHaveClass('w-5', 'h-5');
    expect(lgContainer.querySelector('img')).toHaveClass('w-6', 'h-6');
  });

  it('默认尺寸应该是md', () => {
    const { container } = render(<SwissTeamLogo team={mockTeam} />);

    const img = container.querySelector('img');
    expect(img).toHaveClass('w-5', 'h-5');
  });
});
