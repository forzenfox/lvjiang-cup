import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StartBox } from '@/components/features/StartBox';
import { ZIndexLayers } from '@/constants/zIndex';

vi.mock('@/components/features/StartBox/BackgroundCarousel', () => ({
  BackgroundCarousel: ({ isExiting, onError }: { isExiting: boolean; onError: () => void }) => (
    <div data-testid="background-carousel" data-exiting={isExiting}>
      BackgroundCarousel
    </div>
  ),
}));

vi.mock('@/components/features/StartBox/ScrollTip', () => ({
  ScrollTip: ({ isExiting }: { isExiting: boolean }) => (
    <div data-testid="scroll-tip" data-exiting={isExiting}>
      ScrollTip
    </div>
  ),
}));

vi.mock('@/hooks/useMediaQuery', () => ({
  useIsMobile: () => false,
}));

describe('StartBox 组件', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  describe('渲染封面容器', () => {
    it('应该渲染封面容器', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
      });

      const { container } = render(<StartBox />);

      const coverElement = container.querySelector(`[style*="z-index: ${ZIndexLayers.COVER}"]`);
      expect(coverElement).toBeInTheDocument();
    });
  });

  describe('管理员路径不渲染', () => {
    it('/admin/* 路径不显示封面', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/dashboard' },
        writable: true,
      });

      const { container } = render(<StartBox />);

      const coverElement = container.querySelector(`[style*="z-index: ${ZIndexLayers.COVER}"]`);
      expect(coverElement).not.toBeInTheDocument();
    });

    it('/admin/login 路径不显示封面', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/login' },
        writable: true,
      });

      const { container } = render(<StartBox />);

      const coverElement = container.querySelector(`[style*="z-index: ${ZIndexLayers.COVER}"]`);
      expect(coverElement).not.toBeInTheDocument();
    });
  });

  describe('滚动交互', () => {
    it('向上滚动不应该触发退出', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
      });

      const onExit = vi.fn();
      render(<StartBox onExit={onExit} />);

      const wheelEvent = new WheelEvent('wheel', { deltaY: -100, bubbles: true });
      window.dispatchEvent(wheelEvent);

      expect(onExit).not.toHaveBeenCalled();
    });
  });

  describe('触摸滑动交互', () => {
    it('向上滑动不应该触发退出', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
      });

      const onExit = vi.fn();
      render(<StartBox onExit={onExit} />);

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientY: 100 } as Touch],
        bubbles: true,
      });
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientY: 200 } as Touch],
        bubbles: true,
      });

      window.dispatchEvent(touchStartEvent);
      window.dispatchEvent(touchMoveEvent);

      expect(onExit).not.toHaveBeenCalled();
    });

    it('滑动距离小于50不应该触发退出', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
      });

      const onExit = vi.fn();
      render(<StartBox onExit={onExit} />);

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientY: 100 } as Touch],
        bubbles: true,
      });
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientY: 70 } as Touch],
        bubbles: true,
      });

      window.dispatchEvent(touchStartEvent);
      window.dispatchEvent(touchMoveEvent);

      expect(onExit).not.toHaveBeenCalled();
    });
  });

  describe('刷新后重新显示', () => {
    it('组件每次渲染时都是可见状态', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
      });

      const { container } = render(<StartBox />);

      const coverElement = container.querySelector(`[style*="z-index: ${ZIndexLayers.COVER}"]`);
      expect(coverElement).toBeInTheDocument();
    });
  });
});
