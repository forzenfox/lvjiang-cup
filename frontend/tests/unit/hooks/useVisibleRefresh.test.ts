import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVisibleRefresh } from '@/hooks/useVisibleRefresh';

describe('useVisibleRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('可见时按指定间隔调用 fetchFn', () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);
    const isVisible = true;

    renderHook(() => useVisibleRefresh({ fetchFn, intervalMs: 15000, isVisible }));

    // 初始不调用
    expect(fetchFn).not.toHaveBeenCalled();

    // 快进15秒
    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // 再快进15秒
    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('不可见时不启动定时器', () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);
    const isVisible = false;

    renderHook(() => useVisibleRefresh({ fetchFn, intervalMs: 15000, isVisible }));

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('从不可见变为可见时启动定时器', () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);

    const { rerender } = renderHook(
      ({ isVisible }) => useVisibleRefresh({ fetchFn, intervalMs: 15000, isVisible }),
      { initialProps: { isVisible: false } }
    );

    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(fetchFn).not.toHaveBeenCalled();

    // 变为可见
    rerender({ isVisible: true });

    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('从可见变为不可见时停止定时器', () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);

    const { rerender } = renderHook(
      ({ isVisible }) => useVisibleRefresh({ fetchFn, intervalMs: 15000, isVisible }),
      { initialProps: { isVisible: true } }
    );

    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);

    // 变为不可见
    rerender({ isVisible: false });

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    // 不应再调用
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('enabled 为 false 时不启动定时器', () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);

    renderHook(() =>
      useVisibleRefresh({ fetchFn, intervalMs: 15000, isVisible: true, enabled: false })
    );

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('页面从后台恢复且可见时，调用一次 fetchFn', () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);

    renderHook(() => useVisibleRefresh({ fetchFn, intervalMs: 15000, isVisible: true }));

    // 模拟页面进入后台
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // 模拟页面恢复
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('页面不可见时不调用 fetchFn', () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);

    renderHook(() => useVisibleRefresh({ fetchFn, intervalMs: 15000, isVisible: true }));

    // 模拟页面进入后台
    act(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('组件卸载时清除定时器', () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined);

    const { unmount } = renderHook(() =>
      useVisibleRefresh({ fetchFn, intervalMs: 15000, isVisible: true })
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(fetchFn).not.toHaveBeenCalled();
  });
});
