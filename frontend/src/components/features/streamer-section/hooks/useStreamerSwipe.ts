import { useCallback, useRef } from 'react';

interface UseStreamerSwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}

interface UseStreamerSwipeResult {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export const useStreamerSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: UseStreamerSwipeOptions): UseStreamerSwipeResult => {
  const touchStartX = useRef<number>(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX.current;

      if (Math.abs(diff) < threshold) return;

      if (diff > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    },
    [onSwipeLeft, onSwipeRight, threshold]
  );

  return { onTouchStart, onTouchEnd };
};
