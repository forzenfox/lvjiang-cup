import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ScrollTip } from '@/components/features/StartBox/ScrollTip';

describe('ScrollTip 组件', () => {
  describe('S-01: 渲染滚动提示', () => {
    it('应该渲染滚动提示元素', () => {
      const { container } = render(<ScrollTip isExiting={false} />);

      const scrollTipElement = container.querySelector('.scroll-tip');
      expect(scrollTipElement).toBeInTheDocument();
    });
  });

  describe('S-03: 退出时渐隐', () => {
    it('isExiting=true 时添加渐隐动画类', () => {
      const { container } = render(<ScrollTip isExiting={true} />);

      const scrollTipElement = container.querySelector('.scroll-tip');
      expect(scrollTipElement?.className).toContain('exiting');
    });

    it('isExiting=false 时不添加渐隐动画类', () => {
      const { container } = render(<ScrollTip isExiting={false} />);

      const scrollTipElement = container.querySelector('.scroll-tip');
      expect(scrollTipElement?.className).not.toContain('exiting');
    });
  });
});
