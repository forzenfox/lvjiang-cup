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

  it('autoplays after interval when all conditions are met', () => {
    renderHook(() => useAutoplay({
      enabled: true,
      onAutoplay: mockOnAutoplay,
      videoCount: 3,
      isMobile: false,
    }));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockOnAutoplay).toHaveBeenCalledTimes(1);
  });

  it('pauses autoplay when pause is called', () => {
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
      vi.advanceTimersByTime(3000);
    });

    expect(mockOnAutoplay).not.toHaveBeenCalled();
  });

  it('resumes autoplay after pauseDuration plus interval', () => {
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
      vi.advanceTimersByTime(30000);
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockOnAutoplay).toHaveBeenCalledTimes(1);
  });
});