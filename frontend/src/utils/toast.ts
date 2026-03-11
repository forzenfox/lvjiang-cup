import { toast as sonnerToast, type ToastT, type ExternalToast } from 'sonner';

/**
 * Toast 类型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

/**
 * Toast 配置选项
 */
export interface ToastOptions extends ExternalToast {
  /** Toast 类型 */
  type?: ToastType;
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 持续时间（毫秒） */
  duration?: number;
  /** 是否显示关闭按钮 */
  closeButton?: boolean;
  /** 操作按钮 */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** 取消按钮 */
  cancel?: {
    label: string;
    onClick?: () => void;
  };
}

/**
 * 默认配置
 */
const defaultOptions: Partial<ToastOptions> = {
  duration: 4000,
  closeButton: true,
};

/**
 * 显示 Toast
 */
function show(options: ToastOptions): string | number {
  const { type = 'info', title, description, ...rest } = options;

  const mergedOptions = { ...defaultOptions, ...rest };

  switch (type) {
    case 'success':
      return sonnerToast.success(title, {
        description,
        ...mergedOptions,
      });
    case 'error':
      return sonnerToast.error(title, {
        description,
        ...mergedOptions,
        duration: 6000, // 错误消息显示更久
      });
    case 'warning':
      return sonnerToast.warning(title, {
        description,
        ...mergedOptions,
      });
    case 'loading':
      return sonnerToast.loading(title, {
        description,
        ...mergedOptions,
        duration: Infinity, // loading 不自动关闭
      });
    case 'info':
    default:
      return sonnerToast.info(title, {
        description,
        ...mergedOptions,
      });
  }
}

/**
 * 显示成功 Toast
 */
function success(title: string, description?: string, options?: ExternalToast): string | number {
  return sonnerToast.success(title, {
    description,
    ...defaultOptions,
    ...options,
  });
}

/**
 * 显示错误 Toast
 */
function error(title: string, description?: string, options?: ExternalToast): string | number {
  return sonnerToast.error(title, {
    description,
    ...defaultOptions,
    duration: 6000,
    ...options,
  });
}

/**
 * 显示警告 Toast
 */
function warning(title: string, description?: string, options?: ExternalToast): string | number {
  return sonnerToast.warning(title, {
    description,
    ...defaultOptions,
    ...options,
  });
}

/**
 * 显示信息 Toast
 */
function info(title: string, description?: string, options?: ExternalToast): string | number {
  return sonnerToast.info(title, {
    description,
    ...defaultOptions,
    ...options,
  });
}

/**
 * 显示加载中 Toast
 */
function loading(title: string, description?: string, options?: ExternalToast): string | number {
  return sonnerToast.loading(title, {
    description,
    ...defaultOptions,
    duration: Infinity,
    ...options,
  });
}

/**
 * 显示自定义 Toast
 */
function custom(message: string | React.ReactNode, options?: ExternalToast): string | number {
  return sonnerToast(message, {
    ...defaultOptions,
    ...options,
  });
}

/**
 * 关闭指定 Toast
 */
function dismiss(toastId?: string | number): void {
  sonnerToast.dismiss(toastId);
}

/**
 * 关闭所有 Toast
 */
function dismissAll(): void {
  sonnerToast.dismiss();
}

/**
 * 更新 Toast
 */
function update(toastId: string | number, options: ToastOptions): void {
  const { type = 'info', title, description, ...rest } = options;

  sonnerToast.dismiss(toastId);

  show({
    type,
    title,
    description,
    id: toastId,
    ...rest,
  });
}

/**
 * 将 loading Toast 更新为成功
 */
function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  },
  options?: ExternalToast
): Promise<T> {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...options,
  });
}

/**
 * 操作成功提示（带撤销按钮）
 */
function actionSuccess(
  message: string,
  undoAction: () => void,
  options?: ExternalToast
): string | number {
  return sonnerToast.success(message, {
    ...defaultOptions,
    action: {
      label: '撤销',
      onClick: undoAction,
    },
    ...options,
  });
}

/**
 * 确认对话框
 */
function confirm(
  title: string,
  onConfirm: () => void,
  onCancel?: () => void,
  options?: ExternalToast
): string | number {
  return sonnerToast(title, {
    ...defaultOptions,
    action: {
      label: '确认',
      onClick: onConfirm,
    },
    cancel: {
      label: '取消',
      onClick: onCancel,
    },
    ...options,
  });
}

/**
 * 带进度条的 Toast（用于上传/下载）
 */
function progress(
  title: string,
  progress: number,
  options?: ExternalToast
): string | number {
  const percentage = Math.round(progress * 100);

  return sonnerToast.loading(
    <div className="flex flex-col gap-2 min-w-[200px]">
      <span>{title}</span>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{percentage}%</span>
    </div>,
    {
      ...defaultOptions,
      duration: Infinity,
      ...options,
    }
  );
}

/**
 * API 请求结果提示
 */
function apiResult<T>(
  promise: Promise<T>,
  successMessage: string,
  errorMessage?: string,
  options?: ExternalToast
): Promise<T> {
  return sonnerToast.promise(promise, {
    loading: '处理中...',
    success: successMessage,
    error: errorMessage || '操作失败，请重试',
    ...options,
  });
}

/**
 * 批量操作结果提示
 */
function batchResult(
  successCount: number,
  failCount: number,
  options?: ExternalToast
): void {
  if (failCount === 0) {
    sonnerToast.success(`成功处理 ${successCount} 项`, options);
  } else if (successCount === 0) {
    sonnerToast.error(`${failCount} 项处理失败`, options);
  } else {
    sonnerToast.warning(
      `成功 ${successCount} 项，失败 ${failCount} 项`,
      options
    );
  }
}

// 导出 Toast 对象
export const toast = {
  show,
  success,
  error,
  warning,
  info,
  loading,
  custom,
  dismiss,
  dismissAll,
  update,
  promise,
  actionSuccess,
  confirm,
  progress,
  apiResult,
  batchResult,
};

export default toast;
