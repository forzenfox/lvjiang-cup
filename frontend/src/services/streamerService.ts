import { streamersApi, type StreamerOrder } from '@/api/streamers';
import * as streamersImportApi from '@/api/streamers-import';
import type { Streamer, CreateStreamerRequest, UpdateStreamerRequest } from '@/api/types';
import type { StreamerImportResult, StreamerImportError } from '@/api/streamers-import';
import { requestCache, CACHE_TTL } from '@/utils/requestCache';

/**
 * 主播服务状态接口
 */
export interface StreamerServiceState {
  /** 主播列表 */
  streamers: Streamer[];
  /** 当前选中的主播 */
  currentStreamer: Streamer | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 主播服务接口
 */
interface StreamerService {
  /** 获取所有主播 */
  getAll: () => Promise<Streamer[]>;
  /** 根据 ID 获取主播 */
  getById: (id: string) => Promise<Streamer>;
  /** 创建主播 */
  create: (data: CreateStreamerRequest) => Promise<Streamer>;
  /** 更新主播 */
  update: (id: string, data: UpdateStreamerRequest) => Promise<Streamer>;
  /** 删除主播 */
  remove: (id: string) => Promise<void>;
  /** 更新排序 */
  updateSort: (orders: StreamerOrder[]) => Promise<void>;
  /** 导入主播 */
  importStreamers: (file: File) => Promise<StreamerImportResult>;
  /** 下载模板 */
  downloadTemplate: () => Promise<Blob>;
  /** 下载错误报告 */
  downloadErrorReport: (errors: StreamerImportError[]) => Promise<Blob>;
  /** 获取服务状态 */
  getState: () => StreamerServiceState;
  /** 清除错误 */
  clearError: () => void;
  /** 重置状态 */
  resetState: () => void;
}

/**
 * 服务状态（内部状态管理）
 */
let state: StreamerServiceState = {
  streamers: [],
  currentStreamer: null,
  loading: false,
  error: null,
};

/**
 * 状态监听器集合
 */
const listeners: Set<(state: StreamerServiceState) => void> = new Set();

/**
 * 更新状态并通知监听器
 */
function setState(newState: Partial<StreamerServiceState>): void {
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
 * 主播数据服务
 *
 * 提供完整的主播 CRUD 操作，包含状态管理和错误处理
 *
 * @example
 * ```ts
 * // 获取所有主播
 * const result = await streamerService.getAll();
 *
 * // 创建主播
 * const newStreamer = await streamerService.create({
 *   nickname: '新主播',
 *   posterUrl: 'https://example.com/poster.png',
 *   bio: '主播描述',
 *   liveUrl: 'https://live.example.com/1',
 *   streamerType: StreamerType.INTERNAL
 * });
 *
 * // 更新主播
 * await streamerService.update('streamer1', { nickname: '更新后的名称' });
 *
 * // 删除主播
 * await streamerService.remove('streamer1');
 * ```
 */
export const streamerService: StreamerService = {
  /**
   * 获取所有主播
   * @returns 主播列表
   */
  async getAll(): Promise<Streamer[]> {
    const cached = requestCache.get<Streamer[]>('streamers', CACHE_TTL.streamers);
    if (cached) {
      setState({ streamers: cached, loading: false, error: null });
      return cached;
    }

    setState({ loading: true, error: null });

    try {
      const streamers = await streamersApi.getAll();

      requestCache.set('streamers', streamers);
      setState({
        streamers,
        loading: false,
      });

      return streamers;
    } catch (error) {
      handleError(error, '获取主播列表失败');
    }
  },

  /**
   * 根据 ID 获取主播
   * @param id 主播 ID
   * @returns 主播信息
   */
  async getById(id: string): Promise<Streamer> {
    setState({ loading: true, error: null });

    try {
      const streamer = await streamersApi.getById(id);

      setState({
        currentStreamer: streamer,
        loading: false,
      });

      return streamer;
    } catch (error) {
      handleError(error, `获取主播 ${id} 信息失败`);
    }
  },

  /**
   * 创建主播
   * @param data 创建主播数据
   * @returns 创建的主播信息
   */
  async create(data: CreateStreamerRequest): Promise<Streamer> {
    setState({ loading: true, error: null });

    try {
      // 验证必填字段
      if (!data.nickname || data.nickname.trim() === '') {
        throw new Error('主播昵称不能为空');
      }

      const streamer = await streamersApi.create(data);

      // 清除缓存，确保下次获取时从后端拉取最新数据
      requestCache.clear('streamers');

      // 更新本地列表
      setState({
        streamers: [...state.streamers, streamer],
        loading: false,
      });

      return streamer;
    } catch (error) {
      handleError(error, '创建主播失败');
    }
  },

  /**
   * 更新主播
   * @param id 主播 ID
   * @param data 更新主播数据
   * @returns 更新后的主播信息
   */
  async update(id: string, data: UpdateStreamerRequest): Promise<Streamer> {
    setState({ loading: true, error: null });

    try {
      const streamer = await streamersApi.update(id, data);

      // 清除缓存，确保下次获取时从后端拉取最新数据
      requestCache.clear('streamers');

      // 更新本地列表中的主播
      setState({
        streamers: state.streamers.map(s => (s.id === streamer.id ? streamer : s)),
        currentStreamer:
          state.currentStreamer?.id === streamer.id ? streamer : state.currentStreamer,
        loading: false,
      });

      return streamer;
    } catch (error) {
      handleError(error, '更新主播失败');
    }
  },

  /**
   * 删除主播
   * @param id 主播 ID
   */
  async remove(id: string): Promise<void> {
    setState({ loading: true, error: null });

    try {
      await streamersApi.remove(id);

      // 清除缓存，确保下次获取时从后端拉取最新数据
      requestCache.clear('streamers');

      // 从本地列表中移除
      setState({
        streamers: state.streamers.filter(s => s.id !== id),
        currentStreamer: state.currentStreamer?.id === id ? null : state.currentStreamer,
        loading: false,
      });
    } catch (error) {
      handleError(error, '删除主播失败');
    }
  },

  /**
   * 更新主播排序
   * @param orders 排序数据
   */
  async updateSort(orders: StreamerOrder[]): Promise<void> {
    setState({ loading: true, error: null });

    try {
      await streamersApi.updateSort(orders);

      // 清除缓存，确保下次获取时从后端拉取最新数据
      requestCache.clear('streamers');

      setState({ loading: false });
    } catch (error) {
      handleError(error, '更新主播排序失败');
    }
  },

  /**
   * 导入主播
   * @param file 导入文件
   * @returns 导入结果
   */
  async importStreamers(file: File): Promise<StreamerImportResult> {
    setState({ loading: true, error: null });

    try {
      const result = await streamersImportApi.importStreamers(file);

      // 清除缓存，确保下次获取时从后端拉取最新数据
      requestCache.clear('streamers');

      setState({ loading: false });

      return result;
    } catch (error) {
      handleError(error, '导入主播失败');
    }
  },

  /**
   * 下载导入模板
   * @returns 模板文件 Blob
   */
  async downloadTemplate(): Promise<Blob> {
    setState({ loading: true, error: null });

    try {
      const blob = await streamersImportApi.downloadStreamerTemplate();
      setState({ loading: false });
      return blob;
    } catch (error) {
      handleError(error, '下载模板失败');
    }
  },

  /**
   * 下载错误报告
   * @param errors 错误列表
   * @returns 错误报告文件 Blob
   */
  async downloadErrorReport(errors: StreamerImportError[]): Promise<Blob> {
    setState({ loading: true, error: null });

    try {
      const blob = await streamersImportApi.downloadStreamerErrorReport(errors);
      setState({ loading: false });
      return blob;
    } catch (error) {
      handleError(error, '下载错误报告失败');
    }
  },

  /**
   * 获取当前服务状态
   * @returns 当前状态
   */
  getState(): StreamerServiceState {
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
      streamers: [],
      currentStreamer: null,
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
export function subscribeToStreamerService(
  callback: (state: StreamerServiceState) => void
): () => void {
  listeners.add(callback);
  callback(state); // 立即通知当前状态

  return () => {
    listeners.delete(callback);
  };
}

export default streamerService;
