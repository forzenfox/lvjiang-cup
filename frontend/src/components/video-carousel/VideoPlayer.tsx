import React, { useEffect, useRef, useState } from 'react';
import { useVideoLoad } from './hooks/useVideoLoad';

export type VideoItem = {
  bvid: string;
  title: string;
  cover?: string;
};

interface VideoPlayerProps {
  video: VideoItem;
  autoplay?: boolean;
  muted?: boolean;
  isVisible?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  autoplay = false,
  muted = false,
  isVisible = true,
}) => {
  const { isLoading, isError, retry } = useVideoLoad(video.bvid);
  const [isInViewport, setIsInViewport] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用 Intersection Observer 监听视频是否可见
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // 当视频容器可见度超过 30% 时，才加载 iframe
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            setIsInViewport(true);
          } else {
            setIsInViewport(false);
          }
        });
      },
      {
        threshold: [0, 0.3, 0.5, 1],
        rootMargin: '0px',
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 当视频切换时，重置可见状态
  useEffect(() => {
    setIsInViewport(false);
    // 延迟检查新视频是否在视口中
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
        if (inViewport) {
          setIsInViewport(true);
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [video.bvid]);

  const src = `https://player.bilibili.com/player.html?bvid=${video.bvid}${autoplay ? '&autoplay=1' : ''}${muted ? '&muted=1' : ''}`;

  // 只有在视口内且轮播组件可见时才显示 iframe
  const shouldShowIframe = isInViewport && isVisible;

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center gap-4">
        <div className="text-red-400">视频加载失败</div>
        <button
          onClick={retry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          data-testid="retry-button"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      {shouldShowIframe ? (
        <iframe
          src={src}
          title="bilibili-player"
          className="w-full h-full border-0"
          allow="fullscreen"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          {video.cover ? (
            <img src={video.cover} alt={video.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">▶</div>
              <div>点击播放视频</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
