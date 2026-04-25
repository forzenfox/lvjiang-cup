import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MatchSeriesHeader from '@/components/features/match-data/MatchSeriesHeader';
import type { MatchSeriesInfo, MatchGameData } from '@/types/matchData';

vi.mock('@/utils/upload', () => ({
  getUploadUrl: (url: string) => url || '',
}));

const createMockSeriesInfo = (): MatchSeriesInfo => ({
  matchId: 'match1',
  teamA: {
    id: 'team1',
    name: 'BLG',
  },
  teamB: {
    id: 'team2',
    name: 'WBG',
  },
  format: 'BO3',
  games: [
    { gameNumber: 1, winnerTeamId: 'team1', gameDuration: '32:45', hasData: true },
    { gameNumber: 2, winnerTeamId: 'team2', gameDuration: '28:30', hasData: true },
    { gameNumber: 3, winnerTeamId: null, gameDuration: null, hasData: false },
  ],
});

const createMockGameData = (overrides: Partial<MatchGameData> = {}): MatchGameData => ({
  id: 1,
  matchId: 'match1',
  gameNumber: 1,
  winnerTeamId: 'team1',
  gameDuration: '32:45',
  gameStartTime: '2026-04-16T14:00:00',
  videoBvid: 'BV1Ab4y1X7zK',
  blueTeam: {
    teamId: 'team1',
    teamName: 'BLG',
    side: 'blue',
    kills: 25,
    gold: 65000,
    towers: 9,
    dragons: 3,
    barons: 1,
    isWinner: true,
  },
  redTeam: {
    teamId: 'team2',
    teamName: 'WBG',
    side: 'red',
    kills: 18,
    gold: 58000,
    towers: 5,
    dragons: 1,
    barons: 0,
    isWinner: false,
  },
  playerStats: [],
  ...overrides,
});

describe('MatchSeriesHeader', () => {
  describe('基础渲染', () => {
    it('应该显示双方战队名称', () => {
      const seriesInfo = createMockSeriesInfo();
      const gameData = createMockGameData();
      render(<MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />);

      expect(screen.getByText('BLG')).toBeInTheDocument();
      expect(screen.getByText('WBG')).toBeInTheDocument();
    });

    it('应该显示总比分', () => {
      const seriesInfo = createMockSeriesInfo();
      const gameData = createMockGameData();
      render(<MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />);

      const scores = screen.getAllByText(/\d+/);
      expect(scores.length).toBeGreaterThanOrEqual(2);
    });

    it('应该显示比赛日期和时间', () => {
      const seriesInfo = createMockSeriesInfo();
      const gameData = createMockGameData();
      render(<MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />);

      expect(screen.getByText('04-16')).toBeInTheDocument();
      expect(screen.getByText('14:00')).toBeInTheDocument();
    });

    it('比赛未开始时应该显示未开始状态', () => {
      const seriesInfo = createMockSeriesInfo();
      const gameData = createMockGameData({
        winnerTeamId: null,
        gameStartTime: null,
      });
      render(<MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />);

      expect(screen.getByText('未开始')).toBeInTheDocument();
    });
  });

  describe('视频回顾按钮', () => {
    it('比赛已结束且有BV号时应该显示视频回顾按钮', () => {
      const seriesInfo = createMockSeriesInfo();
      const gameData = createMockGameData({
        winnerTeamId: 'team1',
        videoBvid: 'BV1Ab4y1X7zK',
      });
      render(<MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />);

      expect(screen.getByText('视频回顾')).toBeInTheDocument();
    });

    it('比赛未结束时不应该显示视频回顾按钮', () => {
      const seriesInfo = createMockSeriesInfo();
      const gameData = createMockGameData({
        winnerTeamId: null,
        videoBvid: 'BV1Ab4y1X7zK',
      });
      render(<MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />);

      expect(screen.queryByText('视频回顾')).not.toBeInTheDocument();
    });

    it('没有BV号时不应该显示视频回顾按钮', () => {
      const seriesInfo = createMockSeriesInfo();
      const gameData = createMockGameData({
        winnerTeamId: 'team1',
        videoBvid: null,
      });
      render(<MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />);

      expect(screen.queryByText('视频回顾')).not.toBeInTheDocument();
    });

    it('点击视频回顾按钮应该在新标签页打开视频链接', () => {
      const seriesInfo = createMockSeriesInfo();
      const gameData = createMockGameData({
        winnerTeamId: 'team1',
        videoBvid: 'BV1Ab4y1X7zK',
      });

      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);

      render(<MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />);

      const button = screen.getByText('视频回顾');
      fireEvent.click(button);

      expect(mockOpen).toHaveBeenCalledWith(
        'https://www.bilibili.com/video/BV1Ab4y1X7zK',
        '_blank'
      );

      vi.unstubAllGlobals();
    });

    it('BV号大小写敏感，链接应该正确生成', () => {
      const seriesInfo = createMockSeriesInfo();
      const gameData = createMockGameData({
        winnerTeamId: 'team1',
        videoBvid: 'BV1aB4Y1x7Zk',
      });

      const mockOpen = vi.fn();
      vi.stubGlobal('open', mockOpen);

      render(<MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />);

      const button = screen.getByText('视频回顾');
      fireEvent.click(button);

      expect(mockOpen).toHaveBeenCalledWith(
        'https://www.bilibili.com/video/BV1aB4Y1x7Zk',
        '_blank'
      );

      vi.unstubAllGlobals();
    });
  });

  describe('状态显示', () => {
    it('比赛进行中时应该显示进行中状态', () => {
      const seriesInfo = createMockSeriesInfo();
      const gameData = createMockGameData({
        winnerTeamId: null,
        gameStartTime: '2026-04-16T14:00:00',
      });
      render(<MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />);

      expect(screen.getByText('进行中')).toBeInTheDocument();
    });

    it('比赛已结束时应该显示已结束状态', () => {
      const seriesInfo = createMockSeriesInfo();
      const gameData = createMockGameData({
        winnerTeamId: 'team1',
      });
      render(<MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />);

      expect(screen.getByText('已结束')).toBeInTheDocument();
    });
  });

  describe('BO3比分计算', () => {
    it('应该正确计算系列赛总比分', () => {
      const seriesInfo = createMockSeriesInfo();
      const gameData = createMockGameData({
        winnerTeamId: 'team1',
      });
      render(<MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />);

      const scores = screen.getAllByText(/\d/);
      const redScore = scores.find(s => s.textContent === '1' && s === scores[0]);
      const blueScore = scores.find(s => s.textContent === '1' && s === scores[1]);
      expect(redScore).toBeDefined();
      expect(blueScore).toBeDefined();
    });
  });
});
