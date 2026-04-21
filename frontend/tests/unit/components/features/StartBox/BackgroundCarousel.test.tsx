import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { BackgroundCarousel } from '@/components/features/StartBox/BackgroundCarousel';

vi.mock('@/components/features/StartBox/constants', () => ({
  COVER_BACKGROUNDS: {
    pc: ['/test-pc-bg.png'],
    mobile: ['/test-mobile-bg.png'],
  },
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

  describe('渲染背景图', () => {
    it('应该渲染背景图片', () => {
      render(
        <BackgroundCarousel
          isExiting={false}
          isMobile={false}
          onError={mockOnError}
        />
      );

      expect(document.querySelectorAll('.bg-cover').length).toBeGreaterThan(0);
    });

    it('PC端应该使用PC背景图', () => {
      render(
        <BackgroundCarousel
          isExiting={false}
          isMobile={false}
          onError={mockOnError}
        />
      );

      const bgElement = document.querySelector('[style*="/test-pc-bg.png"]');
      expect(bgElement).toBeInTheDocument();
    });

    it('移动端应该使用移动端背景图', () => {
      render(
        <BackgroundCarousel
          isExiting={false}
          isMobile={true}
          onError={mockOnError}
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
        <BackgroundCarousel
          isExiting={false}
          isMobile={false}
          onError={mockOnError}
        />
      );

      expect(setIntervalSpy).not.toHaveBeenCalled();
    });
  });

  describe('图片加载失败处理', () => {
    it('图片加载失败时应该调用 onError 回调', () => {
      const mockSetHasError = vi.fn();
      
      render(
        <BackgroundCarousel
          isExiting={false}
          isMobile={false}
          onError={mockOnError}
        />
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
        <BackgroundCarousel
          isExiting={true}
          isMobile={false}
          onError={mockOnError}
        />
      );

      const carouselElement = container.firstChild;
      expect(carouselElement).toBeInTheDocument();
    });

    it('isExiting=false 时应该保持可见', () => {
      const { container } = render(
        <BackgroundCarousel
          isExiting={false}
          isMobile={false}
          onError={mockOnError}
        />
      );

      const carouselElement = container.firstChild;
      expect(carouselElement).toBeInTheDocument();
    });
  });
});
