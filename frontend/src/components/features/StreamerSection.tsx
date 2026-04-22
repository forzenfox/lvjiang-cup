import React, { useState, useCallback, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { streamersApi } from '@/api/streamers';
import { type Streamer, StreamerType } from '@/api/types';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { StreamerMainCard } from './streamer-section/StreamerMainCard';
import { StreamerThumbnailCard } from './streamer-section/StreamerThumbnailCard';
import { StreamerIndicator } from './streamer-section/StreamerIndicator';
import { StreamerControlArrows } from './streamer-section/StreamerControlArrows';
import { useStreamerAutoplay, useStreamerSwipe } from './streamer-section/hooks';
import './streamer-section/styles.css';

const StreamerCardSkeleton: React.FC = () => (
  <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden animate-pulse">
    <div className="aspect-video bg-white/10" />
    <div className="p-6">
      <div className="h-8 w-3/4 mx-auto bg-white/10 rounded mb-4" />
      <div className="h-20 bg-white/10 rounded mb-4" />
      <div className="h-12 bg-white/10 rounded" />
    </div>
  </div>
);

const EmptyState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20">
    <div className="w-16 h-16 text-gray-500 mb-4 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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

interface StreamerSectionProps {
  refreshInterval?: number;
}

const StreamerSection: React.FC<StreamerSectionProps> = ({ refreshInterval = 30000 }) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isPC = useMediaQuery('(min-width: 1024px)');

  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'internal' | 'guest'>('internal');
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchStreamers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await streamersApi.getAll();
      setStreamers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取主播数据失败';
      setError(errorMessage);
      console.error('[StreamerSection] 获取主播数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreamers();
  }, [fetchStreamers]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStreamers();
    }, refreshInterval);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStreamers();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshInterval, fetchStreamers]);

  const filteredStreamers = streamers.filter(streamer => {
    if (activeTab === 'internal') return streamer.streamerType === StreamerType.INTERNAL;
    if (activeTab === 'guest') return streamer.streamerType === StreamerType.GUEST;
    return true;
  });

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % filteredStreamers.length);
  }, [filteredStreamers.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + filteredStreamers.length) % filteredStreamers.length);
  }, [filteredStreamers.length]);

  const { pause: pauseAutoplay } = useStreamerAutoplay({
    enabled: isPC && filteredStreamers.length > 2,
    onNext: goToNext,
    streamerCount: filteredStreamers.length,
    isMobile,
    interval: 6000,
    pauseDuration: 30000,
  });

  const handleUserInteraction = useCallback(() => {
    pauseAutoplay();
  }, [pauseAutoplay]);

  const { onTouchStart, onTouchEnd } = useStreamerSwipe({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrev,
    threshold: 50,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    const carouselElement = document.querySelector('[data-testid="streamer-carousel"]');
    if (carouselElement) {
      carouselElement.addEventListener('keydown', handleKeyDown);
      return () => carouselElement.removeEventListener('keydown', handleKeyDown);
    }
  }, [goToNext, goToPrev]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  const getPrevIndex = () =>
    (currentIndex - 1 + filteredStreamers.length) % filteredStreamers.length;
  const getNextIndex = () => (currentIndex + 1) % filteredStreamers.length;

  const showControls = filteredStreamers.length > 2;

  return (
    <section
      id="streamers"
      className="min-h-screen flex flex-col bg-gradient-to-b from-background via-[#0f1420] to-black relative"
    >
      <div className="container mx-auto px-6 flex-1 flex flex-col justify-center min-h-0 py-16">
        <div className="flex justify-center mb-12">
          <Tabs
            defaultValue="internal"
            value={activeTab}
            onValueChange={value => setActiveTab(value as 'internal' | 'guest')}
          >
            <TabsList className="bg-gray-800/50 gap-2 p-1.5">
              <TabsTrigger value="internal">驴酱主播</TabsTrigger>
              <TabsTrigger value="guest">嘉宾主播</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading && streamers.length === 0 ? (
          <div className="max-w-4xl mx-auto w-full">
            <StreamerCardSkeleton />
          </div>
        ) : error && streamers.length === 0 ? (
          <ErrorState message={error} onRetry={fetchStreamers} />
        ) : filteredStreamers.length === 0 ? (
          <EmptyState onRetry={fetchStreamers} />
        ) : (
          <div
            className="streamer-carousel"
            data-testid="streamer-carousel"
            onMouseDown={handleUserInteraction}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {isMobile ? (
              <div className="flex flex-col">
                <div className="w-full">
                  <StreamerMainCard streamer={filteredStreamers[currentIndex]} />
                </div>
                <StreamerIndicator
                  streamers={filteredStreamers}
                  currentIndex={currentIndex}
                  onSelect={setCurrentIndex}
                />
              </div>
            ) : (
              <div className="carousel-container relative">
                {showControls && (
                  <div className="thumbnail-section">
                    <StreamerThumbnailCard
                      streamer={filteredStreamers[getPrevIndex()]}
                      onClick={() => {
                        setCurrentIndex(getPrevIndex());
                        handleUserInteraction();
                      }}
                    />
                  </div>
                )}

                <div className={`main-section ${showControls ? '' : 'max-w-2xl mx-auto'}`}>
                  <div className="main-card-container">
                    <StreamerMainCard streamer={filteredStreamers[currentIndex]} />
                  </div>
                  {showControls && (
                    <StreamerControlArrows
                      onPrev={() => {
                        goToPrev();
                        handleUserInteraction();
                      }}
                      onNext={() => {
                        goToNext();
                        handleUserInteraction();
                      }}
                      canPrev={filteredStreamers.length > 1}
                      canNext={filteredStreamers.length > 1}
                    />
                  )}
                </div>

                {showControls && (
                  <div className="thumbnail-section">
                    <StreamerThumbnailCard
                      streamer={filteredStreamers[getNextIndex()]}
                      onClick={() => {
                        setCurrentIndex(getNextIndex());
                        handleUserInteraction();
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <StreamerIndicator
              streamers={filteredStreamers}
              currentIndex={currentIndex}
              onSelect={setCurrentIndex}
            />
          </div>
        )}

        {loading && streamers.length > 0 && (
          <div className="mt-10 flex items-center justify-center space-x-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">更新中...</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default StreamerSection;
