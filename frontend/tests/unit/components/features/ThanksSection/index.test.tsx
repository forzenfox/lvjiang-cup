import { describe, it, expect, vi } from 'vitest';
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

  it('应该有正确的ID属性', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      const section = screen.getByTestId('thanks-section');
      expect(section).toHaveAttribute('id', 'thanks');
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

  it('应该渲染赞助商列表', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      expect(screen.getAllByText('斗鱼官方').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('神秘老板').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('应该渲染工作人员列表', async () => {
    render(<ThanksSection />);
    await waitFor(() => {
      expect(screen.getAllByText('帅小伙山月').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('大总管').length).toBeGreaterThanOrEqual(1);
    });
  });
});
