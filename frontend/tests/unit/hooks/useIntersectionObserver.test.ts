import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

describe('useIntersectionObserver', () => {
  let observerCallback: IntersectionObserverCallback | null = null;
  let observeMock: ReturnType<typeof vi.fn>;
  let unobserveMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;
  let constructorCalls: Array<{
    callback: IntersectionObserverCallback;
    options?: IntersectionObserverInit;
  }> = [];

  beforeEach(() => {
    observeMock = vi.fn();
    unobserveMock = vi.fn();
    disconnectMock = vi.fn();
    observerCallback = null;
    constructorCalls = [];

    // 使用 class 语法确保可以作为构造函数调用
    const MockObserver = class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        observerCallback = callback;
        constructorCalls.push({ callback, options });
      }
      observe = observeMock;
      unobserve = unobserveMock;
      disconnect = disconnectMock;
    };

    vi.stubGlobal('IntersectionObserver', MockObserver);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('元素未进入视口时，isVisible 为 false', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    const div = document.createElement('div');
    act(() => {
      result.current.ref(div);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('元素进入视口时，isVisible 变为 true', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    const div = document.createElement('div');
    act(() => {
      result.current.ref(div);
    });

    act(() => {
      observerCallback!(
        [{ isIntersecting: true, target: div }] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('一旦可见后不再观察（单次触发）', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    const div = document.createElement('div');
    act(() => {
      result.current.ref(div);
    });

    act(() => {
      observerCallback!(
        [{ isIntersecting: true, target: div }] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });

    expect(unobserveMock).toHaveBeenCalledWith(div);
  });

  it('组件卸载时断开 observer', () => {
    const { result, unmount } = renderHook(() => useIntersectionObserver());

    const div = document.createElement('div');
    act(() => {
      result.current.ref(div);
    });

    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });

  it('options 参数正确传递给 IntersectionObserver', () => {
    const options: IntersectionObserverInit = { threshold: 0.5, rootMargin: '10px' };

    const { result } = renderHook(() => useIntersectionObserver(options));

    const div = document.createElement('div');
    act(() => {
      result.current.ref(div);
    });

    expect(constructorCalls.length).toBe(1);
    expect(constructorCalls[0].options).toEqual(expect.objectContaining(options));
  });

  it('ref 为 null 时不报错且不创建 observer', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.isVisible).toBe(false);
    expect(constructorCalls.length).toBe(0);
  });

  it('ref 绑定到 DOM 元素后创建 observer 并观察', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    const div = document.createElement('div');
    act(() => {
      result.current.ref(div);
    });

    expect(observeMock).toHaveBeenCalledWith(div);
  });

  it('多次调用 ref 只观察最后一个元素', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    act(() => {
      result.current.ref(div1);
    });
    act(() => {
      result.current.ref(div2);
    });

    expect(observeMock).toHaveBeenLastCalledWith(div2);
  });
});
