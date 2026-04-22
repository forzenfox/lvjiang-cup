import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer', () => {
  it('应该正确渲染所有子组件', () => {
    render(<Footer />);

    // 检查社交媒体链接
    expect(screen.getByTestId('social-links')).toBeInTheDocument();

    // 检查微信公众号
    expect(screen.getByTestId('wechat-section')).toBeInTheDocument();

    // 检查联系信息
    expect(screen.getByTestId('contact-info')).toBeInTheDocument();

    // 检查备案号
    expect(screen.getByTestId('icp-info')).toBeInTheDocument();
  });

  it('应该在桌面端显示', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('hidden', 'lg:block');
  });

  it('应该有正确的 role 属性', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('应该有 data-testid', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('应该显示正确的备案号', () => {
    render(<Footer />);
    expect(screen.getByText('鄂 ICP 备 2026017374 号 -1')).toBeInTheDocument();
  });

  it('应该显示正确的邮箱', () => {
    render(<Footer />);
    expect(screen.getByText(/lvjiangshangwu@163.com/)).toBeInTheDocument();
  });

  it('应该显示微信公众号名称', () => {
    render(<Footer />);
    expect(screen.getByText('微信公众号：驴驴电竞')).toBeInTheDocument();
  });
});
