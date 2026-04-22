import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer', () => {
  const openFooter = () => {
    // 触发底部触发区域（带 data-testid="footer-trigger" 的元素）
    const triggerZone = document.querySelector('[data-testid="footer-trigger"]');
    if (triggerZone) {
      fireEvent.mouseEnter(triggerZone);
    }
  };

  it('应该正确渲染所有子组件', () => {
    render(<Footer />);
    openFooter();

    // 检查社交媒体链接
    expect(screen.getByTestId('social-links')).toBeInTheDocument();

    // 检查微信公众号
    expect(screen.getByTestId('wechat-section')).toBeInTheDocument();

    // 检查联系信息
    expect(screen.getByTestId('contact-info')).toBeInTheDocument();

    // 检查备案号
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

    // 鼠标移出 footer 容器
    const footerContainer = document.querySelector('[data-testid="footer-drawer"]');
    if (footerContainer) {
      fireEvent.mouseLeave(footerContainer);
    }

    // 在 jsdom 中 AnimatePresence 的 exit 动画不会真正移除元素，
    // 所以检查是否应用了退出动画的样式
    const footer = screen.queryByRole('contentinfo');
    expect(footer).not.toBeNull();
    // 退出动画会设置 translateY(100%) 使页脚滑出视口
    expect(footer).toHaveStyle('transform: translateY(100%)');
  });
});
