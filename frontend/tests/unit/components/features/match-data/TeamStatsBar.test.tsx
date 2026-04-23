import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TeamStatsBar from '@/components/features/match-data/TeamStatsBar';
import type { TeamGameData } from '@/types/matchData';

const createMockTeamData = (
  overrides: Partial<TeamGameData> & { teamName: string }
): TeamGameData => ({
  teamId: 'team1',
  teamName: 'BLG',
  side: 'blue',
  kills: 25,
  gold: 65000,
  towers: 9,
  dragons: 3,
  barons: 1,
  isWinner: true,
  ...overrides,
});

describe('TeamStatsBar', () => {
  describe('击杀对比显示', () => {
    it('应该正确显示击杀对比', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', kills: 25 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', kills: 18 });
      render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('击杀比分应该使用大字号', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', kills: 25 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', kills: 18 });
      const { container } = render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      const killText = screen.getByText('25');
      expect(killText.closest('.text-4xl')).toBeInTheDocument();
    });

    it('应该显示 Swords 图标表示击杀', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', kills: 25 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', kills: 18 });
      const { container } = render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      // 检查是否存在 Swords SVG 图标
      const swordsIcon = container.querySelector('.lucide-swords');
      expect(swordsIcon).toBeInTheDocument();
    });
  });

  describe('经济对比显示', () => {
    it('应该正确显示经济对比（格式化k单位）', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', gold: 65000 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', gold: 58000 });
      render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      expect(screen.getByText('65.0k')).toBeInTheDocument();
      expect(screen.getByText('58.0k')).toBeInTheDocument();
    });

    it('应该显示经济标签', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', gold: 65000 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', gold: 58000 });
      render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      expect(screen.getByText('经济')).toBeInTheDocument();
    });
  });

  describe('推塔对比显示', () => {
    it('应该正确显示推塔对比', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', towers: 11 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', towers: 5 });
      render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      expect(screen.getByText('11')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('推塔')).toBeInTheDocument();
    });
  });

  describe('控龙对比显示', () => {
    it('应该正确显示控龙对比', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', dragons: 4 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', dragons: 2 });
      render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('龙')).toBeInTheDocument();
    });
  });

  describe('男爵对比显示', () => {
    it('应该正确显示男爵对比', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', barons: 1 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', barons: 0 });
      render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('男爵')).toBeInTheDocument();
    });
  });

  describe('红蓝方颜色正确', () => {
    it('红色方击杀数应该是红色', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', kills: 25 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', kills: 18 });
      const { container } = render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      const redKill = container.querySelector('.text-\\[\\#f44336\\]');
      expect(redKill).toBeInTheDocument();
    });

    it('蓝色方击杀数应该是蓝色', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', kills: 25 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', kills: 18 });
      const { container } = render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      const blueKill = container.querySelector('.text-\\[\\#00bcd4\\]');
      expect(blueKill).toBeInTheDocument();
    });
  });
});
