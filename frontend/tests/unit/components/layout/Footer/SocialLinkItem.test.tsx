import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialLinkItem } from '@/components/layout/Footer/SocialLinkItem';

describe('SocialLinkItem', () => {
  const mockProps = {
    platform: 'bilibili',
    name: '胡凯利_洞主',
    url: 'https://space.bilibili.com/393671271',
    icon: 'https://cdn.baomitu.com/cdn-static/images/logos/bilibili.svg',
  };

  it('应该正确渲染链接', () => {
    render(<SocialLinkItem {...mockProps} />);
    expect(screen.getByText('胡凯利_洞主')).toBeInTheDocument();
  });

  it('链接应该在新标签页打开', () => {
    render(<SocialLinkItem {...mockProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('应该显示图标', () => {
    render(<SocialLinkItem {...mockProps} />);
    const img = screen.getByAltText('bilibili 图标');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockProps.icon);
  });

  it('应该有正确的 href', () => {
    render(<SocialLinkItem {...mockProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', mockProps.url);
  });

  it('应该有 data-testid', () => {
    render(<SocialLinkItem {...mockProps} />);
    expect(screen.getByTestId('social-link-item')).toBeInTheDocument();
  });
});
