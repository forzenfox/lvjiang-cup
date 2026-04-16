import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Indicator } from '@/components/video-carousel/Indicator';
import type { VideoItem } from '@/components/video-carousel/VideoPlayer';

describe('Indicator', () => {
  const mockVideos: VideoItem[] = [
    { bvid: 'BV1', title: 'Video 1' },
    { bvid: 'BV2', title: 'Video 2' },
    { bvid: 'BV3', title: 'Video 3' },
  ];

  it('renders correct number of indicators', () => {
    render(<Indicator videos={mockVideos} currentIndex={0} onSelect={vi.fn()} />);

    const indicators = screen.getAllByTestId('indicator-dot');
    expect(indicators).toHaveLength(3);
  });

  it('highlights current indicator', () => {
    render(<Indicator videos={mockVideos} currentIndex={1} onSelect={vi.fn()} />);

    const indicators = screen.getAllByTestId('indicator-dot');
    expect(indicators[1]).toHaveClass('bg-white');
    expect(indicators[0]).toHaveClass('bg-gray-400');
  });

  it('calls onSelect when indicator is clicked', () => {
    const handleSelect = vi.fn();
    render(<Indicator videos={mockVideos} currentIndex={0} onSelect={handleSelect} />);

    fireEvent.click(screen.getAllByTestId('indicator-dot')[2]);
    expect(handleSelect).toHaveBeenCalledWith(2);
  });
});
