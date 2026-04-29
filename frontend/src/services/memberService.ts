import * as membersApi from '@/api/members';
import type { UpdateMemberRequest } from '@/api/types';
import { requestCache } from '@/utils/requestCache';

/**
 * 队员服务状态接口
 */
export interface MemberServiceState {
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 队员服务接口
 */
interface MemberService {
  /** 更新队员 */
  updateMember: (id: string, data: UpdateMemberRequest) => Promise<unknown>;
  /** 删除队员 */
  removeMember: (id: string) => Promise<void>;
  /** 获取服务状态 */
  getState: () => MemberServiceState;
  /** 清除错误 */
  clearError: () => void;
  /** 重置状态 */
  resetState: () => void;
}

/**
 * 服务状态（内部状态管理）
 */
let state: MemberServiceState = {
  loading: false,
  error: null,
};

/**
 * 状态监听器集合
 */
const listeners: Set<(state: MemberServiceState) => void> = new Set();

/**
 * 更新状态并通知监听器
 */
function setState(newState: Partial<MemberServiceState>): void {
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
 * 队员数据服务
 *
 * 提供队员更新和删除操作，包含状态管理和错误处理
 * 队员属于战队，更新/删除队员后清除 'teams' 缓存
 *
 * @example
 * ```ts
 * // 更新队员
 * await memberService.updateMember('member1', { nickname: '新昵称' });
 *
 * // 删除队员
 * await memberService.removeMember('member1');
 * ```
 */
export const memberService: MemberService = {
  /**
   * 更新队员信息
   * @param id 队员 ID
   * @param data 更新数据
   * @returns 更新后的队员信息
   */
  async updateMember(id: string, data: UpdateMemberRequest): Promise<unknown> {
    setState({ loading: true, error: null });

    try {
      const result = await membersApi.updateMember(id, data);

      // 队员属于战队，清除 teams 缓存以确保下次获取时从后端拉取最新数据
      requestCache.clear('teams');

      setState({ loading: false });

      return result;
    } catch (error) {
      handleError(error, '更新队员失败');
    }
  },

  /**
   * 删除队员
   * @param id 队员 ID
   */
  async removeMember(id: string): Promise<void> {
    setState({ loading: true, error: null });

    try {
      await membersApi.removeMember(id);

      // 队员属于战队，清除 teams 缓存以确保下次获取时从后端拉取最新数据
      requestCache.clear('teams');

      setState({ loading: false });
    } catch (error) {
      handleError(error, '删除队员失败');
    }
  },

  /**
   * 获取当前服务状态
   * @returns 当前状态
   */
  getState(): MemberServiceState {
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
export function subscribeToMemberService(
  callback: (state: MemberServiceState) => void
): () => void {
  listeners.add(callback);
  callback(state); // 立即通知当前状态

  return () => {
    listeners.delete(callback);
  };
}

export default memberService;
