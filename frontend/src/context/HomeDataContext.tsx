import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { Stream, Team as ApiTeam, Streamer, VideoItem } from '@/api/types';
import { streamService } from '@/services/streamService';
import { teamService } from '@/services/teamService';
import { matchService } from '@/services/matchService';
import { getVideos } from '@/api/videos';
import { streamersApi } from '@/api/streamers';
import { requestCache } from '@/utils/requestCache';

/**
 * 首页统一数据 Context
 *
 * 功能：
 * 1. 按需加载：各模块首次调用 fetch 方法时才请求数据
 * 2. 数据共享：同一数据在页面内只请求一次，通过 Context 共享
 * 3. 智能刷新：refresh 方法强制重新请求指定模块数据
 * 4. 并发安全：多个组件同时调用同一 fetch 方法时，只请求一次
 */

type LoadingState = Record<'stream' | 'teams' | 'matches' | 'videos' | 'streamers', boolean>;

interface HomeDataContextValue {
  stream: Stream | null;
  teams: ApiTeam[];
  matches: unknown[];
  videos: VideoItem[];
  streamers: Streamer[];
  isLoading: LoadingState;
  fetchStream: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  fetchVideos: () => Promise<void>;
  fetchStreamers: () => Promise<void>;
  refresh: (module: string) => Promise<void>;
}

const HomeDataContext = createContext<HomeDataContextValue | null>(null);

export const useHomeData = () => {
  const context = useContext(HomeDataContext);
  if (!context) {
    throw new Error('useHomeData must be used within HomeDataProvider');
  }
  return context;
};

interface HomeDataProviderProps {
  children: React.ReactNode;
}

export const HomeDataProvider: React.FC<HomeDataProviderProps> = ({ children }) => {
  const [stream, setStream] = useState<Stream | null>(null);
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [matches, setMatches] = useState<unknown[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [isLoading, setIsLoading] = useState<LoadingState>({
    stream: false,
    teams: false,
    matches: false,
    videos: false,
    streamers: false,
  });

  // 追踪是否已请求过，避免重复请求
  const hasFetched = useRef<Record<string, boolean>>({
    stream: false,
    teams: false,
    matches: false,
    videos: false,
    streamers: false,
  });

  // 追踪正在进行的请求，防止并发重复
  const pendingRequests = useRef<Record<string, Promise<void> | null>>({
    stream: null,
    teams: null,
    matches: null,
    videos: null,
    streamers: null,
  });

  const setLoading = useCallback((key: keyof LoadingState, value: boolean) => {
    setIsLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const fetchStream = useCallback(async () => {
    if (hasFetched.current.stream) return;
    if (pendingRequests.current.stream) {
      await pendingRequests.current.stream;
      return;
    }

    setLoading('stream', true);
    const promise = streamService
      .get()
      .then(data => {
        setStream(data);
      })
      .catch(error => {
        console.error('获取直播数据失败:', error);
      })
      .finally(() => {
        hasFetched.current.stream = true;
        setLoading('stream', false);
        pendingRequests.current.stream = null;
      });

    pendingRequests.current.stream = promise;
    await promise;
  }, [setLoading]);

  const fetchTeams = useCallback(async () => {
    if (hasFetched.current.teams) return;
    if (pendingRequests.current.teams) {
      await pendingRequests.current.teams;
      return;
    }

    setLoading('teams', true);
    const promise = teamService
      .getAll()
      .then(data => {
        setTeams(data);
      })
      .catch(error => {
        console.error('获取战队数据失败:', error);
      })
      .finally(() => {
        hasFetched.current.teams = true;
        setLoading('teams', false);
        pendingRequests.current.teams = null;
      });

    pendingRequests.current.teams = promise;
    await promise;
  }, [setLoading]);

  const fetchMatches = useCallback(async () => {
    // 如果请求正在进行中，等待该请求完成
    if (pendingRequests.current.matches) {
      await pendingRequests.current.matches;
      return;
    }

    setLoading('matches', true);
    const promise = matchService
      .getAll()
      .then(data => {
        setMatches(data);
      })
      .catch(error => {
        console.error('获取比赛数据失败:', error);
      })
      .finally(() => {
        setLoading('matches', false);
        pendingRequests.current.matches = null;
      });

    pendingRequests.current.matches = promise;
    await promise;
  }, [setLoading]);

  const fetchVideos = useCallback(async () => {
    if (hasFetched.current.videos) return;
    if (pendingRequests.current.videos) {
      await pendingRequests.current.videos;
      return;
    }

    setLoading('videos', true);
    const promise = getVideos({ isEnabled: true })
      .then(data => {
        const videoList = data.list || [];
        const videoItems: VideoItem[] = videoList.map(v => ({
          id: v.id,
          title: v.title,
          bvid: v.bvid,
          page: 1,
          coverUrl: v.coverUrl,
        }));
        setVideos(videoItems);
      })
      .catch(error => {
        console.error('获取视频数据失败:', error);
      })
      .finally(() => {
        hasFetched.current.videos = true;
        setLoading('videos', false);
        pendingRequests.current.videos = null;
      });

    pendingRequests.current.videos = promise;
    await promise;
  }, [setLoading]);

  const fetchStreamers = useCallback(async () => {
    if (hasFetched.current.streamers) return;
    if (pendingRequests.current.streamers) {
      await pendingRequests.current.streamers;
      return;
    }

    setLoading('streamers', true);
    const promise = streamersApi
      .getAll()
      .then(data => {
        setStreamers(data);
      })
      .catch(error => {
        console.error('获取主播数据失败:', error);
      })
      .finally(() => {
        hasFetched.current.streamers = true;
        setLoading('streamers', false);
        pendingRequests.current.streamers = null;
      });

    pendingRequests.current.streamers = promise;
    await promise;
  }, [setLoading]);

  const refresh = useCallback(
    async (module: string) => {
      hasFetched.current[module] = false;
      pendingRequests.current[module] = null;
      requestCache.clear(module);

      const fetchMap: Record<string, () => Promise<void>> = {
        stream: fetchStream,
        teams: fetchTeams,
        matches: fetchMatches,
        videos: fetchVideos,
        streamers: fetchStreamers,
      };

      const fetchFn = fetchMap[module];
      if (fetchFn) {
        await fetchFn();
      }
    },
    [fetchStream, fetchTeams, fetchMatches, fetchVideos, fetchStreamers]
  );

  return (
    <HomeDataContext.Provider
      value={{
        stream,
        teams,
        matches,
        videos,
        streamers,
        isLoading,
        fetchStream,
        fetchTeams,
        fetchMatches,
        fetchVideos,
        fetchStreamers,
        refresh,
      }}
    >
      {children}
    </HomeDataContext.Provider>
  );
};

export default HomeDataContext;
