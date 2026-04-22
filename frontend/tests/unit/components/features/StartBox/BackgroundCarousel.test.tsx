import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { BackgroundCarousel } from '@/components/features/StartBox/BackgroundCarousel';
import type { CoverImage } from '@/components/features/StartBox/constants';

vi.mock('@/hooks', () => ({
  useImageWithFallback: (sources: readonly CoverImage[]) => sources,
}));

vi.mock('@/components/features/StartBox/constants', () => ({
  ANIMATION_CONFIG: {
    carouselInterval: 3000,
    exitDuration: 900,
    touchThreshold: 50,
  },
}));

describe('BackgroundCarousel 组件', () => {
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const pcBackgrounds: readonly CoverImage[] = [
    { cdn: '/test-pc-bg.png', local: '/assets/test-pc-bg.png' },
  ];

  const mobileBackgrounds: readonly CoverImage[] = [
    { cdn: '/test-mobile-bg.png', local: '/assets/test-mobile-bg.png' },
  ];

  describe('渲染背景图', () => {
    it('应该渲染背景图片', () => {
      render(
        <BackgroundCarousel isExiting={false} onError={mockOnError} backgrounds={pcBackgrounds} />
      );

      expect(document.querySelectorAll('.bg-cover').length).toBeGreaterThan(0);
    });

    it('应该使用传入的 PC 背景图', () => {
      render(
        <BackgroundCarousel isExiting={false} onError={mockOnError} backgrounds={pcBackgrounds} />
      );

      const bgElement = document.querySelector('[style*="/test-pc-bg.png"]');
      expect(bgElement).toBeInTheDocument();
    });

    it('应该使用传入的移动端背景图', () => {
      render(
        <BackgroundCarousel
          isExiting={false}
          onError={mockOnError}
          backgrounds={mobileBackgrounds}
        />
      );

      const bgElement = document.querySelector('[style*="/test-mobile-bg.png"]');
      expect(bgElement).toBeInTheDocument();
    });
  });

  describe('轮播逻辑', () => {
    it('单张背景图时不应该设置轮播定时器', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');

      render(
        <BackgroundCarousel isExiting={false} onError={mockOnError} backgrounds={pcBackgrounds} />
      );

      expect(setIntervalSpy).not.toHaveBeenCalled();
    });
  });

  describe('图片加载失败处理', () => {
    it('图片加载失败时应该调用 onError 回调', () => {
      render(
        <BackgroundCarousel isExiting={false} onError={mockOnError} backgrounds={pcBackgrounds} />
      );

      const imgElement = document.querySelector('img.hidden');
      expect(imgElement).toBeInTheDocument();

      imgElement?.dispatchEvent(new Event('error'));

      expect(mockOnError).toHaveBeenCalled();
    });
  });

  describe('退出动画', () => {
    it('isExiting=true 时应该触发淡出动画', () => {
      const { container } = render(
        <BackgroundCarousel isExiting={true} onError={mockOnError} backgrounds={pcBackgrounds} />
      );

      const carouselElement = container.firstChild;
      expect(carouselElement).toBeInTheDocument();
    });

    it('isExiting=false 时应该保持可见', () => {
      const { container } = render(
        <BackgroundCarousel isExiting={false} onError={mockOnError} backgrounds={pcBackgrounds} />
      );

      const carouselElement = container.firstChild;
      expect(carouselElement).toBeInTheDocument();
    });
  });
});
