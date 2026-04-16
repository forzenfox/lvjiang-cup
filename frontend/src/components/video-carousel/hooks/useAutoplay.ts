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
  enabled: _enabled,
  onAutoplay: _onAutoplay,
  videoCount: _videoCount,
  isMobile: _isMobile,
}: UseAutoplayOptions): UseAutoplayResult => {
  const pause = useCallback(() => {}, []);

  return { pause };
};
