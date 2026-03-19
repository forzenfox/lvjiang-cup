import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 防抖 Hook
 * 用于延迟执行函数，直到停止调用一段时间后才执行
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // 500ms 后执行搜索
 *   performSearch(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖函数 Hook
 * 返回一个防抖后的函数
 *
 * @example
 * const debouncedSearch = useDebounceCallback(
 *   (query: string) => {
 *     searchAPI(query);
 *   },
 *   500
 * );
 *
 * // 在输入时调用
 * debouncedSearch(inputValue);
 */
export function useDebounceCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  options: {
    leading?: boolean; // 是否在延迟开始前调用
    trailing?: boolean; // 是否在延迟结束后调用
  } = { leading: false, trailing: true }
): {
  run: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
} {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const lastCallTimeRef = useRef<number | null>(null);

  // 保持 callback 引用最新
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastArgsRef.current = null;
    lastCallTimeRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current && lastArgsRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      callbackRef.current(...lastArgsRef.current);
      lastArgsRef.current = null;
      lastCallTimeRef.current = null;
    }
  }, []);

  const pending = useCallback(() => {
    return timeoutRef.current !== null;
  }, []);

  const run = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      lastArgsRef.current = args;

      const invoke = () => {
        callbackRef.current(...args);
        lastCallTimeRef.current = now;
        timeoutRef.current = null;
        lastArgsRef.current = null;
      };

      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 处理 leading 选项
      if (options.leading) {
        const isFirstCall = lastCallTimeRef.current === null;
        const shouldCallNow =
          isFirstCall || (lastCallTimeRef.current && now - lastCallTimeRef.current >= delay);

        if (shouldCallNow) {
          invoke();
          return;
        }
      }

      // 设置新的定时器
      if (options.trailing !== false) {
        timeoutRef.current = setTimeout(invoke, delay);
      }
    },
    [delay, options.leading, options.trailing]
  );

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { run, cancel, flush, pending };
}

/**
 * 防抖请求 Hook
 * 专门用于处理 API 请求的防抖
 *
 * @example
 * const { run: search, loading, error, data } = useDebouncedRequest(
 *   async (query: string) => {
 *     return await searchAPI(query);
 *   },
 *   500
 * );
 */
export function useDebouncedRequest<T, Args extends unknown[]>(
  requestFn: (...args: Args) => Promise<T>,
  delay: number,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    onFinally?: () => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { run: debouncedRun, cancel: cancelDebounce } = useDebounceCallback(
    async (...args: Args) => {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 创建新的 AbortController
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const result = await requestFn(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // 请求被取消，不设置错误状态
          return null;
        }
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
        options.onFinally?.();
      }
    },
    delay
  );

  const cancel = useCallback(() => {
    cancelDebounce();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [cancelDebounce]);

  const reset = useCallback(() => {
    cancel();
    setData(null);
    setError(null);
    setLoading(false);
  }, [cancel]);

  // 组件卸载时取消请求
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    run: debouncedRun,
    cancel,
    reset,
    data,
    loading,
    error,
  };
}

/**
 * 防抖输入 Hook
 * 用于处理输入框的防抖
 *
 * @example
 * const { value, onChange, debouncedValue } = useDebouncedInput('', 500);
 *
 * useEffect(() => {
 *   search(debouncedValue);
 * }, [debouncedValue]);
 */
export function useDebouncedInput(initialValue: string = '', delay: number = 500) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, delay);

  const onChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    onChange,
    debouncedValue,
    setValue,
    reset,
  };
}

/**
 * 防抖搜索 Hook
 * 专门用于搜索功能的防抖封装
 *
 * @example
 * const {
 *   query,
 *   setQuery,
 *   results,
 *   loading,
 *   error,
 * } = useDebouncedSearch(
 *   async (q) => await searchAPI(q),
 *   { delay: 300, minLength: 2 }
 * );
 */
export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T>,
  options: {
    delay?: number;
    minLength?: number;
    initialQuery?: string;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { delay = 300, minLength = 2, initialQuery = '', onSuccess, onError } = options;

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    // 如果查询长度小于最小长度，不执行搜索
    if (debouncedQuery.length < minLength) {
      setResults(null);
      return;
    }

    let cancelled = false;

    const performSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await searchFn(debouncedQuery);
        if (!cancelled) {
          setResults(data);
          onSuccess?.(data);
        }
      } catch (err) {
        if (!cancelled) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          onError?.(error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, minLength, searchFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setQuery(initialQuery);
    setResults(null);
    setError(null);
    setLoading(false);
  }, [initialQuery]);

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    loading,
    error,
    reset,
  };
}

export default useDebounce;
