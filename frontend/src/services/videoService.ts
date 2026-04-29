import * as videoApi from '@/api/videos';
import type {
  Video,
  CreateVideoRequest,
  UpdateVideoRequest,
  GetVideosParams,
  PaginatedVideoData,
} from '@/api/videos';
import { requestCache } from '@/utils/requestCache';

/**
 * 视频服务状态接口
 */
export interface VideoServiceState {
  /** 视频列表 */
  videos: Video[];
  /** 当前选中的视频 */
  currentVideo: Video | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 视频服务接口
 */
interface VideoService {
  /** 前台获取视频列表 */
  getVideos: (params?: GetVideosParams) => Promise<PaginatedVideoData>;
  /** 管理后台获取视频列表 */
  getAdminVideos: () => Promise<Video[]>;
  /** 根据 ID 获取视频 */
  getVideo: (id: string) => Promise<Video>;
  /** 创建视频 */
  createVideo: (data: CreateVideoRequest) => Promise<Video>;
  /** 更新视频 */
  updateVideo: (data: UpdateVideoRequest) => Promise<Video>;
  /** 删除视频 */
  deleteVideo: (id: string) => Promise<void>;
  /** 切换启用状态 */
  toggleEnabled: (id: string, isEnabled: boolean) => Promise<Video>;
  /** 视频排序 */
  reorderVideos: (orderedIds: string[]) => Promise<void>;
  /** 获取服务状态 */
  getState: () => VideoServiceState;
  /** 清除错误 */
  clearError: () => void;
  /** 重置状态 */
  resetState: () => void;
}

/**
 * 服务状态（内部状态管理）
 */
let state: VideoServiceState = {
  videos: [],
  currentVideo: null,
  loading: false,
  error: null,
};

/**
 * 状态监听器集合
 */
const listeners: Set<(state: VideoServiceState) => void> = new Set();

/**
 * 更新状态并通知监听器
 */
function setState(newState: Partial<VideoServiceState>): void {
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
 * 视频数据服务
 *
 * 提供完整的视频 CRUD 操作，包含状态管理和错误处理
 *
 * @example
 * ```ts
 * // 前台获取视频列表
 * const result = await videoService.getVideos({ page: 1, pageSize: 10 });
 *
 * // 管理后台获取视频列表
 * const adminVideos = await videoService.getAdminVideos();
 *
 * // 创建视频
 * const newVideo = await videoService.createVideo({
 *   url: 'https://www.bilibili.com/video/BV1xx411c7mD',
 *   customTitle: '自定义标题',
 * });
 *
 * // 更新视频
 * await videoService.updateVideo({ id: 'video1', customTitle: '更新后的标题' });
 *
 * // 删除视频
 * await videoService.deleteVideo('video1');
 *
 * // 切换启用状态
 * await videoService.toggleEnabled('video1', false);
 *
 * // 视频排序
 * await videoService.reorderVideos(['video2', 'video1']);
 * ```
 */
export const videoService: VideoService = {
  /**
   * 前台获取视频列表
   * @param params 查询参数
   * @returns 分页视频数据
   */
  async getVideos(params?: GetVideosParams): Promise<PaginatedVideoData> {
    setState({ loading: true, error: null });

    try {
      const data = await videoApi.getVideos(params);

      setState({
        videos: data.list,
        loading: false,
      });

      return data;
    } catch (error) {
      handleError(error, '获取视频列表失败');
    }
  },

  /**
   * 管理后台获取视频列表（不使用前端缓存）
   * @returns 视频列表
   */
  async getAdminVideos(): Promise<Video[]> {
    setState({ loading: true, error: null });

    try {
      const videos = await videoApi.getAdminVideos();

      setState({
        videos,
        loading: false,
      });

      return videos;
    } catch (error) {
      handleError(error, '获取视频列表失败');
    }
  },

  /**
   * 根据 ID 获取视频
   * @param id 视频 ID
   * @returns 视频信息
   */
  async getVideo(id: string): Promise<Video> {
    setState({ loading: true, error: null });

    try {
      const video = await videoApi.getVideo(id);

      setState({
        currentVideo: video,
        loading: false,
      });

      return video;
    } catch (error) {
      handleError(error, `获取视频 ${id} 信息失败`);
    }
  },

  /**
   * 创建视频
   * @param data 创建视频数据
   * @returns 创建的视频信息
   */
  async createVideo(data: CreateVideoRequest): Promise<Video> {
    setState({ loading: true, error: null });

    try {
      const video = await videoApi.createVideo(data);

      // 清除缓存，确保下次获取时从后端拉取最新数据
      requestCache.clear('videos');

      // 更新本地列表
      setState({
        videos: [...state.videos, video],
        loading: false,
      });

      return video;
    } catch (error) {
      handleError(error, '创建视频失败');
    }
  },

  /**
   * 更新视频
   * @param data 更新视频数据
   * @returns 更新后的视频信息
   */
  async updateVideo(data: UpdateVideoRequest): Promise<Video> {
    setState({ loading: true, error: null });

    try {
      const video = await videoApi.updateVideo(data);

      // 清除缓存，确保下次获取时从后端拉取最新数据
      requestCache.clear('videos');

      // 更新本地列表中的视频
      setState({
        videos: state.videos.map(v => (v.id === video.id ? video : v)),
        currentVideo: state.currentVideo?.id === video.id ? video : state.currentVideo,
        loading: false,
      });

      return video;
    } catch (error) {
      handleError(error, '更新视频失败');
    }
  },

  /**
   * 删除视频
   * @param id 视频 ID
   */
  async deleteVideo(id: string): Promise<void> {
    setState({ loading: true, error: null });

    try {
      await videoApi.deleteVideo(id);

      // 清除缓存，确保下次获取时从后端拉取最新数据
      requestCache.clear('videos');

      // 从本地列表中移除
      setState({
        videos: state.videos.filter(v => v.id !== id),
        currentVideo: state.currentVideo?.id === id ? null : state.currentVideo,
        loading: false,
      });
    } catch (error) {
      handleError(error, '删除视频失败');
    }
  },

  /**
   * 切换视频启用状态
   * @param id 视频 ID
   * @param isEnabled 是否启用
   * @returns 更新后的视频信息
   */
  async toggleEnabled(id: string, isEnabled: boolean): Promise<Video> {
    setState({ loading: true, error: null });

    try {
      const video = await videoApi.toggleVideoEnabled(id, isEnabled);

      // 清除缓存，确保下次获取时从后端拉取最新数据
      requestCache.clear('videos');

      // 更新本地列表中的视频
      setState({
        videos: state.videos.map(v => (v.id === video.id ? video : v)),
        currentVideo: state.currentVideo?.id === video.id ? video : state.currentVideo,
        loading: false,
      });

      return video;
    } catch (error) {
      handleError(error, '切换视频状态失败');
    }
  },

  /**
   * 视频排序
   * @param orderedIds 排序后的视频 ID 列表
   */
  async reorderVideos(orderedIds: string[]): Promise<void> {
    setState({ loading: true, error: null });

    try {
      await videoApi.reorderVideos(orderedIds);

      // 清除缓存，确保下次获取时从后端拉取最新数据
      requestCache.clear('videos');

      setState({
        loading: false,
      });
    } catch (error) {
      handleError(error, '排序视频失败');
    }
  },

  /**
   * 获取当前服务状态
   * @returns 当前状态
   */
  getState(): VideoServiceState {
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
      videos: [],
      currentVideo: null,
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
export function subscribeToVideoService(callback: (state: VideoServiceState) => void): () => void {
  listeners.add(callback);
  callback(state); // 立即通知当前状态

  return () => {
    listeners.delete(callback);
  };
}

export default videoService;
