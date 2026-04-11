import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ visible, onClose, title, children, className }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [visible, onClose]);

  React.useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  if (!visible) return null;

  const modalContent = (
    <div
      className="fixed z-[100] flex items-center justify-center"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      {/* 黑色遮罩背景 */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 弹框内容 */}
      <div
        className={cn(
          'relative z-[101] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl',
          'animate-in zoom-in-95 fade-in duration-200',
          'w-full max-w-lg mx-4',
          className
        )}
        style={{
          maxHeight: '90vh',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* 标题栏 */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 id="modal-title" className="text-lg font-semibold text-white font-heading">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
              aria-label="关闭"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* 内容区域 */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  // 使用 Portal 将弹框渲染到 body 下，避免受父元素 transform 影响
  return createPortal(modalContent, document.body);
};

export default Modal;
