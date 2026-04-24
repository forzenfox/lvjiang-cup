import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TeamStatsBar from '@/components/features/match-data/TeamStatsBar';
import type { TeamGameData, BanData } from '@/types/matchData';

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

const createMockBans = (): BanData => ({
  red: ['Ahri', 'Yasuo', 'LeeSin', 'Jinx', 'Thresh'],
  blue: ['Zed', 'Riven', 'Viego', 'Ezreal', 'Lulu'],
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
      expect(killText.closest('.text-5xl')).toBeInTheDocument();
    });

    it('应该显示 Swords 图标表示击杀', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', kills: 25 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', kills: 18 });
      const { container } = render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      // 检查是否存在 Swords SVG 图标
      const swordsIcon = container.querySelector('.lucide-swords');
      expect(swordsIcon).toBeInTheDocument();
    });

    it('应该显示击杀数标签', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', kills: 25 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', kills: 18 });
      render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      expect(screen.getByText('击杀数')).toBeInTheDocument();
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

      // 现在两侧都有金币标签，使用 getAllByText
      const goldLabels = screen.getAllByText('金币');
      expect(goldLabels.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('推塔对比显示', () => {
    it('应该正确显示推塔对比', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', towers: 11 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', towers: 5 });
      render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      expect(screen.getByText('11')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      // 现在两侧都有防御塔标签，使用 getAllByText
      const towerLabels = screen.getAllByText('防御塔');
      expect(towerLabels.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('控龙对比显示', () => {
    it('应该正确显示控龙对比', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', dragons: 4 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', dragons: 2 });
      render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      // 现在显示为"小龙"而不是"龙"
      const dragonLabels = screen.getAllByText('小龙');
      expect(dragonLabels.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('男爵对比显示', () => {
    it('应该正确显示男爵对比', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue', barons: 1 });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red', barons: 0 });
      render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      // 现在两侧都有男爵标签，使用 getAllByText
      const baronLabels = screen.getAllByText('男爵');
      expect(baronLabels.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('BAN位显示', () => {
    it('应该正确显示BAN位', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue' });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red' });
      const bans = createMockBans();
      render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} bans={bans} />);

      // 检查BAN/PICK标签
      expect(screen.getByText('BAN / PICK')).toBeInTheDocument();
    });

    it('没有BAN数据时不显示BAN区域', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue' });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red' });
      render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      // BAN/PICK标签不应该出现
      expect(screen.queryByText('BAN / PICK')).not.toBeInTheDocument();
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

  describe('图标显示', () => {
    it('应该显示所有数据图标', () => {
      const blueTeam = createMockTeamData({ teamName: 'BLG', side: 'blue' });
      const redTeam = createMockTeamData({ teamName: 'WBG', side: 'red' });
      const { container } = render(<TeamStatsBar blueTeam={blueTeam} redTeam={redTeam} />);

      // 检查各个图标是否存在
      expect(container.querySelector('.lucide-swords')).toBeInTheDocument();
      expect(container.querySelector('.lucide-coins')).toBeInTheDocument();
      expect(container.querySelector('.lucide-castle')).toBeInTheDocument();
      expect(container.querySelector('.lucide-flame')).toBeInTheDocument();
      expect(container.querySelector('.lucide-crown')).toBeInTheDocument();
    });
  });
});
