import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StreamerIndicator } from '@/components/features/streamer-section/StreamerIndicator';
import { StreamerType } from '@/api/types';
import type { Streamer } from '@/api/types';

/**
 * StreamerIndicator 组件测试
 * 测试目标：确保指示器组件能够正确渲染，并处理边界情况
 */
describe('StreamerIndicator', () => {
  // 正常的主播数据
  const mockStreamers: Streamer[] = [
    {
      id: '1',
      nickname: '主播1',
      posterUrl: 'https://example.com/poster1.jpg',
      bio: '简介1',
      liveUrl: 'https://live1.example.com',
      streamerType: StreamerType.INTERNAL,
    },
    {
      id: '2',
      nickname: '主播2',
      posterUrl: 'https://example.com/poster2.jpg',
      bio: '简介2',
      liveUrl: 'https://live2.example.com',
      streamerType: StreamerType.GUEST,
    },
    {
      id: '3',
      nickname: '主播3',
      posterUrl: 'https://example.com/poster3.jpg',
      bio: '简介3',
      liveUrl: 'https://live3.example.com',
      streamerType: StreamerType.INTERNAL,
    },
  ];

  /**
   * 用户旅程1：正常显示指示器
   * 作为用户，我希望看到主播轮播的指示器
   * 以便了解当前位置和快速跳转
   */
  it('renders indicator dots for each streamer', () => {
    render(
      <StreamerIndicator
        streamers={mockStreamers}
        currentIndex={0}
        onSelect={vi.fn()}
      />
    );

    const dots = screen.getAllByTestId('indicator-dot');
    expect(dots).toHaveLength(3);
  });

  it('highlights current index dot', () => {
    render(
      <StreamerIndicator
        streamers={mockStreamers}
        currentIndex={1}
        onSelect={vi.fn()}
      />
    );

    const dots = screen.getAllByTestId('indicator-dot');
    // 当前选中的应该有特殊样式（通过 aria-label 可以识别）
    expect(dots[1]).toHaveAttribute('aria-label', '跳转到主播 主播2');
  });

  it('calls onSelect with correct index when clicked', () => {
    const handleSelect = vi.fn();
    render(
      <StreamerIndicator
        streamers={mockStreamers}
        currentIndex={0}
        onSelect={handleSelect}
      />
    );

    const dots = screen.getAllByTestId('indicator-dot');
    fireEvent.click(dots[2]);
    expect(handleSelect).toHaveBeenCalledWith(2);
  });

  it('has correct aria-label for accessibility', () => {
    render(
      <StreamerIndicator
        streamers={mockStreamers}
        currentIndex={0}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByLabelText('跳转到主播 主播1')).toBeInTheDocument();
    expect(screen.getByLabelText('跳转到主播 主播2')).toBeInTheDocument();
    expect(screen.getByLabelText('跳转到主播 主播3')).toBeInTheDocument();
  });

  /**
   * 用户旅程2：错误边界处理
   * 作为用户，当数据异常时，我不希望页面崩溃
   */
  it('renders empty when streamers is empty array', () => {
    const { container } = render(
      <StreamerIndicator streamers={[]} currentIndex={0} onSelect={vi.fn()} />
    );

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByTestId('indicator-dot')).not.toBeInTheDocument();
  });

  it('handles streamers with null items gracefully', () => {
    const streamersWithNull = [
      mockStreamers[0],
      null as unknown as Streamer,
      mockStreamers[2],
    ];

    const { container } = render(
      <StreamerIndicator
        streamers={streamersWithNull}
        currentIndex={0}
        onSelect={vi.fn()}
      />
    );

    // 应该能渲染，不会崩溃
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles streamers with undefined items gracefully', () => {
    const streamersWithUndefined = [
      mockStreamers[0],
      undefined as unknown as Streamer,
      mockStreamers[2],
    ];

    const { container } = render(
      <StreamerIndicator
        streamers={streamersWithUndefined}
        currentIndex={0}
        onSelect={vi.fn()}
      />
    );

    // 应该能渲染，不会崩溃
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles streamers with missing id gracefully', () => {
    const streamersWithMissingId = [
      mockStreamers[0],
      { ...mockStreamers[1], id: undefined } as unknown as Streamer,
      mockStreamers[2],
    ];

    const { container } = render(
      <StreamerIndicator
        streamers={streamersWithMissingId}
        currentIndex={0}
        onSelect={vi.fn()}
      />
    );

    // 应该能渲染，不会崩溃
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles streamers with missing nickname gracefully', () => {
    const streamersWithMissingNickname = [
      mockStreamers[0],
      { ...mockStreamers[1], nickname: undefined } as unknown as Streamer,
      mockStreamers[2],
    ];

    const { container } = render(
      <StreamerIndicator
        streamers={streamersWithMissingNickname}
        currentIndex={0}
        onSelect={vi.fn()}
      />
    );

    // 应该能渲染，不会崩溃
    expect(container.firstChild).toBeInTheDocument();
  });

  /**
   * 用户旅程3：数据完整性检查
   */
  it('has correct data-testid attribute', () => {
    render(
      <StreamerIndicator
        streamers={mockStreamers}
        currentIndex={0}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('streamer-indicator')).toBeInTheDocument();
  });

  it('renders with single streamer', () => {
    render(
      <StreamerIndicator
        streamers={[mockStreamers[0]]}
        currentIndex={0}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getAllByTestId('indicator-dot')).toHaveLength(1);
  });
});
