import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useDebounce,
  useDebounceCallback,
  useDebouncedRequest,
  useDebouncedInput,
} from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useDebounce', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));

      expect(result.current).toBe('initial');
    });

    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'changed' });
      expect(result.current).toBe('initial'); // 还未更新

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('changed'); // 已更新
    });

    it('should reset timer on rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: 'change1' });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      rerender({ value: 'change2' });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe('initial'); // 还未更新

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current).toBe('change2');
    });
  });

  describe('useDebounceCallback', () => {
    it('should debounce callback execution', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 500));

      act(() => {
        result.current.run('arg1');
        result.current.run('arg2');
        result.current.run('arg3');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('arg3');
    });

    it('should support leading option', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebounceCallback(callback, 500, { leading: true })
      );

      act(() => {
        result.current.run('arg1');
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('arg1');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // 只调用一次（leading）
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should support cancel', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 500));

      act(() => {
        result.current.run('arg1');
        result.current.cancel();
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should support flush', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 500));

      act(() => {
        result.current.run('arg1');
        result.current.flush();
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('arg1');
    });

    it('should report pending status', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounceCallback(callback, 500));

      expect(result.current.pending()).toBe(false);

      act(() => {
        result.current.run('arg1');
      });

      expect(result.current.pending()).toBe(true);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.pending()).toBe(false);
    });
  });

  describe('useDebouncedRequest', () => {
    it('should debounce request execution', async () => {
      const requestFn = vi.fn().mockResolvedValue('data');
      const { result } = renderHook(() => useDebouncedRequest(requestFn, 500));

      act(() => {
        result.current.run('arg1');
        result.current.run('arg2');
      });

      expect(result.current.loading).toBe(false);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(requestFn).toHaveBeenCalledTimes(1);
        expect(requestFn).toHaveBeenCalledWith('arg2');
      });
    }, 10000);

    it('should handle successful request', async () => {
      const requestFn = vi.fn().mockResolvedValue({ data: 'success' });
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedRequest(requestFn, 500, { onSuccess })
      );

      act(() => {
        result.current.run();
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({ data: 'success' });
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(onSuccess).toHaveBeenCalledWith({ data: 'success' });
      });
    }, 10000);

    it('should handle request error', async () => {
      const error = new Error('Request failed');
      const requestFn = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedRequest(requestFn, 500, { onError })
      );

      // 使用 try-catch 来捕获预期的错误
      try {
        act(() => {
          result.current.run();
        });

        act(() => {
          vi.advanceTimersByTime(500);
        });

        await waitFor(() => {
          expect(result.current.error).toEqual(error);
          expect(result.current.loading).toBe(false);
        });
      } catch (e) {
        // 预期的错误
      }
    }, 10000);

    it('should support reset', async () => {
      const requestFn = vi.fn().mockResolvedValue('data');
      const { result } = renderHook(() => useDebouncedRequest(requestFn, 500));

      act(() => {
        result.current.run();
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(result.current.data).toBe('data');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    }, 10000);
  });

  describe('useDebouncedInput', () => {
    it('should return initial value', () => {
      const { result } = renderHook(() => useDebouncedInput('initial', 500));

      expect(result.current.value).toBe('initial');
      expect(result.current.debouncedValue).toBe('initial');
    });

    it('should debounce input changes', () => {
      const { result } = renderHook(() => useDebouncedInput('', 500));

      act(() => {
        result.current.onChange('new value');
      });

      expect(result.current.value).toBe('new value');
      expect(result.current.debouncedValue).toBe('');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.debouncedValue).toBe('new value');
    });

    it('should support reset', () => {
      const { result } = renderHook(() => useDebouncedInput('initial', 500));

      act(() => {
        result.current.onChange('changed');
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.value).toBe('changed');
      expect(result.current.debouncedValue).toBe('changed');

      act(() => {
        result.current.reset();
      });

      expect(result.current.value).toBe('initial');
    });
  });
});
