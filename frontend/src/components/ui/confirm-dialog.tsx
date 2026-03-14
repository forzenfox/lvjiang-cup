import React from 'react';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = '确认操作',
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* 弹框内容 */}
      <div className="relative bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        {/* 消息内容 */}
        <div className="px-6 py-4">
          <p className="text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* 按钮区域 */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-900/50 border-t border-gray-700">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
          >
            {cancelText}
          </Button>
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
