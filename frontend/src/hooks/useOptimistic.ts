import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

/**
 * 乐观更新状态
 */
interface OptimisticState<T> {
  /** 当前显示的数据（可能是乐观数据） */
  data: T;
  /** 是否正在提交 */
  isPending: boolean;
  /** 是否出错 */
  error: Error | null;
  /** 是否是乐观数据 */
  isOptimistic: boolean;
}

/**
 * 乐观更新配置
 */
interface OptimisticConfig<T> {
  /** 初始数据 */
  initialData: T;
  /** 提交函数 */
  onSubmit: (data: T) => Promise<T>;
  /** 成功回调 */
  onSuccess?: (data: T) => void;
  /** 错误回调 */
  onError?: (error: Error, rollbackData: T) => void;
  /** 成功提示消息 */
  successMessage?: string;
  /** 错误提示消息 */
  errorMessage?: string;
  /** 是否显示 toast */
  showToast?: boolean;
}

/**
 * 乐观更新 Hook
 * 用于实现乐观更新模式，先更新 UI 再发送请求
 *
 * @example
 * const { data, isPending, update, rollback } = useOptimistic({
 *   initialData: { count: 0 },
 *   onSubmit: async (data) => {
 *     return await api.updateCount(data.count);
 *   },
 *   onSuccess: () => toast.success('更新成功'),
 *   onError: () => toast.error('更新失败'),
 * });
 */
export function useOptimistic<T>(config: OptimisticConfig<T>) {
  const {
    initialData,
    onSubmit,
    onSuccess,
    onError,
    successMessage,
    errorMessage = '操作失败，已恢复原始数据',
    showToast = true,
  } = config;

  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isPending: false,
    error: null,
    isOptimistic: false,
  });

  // 保存原始数据用于回滚
  const originalDataRef = useRef<T>(initialData);
  // 保存当前待提交的乐观数据
  const pendingDataRef = useRef<T | null>(null);

  /**
   * 执行乐观更新
   */
  const update = useCallback(
    async (optimisticData: T | ((prev: T) => T)) => {
      const newData =
        typeof optimisticData === 'function'
          ? (optimisticData as (prev: T) => T)(state.data)
          : optimisticData;

      // 保存原始数据
      originalDataRef.current = state.data;
      pendingDataRef.current = newData;

      // 立即更新 UI（乐观更新）
      setState({
        data: newData,
        isPending: true,
        error: null,
        isOptimistic: true,
      });

      try {
        // 发送实际请求
        const result = await onSubmit(newData);

        // 请求成功，更新为真实数据
        setState({
          data: result,
          isPending: false,
          error: null,
          isOptimistic: false,
        });

        pendingDataRef.current = null;

        // 显示成功提示
        if (showToast && successMessage) {
          toast.success(successMessage);
        }

        // 调用成功回调
        onSuccess?.(result);

        return { success: true, data: result };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        // 请求失败，回滚到原始数据
        setState({
          data: originalDataRef.current,
          isPending: false,
          error,
          isOptimistic: false,
        });

        pendingDataRef.current = null;

        // 显示错误提示
        if (showToast) {
          toast.error(errorMessage, {
            description: error.message,
          });
        }

        // 调用错误回调
        onError?.(error, originalDataRef.current);

        return { success: false, error };
      }
    },
    [state.data, onSubmit, onSuccess, onError, successMessage, errorMessage, showToast]
  );

  /**
   * 手动回滚到原始数据
   */
  const rollback = useCallback(() => {
    setState({
      data: originalDataRef.current,
      isPending: false,
      error: null,
      isOptimistic: false,
    });
    pendingDataRef.current = null;
  }, []);

  /**
   * 重置到初始状态
   */
  const reset = useCallback(() => {
    setState({
      data: initialData,
      isPending: false,
      error: null,
      isOptimistic: false,
    });
    originalDataRef.current = initialData;
    pendingDataRef.current = null;
  }, [initialData]);

  /**
   * 手动设置数据
   */
  const setData = useCallback((data: T | ((prev: T) => T)) => {
    setState(prev => ({
      ...prev,
      data: typeof data === 'function' ? (data as (prev: T) => T)(prev.data) : data,
      isOptimistic: false,
    }));
  }, []);

  return {
    ...state,
    update,
    rollback,
    reset,
    setData,
  };
}

/**
 * 批量乐观更新配置
 */
interface BatchOptimisticConfig<T extends { id: string | number }> {
  /** 初始数据列表 */
  initialData: T[];
  /** 提交函数 */
  onSubmit: (item: T) => Promise<T>;
  /** 成功回调 */
  onSuccess?: (item: T) => void;
  /** 错误回调 */
  onError?: (error: Error, item: T) => void;
  /** 是否显示 toast */
  showToast?: boolean;
}

/**
 * 批量乐观更新 Hook
 * 用于处理列表数据的乐观更新
 */
export function useBatchOptimistic<T extends { id: string | number }>(
  config: BatchOptimisticConfig<T>
) {
  const { initialData, onSubmit, onSuccess, onError, showToast = true } = config;

  const [items, setItems] = useState<T[]>(initialData);
  const [pendingIds, setPendingIds] = useState<Set<string | number>>(new Set());

  // 保存原始数据
  const originalItemsRef = useRef<Map<string | number, T>>(new Map());

  /**
   * 更新单个项目
   */
  const updateItem = useCallback(
    async (id: string | number, updates: Partial<T>) => {
      const item = items.find(i => i.id === id);
      if (!item) return { success: false, error: new Error('Item not found') };

      const updatedItem = { ...item, ...updates };

      // 保存原始数据
      originalItemsRef.current.set(id, item);

      // 乐观更新
      setItems(prev => prev.map(i => (i.id === id ? updatedItem : i)));
      setPendingIds(prev => new Set(prev).add(id));

      try {
        const result = await onSubmit(updatedItem);

        // 更新为真实数据
        setItems(prev => prev.map(i => (i.id === id ? result : i)));
        setPendingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        originalItemsRef.current.delete(id);

        onSuccess?.(result);

        return { success: true, data: result };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        // 回滚
        const originalItem = originalItemsRef.current.get(id);
        if (originalItem) {
          setItems(prev => prev.map(i => (i.id === id ? originalItem : i)));
        }

        setPendingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        originalItemsRef.current.delete(id);

        if (showToast) {
          toast.error('操作失败', {
            description: error.message,
          });
        }

        onError?.(error, item);

        return { success: false, error };
      }
    },
    [items, onSubmit, onSuccess, onError, showToast]
  );

  /**
   * 检查项目是否正在提交
   */
  const isPending = useCallback((id: string | number) => pendingIds.has(id), [pendingIds]);

  /**
   * 设置数据
   */
  const setData = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  return {
    items,
    pendingIds,
    updateItem,
    isPending,
    setData,
  };
}

export default useOptimistic;
