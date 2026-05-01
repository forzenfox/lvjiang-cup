import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMarqueeDuration } from '@/components/features/ThanksSection/useMarqueeDuration';

describe('useMarqueeDuration', () => {
  let contentRef: React.RefObject<HTMLDivElement | null>;
  let containerRef: React.RefObject<HTMLDivElement | null>;

  beforeEach(() => {
    contentRef = { current: document.createElement('div') };
    containerRef = { current: document.createElement('div') };

    // 默认桌面端宽度
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1368,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('桌面端应该使用 130px/s 的速度计算 duration', () => {
    // 模拟内容宽度 9600px（scrollWidth 包含两份内容）
    Object.defineProperty(contentRef.current!, 'scrollWidth', {
      value: 19200,
      configurable: true,
    });

    const { result } = renderHook(() => useMarqueeDuration({ contentRef, containerRef }));

    // 9600 / 130 = 73.85，无上限限制，所以是 73.85
    expect(result.current).toBeCloseTo(73.85, 1);
  });

  it('移动端应该使用 80px/s 的速度计算 duration', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    Object.defineProperty(contentRef.current!, 'scrollWidth', {
      value: 19200,
      configurable: true,
    });

    const { result } = renderHook(() => useMarqueeDuration({ contentRef, containerRef }));

    // 9600 / 80 = 120，无上限限制，所以是 120
    expect(result.current).toBe(120);
  });

  it('duration 应该不小于最小值 15 秒', () => {
    Object.defineProperty(contentRef.current!, 'scrollWidth', {
      value: 2000, // 单份 1000px，很小
      configurable: true,
    });

    const { result } = renderHook(() => useMarqueeDuration({ contentRef, containerRef }));

    // 1000 / 150 = 6.67，但最小值是 15
    expect(result.current).toBe(15);
  });

  it('极大内容时 duration 不应该有上限', () => {
    Object.defineProperty(contentRef.current!, 'scrollWidth', {
      value: 50000, // 单份 25000px，很大
      configurable: true,
    });

    const { result } = renderHook(() => useMarqueeDuration({ contentRef, containerRef }));

    // 25000 / 130 = 192.31，无上限限制，直接使用计算值
    expect(result.current).toBeCloseTo(192.31, 1);
  });

  it('中等宽度内容应该返回正确计算的 duration', () => {
    Object.defineProperty(contentRef.current!, 'scrollWidth', {
      value: 7200, // 单份 3600px
      configurable: true,
    });

    const { result } = renderHook(() => useMarqueeDuration({ contentRef, containerRef }));

    // 3600 / 130 = 27.69，在合理范围内
    expect(result.current).toBeCloseTo(27.69, 1);
  });

  it('窗口大小变化时应该重新计算 duration', () => {
    Object.defineProperty(contentRef.current!, 'scrollWidth', {
      value: 7200,
      configurable: true,
    });

    const { result } = renderHook(() => useMarqueeDuration({ contentRef, containerRef }));

    expect(result.current).toBeCloseTo(27.69, 1);

    // 切换到移动端
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));
    });

    // 3600 / 80 = 45
    expect(result.current).toBe(45);
  });

  it('refs 为 null 时应该返回默认值 30', () => {
    const nullContentRef = { current: null };
    const nullContainerRef = { current: null };

    const { result } = renderHook(() =>
      useMarqueeDuration({ contentRef: nullContentRef, containerRef: nullContainerRef })
    );

    expect(result.current).toBe(30);
  });

  it('组件卸载时应该移除 resize 监听器', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    Object.defineProperty(contentRef.current!, 'scrollWidth', {
      value: 7200,
      configurable: true,
    });

    const { unmount } = renderHook(() => useMarqueeDuration({ contentRef, containerRef }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
