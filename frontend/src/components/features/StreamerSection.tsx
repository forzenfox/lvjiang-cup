import React, { useState, useCallback, useEffect } from 'react';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// 隐藏滚动条的样式
const styles = `
  #streamers-scroll::-webkit-scrollbar {
    display: none;
  }
`;

// 扩展Window接口，添加APP_CONFIG类型
declare global {
  interface Window {
    APP_CONFIG: {
      API_BASE_URL: string;
      APP_NAME: string;
      VERSION: string;
      STREAMERS: Streamer[];
    };
  }
}

// 主播类型定义
interface Streamer {
  id: string;
  nickname: string;
  avatarUrl: string;
  posterUrl: string;
  bio: string;
  liveUrl: string;
  isStar: boolean;
  isGuest: boolean;
  teamId?: string;
  gameId?: string;
  level?: string;
}

// 从配置文件获取主播数据
const getStreamersFromConfig = (): Streamer[] => {
  // 检查window.APP_CONFIG是否存在
  if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.STREAMERS) {
    return window.APP_CONFIG.STREAMERS;
  }
  //  fallback 数据
  return [];
};

// 骨架屏组件
const StreamerCardSkeleton: React.FC = () => (
  <Card className="bg-white/5 border-white/10 overflow-hidden">
    <div className="h-64 bg-gradient-to-br from-blue-900/30 to-purple-900/30 relative">
      <div className="w-full h-full bg-white/10 animate-pulse" />
    </div>
    <CardHeader>
      <div className="h-6 w-3/4 mx-auto bg-white/10 rounded animate-pulse" />
      <div className="h-4 w-1/2 mx-auto bg-white/10 rounded animate-pulse mt-2" />
    </CardHeader>
    <CardContent>
      <div className="h-12 bg-white/10 rounded animate-pulse mb-4" />
      <div className="flex space-x-2">
        <div className="flex-1 h-10 bg-white/10 rounded animate-pulse" />
        <div className="w-20 h-10 bg-white/10 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

// 空数据状态组件
const EmptyState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20">
    <div className="w-16 h-16 text-gray-500 mb-4 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4a2 2 0 0 0-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
        <path d="M12 11v6" />
        <path d="M9 14h6" />
      </svg>
    </div>
    <p className="text-xl text-gray-400 mb-2">暂无主播数据</p>
    <p className="text-sm text-gray-500 mb-6">当前没有可用的主播信息</p>
    <Button
      variant="outline"
      onClick={onRetry}
      className="border-secondary text-secondary hover:bg-secondary/10"
    >
      刷新数据
    </Button>
  </div>
);

// 错误状态组件
const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20">
    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
    <p className="text-xl text-red-400 mb-2">加载失败</p>
    <p className="text-sm text-gray-400 mb-6">{message}</p>
    <Button
      variant="outline"
      onClick={onRetry}
      className="border-red-400 text-red-400 hover:bg-red-400/10"
    >
      重试
    </Button>
  </div>
);

// 主播卡片组件
const StreamerCard: React.FC<{ streamer: Streamer; onClick: () => void }> = ({ streamer, onClick }) => {
  return (
    <Card className="bg-white/5 border-white/10 hover:border-secondary/50 transition-all duration-300 hover:transform hover:-translate-y-2 group overflow-hidden cursor-pointer" onClick={onClick}>
      {/* 海报区域 */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={streamer.posterUrl} 
          alt={streamer.nickname} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* 标签 */}
        <div className="absolute top-4 left-4 flex space-x-2">
          {streamer.isStar && (
                <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                  驴酱
                </span>
              )}
          {streamer.isGuest && (
            <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              嘉宾
            </span>
          )}
        </div>
      </div>
      
      {/* 信息区域 */}
      <CardHeader>
        <CardTitle className="text-xl text-center text-secondary group-hover:text-white transition-colors">
          {streamer.nickname}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {streamer.bio}
        </p>
        <Button 
          className="w-full bg-secondary hover:bg-secondary/80"
          onClick={(e) => {
            e.stopPropagation();
            window.open(streamer.liveUrl, '_blank');
          }}
        >
          进入直播间
        </Button>
      </CardContent>
    </Card>
  );
};



interface StreamerSectionProps {
  /** 自动刷新间隔（毫秒），默认 30000ms (30秒) */
  refreshInterval?: number;
}

const StreamerSection: React.FC<StreamerSectionProps> = ({ refreshInterval = 30000 }) => {
  // 注入隐藏滚动条的样式
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'star' | 'guest'>('all');

  // 获取主播数据
  const fetchStreamers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 从配置文件获取数据
      const streamersFromConfig = getStreamersFromConfig();
      if (streamersFromConfig.length > 0) {
        setStreamers(streamersFromConfig);
      } else {
        setError('配置文件中没有主播数据');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取主播数据失败';
      setError(errorMessage);
      console.error('[StreamerSection] 获取主播数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 初始加载
    fetchStreamers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 设置自动刷新
    const interval = setInterval(() => {
      fetchStreamers();
    }, refreshInterval);

    // 页面可见性检测：切换回页面时立即刷新
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStreamers();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理函数
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshInterval, fetchStreamers]);

  // 过滤主播列表
  const filteredStreamers = streamers.filter(streamer => {
    if (activeTab === 'all') return true;
    if (activeTab === 'star') return streamer.isStar;
    if (activeTab === 'guest') return streamer.isGuest;
    return true;
  });

  return (
    <section
      id="streamers"
      className="min-h-screen py-20 bg-gradient-to-b from-background to-black relative"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white uppercase tracking-wider">
          主播阵容
        </h2>

        {/* 标签切换 */}
        <div className="flex justify-center mb-12">
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'all' | 'star' | 'guest')}
          >
            <TabsList className="bg-gray-800/50">
              <TabsTrigger value="all">全部主播</TabsTrigger>
              <TabsTrigger value="star">驴酱主播</TabsTrigger>
              <TabsTrigger value="guest">嘉宾主播</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 加载骨架屏 */}
        {loading && streamers.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <StreamerCardSkeleton key={i} />
            ))}
          </div>
        ) : error && streamers.length === 0 ? (
          /* 错误状态 */
          <div className="grid grid-cols-1">
            <ErrorState message={error} onRetry={fetchStreamers} />
          </div>
        ) : streamers.length === 0 ? (
          /* 空数据状态 */
          <div className="grid grid-cols-1">
            <EmptyState onRetry={fetchStreamers} />
          </div>
        ) : (
          /* 正常数据展示 */
          <div className="relative">
            {/* 滚动指示器 */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button 
                className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-full"
                onClick={() => document.getElementById('streamers-scroll')?.scrollBy({ left: -300, behavior: 'smooth' })}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <button 
                className="bg-black/50 hover:bg-black/80 text-white p-2 rounded-full"
                onClick={() => document.getElementById('streamers-scroll')?.scrollBy({ left: 300, behavior: 'smooth' })}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
            
            {/* 水平滚动卡片 */}
            <div 
              id="streamers-scroll"
              className="flex space-x-6 overflow-x-auto pb-8 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              data-testid="streamers-grid"
            >
              {filteredStreamers.map(streamer => (
                <div key={streamer.id} className="flex-shrink-0 w-80 snap-center">
                  <StreamerCard
                    streamer={streamer}
                    onClick={() => window.open(streamer.liveUrl, '_blank')}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 刷新指示器 */}
        {loading && streamers.length > 0 && (
          <div className="mt-8 flex items-center justify-center space-x-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">更新中...</span>
          </div>
        )}


      </div>
    </section>
  );
};

export default StreamerSection;