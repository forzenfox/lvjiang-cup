import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimistic, useBatchOptimistic } from '@/hooks/useOptimistic';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useOptimistic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useOptimistic', () => {
    it('should initialize with initial data', () => {
      const { result } = renderHook(() =>
        useOptimistic({
          initialData: { count: 0 },
          onSubmit: vi.fn(),
        })
      );

      expect(result.current.data).toEqual({ count: 0 });
      expect(result.current.isPending).toBe(false);
      expect(result.current.isOptimistic).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should perform optimistic update successfully', async () => {
      const onSubmit = vi.fn().mockResolvedValue({ count: 1 });
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useOptimistic({
          initialData: { count: 0 },
          onSubmit,
          onSuccess,
          showToast: false,
        })
      );

      // 执行乐观更新
      await act(async () => {
        await result.current.update({ count: 1 });
      });

      expect(onSubmit).toHaveBeenCalledWith({ count: 1 });
      expect(onSuccess).toHaveBeenCalledWith({ count: 1 });
      expect(result.current.data).toEqual({ count: 1 });
      expect(result.current.isPending).toBe(false);
      expect(result.current.isOptimistic).toBe(false);
    });

    it('should rollback on error', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('Update failed'));
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useOptimistic({
          initialData: { count: 0 },
          onSubmit,
          onError,
          showToast: false,
        })
      );

      // 执行乐观更新（会失败）
      await act(async () => {
        await result.current.update({ count: 1 });
      });

      expect(onSubmit).toHaveBeenCalledWith({ count: 1 });
      expect(onError).toHaveBeenCalled();
      // 应该回滚到原始数据
      expect(result.current.data).toEqual({ count: 0 });
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should show optimistic state immediately', async () => {
      let resolveSubmit: (value: { count: number }) => void;
      const onSubmit = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSubmit = resolve;
          })
      );

      const { result } = renderHook(() =>
        useOptimistic({
          initialData: { count: 0 },
          onSubmit,
          showToast: false,
        })
      );

      // 开始更新
      act(() => {
        result.current.update({ count: 1 });
      });

      // 立即显示乐观数据
      expect(result.current.data).toEqual({ count: 1 });
      expect(result.current.isPending).toBe(true);
      expect(result.current.isOptimistic).toBe(true);

      // 完成更新
      await act(async () => {
        resolveSubmit!({ count: 1 });
      });

      expect(result.current.isPending).toBe(false);
    });

    it('should support functional update', async () => {
      const onSubmit = vi.fn().mockImplementation((data) => Promise.resolve(data));

      const { result } = renderHook(() =>
        useOptimistic({
          initialData: { count: 0 },
          onSubmit,
          showToast: false,
        })
      );

      await act(async () => {
        await result.current.update((prev) => ({ count: prev.count + 1 }));
      });

      expect(result.current.data).toEqual({ count: 1 });
    });

    it('should support manual rollback', async () => {
      const onSubmit = vi.fn().mockResolvedValue({ count: 1 });

      const { result } = renderHook(() =>
        useOptimistic({
          initialData: { count: 0 },
          onSubmit,
          showToast: false,
        })
      );

      // 先更新数据
      await act(async () => {
        await result.current.update({ count: 1 });
      });

      expect(result.current.data).toEqual({ count: 1 });

      // 手动回滚
      act(() => {
        result.current.rollback();
      });

      expect(result.current.data).toEqual({ count: 0 });
    });

    it('should support reset', async () => {
      const onSubmit = vi.fn().mockResolvedValue({ count: 1 });

      const { result } = renderHook(() =>
        useOptimistic({
          initialData: { count: 0 },
          onSubmit,
          showToast: false,
        })
      );

      // 先更新数据
      await act(async () => {
        await result.current.update({ count: 1 });
      });

      // 重置
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toEqual({ count: 0 });
      expect(result.current.error).toBeNull();
      expect(result.current.isPending).toBe(false);
    });

    it('should support manual setData', () => {
      const { result } = renderHook(() =>
        useOptimistic({
          initialData: { count: 0 },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setData({ count: 5 });
      });

      expect(result.current.data).toEqual({ count: 5 });
      expect(result.current.isOptimistic).toBe(false);
    });
  });

  describe('useBatchOptimistic', () => {
    interface Item {
      id: number;
      name: string;
      completed: boolean;
    }

    const initialItems: Item[] = [
      { id: 1, name: 'Item 1', completed: false },
      { id: 2, name: 'Item 2', completed: false },
      { id: 3, name: 'Item 3', completed: false },
    ];

    it('should initialize with initial items', () => {
      const { result } = renderHook(() =>
        useBatchOptimistic({
          initialData: initialItems,
          onSubmit: vi.fn(),
        })
      );

      expect(result.current.items).toEqual(initialItems);
      expect(result.current.pendingIds.size).toBe(0);
    });

    it('should update item optimistically', async () => {
      const onSubmit = vi.fn().mockImplementation((item) => Promise.resolve(item));

      const { result } = renderHook(() =>
        useBatchOptimistic({
          initialData: initialItems,
          onSubmit,
          showToast: false,
        })
      );

      await act(async () => {
        await result.current.updateItem(1, { completed: true });
      });

      // 检查更新后的数据
      const updatedItem = result.current.items.find((i) => i.id === 1);
      expect(updatedItem?.completed).toBe(true);
      expect(result.current.isPending(1)).toBe(false);
    });

    it('should show pending state during update', async () => {
      let resolveSubmit: (value: Item) => void;
      const onSubmit = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSubmit = resolve;
          })
      );

      const { result } = renderHook(() =>
        useBatchOptimistic({
          initialData: initialItems,
          onSubmit,
          showToast: false,
        })
      );

      // 开始更新
      act(() => {
        result.current.updateItem(1, { completed: true });
      });

      // 检查 pending 状态
      expect(result.current.isPending(1)).toBe(true);

      // 完成更新
      await act(async () => {
        resolveSubmit!({ ...initialItems[0], completed: true });
      });

      expect(result.current.isPending(1)).toBe(false);
    });

    it('should rollback on error', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('Update failed'));
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useBatchOptimistic({
          initialData: initialItems,
          onSubmit,
          onError,
          showToast: false,
        })
      );

      await act(async () => {
        await result.current.updateItem(1, { completed: true });
      });

      // 应该回滚
      const item = result.current.items.find((i) => i.id === 1);
      expect(item?.completed).toBe(false);
      expect(onError).toHaveBeenCalled();
    });

    it('should handle multiple concurrent updates', async () => {
      const onSubmit = vi.fn().mockImplementation((item) => Promise.resolve(item));

      const { result } = renderHook(() =>
        useBatchOptimistic({
          initialData: initialItems,
          onSubmit,
          showToast: false,
        })
      );

      // 同时更新多个项目
      await act(async () => {
        await Promise.all([
          result.current.updateItem(1, { completed: true }),
          result.current.updateItem(2, { completed: true }),
          result.current.updateItem(3, { name: 'Updated Item 3' }),
        ]);
      });

      expect(result.current.items[0].completed).toBe(true);
      expect(result.current.items[1].completed).toBe(true);
      expect(result.current.items[2].name).toBe('Updated Item 3');
    });

    it('should support setData', () => {
      const { result } = renderHook(() =>
        useBatchOptimistic({
          initialData: initialItems,
          onSubmit: vi.fn(),
        })
      );

      const newItems = [{ id: 4, name: 'New Item', completed: false }];

      act(() => {
        result.current.setData(newItems);
      });

      expect(result.current.items).toEqual(newItems);
    });

    it('should return error for non-existent item', async () => {
      const onSubmit = vi.fn();

      const { result } = renderHook(() =>
        useBatchOptimistic({
          initialData: initialItems,
          onSubmit,
          showToast: false,
        })
      );

      const updateResult = await act(async () => {
        return await result.current.updateItem(999, { completed: true });
      });

      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBeInstanceOf(Error);
    });
  });
});
