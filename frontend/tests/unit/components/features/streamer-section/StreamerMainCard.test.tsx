import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StreamerMainCard } from '@/components/features/streamer-section/StreamerMainCard';
import { StreamerType } from '@/api/types';
import type { Streamer } from '@/api/types';

/**
 * StreamerMainCard 组件测试
 * 测试目标：确保主卡片组件能够正确渲染主播详情，并处理边界情况
 */
describe('StreamerMainCard', () => {
  // 正常的主播数据
  const mockStreamer: Streamer = {
    id: '1',
    nickname: '测试主播',
    posterUrl: 'https://example.com/poster.jpg',
    bio: '这是一个测试主播的简介',
    liveUrl: 'https://live.example.com',
    streamerType: StreamerType.INTERNAL,
  };

  /**
   * 用户旅程1：正常显示主播详情
   * 作为用户，我希望看到主播的封面图、昵称、简介等信息
   * 以便了解主播详情
   */
  it('renders main card with poster image', () => {
    render(<StreamerMainCard streamer={mockStreamer} />);

    const img = screen.getByAltText('测试主播');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/poster.jpg');
  });

  it('displays streamer nickname in title', () => {
    render(<StreamerMainCard streamer={mockStreamer} />);

    expect(screen.getByText('测试主播')).toBeInTheDocument();
  });

  it('displays streamer bio', () => {
    render(<StreamerMainCard streamer={mockStreamer} />);

    expect(screen.getByText('这是一个测试主播的简介')).toBeInTheDocument();
  });

  it('shows "驴酱" badge for internal streamer', () => {
    render(<StreamerMainCard streamer={mockStreamer} />);

    expect(screen.getByText('驴酱')).toBeInTheDocument();
  });

  it('shows "嘉宾" badge for guest streamer', () => {
    const guestStreamer: Streamer = {
      ...mockStreamer,
      streamerType: StreamerType.GUEST,
    };
    render(<StreamerMainCard streamer={guestStreamer} />);

    expect(screen.getByText('嘉宾')).toBeInTheDocument();
  });

  /**
   * 用户旅程2：直播间按钮功能
   * 作为用户，我希望点击进入直播间按钮能跳转到直播页面
   * 以便观看直播
   */
  it('opens live room when clicking button', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<StreamerMainCard streamer={mockStreamer} />);

    fireEvent.click(screen.getByText('进入直播间'));
    expect(openSpy).toHaveBeenCalledWith('https://live.example.com', '_blank');
    openSpy.mockRestore();
  });

  /**
   * 用户旅程3：错误边界处理
   * 作为用户，当数据异常时，我不希望页面崩溃
   * 以便获得良好的用户体验
   */
  it('returns null when streamer is null', () => {
    const { container } = render(<StreamerMainCard streamer={null as unknown as Streamer} />);

    expect(container.firstChild).toBeNull();
  });

  it('returns null when streamer is undefined', () => {
    const { container } = render(<StreamerMainCard streamer={undefined as unknown as Streamer} />);

    expect(container.firstChild).toBeNull();
  });

  it('returns null when posterUrl is missing', () => {
    const streamerWithoutPoster = {
      ...mockStreamer,
      posterUrl: undefined,
    } as unknown as Streamer;
    const { container } = render(<StreamerMainCard streamer={streamerWithoutPoster} />);

    expect(container.firstChild).toBeNull();
  });

  it('returns null when nickname is missing', () => {
    const streamerWithoutNickname = {
      ...mockStreamer,
      nickname: undefined,
    } as unknown as Streamer;
    const { container } = render(<StreamerMainCard streamer={streamerWithoutNickname} />);

    expect(container.firstChild).toBeNull();
  });

  it('returns null when liveUrl is missing', () => {
    const streamerWithoutLiveUrl = {
      ...mockStreamer,
      liveUrl: undefined,
    } as unknown as Streamer;
    const { container } = render(<StreamerMainCard streamer={streamerWithoutLiveUrl} />);

    expect(container.firstChild).toBeNull();
  });

  /**
   * 用户旅程4：数据完整性检查
   */
  it('has correct data-testid attribute', () => {
    render(<StreamerMainCard streamer={mockStreamer} />);

    expect(screen.getByTestId('streamer-main-card')).toBeInTheDocument();
  });

  it('renders with empty bio gracefully', () => {
    const streamerWithEmptyBio = {
      ...mockStreamer,
      bio: '',
    };
    const { container } = render(<StreamerMainCard streamer={streamerWithEmptyBio} />);

    // 空简介应该也能渲染
    expect(container.firstChild).not.toBeNull();
  });
});
