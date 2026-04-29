import * as matchDataApi from '@/api/matchData';
import type {
  MatchSeriesInfo,
  MatchGameData,
  MatchDataCheckResponse,
  ImportMatchDataResponse,
  MultiGameImportResponse,
  UpdateMatchDataResponse,
  ImportOptions,
} from '@/types/matchData';
import { requestCache, CACHE_TTL } from '@/utils/requestCache';

/**
 * 对战数据服务状态接口
 */
export interface MatchDataServiceState {
  /** 系列赛信息 */
  series: MatchSeriesInfo | null;
  /** 当前单局数据 */
  currentGame: MatchGameData | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 对战数据服务接口
 */
interface MatchDataService {
  /** 检查对战数据是否存在 */
  checkExists: (matchId: string) => Promise<MatchDataCheckResponse>;
  /** 获取系列赛信息 */
  getSeries: (matchId: string) => Promise<MatchSeriesInfo>;
  /** 获取单局数据 */
  getGameData: (matchId: string, gameNumber: number) => Promise<MatchGameData | null>;
  /** 导入对战数据 */
  importMatchData: (
    matchId: string,
    file: File,
    options?: ImportOptions
  ) => Promise<ImportMatchDataResponse | MultiGameImportResponse>;
  /** 更新单局数据 */
  updateGameData: (
    matchId: string,
    gameId: number,
    data: unknown
  ) => Promise<UpdateMatchDataResponse>;
  /** 删除单局数据 */
  deleteGameData: (
    matchId: string,
    gameNumber: number
  ) => Promise<{ deleted: boolean; gameNumber: number }>;
  /** 下载模板 */
  downloadTemplate: (matchId: string) => Promise<{ blob: Blob; fileName: string | null }>;
  /** 下载错误报告 */
  downloadErrorReport: (errors: any[]) => Promise<Blob>;
  /** 获取服务状态 */
  getState: () => MatchDataServiceState;
  /** 清除错误 */
  clearError: () => void;
  /** 重置状态 */
  resetState: () => void;
}

/**
 * 服务状态（内部状态管理）
 */
let state: MatchDataServiceState = {
  series: null,
  currentGame: null,
  loading: false,
  error: null,
};

/**
 * 状态监听器集合
 */
const listeners: Set<(state: MatchDataServiceState) => void> = new Set();

/**
 * 更新状态并通知监听器
 */
function setState(newState: Partial<MatchDataServiceState>): void {
  state = { ...state, ...newState };
  listeners.forEach(listener => listener(state));
}

/**
 * 处理错误
 */
function handleError(error: unknown, defaultMessage: string): never {
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  setState({ error: errorMessage, loading: false });
  throw new Error(errorMessage);
}

/**
 * 清除指定 matchId 的所有缓存（matchSeries 和 matchGame_1 到 matchGame_10）
 */
function clearMatchCache(matchId: string): void {
  requestCache.clear(`matchSeries_${matchId}`);
  for (let i = 1; i <= 10; i++) {
    requestCache.clear(`matchGame_${matchId}_${i}`);
  }
}

/**
 * 对战数据服务
 *
 * 提供完整的对战数据查询、导入、更新和删除操作，包含状态管理和错误处理
 *
 * @example
 * ```ts
 * // 检查对战数据是否存在
 * const exists = await matchDataService.checkExists('match1');
 *
 * // 获取系列赛信息
 * const series = await matchDataService.getSeries('match1');
 *
 * // 获取单局数据
 * const gameData = await matchDataService.getGameData('match1', 1);
 *
 * // 导入对战数据
 * await matchDataService.importMatchData('match1', file);
 *
 * // 更新单局数据
 * await matchDataService.updateGameData('match1', 1, { winnerTeamId: 'team1' });
 *
 * // 删除单局数据
 * await matchDataService.deleteGameData('match1', 1);
 * ```
 */
export const matchDataService: MatchDataService = {
  /**
   * 检查对战数据是否存在
   * @param matchId 比赛 ID
   * @returns 数据存在性检查结果
   */
  async checkExists(matchId: string): Promise<MatchDataCheckResponse> {
    setState({ loading: true, error: null });

    try {
      const result = await matchDataApi.checkMatchDataExists(matchId);
      setState({ loading: false });
      return result;
    } catch (error) {
      handleError(error, '检查对战数据失败');
    }
  },

  /**
   * 获取系列赛信息
   * @param matchId 比赛 ID
   * @returns 系列赛信息
   */
  async getSeries(matchId: string): Promise<MatchSeriesInfo> {
    const cacheKey = `matchSeries_${matchId}`;
    const cached = requestCache.get<MatchSeriesInfo>(cacheKey, CACHE_TTL.matches);
    if (cached) {
      setState({ series: cached, loading: false, error: null });
      return cached;
    }

    setState({ loading: true, error: null });

    try {
      const series = await matchDataApi.getMatchSeries(matchId);

      requestCache.set(cacheKey, series);
      setState({
        series,
        loading: false,
      });

      return series;
    } catch (error) {
      handleError(error, '获取系列赛信息失败');
    }
  },

  /**
   * 获取单局数据
   * @param matchId 比赛 ID
   * @param gameNumber 局数
   * @returns 单局数据
   */
  async getGameData(matchId: string, gameNumber: number): Promise<MatchGameData | null> {
    const cacheKey = `matchGame_${matchId}_${gameNumber}`;
    const cached = requestCache.get<MatchGameData>(cacheKey, CACHE_TTL.matches);
    if (cached) {
      setState({ currentGame: cached, loading: false, error: null });
      return cached;
    }

    setState({ loading: true, error: null });

    try {
      const gameData = await matchDataApi.getMatchGameData(matchId, gameNumber);

      requestCache.set(cacheKey, gameData);
      setState({
        currentGame: gameData,
        loading: false,
      });

      return gameData;
    } catch (error) {
      handleError(error, '获取单局数据失败');
    }
  },

  /**
   * 导入对战数据
   * @param matchId 比赛 ID
   * @param file Excel 文件
   * @param options 导入选项
   * @returns 导入结果
   */
  async importMatchData(
    matchId: string,
    file: File,
    options?: ImportOptions
  ): Promise<ImportMatchDataResponse | MultiGameImportResponse> {
    setState({ loading: true, error: null });

    try {
      const result = await matchDataApi.importMatchData(matchId, file, options);

      // 清除缓存，确保下次获取时从后端拉取最新数据
      clearMatchCache(matchId);

      setState({ loading: false });

      return result;
    } catch (error) {
      handleError(error, '导入对战数据失败');
    }
  },

  /**
   * 更新单局数据
   * @param matchId 比赛 ID
   * @param gameId 对战记录 ID
   * @param data 更新的对战数据
   * @returns 更新结果
   */
  async updateGameData(
    matchId: string,
    gameId: number,
    data: unknown
  ): Promise<UpdateMatchDataResponse> {
    setState({ loading: true, error: null });

    try {
      const result = await matchDataApi.updateMatchGameData(matchId, gameId, data);

      // 清除相关缓存
      requestCache.clear(`matchSeries_${matchId}`);
      requestCache.clear(`matchGame_${matchId}_${gameId}`);

      setState({ loading: false });

      return result;
    } catch (error) {
      handleError(error, '更新对战数据失败');
    }
  },

  /**
   * 删除单局数据
   * @param matchId 比赛 ID
   * @param gameNumber 局数
   * @returns 删除结果
   */
  async deleteGameData(
    matchId: string,
    gameNumber: number
  ): Promise<{ deleted: boolean; gameNumber: number }> {
    setState({ loading: true, error: null });

    try {
      const result = await matchDataApi.deleteMatchGameData(matchId, gameNumber);

      // 清除相关缓存
      requestCache.clear(`matchSeries_${matchId}`);
      requestCache.clear(`matchGame_${matchId}_${gameNumber}`);

      setState({ loading: false });

      return result;
    } catch (error) {
      handleError(error, '删除对战数据失败');
    }
  },

  /**
   * 下载对战数据导入模板
   * @param matchId 比赛 ID
   * @returns 模板文件 Blob 和文件名
   */
  async downloadTemplate(matchId: string): Promise<{ blob: Blob; fileName: string | null }> {
    setState({ loading: true, error: null });

    try {
      const result = await matchDataApi.downloadMatchDataTemplate(matchId);
      setState({ loading: false });
      return result;
    } catch (error) {
      handleError(error, '下载模板失败');
    }
  },

  /**
   * 下载对战数据导入错误报告
   * @param errors 错误列表
   * @returns 错误报告文件 Blob
   */
  async downloadErrorReport(errors: any[]): Promise<Blob> {
    setState({ loading: true, error: null });

    try {
      const result = await matchDataApi.downloadMatchDataErrorReport(errors);
      setState({ loading: false });
      return result;
    } catch (error) {
      handleError(error, '下载错误报告失败');
    }
  },

  /**
   * 获取当前服务状态
   * @returns 当前状态
   */
  getState(): MatchDataServiceState {
    return { ...state };
  },

  /**
   * 清除错误信息
   */
  clearError(): void {
    setState({ error: null });
  },

  /**
   * 重置状态到初始值
   */
  resetState(): void {
    state = {
      series: null,
      currentGame: null,
      loading: false,
      error: null,
    };
    listeners.forEach(listener => listener(state));
  },
};

/**
 * 订阅状态变化
 * @param callback 状态变化回调函数
 * @returns 取消订阅函数
 */
export function subscribeToMatchDataService(
  callback: (state: MatchDataServiceState) => void
): () => void {
  listeners.add(callback);
  callback(state); // 立即通知当前状态

  return () => {
    listeners.delete(callback);
  };
}

export default matchDataService;
