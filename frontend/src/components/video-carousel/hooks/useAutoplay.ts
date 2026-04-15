import { useCallback } from 'react';

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
  const pause = useCallback(() => {
  }, []);

  return { pause };
};