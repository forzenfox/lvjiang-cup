import { useEffect, useRef, useCallback, useState, useMemo } from 'react';

/**
 * 性能监控指标
 */
interface PerformanceMetrics {
  /** 首次内容绘制 */
  fcp?: number;
  /** 最大内容绘制 */
  lcp?: number;
  /** 首次输入延迟 */
  fid?: number;
  /** 累积布局偏移 */
  cls?: number;
  /** 首次字节时间 */
  ttfb?: number;
  /** 可交互时间 */
  tti?: number;
}

/**
 * 使用性能监控
 * 监控页面核心性能指标
 */
export function usePerformanceMonitoring(
  onMetrics?: (metrics: PerformanceMetrics) => void
): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const observersRef = useRef<PerformanceObserver[]>([]);

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    const newMetrics: PerformanceMetrics = {};

    // 监听 LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        newMetrics.lcp = lastEntry.startTime;
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      observersRef.current.push(lcpObserver);
    } catch {
      // 浏览器不支持
    }

    // 监听 FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as PerformanceEntry & {
            processingStart: number;
            startTime: number;
          };
          const fid = fidEntry.processingStart - fidEntry.startTime;
          newMetrics.fid = fid;
          setMetrics(prev => ({ ...prev, fid }));
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      observersRef.current.push(fidObserver);
    } catch {
      // 浏览器不支持
    }

    // 监听 CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const clsEntry = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
            newMetrics.cls = clsValue;
            setMetrics(prev => ({ ...prev, cls: clsValue }));
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      observersRef.current.push(clsObserver);
    } catch {
      // 浏览器不支持
    }

    // 获取 FCP (First Contentful Paint)
    try {
      const paintObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            const fcpEntry = entry as PerformanceEntry & { startTime: number };
            newMetrics.fcp = fcpEntry.startTime;
            setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      observersRef.current.push(paintObserver);
    } catch {
      // 浏览器不支持
    }

    // 获取 TTFB (Time to First Byte)
    try {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        newMetrics.ttfb = navigation.responseStart - navigation.startTime;
        setMetrics(prev => ({ ...prev, ttfb: newMetrics.ttfb }));
      }
    } catch {
      // 浏览器不支持
    }

    // 清理函数
    return () => {
      observersRef.current.forEach(observer => observer.disconnect());
      observersRef.current = [];
    };
  }, []);

  // 当指标更新时调用回调
  useEffect(() => {
    if (onMetrics && Object.keys(metrics).length > 0) {
      onMetrics(metrics);
    }
  }, [metrics, onMetrics]);

  return metrics;
}

/**
 * 使用 RAF (Request Animation Frame) 节流
 * 用于优化高频更新（如滚动、鼠标移动）
 */
export function useRafThrottle<T extends (...args: unknown[]) => void>(
  callback: T
): (...args: Parameters<T>) => void {
  const rafIdRef = useRef<number | null>(null);
  const latestArgsRef = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      latestArgsRef.current = args;

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (latestArgsRef.current) {
            callback(...latestArgsRef.current);
          }
          rafIdRef.current = null;
          latestArgsRef.current = null;
        });
      }
    },
    [callback]
  );
}

/**
 * 使用 Intersection Observer
 * 用于实现懒加载、无限滚动等
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit & {
    onIntersect?: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void;
    triggerOnce?: boolean;
  }
): {
  ref: React.RefObject<HTMLElement>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
} {
  const { onIntersect, triggerOnce = false, ...observerOptions } = options || {};
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
      setIsIntersecting(entry.isIntersecting);

      if (onIntersect) {
        onIntersect(entry.isIntersecting, entry);
      }

      if (triggerOnce && entry.isIntersecting) {
        hasTriggeredRef.current = true;
        observer.unobserve(element);
      }
    }, observerOptions);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    onIntersect,
    triggerOnce,
    observerOptions.threshold,
    observerOptions.root,
    observerOptions.rootMargin,
  ]);

  return { ref: ref as React.RefObject<HTMLElement>, isIntersecting, entry };
}

/**
 * 使用虚拟列表
 * 用于优化长列表渲染性能
 */
