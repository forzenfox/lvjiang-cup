import { create } from 'zustand';
import { getMatchGameData, getMatchSeries, checkMatchDataExists } from '@/api/matchData';
import type { MatchGameData, MatchSeriesInfo } from '@/types/matchData';

/**
 * 对战数据状态接口
 */
interface MatchDataState {
  /** 单局对战完整数据 */
  gameData: MatchGameData | null;
  /** 系列赛信息（用于局数切换器） */
  seriesInfo: MatchSeriesInfo | null;
  /** 是否有数据 */
  hasData: boolean;
  /** 加载中状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 当前选中的局数 */
  selectedGameNumber: number;
  /** 展开的选手ID（用于雷达图展示） */
  expandedPlayerId: number | null;

  /** 获取单局对战数据 */
  fetchGameData: (matchId: string, gameNumber: number) => Promise<void>;
  /** 获取系列赛信息 */
  fetchSeriesInfo: (matchId: string) => Promise<void>;
  /** 检查比赛是否有数据 */
  checkHasData: (matchId: string) => Promise<void>;
  /** 设置当前选中的局数 */
  setSelectedGame: (gameNumber: number) => void;
  /** 设置展开的选手 */
  setExpandedPlayer: (playerId: number | null) => void;
  /** 预加载相邻局数数据 */
  preloadAdjacentGame: (matchId: string, currentGame: number, maxGames: number) => void;
  /** 重置所有状态 */
  reset: () => void;
}

/**
 * 初始状态
 */
const initialState = {
  gameData: null as MatchGameData | null,
  seriesInfo: null as MatchSeriesInfo | null,
  hasData: false,
  loading: false,
  error: null as string | null,
  selectedGameNumber: 1,
  expandedPlayerId: null as number | null,
};

/**
 * 对战数据状态管理
 */
export const useMatchDataStore = create<MatchDataState>(set => ({
  ...initialState,

  /**
   * 获取单局对战数据
   * @param matchId 比赛ID
   * @param gameNumber 局数 (1-5)
   */
  fetchGameData: async (matchId: string, gameNumber: number) => {
    set({ loading: true, error: null });

    try {
      const data = await getMatchGameData(matchId, gameNumber);
      set({
        gameData: data,
        selectedGameNumber: gameNumber,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取对战数据失败';
      set({
        gameData: null,
        loading: false,
        error: errorMessage,
      });
    }
  },

  /**
   * 获取系列赛信息（用于局数切换器）
   * @param matchId 比赛ID
   */
  fetchSeriesInfo: async (matchId: string) => {
    set({ loading: true, error: null });

    try {
      const info = await getMatchSeries(matchId);
      set({
        seriesInfo: info,
        hasData: info.games.length > 0,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取系列赛信息失败';
      set({
        seriesInfo: null,
        loading: false,
        error: errorMessage,
      });
    }
  },

  /**
   * 检查比赛是否有数据
   * @param matchId 比赛ID
   */
  checkHasData: async (matchId: string) => {
    set({ loading: true, error: null });

    try {
      const result = await checkMatchDataExists(matchId);
      set({
        hasData: result.hasData,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '检查数据存在性失败';
      set({
        hasData: false,
        loading: false,
        error: errorMessage,
      });
    }
  },

  /**
   * 设置当前选中的局数
   * @param gameNumber 局数
   */
  setSelectedGame: (gameNumber: number) => {
    set({ selectedGameNumber: gameNumber });
  },

  /**
   * 设置展开的选手（用于雷达图）
   * @param playerId 选手ID，null表示收起
   */
  setExpandedPlayer: (playerId: number | null) => {
    set({ expandedPlayerId: playerId });
  },

  /**
   * 预加载相邻局数数据（gameNumber-1 和 gameNumber+1）
   * 使用 setTimeout 延迟1秒执行，避免阻塞主线程
   * @param matchId 比赛ID
   * @param currentGame 当前局数
   * @param maxGames 最大局数
   */
  preloadAdjacentGame: (matchId: string, currentGame: number, maxGames: number) => {
    setTimeout(() => {
      const adjacentGames: number[] = [];

      // 预加载前一局
      if (currentGame > 1) {
        adjacentGames.push(currentGame - 1);
      }

      // 预加载后一局
      if (currentGame < maxGames) {
        adjacentGames.push(currentGame + 1);
      }

      // 异步预加载，不阻塞主线程
      adjacentGames.forEach(gameNumber => {
        getMatchGameData(matchId, gameNumber)
          .then(() => {
            // 预加载数据存入缓存（通过浏览器缓存或zustand内部缓存）
            // 这里不更新state，仅利用API层缓存
          })
          .catch(() => {
            // 预加载失败静默处理，不影响用户体验
          });
      });
    }, 1000); // 1秒延迟
  },

  /**
   * 重置所有状态到初始值
   */
  reset: () => {
    set(initialState);
  },
}));
