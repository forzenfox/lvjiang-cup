import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { BackgroundCarousel } from '@/components/features/StartBox/BackgroundCarousel';

describe('BackgroundCarousel 组件', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('C-01: 渲染当前背景图', () => {
    it('应该渲染背景图片', () => {
      render(<BackgroundCarousel isExiting={false} />);

      const carouselElement = document.querySelector('.background-carousel');
      expect(carouselElement).toBeInTheDocument();
    });
  });

  describe('C-02: 3秒自动切换', () => {
    it('应该设置3秒的轮播间隔', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');

      render(<BackgroundCarousel isExiting={false} />);

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        3000
      );
    });
  });

  describe('C-04: 退出时向上滑出', () => {
    it('isExiting=true 时添加滑出动画类', () => {
      const { container } = render(<BackgroundCarousel isExiting={true} />);

      const carouselElement = container.querySelector('.background-carousel');
      expect(carouselElement?.className).toContain('exiting');
    });

    it('isExiting=false 时不添加滑出动画类', () => {
      const { container } = render(<BackgroundCarousel isExiting={false} />);

      const carouselElement = container.querySelector('.background-carousel');
      expect(carouselElement?.className).not.toContain('exiting');
    });
  });
});
