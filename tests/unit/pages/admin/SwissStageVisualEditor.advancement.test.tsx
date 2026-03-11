import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SwissStageVisualEditor from '@/pages/admin/SwissStageVisualEditor';
import type { Team } from '@/types';

const mockTeams: Team[] = [
  { id: 'team1', name: '驴酱', logo: '/logo1.png', players: [], description: '测试队伍1' },
  { id: 'team2', name: 'IC', logo: '/logo2.png', players: [], description: '测试队伍2' },
  { id: 'team3', name: '小熊', logo: '/logo3.png', players: [], description: '测试队伍3' },
];

const mockAdvancement = {
  winners2_0: [],
  winners2_1: [],
  losersBracket: [],
  eliminated3rd: [],
  eliminated0_3: [],
};

describe('AdvancementEditor 下拉框交互', () => {
  it('点击分类标签应显示下拉框', () => {
    const onMatchUpdate = vi.fn();
    const onAdvancementUpdate = vi.fn();

    render(
      <SwissStageVisualEditor
        matches={[]}
        teams={mockTeams}
        advancement={mockAdvancement}
        onMatchUpdate={onMatchUpdate}
        onAdvancementUpdate={onAdvancementUpdate}
      />
    );

    // 点击 "2-0 晋级" 标签
    const badge2_0 = screen.getByText('2-0 晋级 (胜者组)');
    fireEvent.click(badge2_0);

    // 验证下拉框显示
    const dropdown = screen.getByRole('combobox');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toBeVisible();
  });

  it('点击其他地方（不选择队伍）后下拉框应关闭', () => {
    const onMatchUpdate = vi.fn();
    const onAdvancementUpdate = vi.fn();

    render(
      <SwissStageVisualEditor
        matches={[]}
        teams={mockTeams}
        advancement={mockAdvancement}
        onMatchUpdate={onMatchUpdate}
        onAdvancementUpdate={onAdvancementUpdate}
      />
    );

    // 点击 "2-0 晋级" 标签打开下拉框
    const badge2_0 = screen.getByText('2-0 晋级 (胜者组)');
    fireEvent.click(badge2_0);

    // 验证下拉框显示
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    // 触发 blur 事件（模拟点击其他地方）
    const dropdown = screen.getByRole('combobox');
    fireEvent.blur(dropdown);

    // 验证下拉框关闭
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('选择队伍后下拉框应关闭并添加队伍', () => {
    const onMatchUpdate = vi.fn();
    const onAdvancementUpdate = vi.fn();

    render(
      <SwissStageVisualEditor
        matches={[]}
        teams={mockTeams}
        advancement={mockAdvancement}
        onMatchUpdate={onMatchUpdate}
        onAdvancementUpdate={onAdvancementUpdate}
      />
    );

    // 点击 "2-0 晋级" 标签打开下拉框
    const badge2_0 = screen.getByText('2-0 晋级 (胜者组)');
    fireEvent.click(badge2_0);

    // 选择一个队伍
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'team1' } });

    // 触发 blur 事件
    fireEvent.blur(dropdown);

    // 验证 onAdvancementUpdate 被调用，且包含 team1
    expect(onAdvancementUpdate).toHaveBeenCalledWith({
      ...mockAdvancement,
      winners2_0: ['team1'],
    });

    // 验证下拉框关闭
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('重复添加同一队伍不应重复', () => {
    const onMatchUpdate = vi.fn();
    const onAdvancementUpdate = vi.fn();

    const advancementWithTeam = {
      ...mockAdvancement,
      winners2_0: ['team1'],
    };

    render(
      <SwissStageVisualEditor
        matches={[]}
        teams={mockTeams}
        advancement={advancementWithTeam}
        onMatchUpdate={onMatchUpdate}
        onAdvancementUpdate={onAdvancementUpdate}
      />
    );

    // 点击 "2-0 晋级" 标签打开下拉框
    const badge2_0 = screen.getByText('2-0 晋级 (胜者组)');
    fireEvent.click(badge2_0);

    // team1 应该不在可选列表中
    const dropdown = screen.getByRole('combobox');
    const options = Array.from(dropdown.querySelectorAll('option')).map(o => o.value);
    expect(options).not.toContain('team1');
  });
});
