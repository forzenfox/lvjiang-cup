import { useEffect, useRef } from 'react';

interface UseVisibleRefreshOptions {
  fetchFn: () => Promise<void>;
  intervalMs: number;
  isVisible: boolean;
  enabled?: boolean;
}

export function useVisibleRefresh({
  fetchFn,
  intervalMs,
  isVisible,
  enabled = true,
}: UseVisibleRefreshOptions): void {
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  useEffect(() => {
    if (!isVisible || !enabled) return;

    const timer = setInterval(() => {
      fetchFnRef.current();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isVisible, enabled, intervalMs]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isVisible && enabled) {
        fetchFnRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isVisible, enabled]);
}
