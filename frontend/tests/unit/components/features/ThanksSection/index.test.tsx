import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThanksSection } from '@/components/features/ThanksSection';

(globalThis as any).vi = vi;

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

describe('ThanksSection', () => {
  it('应该渲染鸣谢区块', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      expect(screen.getByTestId('thanks-section')).toBeInTheDocument();
    });
  });

  it('应该渲染标题', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      expect(screen.getByTestId('thanks-section-title')).toBeInTheDocument();
    });
  });

  it('应该使用SVG图标替代emoji装饰', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      const section = screen.getByTestId('thanks-section');
      const svgs = section.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('不应该包含emoji字符', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      const section = screen.getByTestId('thanks-section');
      const textContent = section.textContent || '';
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const emojis = textContent.match(emojiRegex);
      expect(emojis).toBeNull();
    });
  });

  it('应该有正确的背景样式', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      const section = screen.getByTestId('thanks-section');
      expect(section.className).toContain('bg-gradient-to-b');
      expect(section.className).toContain('from-black');
      expect(section.className).toContain('via-gray-950');
      expect(section.className).toContain('to-black');
    });
  });

  it('应该限制在视窗高度内', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      const section = screen.getByTestId('thanks-section');
      expect(section.className).toContain('h-[calc(100vh-96px)]');
    });
  });

  it('应该使用flex布局', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      const section = screen.getByTestId('thanks-section');
      expect(section.className).toContain('flex');
      expect(section.className).toContain('flex-col');
    });
  });

  it('应该防止内容溢出', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      const section = screen.getByTestId('thanks-section');
      expect(section.className).toContain('overflow-hidden');
    });
  });

  it('应该有正确的模块间距', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      const section = screen.getByTestId('thanks-section');
      const bottomDecorations = section.querySelectorAll('.mt-16, .md\\:mt-20');
      expect(bottomDecorations.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('应该有正确的ID属性', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      const section = screen.getByTestId('thanks-section');
      expect(section).toHaveAttribute('id', 'thanks');
    });
  });

  it('应该使用framer-motion动画', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      const section = screen.getByTestId('thanks-section');
      expect(section).toHaveStyle({ opacity: '0' });
    });
  });

  it('标题应该使用正确的字体', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      const title = screen.getByTestId('thanks-section-title');
      expect(title.style.fontFamily).toContain('Chakra Petch');
    });
  });

  it('应该有正确的副标题', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      expect(screen.getByText('感谢每一位支持者的信任与陪伴')).toBeInTheDocument();
    });
  });

  it('应该有SPONSORS & STAFF标签', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      expect(screen.getByText('SPONSORS & STAFF')).toBeInTheDocument();
    });
  });

  it('底部应该有感谢文字', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      expect(screen.getByText('再次感谢所有支持')).toBeInTheDocument();
    });
  });

  it('内容区域应该有动态缩放样式', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      const section = screen.getByTestId('thanks-section');
      const scaledContent = section.querySelector('div[style*="scale"]');
      expect(scaledContent).not.toBeNull();
    });
  });
});
