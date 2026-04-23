import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlayerStatsRow from '@/components/features/match-data/PlayerStatsRow';
import type { PlayerStat, PositionType } from '@/types/matchData';

const createMockPlayerStat = (overrides: Partial<PlayerStat> = {}): PlayerStat => ({
  playerName: 'Bin',
  championName: '格温',
  position: 'TOP' as PositionType,
  kda: '8/2/12',
  cs: 349,
  gold: 18500,
  mvp: true,
  firstBlood: true,
  damageDealt: 45000,
  damageTaken: 28000,
  ...overrides,
});

describe('PlayerStatsRow', () => {
  describe('基本渲染', () => {
    it('应该正确渲染选手信息', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin' });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', mvp: false });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      // 使用 container 查询避免多个匹配（移动端和桌面端都有）
      const elements = container.querySelectorAll('*');
      const hasBin = Array.from(elements).some(el => el.textContent === 'Bin');
      const hasZika = Array.from(elements).some(el => el.textContent === 'Zika');
      expect(hasBin).toBe(true);
      expect(hasZika).toBe(true);
    });

    it('应该显示选手的 KDA', () => {
      const bluePlayer = createMockPlayerStat({ kda: '8/2/12' });
      const redPlayer = createMockPlayerStat({ kda: '3/5/8', mvp: false });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      // 使用 container 查询避免多个匹配
      const elements = container.querySelectorAll('*');
      const hasKDA1 = Array.from(elements).some(el => el.textContent === '8/2/12');
      const hasKDA2 = Array.from(elements).some(el => el.textContent === '3/5/8');
      expect(hasKDA1).toBe(true);
      expect(hasKDA2).toBe(true);
    });

    it('应该显示选手的补刀数', () => {
      const bluePlayer = createMockPlayerStat({ cs: 349 });
      const redPlayer = createMockPlayerStat({ cs: 267, mvp: false });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      // 检查包含CS的元素
      const elements = container.querySelectorAll('*');
      const hasCS = Array.from(elements).some(el => el.textContent?.includes('CS:'));
      expect(hasCS).toBe(true);
    });

    it('应该正确格式化金币显示', () => {
      const bluePlayer = createMockPlayerStat({ gold: 18500 });
      const redPlayer = createMockPlayerStat({ gold: 15200, mvp: false });
      render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      expect(screen.getByText('18.5k')).toBeInTheDocument();
      expect(screen.getByText('15.2k')).toBeInTheDocument();
    });
  });

  describe('交互行为', () => {
    it('点击行时应该触发 onToggle', () => {
      const onToggle = vi.fn();
      const bluePlayer = createMockPlayerStat();
      const redPlayer = createMockPlayerStat({ mvp: false });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={onToggle}
        />
      );

      const row = container.firstChild as HTMLElement;
      fireEvent.click(row);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('展开状态时应该显示展开图标', () => {
      const bluePlayer = createMockPlayerStat();
      const redPlayer = createMockPlayerStat({ mvp: false });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={true}
          onToggle={vi.fn()}
        />
      );

      const chevron = container.querySelector('.rotate-180');
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('MVP 和首杀标识', () => {
    it('应该显示 MVP 标识', () => {
      const bluePlayer = createMockPlayerStat({ mvp: true });
      const redPlayer = createMockPlayerStat({ mvp: false });
      render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      expect(screen.getByText('MVP')).toBeInTheDocument();
    });

    it('应该显示一血标识', () => {
      const bluePlayer = createMockPlayerStat({ firstBlood: true });
      const redPlayer = createMockPlayerStat({ firstBlood: false, mvp: false });
      render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      expect(screen.getByText('一血')).toBeInTheDocument();
    });
  });

  describe('红蓝方边框颜色', () => {
    it('蓝色方应该有蓝色边框', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin' });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', mvp: false });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      const blueBorder = container.querySelector('[class*="border-[\#00bcd4\]"]');
      expect(blueBorder).toBeInTheDocument();
    });

    it('红色方应该有红色边框', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin' });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', mvp: false });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      const redBorder = container.querySelector('[class*="border-[\#f44336\]"]');
      expect(redBorder).toBeInTheDocument();
    });
  });

  describe('伤害和承伤数据显示', () => {
    it('应该显示伤害数据', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin', damageDealt: 45000 });
      const redPlayer = createMockPlayerStat({
        playerName: 'Zika',
        damageDealt: 38000,
        mvp: false,
      });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      // 检查包含伤害数值的元素
      const elements = container.querySelectorAll('*');
      const hasDamage = Array.from(elements).some(el => el.textContent?.includes('45.0k'));
      expect(hasDamage).toBe(true);
    });

    it('应该显示承伤数据', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin', damageTaken: 28000 });
      const redPlayer = createMockPlayerStat({
        playerName: 'Zika',
        damageTaken: 35000,
        mvp: false,
      });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      // 检查包含承伤数值的元素
      const elements = container.querySelectorAll('*');
      const hasDamageTaken = Array.from(elements).some(el => el.textContent?.includes('28.0k'));
      expect(hasDamageTaken).toBe(true);
    });

    it('应该正确格式化大数字（千位）', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin', damageDealt: 45000 });
      const redPlayer = createMockPlayerStat({
        playerName: 'Zika',
        damageDealt: 38000,
        mvp: false,
      });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      // 检查包含45.0k的元素
      const elements = container.querySelectorAll('*');
      const has45k = Array.from(elements).some(el => el.textContent?.includes('45.0k'));
      expect(has45k).toBe(true);
    });

    it('应该正确显示小数字（不格式化）', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin', damageDealt: 850 });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', damageDealt: 920, mvp: false });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      // 检查包含850的元素
      const elements = container.querySelectorAll('*');
      const has850 = Array.from(elements).some(el => el.textContent?.includes('850'));
      expect(has850).toBe(true);
    });

    it('应该处理伤害数据为0的情况', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin', damageDealt: 0 });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', damageDealt: 0, mvp: false });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      // 检查包含0的元素（伤害数值）
      const elements = container.querySelectorAll('*');
      const hasZero = Array.from(elements).some(el => el.textContent === '0');
      expect(hasZero).toBe(true);
    });
  });
});
