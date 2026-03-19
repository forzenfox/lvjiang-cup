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
  winners2_0: [] as string[],
  winners2_1: [] as string[],
  losersBracket: [] as string[],
  eliminated3rd: [] as string[],
  eliminated0_3: [] as string[],
};

describe('AdvancementEditor 拖拽交互', () => {
  it('应显示晋级分类卡片', () => {
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

    // 验证所有分类标签都显示
    expect(screen.getByText('2-0 晋级（胜者组）')).toBeInTheDocument();
    expect(screen.getByText('2-1 晋级（胜者组）')).toBeInTheDocument();
    expect(screen.getByText('晋级败者组')).toBeInTheDocument();
    expect(screen.getByText('积分第三淘汰')).toBeInTheDocument();
    expect(screen.getByText('0-3 淘汰')).toBeInTheDocument();
  });

  it('未分配队伍区域应显示未分配的队伍', () => {
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

    // 验证未分配区域显示所有队伍
    expect(screen.getByText('未分配 (3)')).toBeInTheDocument();
    expect(screen.getByText('驴酱')).toBeInTheDocument();
    expect(screen.getByText('IC')).toBeInTheDocument();
    expect(screen.getByText('小熊')).toBeInTheDocument();
  });

  it('已分配的队伍不应出现在未分配区域', () => {
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

    // 验证未分配区域只显示剩余队伍
    expect(screen.getByText('未分配 (2)')).toBeInTheDocument();
    // team1 不在未分配区域，而是在 2-0 晋级区域
    const winners2_0Section = screen.getByText('2-0 晋级（胜者组）').closest('.bg-gray-900\\/50');
    expect(winners2_0Section?.textContent).toContain('驴酱');
  });

  it('点击移除按钮应从分类中移除队伍', () => {
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

    // 找到 2-0 晋级区域中的移除按钮
    const winners2_0Section = screen.getByText('2-0 晋级（胜者组）').closest('.bg-gray-900\\/50');
    const removeButton = winners2_0Section?.querySelector('button[title="移除"]');

    expect(removeButton).toBeInTheDocument();

    if (removeButton) {
      fireEvent.click(removeButton);
      // 验证移除后队伍回到未分配区域
      expect(screen.getByText('未分配 (3)')).toBeInTheDocument();
    }
  });

  it('保存按钮在未更改时应禁用', () => {
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

    // 找到保存按钮
    const saveButton = screen.getByText('保存更改').closest('button');
    expect(saveButton).toBeDisabled();
  });

  it('重置按钮应恢复原始状态', () => {
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

    // 点击移除按钮
    const winners2_0Section = screen.getByText('2-0 晋级（胜者组）').closest('.bg-gray-900\\/50');
    const removeButton = winners2_0Section?.querySelector('button[title="移除"]');

    if (removeButton) {
      fireEvent.click(removeButton);

      // 点击重置按钮
      const resetButton = screen.getByText('重置').closest('button');
      if (resetButton) {
        fireEvent.click(resetButton);

        // 验证状态恢复
        expect(screen.getByText('未分配 (2)')).toBeInTheDocument();
      }
    }
  });
});
