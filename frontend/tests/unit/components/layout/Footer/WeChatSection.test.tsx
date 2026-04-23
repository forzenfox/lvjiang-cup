import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WeChatSection } from '@/components/layout/Footer/WeChatSection';

describe('WeChatSection', () => {
  const mockProps = {
    name: '驴驴电竞',
    qrCode: '/assets/lvlvdianjing.webp',
    size: 120,
  };

  const OriginalImage = global.Image;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.Image = OriginalImage;
  });

  it('默认应该只显示文字和图标', () => {
    render(<WeChatSection {...mockProps} />);
    expect(screen.getByText('微信公众号：驴驴电竞')).toBeInTheDocument();
    expect(screen.queryByAltText('微信公众号二维码')).not.toBeInTheDocument();
    const qrIcon = document.querySelector('svg');
    expect(qrIcon).toBeInTheDocument();
  });

  it('悬停时应该显示加载状态', async () => {
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';

      constructor() {}
    } as unknown as typeof Image;

    render(<WeChatSection {...mockProps} />);
    const wechatText = screen.getByText('微信公众号：驴驴电竞');

    fireEvent.mouseEnter(wechatText);

    await waitFor(() => {
      const loadingSpinner = document.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });
  });

  it('悬停时应该显示二维码', async () => {
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as unknown as typeof Image;

    render(<WeChatSection {...mockProps} />);
    const wechatText = screen.getByText('微信公众号：驴驴电竞');

    fireEvent.mouseEnter(wechatText);

    await waitFor(() => {
      expect(screen.getByAltText('微信公众号二维码')).toBeInTheDocument();
    });
  });

  it('鼠标离开时应该隐藏二维码', async () => {
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as unknown as typeof Image;

    render(<WeChatSection {...mockProps} />);
    const wechatText = screen.getByText('微信公众号：驴驴电竞');

    fireEvent.mouseEnter(wechatText);
    await waitFor(() => {
      expect(screen.getByAltText('微信公众号二维码')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(wechatText);
    await waitFor(() => {
      expect(screen.queryByAltText('微信公众号二维码')).not.toBeInTheDocument();
    });
  });

  it('加载失败时应该显示错误提示', async () => {
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';

      constructor() {
        setTimeout(() => {
          if (this.onerror) this.onerror();
        }, 0);
      }
    } as unknown as typeof Image;

    render(<WeChatSection {...mockProps} />);
    const wechatText = screen.getByText('微信公众号：驴驴电竞');
    fireEvent.mouseEnter(wechatText);

    await waitFor(() => {
      expect(screen.getByText('二维码加载失败')).toBeInTheDocument();
    });
  });

  it('应该有正确的 data-testid', () => {
    render(<WeChatSection {...mockProps} />);
    expect(screen.getByTestId('wechat-section')).toBeInTheDocument();
  });

  it('二维码图片应该显示原始大小（无裁剪）', async () => {
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as unknown as typeof Image;

    render(<WeChatSection {...mockProps} />);
    const wechatText = screen.getByText('微信公众号：驴驴电竞');

    fireEvent.mouseEnter(wechatText);

    await waitFor(() => {
      const img = screen.getByAltText('微信公众号二维码');
      expect(img).toHaveClass('object-contain', 'w-auto', 'h-auto');
    });
  });
});
