import { useEffect, useRef, useCallback } from 'react';

interface UseAutoplayOptions {
  enabled: boolean;
  onAutoplay: () => void;
  videoCount: number;
  isMobile: boolean;
}

interface UseAutoplayResult {
  pause: () => void;
}

export const useAutoplay = ({
  enabled,
  onAutoplay,
  videoCount,
  isMobile,
}: UseAutoplayOptions): UseAutoplayResult => {
  const intervalRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);
  const onAutoplayRef = useRef(onAutoplay);

  useEffect(() => {
    onAutoplayRef.current = onAutoplay;
  }, [onAutoplay]);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      onAutoplayRef.current();
    }, 5000);
  }, []);

  const pause = useCallback(() => {
    clearTimers();
    if (enabled && !isMobile && videoCount > 2) {
      pauseTimeoutRef.current = window.setTimeout(() => {
        startAutoplay();
      }, 30000);
    }
  }, [clearTimers, enabled, isMobile, videoCount, startAutoplay]);

  useEffect(() => {
    if (!enabled || isMobile || videoCount <= 2) {
      clearTimers();
      return;
    }

    startAutoplay();

    return () => {
      clearTimers();
    };
  }, [enabled, isMobile, videoCount, clearTimers, startAutoplay]);

  return { pause };
};