import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer/Footer';

describe('Footer', () => {
  const openFooter = () => {
    const triggerZone = document.querySelector('[data-testid="footer-trigger"]');
    if (triggerZone) {
      fireEvent.mouseEnter(triggerZone);
    }
  };

  it('应该正确渲染所有子组件', () => {
    render(<Footer />);
    openFooter();

    expect(screen.getByTestId('social-links')).toBeInTheDocument();
    expect(screen.getByTestId('wechat-section')).toBeInTheDocument();
    expect(screen.getByTestId('contact-info')).toBeInTheDocument();
    expect(screen.getByTestId('icp-info')).toBeInTheDocument();
  });

  it('应该有正确的 role 属性', () => {
    render(<Footer />);
    openFooter();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('应该有 data-testid', () => {
    render(<Footer />);
    openFooter();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('应该显示正确的备案号', () => {
    render(<Footer />);
    openFooter();
    expect(screen.getByText('鄂 ICP 备 2026017374 号 -1')).toBeInTheDocument();
  });

  it('应该显示正确的邮箱', () => {
    render(<Footer />);
    openFooter();
    expect(screen.getByText(/lvjiangshangwu@163.com/)).toBeInTheDocument();
  });

  it('应该显示微信公众号名称', () => {
    render(<Footer />);
    openFooter();
    expect(screen.getByText('微信公众号：驴驴电竞')).toBeInTheDocument();
  });

  it('应该包含底部触发区域', () => {
    render(<Footer />);
    const triggerZone = document.querySelector('[data-testid="footer-trigger"]');
    expect(triggerZone).toBeInTheDocument();
    expect(triggerZone).toHaveStyle({ height: '20px' });
  });

  it('鼠标移入触发区域应打开页脚', () => {
    render(<Footer />);
    const triggerZone = document.querySelector('[data-testid="footer-trigger"]');
    if (triggerZone) {
      fireEvent.mouseEnter(triggerZone);
    }
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('鼠标移出页脚区域应收回页脚', () => {
    render(<Footer />);
    openFooter();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    const footerContainer = document.querySelector('[data-testid="footer-drawer"]');
    if (footerContainer) {
      fireEvent.mouseLeave(footerContainer);
    }

    const footer = screen.queryByRole('contentinfo');
    expect(footer).not.toBeNull();
    expect(footer).toHaveStyle('transform: translateY(100%)');
  });
});
