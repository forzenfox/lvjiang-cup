import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WeChatSection } from '../WeChatSection';

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

  it('应该显示微信公众号名称', () => {
    render(<WeChatSection {...mockProps} />);
    expect(screen.getByText('微信公众号：驴驴电竞')).toBeInTheDocument();
  });

  it('加载成功时应该显示二维码图片', async () => {
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

    await waitFor(() => {
      expect(screen.getByAltText('微信公众号二维码')).toBeInTheDocument();
    });
  });

  it('加载失败时应该显示错误提示', async () => {
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

    await waitFor(() => {
      expect(screen.getByText('二维码加载失败')).toBeInTheDocument();
    });
  });

  it('应该有正确的 data-testid', () => {
    render(<WeChatSection {...mockProps} />);
    expect(screen.getByTestId('wechat-section')).toBeInTheDocument();
  });

  it('加载中时应该显示占位符', async () => {
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src: string = '';

      constructor() {
        // 不调用 onload，模拟加载中
      }
    } as unknown as typeof Image;

    render(<WeChatSection {...mockProps} />);

    await waitFor(() => {
      const placeholder = document.querySelector('.animate-pulse');
      expect(placeholder).toBeInTheDocument();
    });
  });

  it('应该使用正确的最大尺寸并保持原始比例', async () => {
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

    await waitFor(() => {
      const img = screen.getByAltText('微信公众号二维码');
      expect(img).toHaveStyle({ maxWidth: '120px', maxHeight: '120px' });
      expect(img).toHaveClass('object-contain');
    });
  });
});
