import * as advancementApi from '@/api/advancement';
import type { Advancement, UpdateAdvancementRequest } from '@/api/types';
import { requestCache } from '@/utils/requestCache';

/**
 * 晋级服务状态接口
 */
export interface AdvancementServiceState {
  /** 晋级名单 */
  advancement: Advancement | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 晋级服务接口
 */
interface AdvancementService {
  /** 获取晋级名单 */
  get: () => Promise<Advancement>;
  /** 更新晋级名单 */
  update: (data: UpdateAdvancementRequest) => Promise<Advancement>;
  /** 获取服务状态 */
  getState: () => AdvancementServiceState;
  /** 清除错误 */
  clearError: () => void;
  /** 重置状态 */
  resetState: () => void;
}

/**
 * 服务状态（内部状态管理）
 */
let state: AdvancementServiceState = {
  advancement: null,
  loading: false,
  error: null,
};

/**
 * 状态监听器集合
 */
const listeners: Set<(state: AdvancementServiceState) => void> = new Set();

/**
 * 更新状态并通知监听器
 */
function setState(newState: Partial<AdvancementServiceState>): void {
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
 * 晋级数据服务
 *
 * 提供晋级名单的获取和更新操作，包含状态管理和错误处理
 *
 * @example
 * ```ts
 * // 获取晋级名单
 * const advancement = await advancementService.get();
 *
 * // 更新晋级名单
 * await advancementService.update({
 *   top8: ['team1', 'team2'],
 *   eliminated: ['team3', 'team4']
 * });
 * ```
 */
export const advancementService: AdvancementService = {
  /**
   * 获取晋级名单
   * @returns 晋级名单信息
   */
  async get(): Promise<Advancement> {
    const cached = requestCache.get<Advancement>('advancement', 300000);
    if (cached) {
      setState({ advancement: cached, loading: false, error: null });
      return cached;
    }

    setState({ loading: true, error: null });

    try {
      const advancement = await advancementApi.get();

      requestCache.set('advancement', advancement);
      setState({
        advancement,
        loading: false,
      });

      return advancement;
    } catch (error) {
      handleError(error, '获取晋级名单失败');
    }
  },

  /**
   * 更新晋级名单
   * @param data 更新晋级名单数据
   * @returns 更新后的晋级名单信息
   */
  async update(data: UpdateAdvancementRequest): Promise<Advancement> {
    setState({ loading: true, error: null });

    try {
      const advancement = await advancementApi.update(data);

      // 清除缓存，确保下次获取时从后端拉取最新数据
      requestCache.clear('advancement');

      setState({
        advancement,
        loading: false,
      });

      return advancement;
    } catch (error) {
      handleError(error, '更新晋级名单失败');
    }
  },

  /**
   * 获取当前服务状态
   * @returns 当前状态
   */
  getState(): AdvancementServiceState {
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
      advancement: null,
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
export function subscribeToAdvancementService(
  callback: (state: AdvancementServiceState) => void
): () => void {
  listeners.add(callback);
  callback(state); // 立即通知当前状态

  return () => {
    listeners.delete(callback);
  };
}

export default advancementService;
