import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSwipe } from '@/components/video-carousel/hooks/useSwipe';

describe('useSwipe', () => {
  const mockOnSwipeLeft = vi.fn();
  const mockOnSwipeRight = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createTouchEvent = (clientX: number, type: 'touchstart' | 'touchend') => {
    if (type === 'touchstart') {
      return new TouchEvent(type, {
        touches: [{ clientX }] as unknown as Touch[],
        bubbles: true,
      });
    }
    return new TouchEvent(type, {
      changedTouches: [{ clientX }] as unknown as Touch[],
      bubbles: true,
    });
  };

  it('does not call callbacks when swipe distance is less than threshold', () => {
    const { result } = renderHook(() =>
      useSwipe({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 50,
      })
    );

    const { onTouchStart, onTouchEnd } = result.current;

    act(() => {
      onTouchStart(createTouchEvent(100, 'touchstart') as unknown as React.TouchEvent);
    });

    act(() => {
      onTouchEnd(createTouchEvent(130, 'touchend') as unknown as React.TouchEvent);
    });

    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });

  it('calls onSwipeRight when swiping right', () => {
    const { result } = renderHook(() =>
      useSwipe({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 50,
      })
    );

    const { onTouchStart, onTouchEnd } = result.current;

    act(() => {
      onTouchStart(createTouchEvent(100, 'touchstart') as unknown as React.TouchEvent);
    });

    act(() => {
      onTouchEnd(createTouchEvent(160, 'touchend') as unknown as React.TouchEvent);
    });

    expect(mockOnSwipeRight).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeLeft).not.toHaveBeenCalled();
  });

  it('calls onSwipeLeft when swiping left', () => {
    const { result } = renderHook(() =>
      useSwipe({
        onSwipeLeft: mockOnSwipeLeft,
        onSwipeRight: mockOnSwipeRight,
        threshold: 50,
      })
    );

    const { onTouchStart, onTouchEnd } = result.current;

    act(() => {
      onTouchStart(createTouchEvent(160, 'touchstart') as unknown as React.TouchEvent);
    });

    act(() => {
      onTouchEnd(createTouchEvent(100, 'touchend') as unknown as React.TouchEvent);
    });

    expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1);
    expect(mockOnSwipeRight).not.toHaveBeenCalled();
  });
});
