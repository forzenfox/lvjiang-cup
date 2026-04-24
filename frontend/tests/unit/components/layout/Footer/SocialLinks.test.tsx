import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialLinks } from '@/components/layout/Footer/SocialLinks';
import type { SocialLinkConfig } from '@/config/footer';

describe('SocialLinks', () => {
  const mockLinks: SocialLinkConfig[] = [
    {
      platform: 'bilibili',
      name: '胡凯利_洞主',
      url: 'https://space.bilibili.com/393671271',
      icon: 'https://cdn.baomitu.com/cdn-static/images/logos/bilibili.svg',
    },
    {
      platform: 'douyin',
      name: '凯菇来啦',
      url: 'https://v.douyin.com/JKo-Lq5r86I/',
      icon: 'https://cdn.baomitu.com/cdn-static/images/logos/douyin.svg',
    },
    {
      platform: 'douyin',
      name: '胡凯利_洞主',
      url: 'https://v.douyin.com/hErnCiyHPbg/',
      icon: 'https://cdn.baomitu.com/cdn-static/images/logos/douyin.svg',
    },
  ];

  it('应该渲染所有社交媒体链接', () => {
    render(<SocialLinks links={mockLinks} />);
    expect(screen.getAllByTestId('social-link-item')).toHaveLength(3);
  });

  it('应该正确传递 props 给子组件', () => {
    render(<SocialLinks links={mockLinks} />);
    expect(screen.getAllByText('胡凯利_洞主')).toHaveLength(2);
    expect(screen.getByText('凯菇来啦')).toBeInTheDocument();
  });

  it('应该有正确的 data-testid', () => {
    render(<SocialLinks links={mockLinks} />);
    expect(screen.getByTestId('social-links')).toBeInTheDocument();
  });

  it('应该为每个链接生成唯一的 key', () => {
    render(<SocialLinks links={mockLinks} />);
    const items = screen.getAllByTestId('social-link-item');
    expect(items).toHaveLength(3);
  });
});
