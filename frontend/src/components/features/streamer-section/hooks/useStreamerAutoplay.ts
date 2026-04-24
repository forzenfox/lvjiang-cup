import { useEffect, useRef, useCallback } from 'react';

interface UseStreamerAutoplayOptions {
  enabled: boolean;
  onNext: () => void;
  streamerCount: number;
  isMobile: boolean;
  interval?: number;
  pauseDuration?: number;
}

interface UseStreamerAutoplayResult {
  pause: () => void;
}

export const useStreamerAutoplay = ({
  enabled,
  onNext,
  streamerCount,
  isMobile,
  interval = 6000,
  pauseDuration = 30000,
}: UseStreamerAutoplayOptions): UseStreamerAutoplayResult => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    if (enabled && !isMobile && streamerCount > 1 && !isPausedRef.current) {
      timerRef.current = setInterval(() => {
        onNext();
      }, interval);
    }
  }, [enabled, isMobile, streamerCount, onNext, interval, clearTimer]);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    clearTimer();

    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    pauseTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
      startTimer();
    }, pauseDuration);
  }, [clearTimer, startTimer, pauseDuration]);

  useEffect(() => {
    startTimer();
    return () => {
      clearTimer();
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, [startTimer, clearTimer]);

  return { pause };
};
