import { useState, useEffect } from 'react';

/**
 * 桌面端默认滚动速度（像素/秒）
 */
const DESKTOP_SPEED = 130;

/**
 * 移动端默认滚动速度（像素/秒）
 */
const MOBILE_SPEED = 80;

/**
 * 动画时长最小值（秒）
 */
const MIN_DURATION = 15;

/**
 * 默认动画时长（秒）
 */
const DEFAULT_DURATION = 30;

/**
 * 响应式断点（像素）
 */
const BREAKPOINT = 768;

interface UseMarqueeDurationOptions {
  /**
   * 内容元素引用（包含两份重复内容）
   */
  contentRef: React.RefObject<HTMLDivElement | null>;
  /**
   * 容器元素引用
   */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * 计算 Marquee 滚动动画时长的 Hook
 *
 * 基于固定速度计算，确保不同内容长度下滚动速度一致：
 * - 桌面端（>=768px）：130px/s
 * - 移动端（<768px）：80px/s
 *
 * 计算结果限制最小值为 15 秒，无最大值限制
 *
 * @param options - 配置选项
 * @returns 动画时长（秒）
 */
export function useMarqueeDuration({
  contentRef,
  containerRef,
}: UseMarqueeDurationOptions): number {
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  useEffect(() => {
    /**
     * 根据内容宽度和视口大小计算动画时长
     */
    const calculateDuration = () => {
      if (!contentRef.current || !containerRef.current) {
        return;
      }

      // scrollWidth 包含两份重复内容，所以除以 2 得到单份宽度
      const contentWidth = contentRef.current.scrollWidth / 2;
      const speed = window.innerWidth >= BREAKPOINT ? DESKTOP_SPEED : MOBILE_SPEED;
      const newDuration = contentWidth / speed;

      // 限制在合理范围内（只设置最小值，不限制最大值）
      setDuration(Math.max(newDuration, MIN_DURATION));
    };

    calculateDuration();

    window.addEventListener('resize', calculateDuration);

    return () => {
      window.removeEventListener('resize', calculateDuration);
    };
  }, [contentRef, containerRef]);

  return duration;
}
