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
          // 当视频容器可见度超过 10% 时，加载 iframe
          // 降低阈值以确保视频能够更快加载
          if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
            setIsInViewport(true);
          }
          // 只有在完全不在视口内时才隐藏 iframe
          else if (!entry.isIntersecting) {
            setIsInViewport(false);
          }
        });
      },
      {
        threshold: [0, 0.1, 0.3, 0.5, 1],
        rootMargin: '50px',
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 当视频切换时，检查新视频是否在视口中
  useEffect(() => {
    // 使用 requestAnimationFrame 确保 DOM 已更新
    const checkViewport = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // 降低阈值：只要容器有一部分在视口内（考虑 rootMargin）就显示
        const inViewport = rect.top < windowHeight + 100 && rect.bottom > -100;
        if (inViewport) {
          setIsInViewport(true);
        } else {
          setIsInViewport(false);
        }
      }
    };

    // 立即检查一次
    checkViewport();

    // 延迟再次检查，确保布局稳定
    const timer = setTimeout(checkViewport, 150);
    return () => clearTimeout(timer);
  }, [video.bvid]);

  // 明确设置 autoplay=0 以确保视频默认不自动播放
  const src = `https://player.bilibili.com/player.html?bvid=${video.bvid}&autoplay=${autoplay ? '1' : '0'}${muted ? '&muted=1' : ''}`;

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
