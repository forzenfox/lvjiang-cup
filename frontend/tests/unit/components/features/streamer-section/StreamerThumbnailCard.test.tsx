import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StreamerThumbnailCard } from '@/components/features/streamer-section/StreamerThumbnailCard';
import { StreamerType } from '@/api/types';
import type { Streamer } from '@/api/types';

/**
 * StreamerThumbnailCard 组件测试
 * 测试目标：确保组件能够正确渲染主播缩略图，并处理边界情况
 */
describe('StreamerThumbnailCard', () => {
  // 正常的主播数据
  const mockStreamer: Streamer = {
    id: '1',
    nickname: '测试主播',
    posterUrl: 'https://example.com/poster.jpg',
    bio: '这是一个测试主播',
    liveUrl: 'https://live.example.com',
    streamerType: StreamerType.INTERNAL,
  };

  /**
   * 用户旅程1：正常显示主播缩略图
   * 作为用户，我希望看到主播的封面图和昵称
   * 以便快速识别主播身份
   */
  it('renders streamer thumbnail with poster image', () => {
    render(<StreamerThumbnailCard streamer={mockStreamer} onClick={vi.fn()} />);

    const img = screen.getByAltText('测试主播');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/poster.jpg');
  });

  it('displays streamer nickname', () => {
    render(<StreamerThumbnailCard streamer={mockStreamer} onClick={vi.fn()} />);

    expect(screen.getByText('测试主播')).toBeInTheDocument();
  });

  /**
   * 用户旅程2：显示主播类型标签
   * 作为用户，我希望看到主播类型（驴酱/嘉宾）
   * 以便区分不同类型的主播
   */
  it('shows "驴酱" badge for internal streamer', () => {
    render(<StreamerThumbnailCard streamer={mockStreamer} onClick={vi.fn()} />);

    expect(screen.getByText('驴酱')).toBeInTheDocument();
  });

  it('shows "嘉宾" badge for guest streamer', () => {
    const guestStreamer: Streamer = {
      ...mockStreamer,
      streamerType: StreamerType.GUEST,
    };
    render(<StreamerThumbnailCard streamer={guestStreamer} onClick={vi.fn()} />);

    expect(screen.getByText('嘉宾')).toBeInTheDocument();
  });

  /**
   * 用户旅程3：点击交互
   * 作为用户，我希望点击缩略图可以切换主播
   * 以便浏览不同主播的信息
   */
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<StreamerThumbnailCard streamer={mockStreamer} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  /**
   * 用户旅程4：错误边界处理
   * 作为用户，当数据异常时，我不希望页面崩溃
   * 以便获得良好的用户体验
   */
  it('returns null when streamer is null', () => {
    const { container } = render(
      <StreamerThumbnailCard streamer={null as unknown as Streamer} onClick={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when streamer is undefined', () => {
    const { container } = render(
      <StreamerThumbnailCard streamer={undefined as unknown as Streamer} onClick={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when posterUrl is missing', () => {
    const streamerWithoutPoster = {
      ...mockStreamer,
      posterUrl: undefined,
    } as unknown as Streamer;
    const { container } = render(
      <StreamerThumbnailCard streamer={streamerWithoutPoster} onClick={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when nickname is missing', () => {
    const streamerWithoutNickname = {
      ...mockStreamer,
      nickname: undefined,
    } as unknown as Streamer;
    const { container } = render(
      <StreamerThumbnailCard streamer={streamerWithoutNickname} onClick={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  /**
   * 用户旅程5：数据完整性检查
   * 确保组件在渲染前验证必要字段
   */
  it('has correct data-testid attribute', () => {
    render(<StreamerThumbnailCard streamer={mockStreamer} onClick={vi.fn()} />);

    expect(screen.getByTestId('streamer-thumbnail-card')).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    render(<StreamerThumbnailCard streamer={mockStreamer} onClick={vi.fn()} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('relative', 'w-full', 'aspect-video', 'rounded-lg');
  });
});
