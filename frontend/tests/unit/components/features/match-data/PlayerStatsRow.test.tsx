import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlayerStatsRow from '@/components/features/match-data/PlayerStatsRow';
import type { PlayerStat } from '@/types/matchData';

const createMockPlayerStat = (
  overrides: Partial<PlayerStat> & { playerName: string }
): PlayerStat => ({
  id: 1,
  playerId: 'p1',
  playerName: 'Bin',
  teamId: 'team1',
  teamName: 'BLG',
  position: 'TOP',
  championName: '格温',
  kills: 8,
  deaths: 2,
  assists: 12,
  kda: '8/2/12',
  cs: 349,
  gold: 18500,
  damageDealt: 45000,
  damageTaken: 28000,
  visionScore: 25,
  wardsPlaced: 15,
  level: 18,
  firstBlood: false,
  mvp: true,
  ...overrides,
});

describe('PlayerStatsRow', () => {
  describe('左侧红色方选手信息显示', () => {
    it('应该正确显示选手名称', () => {
      const bluePlayer = createMockPlayerStat({
        playerName: 'Bin',
        teamName: 'BLG',
        position: 'TOP',
      });
      const redPlayer = createMockPlayerStat({
        playerName: 'Zika',
        teamName: 'WBG',
        position: 'TOP',
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

      const binElements = container.querySelectorAll('.text-white');
      const binText = Array.from(binElements).find(el => el.textContent === 'Bin');
      expect(binText).toBeInTheDocument();
    });

    it('应该正确显示英雄名称（作为头像占位符）', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin', championName: '格温' });
      const redPlayer = createMockPlayerStat({
        playerName: 'Zika',
        championName: '赛恩',
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

      const championElements = container.querySelectorAll('.bg-\\[\\#1a1a2e\\]');
      expect(championElements.length).toBe(2);
    });

    it('应该正确显示CS（格式CS: xxx）', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin', cs: 349 });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', cs: 267, mvp: false });
      render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      expect(screen.getByText('CS: 349')).toBeInTheDocument();
    });

    it('应该显示经济数据', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin', gold: 18500 });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', gold: 15200, mvp: false });
      render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      expect(screen.getByText('18.5k')).toBeInTheDocument();
    });
  });

  describe('右侧蓝色方选手信息显示', () => {
    it('应该正确显示选手名称', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin', teamName: 'BLG' });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', teamName: 'WBG', mvp: false });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      const zikaElements = container.querySelectorAll('.text-white');
      const zikaText = Array.from(zikaElements).find(el => el.textContent === 'Zika');
      expect(zikaText).toBeInTheDocument();
    });
  });

  describe('中间VS标记显示', () => {
    it('应该显示VS标记', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin' });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', mvp: false });
      render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      expect(screen.getByText('VS')).toBeInTheDocument();
    });
  });

  describe('MVP和一血标记', () => {
    it('MVP选手应该显示MVP标记', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin', mvp: true });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', mvp: false });
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

    it('非MVP选手不应显示MVP标记', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin', mvp: false });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', mvp: false });
      render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={vi.fn()}
        />
      );

      expect(screen.queryByText('MVP')).not.toBeInTheDocument();
    });

    it('一血选手应该显示一血标记', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin', firstBlood: true });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', firstBlood: false, mvp: false });
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

  describe('点击交互', () => {
    it('点击行应该触发onToggle回调', () => {
      const handleToggle = vi.fn();
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin' });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', mvp: false });
      const { container } = render(
        <PlayerStatsRow
          bluePlayer={bluePlayer}
          redPlayer={redPlayer}
          isExpanded={false}
          onToggle={handleToggle}
        />
      );

      const row = container.querySelector('.cursor-pointer');
      if (row) fireEvent.click(row);
      expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it('展开状态应该显示ChevronDown图标旋转', () => {
      const bluePlayer = createMockPlayerStat({ playerName: 'Bin' });
      const redPlayer = createMockPlayerStat({ playerName: 'Zika', mvp: false });
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

      const blueBorder = container.querySelector('[class*="border-\\[\\#00bcd4\\]"]');
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

      const redBorder = container.querySelector('[class*="border-\\[\\#f44336\\]"]');
      expect(redBorder).toBeInTheDocument();
    });
  });
});
