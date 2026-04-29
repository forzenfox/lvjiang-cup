import * as adminApi from '@/api/admin';
import { requestCache } from '@/utils/requestCache';

/**
 * 管理服务状态接口
 */
export interface AdminServiceState {
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 管理服务接口
 */
interface AdminService {
  /** 初始化比赛槽位 */
  initSlots: () => Promise<{ message: string; count: number }>;
  /** 获取服务状态 */
  getState: () => AdminServiceState;
  /** 清除错误 */
  clearError: () => void;
  /** 重置状态 */
  resetState: () => void;
}

/**
 * 服务状态（内部状态管理）
 */
let state: AdminServiceState = {
  loading: false,
  error: null,
};

/**
 * 状态监听器集合
 */
const listeners: Set<(state: AdminServiceState) => void> = new Set();

/**
 * 更新状态并通知监听器
 */
function setState(newState: Partial<AdminServiceState>): void {
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
 * 管理后台数据服务
 *
 * 提供管理后台相关操作，包含状态管理和错误处理
 *
 * @example
 * ```ts
 * // 初始化比赛槽位
 * const result = await adminService.initSlots();
 * ```
 */
export const adminService: AdminService = {
  /**
   * 初始化比赛槽位
   * @returns 初始化结果
   */
  async initSlots(): Promise<{ message: string; count: number }> {
    setState({ loading: true, error: null });

    try {
      const result = await adminApi.initSlots();

      // 清除 matches 缓存，确保下次获取时从后端拉取最新数据
      requestCache.clear('matches');

      setState({
        loading: false,
      });

      return result;
    } catch (error) {
      handleError(error, '初始化比赛槽位失败');
    }
  },

  /**
   * 获取当前服务状态
   * @returns 当前状态
   */
  getState(): AdminServiceState {
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
export function subscribeToAdminService(callback: (state: AdminServiceState) => void): () => void {
  listeners.add(callback);
  callback(state); // 立即通知当前状态

  return () => {
    listeners.delete(callback);
  };
}

export default adminService;
