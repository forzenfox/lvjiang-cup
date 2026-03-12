import { toast as sonnerToast, Toaster } from 'sonner';
import React from 'react';

// 导出 Toaster 组件
export { Toaster };

// 导出基础 toast 对象
export const toast = {
  success: (message: string, options?: any) => {
    return sonnerToast.success(message, options);
  },
  error: (message: string, options?: any) => {
    return sonnerToast.error(message, options);
  },
  warning: (message: string, options?: any) => {
    return sonnerToast.warning(message, options);
  },
  info: (message: string, options?: any) => {
    return sonnerToast.info(message, options);
  },
  loading: (message: string, options?: any) => {
    return sonnerToast.loading(message, options);
  },
  custom: (message: string, options?: any) => {
    return sonnerToast(message, options);
  },
  dismiss: (id?: string) => {
    sonnerToast.dismiss(id);
  },
  promise: (promise: Promise<any>, messages: any) => {
    return sonnerToast.promise(promise, messages);
  },
};
