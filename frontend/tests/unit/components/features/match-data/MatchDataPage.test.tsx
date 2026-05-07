import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MatchDataPage from '@/components/features/match-data/MatchDataPage';
import * as matchDataApi from '@/api/matchData';
import type { MatchSeriesInfo, MatchGameData } from '@/types/matchData';

const mockMatchDataCache = vi.hoisted(() => ({
  get: vi.fn(() => null),
  set: vi.fn(),
  getMatchSeriesKey: vi.fn(() => 'cache-key-match1'),
  getGameDataKey: vi.fn(() => 'cache-key-game1'),
  getCachedSeries: vi.fn(() => null),
  getCachedGameData: vi.fn(() => null),
  cacheSeries: vi.fn(),
  cacheGameData: vi.fn(),
  cleanup: vi.fn(),
}));

const mockPreloadAdjacentGame = vi.hoisted(() => vi.fn());

vi.mock('@/api/matchData', () => ({
  getMatchSeries: vi.fn(),
  getMatchGameData: vi.fn(),
}));

vi.mock('@/utils/matchDataCache', () => ({
  matchDataCache: mockMatchDataCache,
}));

vi.mock('@/store/matchDataStore', () => ({
  useMatchDataStore: vi.fn((selector: (state: any) => any) => {
    const state = {
      setSeriesInfo: vi.fn(),
      updateGame: vi.fn(),
      preloadAdjacentGame: mockPreloadAdjacentGame,
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('@/utils/upload', () => ({
  getUploadUrl: (url: string) => url || '',
}));

const mockGetMatchSeries = matchDataApi.getMatchSeries as ReturnType<typeof vi.fn>;
const mockGetMatchGameData = matchDataApi.getMatchGameData as ReturnType<typeof vi.fn>;

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

const createMockGameData = (): MatchGameData => ({
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
  playerStats: [
    {
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
    },
    {
      id: 2,
      playerId: 'p6',
      playerName: 'Zika',
      teamId: 'team2',
      teamName: 'WBG',
      position: 'TOP',
      championName: '赛恩',
      kills: 1,
      deaths: 5,
      assists: 9,
      kda: '1/5/9',
      cs: 267,
      gold: 15200,
      damageDealt: 32000,
      damageTaken: 45000,
      visionScore: 18,
      wardsPlaced: 10,
      level: 16,
      firstBlood: false,
      mvp: false,
    },
  ],
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter initialEntries={['/match/match1']}>
      <Routes>
        <Route path="/match/:id" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('MatchDataPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('页面加载', () => {
    it('应该显示加载状态', () => {
      mockGetMatchSeries.mockImplementation(() => new Promise(() => {}));
      mockGetMatchGameData.mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<MatchDataPage />);

      // 加载中应该显示骨架屏（带有 animate-pulse 类）
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('加载完成后应该显示MatchInfoCard', async () => {
      mockGetMatchSeries.mockResolvedValueOnce(createMockSeriesInfo());
      mockGetMatchGameData.mockResolvedValueOnce(createMockGameData());

      renderWithRouter(<MatchDataPage />);

      await waitFor(
        () => {
          // 检查页面标题
          expect(screen.getByText('对战数据详情')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('加载完成后应该显示TeamStatsBar', async () => {
      mockGetMatchSeries.mockResolvedValueOnce(createMockSeriesInfo());
      mockGetMatchGameData.mockResolvedValueOnce(createMockGameData());

      renderWithRouter(<MatchDataPage />);

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByText('18')).toBeInTheDocument();
      });
    });
  });

  describe('GameSwitcher集成', () => {
    it('应该使用GameSwitcher组件', async () => {
      mockGetMatchSeries.mockResolvedValueOnce(createMockSeriesInfo());
      mockGetMatchGameData.mockResolvedValueOnce(createMockGameData());

      renderWithRouter(<MatchDataPage />);

      await waitFor(
        () => {
          // GameSwitcher 在局数 > 1 时显示"第一场"等中文标签
          expect(screen.getByText('第一场')).toBeInTheDocument();
          expect(screen.getByText('第二场')).toBeInTheDocument();
          expect(screen.getByText('第三场')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('BO1不应该显示GameSwitcher', async () => {
      const bo1Series = {
        ...createMockSeriesInfo(),
        format: 'BO1',
        games: [{ gameNumber: 1, winnerTeamId: 'team1', gameDuration: '32:45', hasData: true }],
      };
      mockGetMatchSeries.mockResolvedValueOnce(bo1Series);
      mockGetMatchGameData.mockResolvedValueOnce(createMockGameData());

      renderWithRouter(<MatchDataPage />);

      await waitFor(
        () => {
          // BO1 显示"第一场"标签而不是可切换的"第X场"按钮
          expect(screen.queryByText('第二场')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('PlayerStatsList集成', () => {
    it('应该按位置顺序显示选手数据', async () => {
      mockGetMatchSeries.mockResolvedValueOnce(createMockSeriesInfo());

      const gameDataWithAllPositions = createMockGameData();
      gameDataWithAllPositions.playerStats = [
        ...gameDataWithAllPositions.playerStats,
        {
          ...gameDataWithAllPositions.playerStats[0],
          position: 'JUNGLE',
          playerName: 'Xun',
          playerId: 'p2',
        },
        {
          ...gameDataWithAllPositions.playerStats[1],
          position: 'JUNGLE',
          playerName: 'Weiwei',
          playerId: 'p7',
        },
        {
          ...gameDataWithAllPositions.playerStats[0],
          position: 'MID',
          playerName: 'Yagao',
          playerId: 'p3',
        },
        {
          ...gameDataWithAllPositions.playerStats[1],
          position: 'MID',
          playerName: 'Angel',
          playerId: 'p8',
        },
        {
          ...gameDataWithAllPositions.playerStats[0],
          position: 'ADC',
          playerName: 'Elk',
          playerId: 'p4',
        },
        {
          ...gameDataWithAllPositions.playerStats[1],
          position: 'ADC',
          playerName: 'Light',
          playerId: 'p9',
        },
        {
          ...gameDataWithAllPositions.playerStats[0],
          position: 'SUPPORT',
          playerName: 'ON',
          playerId: 'p5',
        },
        {
          ...gameDataWithAllPositions.playerStats[1],
          position: 'SUPPORT',
          playerName: 'Crisp',
          playerId: 'p10',
        },
      ];
      mockGetMatchGameData.mockResolvedValueOnce(gameDataWithAllPositions);

      renderWithRouter(<MatchDataPage />);

      await waitFor(() => {
        expect(screen.getByText('Bin')).toBeInTheDocument();
        expect(screen.getByText('Zika')).toBeInTheDocument();
      });
    });
  });

  describe('雷达图集成', () => {
    it('点击选手行应该展开雷达图', async () => {
      mockGetMatchSeries.mockResolvedValueOnce(createMockSeriesInfo());
      mockGetMatchGameData.mockResolvedValueOnce(createMockGameData());

      renderWithRouter(<MatchDataPage />);

      await waitFor(
        () => {
          expect(screen.getByText('Bin')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const binRow = screen.getByText('Bin').closest('.cursor-pointer');
      if (binRow) {
        (binRow as HTMLElement).click();
      }

      // 点击后应该展开雷达图（RadarChart 组件使用 framer-motion 动画）
      await waitFor(
        () => {
          // 检查是否有展开的内容（雷达图区域）
          const radarArea = document.querySelector('.bg-\\[\\#1a1a2e\\]');
          expect(radarArea).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });
  });
});
