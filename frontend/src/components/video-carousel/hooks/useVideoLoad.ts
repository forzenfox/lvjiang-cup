import { useState, useCallback, useEffect } from 'react';

interface UseVideoLoadResult {
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}

export const useVideoLoad = (bvid: string): UseVideoLoadResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [bvid]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
  }, []);

  return {
    isLoading,
    isError,
    retry,
  };
};