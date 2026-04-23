import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoplayOptions {
  enabled: boolean;
  onAutoplay: () => void;
  videoCount: number;
  isMobile: boolean;
  onVisibilityChange?: (isVisible: boolean) => void;
}

interface UseAutoplayResult {
  pause: () => void;
  resume: () => void;
  isActive: boolean;
}

const AUTOPLAY_INTERVAL = 5000; // 5秒自动切换

export const useAutoplay = ({
  enabled,
  onAutoplay,
  videoCount,
  isMobile,
  onVisibilityChange,
}: UseAutoplayOptions): UseAutoplayResult => {
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLElement | null>(null);

  // 清除定时器
  const clearAutoplayInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 开始自动切换
  const startAutoplay = useCallback(() => {
    if (!enabled || videoCount <= 1 || isMobile) return;
    
    clearAutoplayInterval();
    intervalRef.current = setInterval(() => {
      onAutoplay();
    }, AUTOPLAY_INTERVAL);
    setIsActive(true);
  }, [enabled, videoCount, isMobile, onAutoplay, clearAutoplayInterval]);

  // 暂停自动切换
  const pause = useCallback(() => {
    clearAutoplayInterval();
    setIsActive(false);
  }, [clearAutoplayInterval]);

  // 恢复自动切换
  const resume = useCallback(() => {
    if (enabled && videoCount > 1 && !isMobile) {
      startAutoplay();
    }
  }, [enabled, videoCount, isMobile, startAutoplay]);

  // 使用 Intersection Observer 监听视频模块是否可见
  useEffect(() => {
    if (!enabled || isMobile) return;

    // 查找视频轮播组件的 DOM 元素
    const findCarouselElement = () => {
      const element = document.querySelector('[data-testid="video-carousel"]') as HTMLElement;
      if (element) {
        carouselRef.current = element;
        return element;
      }
      return null;
    };

    const element = findCarouselElement();
    if (!element) return;

    // 创建 Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // 当视频模块可见度超过50%时，开始自动切换
            startAutoplay();
            onVisibilityChange?.(true);
          } else {
            // 当视频模块不可见或可见度低于50%时，暂停自动切换
            pause();
            onVisibilityChange?.(false);
          }
        });
      },
      {
        threshold: [0, 0.5, 1], // 监听 0%, 50%, 100% 可见度
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      clearAutoplayInterval();
    };
  }, [enabled, isMobile, startAutoplay, pause, clearAutoplayInterval, onVisibilityChange]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearAutoplayInterval();
    };
  }, [clearAutoplayInterval]);

  return { pause, resume, isActive };
};
