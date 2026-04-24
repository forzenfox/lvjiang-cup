import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ScrollTip } from '@/components/features/StartBox/ScrollTip';

describe('ScrollTip 组件', () => {
  describe('渲染滚动提示', () => {
    it('应该渲染滚动提示元素', () => {
      const { container } = render(<ScrollTip isExiting={false} />);

      const scrollTipElement = container.querySelector('.scroll-tip');
      expect(scrollTipElement).toBeInTheDocument();
    });

    it('应该底部居中定位', () => {
      const { container } = render(<ScrollTip isExiting={false} />);

      const scrollTipElement = container.querySelector('.scroll-tip');
      expect(scrollTipElement?.className).toContain('bottom-10');
      expect(scrollTipElement?.className).toContain('-translate-x-1/2');
    });

    it('应该包含滚动动画类', () => {
      const { container } = render(<ScrollTip isExiting={false} />);

      const scrollTipElement = container.querySelector('.scroll-tip');
      expect(scrollTipElement?.className).toContain('scroll-tip-arrow');
    });
  });

  describe('退出动画', () => {
    it('isExiting=true 时 opacity 为 0', () => {
      const { container } = render(<ScrollTip isExiting={true} />);

      const scrollTipElement = container.querySelector('.scroll-tip');
      expect(scrollTipElement).toBeInTheDocument();
    });

    it('isExiting=false 时 opacity 为 1', () => {
      const { container } = render(<ScrollTip isExiting={false} />);

      const scrollTipElement = container.querySelector('.scroll-tip');
      expect(scrollTipElement).toBeInTheDocument();
    });
  });
});
