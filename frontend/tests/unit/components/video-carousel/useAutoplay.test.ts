import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoplay } from '@/components/video-carousel/hooks/useAutoplay';

describe('useAutoplay', () => {
  const mockOnAutoplay = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnAutoplay.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not autoplay regardless of conditions', () => {
    renderHook(() => useAutoplay({
      enabled: true,
      onAutoplay: mockOnAutoplay,
      videoCount: 3,
      isMobile: false,
    }));

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(mockOnAutoplay).not.toHaveBeenCalled();
  });

  it('does not autoplay when enabled is false', () => {
    renderHook(() => useAutoplay({
      enabled: false,
      onAutoplay: mockOnAutoplay,
      videoCount: 3,
      isMobile: false,
    }));

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(mockOnAutoplay).not.toHaveBeenCalled();
  });

  it('does not autoplay when videoCount <= 2', () => {
    renderHook(() => useAutoplay({
      enabled: true,
      onAutoplay: mockOnAutoplay,
      videoCount: 2,
      isMobile: false,
    }));

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(mockOnAutoplay).not.toHaveBeenCalled();
  });

  it('does not autoplay when isMobile is true', () => {
    renderHook(() => useAutoplay({
      enabled: true,
      onAutoplay: mockOnAutoplay,
      videoCount: 3,
      isMobile: true,
    }));

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(mockOnAutoplay).not.toHaveBeenCalled();
  });

  it('pause does not trigger autoplay after 30 seconds', () => {
    const { result } = renderHook(() => useAutoplay({
      enabled: true,
      onAutoplay: mockOnAutoplay,
      videoCount: 3,
      isMobile: false,
    }));

    act(() => {
      vi.advanceTimersByTime(3000);
      result.current.pause();
    });

    act(() => {
      vi.advanceTimersByTime(35000);
    });

    expect(mockOnAutoplay).not.toHaveBeenCalled();
  });
});