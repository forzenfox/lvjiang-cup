import { toast as sonnerToast, Toaster } from 'sonner';

// 导出 Toaster 组件
export { Toaster };

// Toast 选项类型
type ToastOptions = Omit<Parameters<typeof sonnerToast.success>[1], 'type'>;
type PromiseMessages<T> = {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: Error) => string);
};

// 基础 toast 对象
const toastObject = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, options);
  },
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, options);
  },
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, options);
  },
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, options);
  },
  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, options);
  },
  custom: (message: string, options?: ToastOptions) => {
    return sonnerToast(message, options);
  },
  dismiss: (id?: string) => {
    sonnerToast.dismiss(id);
  },
  promise: <T,>(promise: Promise<T>, messages: PromiseMessages<T>) => {
    return sonnerToast.promise(promise, messages);
  },
};

// 导出 toast 对象
// eslint-disable-next-line react-refresh/only-export-components
export { toastObject as toast };
