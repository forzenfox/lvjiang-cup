import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WeChatSection } from '../WeChatSection';

describe('WeChatSection', () => {
  const mockProps = {
    name: '驴驴电竞',
    qrCode: '/assets/lvlvdianjing.webp',
    size: 120,
  };

  // 保存原始的 Image 构造函数
  const OriginalImage = global.Image;

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 恢复原始的 Image 构造函数
    global.Image = OriginalImage;
  });

  it('默认应该只显示文字', () => {
    render(<WeChatSection {...mockProps} />);
    expect(screen.getByText('微信公众号：驴驴电竞')).toBeInTheDocument();
    expect(screen.queryByAltText('微信公众号二维码')).not.toBeInTheDocument();
  });

  it('悬停时应该显示二维码', async () => {
    // Mock Image 加载成功
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src: string = '';

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
    // Mock Image 加载成功
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src: string = '';

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
    // Mock Image 加载失败
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src: string = '';

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

  it('悬停时应该显示加载状态', async () => {
    // Mock Image 延迟加载
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src: string = '';

      constructor() {
        // 不立即调用 onload，模拟加载中状态
      }
    } as unknown as typeof Image;

    render(<WeChatSection {...mockProps} />);
    const wechatText = screen.getByText('微信公众号：驴驴电竞');

    fireEvent.mouseEnter(wechatText);

    // 检查加载动画是否存在
    await waitFor(() => {
      const loadingSpinner = document.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();
    });
  });
});