export function useVirtualList<T>(
  items: T[],
  options: {
    itemHeight: number;
    overscan?: number;
    containerHeight: number;
  }
): {
  virtualItems: Array<{ item: T; index: number; style: React.CSSProperties }>;
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  scrollToIndex: (index: number) => void;
} {
  const { itemHeight, overscan = 5, containerHeight } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算可见范围
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);

  // 虚拟列表项
  const virtualItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  // 总高度
  const totalHeight = items.length * itemHeight;

  // 滚动到指定索引
  const scrollToIndex = useCallback(
    (index: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = index * itemHeight;
      }
    },
    [itemHeight]
  );

  // 监听滚动
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    scrollToIndex,
  };
}

/**
 * 使用组件渲染计数
 * 用于开发时调试渲染性能
 */
export function useRenderCount(componentName: string): number {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCountRef.current} times`);
    }
  });

  return renderCountRef.current;
}

/**
 * 使用长任务监控
 * 检测阻塞主线程的长任务
 */
export function useLongTaskMonitoring(
  onLongTask?: (duration: number, entry: PerformanceEntry) => void,
  threshold: number = 50
): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const longTaskEntry = entry as PerformanceEntry & { duration: number };
          if (longTaskEntry.duration > threshold) {
            onLongTask?.(longTaskEntry.duration, entry);
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });

      return () => {
        observer.disconnect();
      };
    } catch {
      // 浏览器不支持
    }
  }, [onLongTask, threshold]);
}

/**
 * 使用资源加载监控
 * 监控图片、脚本等资源加载性能
 */
export function useResourceMonitoring(
  onResourceLoad?: (entry: PerformanceResourceTiming) => void
): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          onResourceLoad?.(entry as PerformanceResourceTiming);
        });
      });

      observer.observe({ entryTypes: ['resource'] });

      return () => {
        observer.disconnect();
      };
    } catch {
      // 浏览器不支持
    }
  }, [onResourceLoad]);
}

/**
 * 使用内存监控
 * 监控内存使用情况（仅 Chrome）
 */
export function useMemoryMonitoring(
  onMemoryInfo?: (info: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  }) => void,
  interval: number = 5000
): void {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !(
        performance as unknown as {
          memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
        }
      ).memory
    ) {
      return;
    }

    const timer = setInterval(() => {
      const memory = (
        performance as unknown as {
          memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
        }
      ).memory;
      if (memory) {
        onMemoryInfo?.({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [onMemoryInfo, interval]);
}

/**
 * 使用 Web Worker
 * 将耗时计算放到 Worker 线程
 */
export function useWorker<T, R>(
  workerFunction: (data: T) => R
): {
  run: (data: T) => Promise<R>;
  terminate: () => void;
} {
  const workerRef = useRef<Worker | null>(null);

  // 创建 Worker
  useEffect(() => {
    const workerCode = `
      self.onmessage = function(e) {
        const fn = ${workerFunction.toString()};
        const result = fn(e.data);
        self.postMessage(result);
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    return () => {
      workerRef.current?.terminate();
    };
  }, [workerFunction]);

  const run = useCallback((data: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const handleMessage = (e: MessageEvent) => {
        resolve(e.data as R);
        workerRef.current?.removeEventListener('message', handleMessage);
      };

      const handleError = (e: ErrorEvent) => {
        reject(e.error);
        workerRef.current?.removeEventListener('error', handleError);
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.addEventListener('error', handleError);
      workerRef.current.postMessage(data);
    });
  }, []);

  const terminate = useCallback(() => {
    workerRef.current?.terminate();
  }, []);

  return { run, terminate };
}

/**
 * 使用测量渲染时间
 * 测量组件渲染耗时
 */
export function useMeasureRender(
  componentName: string,
  onMeasure?: (duration: number) => void
): void {
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();
  });

  useEffect(() => {
    const duration = performance.now() - startTimeRef.current;
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
    }
    onMeasure?.(duration);
  });
}

export default {
  usePerformanceMonitoring,
  useRafThrottle,
  useIntersectionObserver,
  useVirtualList,
  useRenderCount,
  useLongTaskMonitoring,
  useResourceMonitoring,
  useMemoryMonitoring,
  useWorker,
  useMeasureRender,
};
