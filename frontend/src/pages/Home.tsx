import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import HeroSection from '../components/features/HeroSection';
import ScheduleSection from '../components/features/ScheduleSection';
import TeamSection from '../components/features/TeamSection';
import { Button } from '../components/ui/button';
import { streamService, teamService, matchService, advancementService } from '../services';

/**
 * 首页数据加载状态
 */
interface HomeDataState {
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 各模块加载状态 */
  modules: {
    stream: boolean;
    teams: boolean;
    matches: boolean;
  };
}

/**
 * 全局错误提示组件
 */
const GlobalErrorToast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="fixed top-4 right-4 z-50 bg-red-500/90 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-in slide-in-from-top-2">
    <AlertCircle className="w-5 h-5" />
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 hover:bg-white/20 rounded p-1">
      ×
    </button>
  </div>
);

/**
 * 全局加载指示器
 */
const GlobalLoadingIndicator: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">数据更新中...</span>
    </div>
  );
};

/**
 * 手动刷新按钮
 */
const RefreshButton: React.FC<{ onRefresh: () => void; loading: boolean }> = ({ onRefresh, loading }) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onRefresh}
    disabled={loading}
    className="fixed bottom-4 left-4 z-50 bg-black/80 border-white/20 text-white hover:bg-white/10"
  >
    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
    {loading ? '刷新中...' : '刷新数据'}
  </Button>
);

/**
 * 首页组件
 * 
 * 功能：
 * 1. 整合 HeroSection、TeamSection、ScheduleSection 三大模块
 * 2. 统一管理数据自动刷新（默认 30 秒）
 * 3. 全局加载状态和错误处理
 * 4. 页面可见性检测，切换回页面时自动刷新
 * 5. 提供手动刷新功能
 */
const Home: React.FC = () => {
  // 数据刷新间隔（30秒）
  const REFRESH_INTERVAL = 30000;

  const [state, setState] = useState<HomeDataState>({
    loading: true,
    error: null,
    modules: {
      stream: true,
      teams: true,
      matches: true,
    },
  });

  const [showError, setShowError] = useState(false);

  /**
   * 更新加载状态
   */
  const updateLoadingState = useCallback((module: keyof HomeDataState['modules'], loading: boolean) => {
    setState(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [module]: loading,
      },
      loading: loading || Object.entries(prev.modules).some(([key, value]) => key !== module && value),
    }));
  }, []);

  /**
   * 加载所有数据
   */
  const loadAllData = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      // 并行加载所有数据
      await Promise.all([
        // 直播信息
        (async () => {
          updateLoadingState('stream', true);
          try {
            await streamService.get();
          } finally {
            updateLoadingState('stream', false);
          }
        })(),
        // 战队数据
        (async () => {
          updateLoadingState('teams', true);
          try {
            await teamService.getAll(1, 100);
          } finally {
            updateLoadingState('teams', false);
          }
        })(),
        // 比赛数据
        (async () => {
          updateLoadingState('matches', true);
          try {
            await matchService.getAll(1, 100);
          } finally {
            updateLoadingState('matches', false);
          }
        })(),
        // 晋级名单数据
        (async () => {
          if (isBackground) {
            advancementService.resetState();
          }
          await advancementService.get();
        })(),
      ]);

      setState(prev => ({ ...prev, error: null }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '数据加载失败';
      setState(prev => ({ ...prev, error: errorMessage }));
      setShowError(true);
      console.error('[Home] 数据加载失败:', err);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [updateLoadingState]);

  /**
   * 手动刷新
   */
  const handleManualRefresh = useCallback(() => {
    loadAllData(false);
  }, [loadAllData]);

  useEffect(() => {
    // 初始加载
    loadAllData(false);

    // 设置自动刷新
    const interval = setInterval(() => {
      loadAllData(true);
    }, REFRESH_INTERVAL);

    // 页面可见性检测：切换回页面时立即刷新
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadAllData(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理函数
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadAllData]);

  // 自动隐藏错误提示
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  return (
    <Layout>
      {/* 全局错误提示 */}
      {showError && state.error && (
        <GlobalErrorToast 
          message={state.error} 
          onClose={() => setShowError(false)} 
        />
      )}

      {/* 全局加载指示器 */}
      <GlobalLoadingIndicator visible={state.loading} />

      {/* 手动刷新按钮 */}
      <RefreshButton onRefresh={handleManualRefresh} loading={state.loading} />

      {/* 页面内容 */}
      <HeroSection refreshInterval={REFRESH_INTERVAL} />
      <TeamSection refreshInterval={REFRESH_INTERVAL} />
      <ScheduleSection refreshInterval={REFRESH_INTERVAL} />
    </Layout>
  );
};

export default Home;
