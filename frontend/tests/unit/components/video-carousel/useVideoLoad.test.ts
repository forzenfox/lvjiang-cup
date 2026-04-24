import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVideoLoad } from '@/components/video-carousel/hooks/useVideoLoad';

describe('useVideoLoad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useVideoLoad('BV1xx411c7XZ'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('provides retry function', () => {
    const { result } = renderHook(() => useVideoLoad('BV1xx411c7XZ'));

    expect(result.current.retry).toBeDefined();
    expect(typeof result.current.retry).toBe('function');
  });
});
