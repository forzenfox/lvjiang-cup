import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoThumbnail } from '@/components/video-carousel/VideoThumbnail';
import type { VideoItem } from '@/components/video-carousel/VideoPlayer';

describe('VideoThumbnail', () => {
  const mockVideo: VideoItem = {
    bvid: 'BV1xx411c7XZ',
    title: 'Test Video',
    cover: 'https://example.com/cover.jpg',
    page: 1,
  };

  it('renders thumbnail with cover image', () => {
    render(<VideoThumbnail video={mockVideo} onClick={vi.fn()} />);

    const img = screen.getByAltText('thumbnail');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('shows title overlay', () => {
    render(<VideoThumbnail video={mockVideo} onClick={vi.fn()} />);

    expect(screen.getByText('Test Video')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<VideoThumbnail video={mockVideo} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(mockVideo);
  });

  it('applies active class when isActive is true', () => {
    render(<VideoThumbnail video={mockVideo} onClick={vi.fn()} isActive />);

    const container = screen.getByRole('button');
    expect(container).toHaveClass('ring-2', 'ring-blue-500');
  });

  it('does not apply active class when isActive is false', () => {
    render(<VideoThumbnail video={mockVideo} onClick={vi.fn()} isActive={false} />);

    const container = screen.getByRole('button');
    expect(container).not.toHaveClass('ring-2', 'ring-blue-500');
  });
});