import React, { useState, useCallback, useEffect } from 'react';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Modal from '../ui/Modal';

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
    <Card className="bg-white/5 border-white/10 hover:border-secondary/50 transition-all duration-300 hover:transform hover:-translate-y-2 group overflow-hidden">
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
                  驴酱主播
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
        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-secondary hover:bg-secondary/80"
            onClick={(e) => {
              e.stopPropagation();
              window.open(streamer.liveUrl, '_blank');
            }}
          >
            进入直播间
          </Button>
          <Button 
            variant="outline" 
            className="border-secondary text-secondary hover:bg-secondary/10"
            onClick={onClick}
          >
            详情
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// 主播详情模态框
const StreamerDetailModal: React.FC<{ 
  streamer: Streamer | null; 
  isOpen: boolean; 
  onClose: () => void 
}> = ({ streamer, isOpen, onClose }) => {
  if (!streamer) return null;

  return (
    <Modal visible={isOpen} onClose={onClose} title={streamer.nickname} className="max-w-2xl bg-gray-900 border-white/10 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 海报 */}
        <div className="relative rounded-lg overflow-hidden">
          <img 
            src={streamer.posterUrl} 
            alt={streamer.nickname} 
            className="w-full h-80 object-cover"
          />
          {/* 标签 */}
          <div className="absolute top-4 left-4 flex space-x-2">
            {streamer.isStar && (
                <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                  驴酱主播
                </span>
              )}
            {streamer.isGuest && (
              <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                嘉宾
              </span>
            )}
          </div>
        </div>
        
        {/* 详细信息 */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-300">个人简介</h3>
            <p className="text-gray-400">{streamer.bio}</p>
          </div>
          
          {streamer.level && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-300">等级</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                streamer.level === 'S' ? 'bg-yellow-500 text-black' :
                streamer.level === 'A' ? 'bg-blue-500 text-white' :
                streamer.level === 'B' ? 'bg-green-500 text-white' :
                streamer.level === 'C' ? 'bg-orange-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {streamer.level}
              </span>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-300">直播间</h3>
            <a 
              href={streamer.liveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-secondary hover:underline flex items-center"
            >
              {streamer.liveUrl}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-white/10">
        <Button 
          className="bg-secondary hover:bg-secondary/80"
          onClick={() => {
            window.open(streamer.liveUrl, '_blank');
          }}
        >
          进入直播间
        </Button>
        <Button 
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
          onClick={onClose}
        >
          关闭
        </Button>
      </div>
    </Modal>
  );
};

interface StreamerSectionProps {
  /** 自动刷新间隔（毫秒），默认 30000ms (30秒) */
  refreshInterval?: number;
}

const StreamerSection: React.FC<StreamerSectionProps> = ({ refreshInterval = 30000 }) => {
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'star' | 'guest'>('all');
  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleStreamerClick = (streamer: Streamer) => {
    setSelectedStreamer(streamer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStreamer(null);
  };

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
          明星主播
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
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            data-testid="streamers-grid"
          >
            {filteredStreamers.map(streamer => (
              <StreamerCard
                key={streamer.id}
                streamer={streamer}
                onClick={() => handleStreamerClick(streamer)}
              />
            ))}
          </div>
        )}

        {/* 刷新指示器 */}
        {loading && streamers.length > 0 && (
          <div className="mt-8 flex items-center justify-center space-x-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">更新中...</span>
          </div>
        )}

        {/* 主播详情模态框 */}
        <StreamerDetailModal
          streamer={selectedStreamer}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </section>
  );
};

export default StreamerSection;