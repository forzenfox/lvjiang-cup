import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThanksSection } from '@/components/features/ThanksSection';

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  trigger(entries: IntersectionObserverEntry[]) {
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

describe('ThanksSection', () => {
  beforeEach(() => {
    global.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  it('应该渲染主标题', () => {
    render(<ThanksSection />);

    expect(screen.getByText(content => content.includes('特别鸣谢'))).toBeInTheDocument();
  });

  it('应该渲染弹幕组件', () => {
    render(<ThanksSection />);

    const marqueeContainer = screen.getByTestId('marquee-container');
    expect(marqueeContainer).toBeInTheDocument();
  });

  it('应该渲染特殊奖项组件', () => {
    render(<ThanksSection />);

    expect(screen.getByText(content => content.includes('特殊奖项'))).toBeInTheDocument();
  });

  it('应该渲染幕后工作人员组件', () => {
    render(<ThanksSection />);

    expect(screen.getByText(content => content.includes('幕后工作人员'))).toBeInTheDocument();
  });

  it('应该有正确的 section id', () => {
    render(<ThanksSection />);

    const section = screen.getByTestId('thanks-section');
    expect(section).toHaveAttribute('id', 'thanks');
  });

  it('应该应用正确的背景样式', () => {
    render(<ThanksSection />);

    const section = screen.getByTestId('thanks-section');
    expect(section.className).toContain('bg-gradient-to-b');
    expect(section.className).toContain('from-black');
  });

  it('应该应用正确的内边距样式', () => {
    render(<ThanksSection />);

    const section = screen.getByTestId('thanks-section');
    expect(section.className).toContain('py-16');
    expect(section.className).toContain('md:py-24');
  });

  it('标题应该有正确的样式', () => {
    render(<ThanksSection />);

    const title = screen.getByTestId('thanks-section-title');
    expect(title.className).toContain('font-bold');
    expect(title.className).toContain('tracking-wider');
  });
});
