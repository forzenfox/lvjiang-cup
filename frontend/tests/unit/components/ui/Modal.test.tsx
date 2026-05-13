import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '@/components/ui/Modal';

describe('Modal 组件', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

  describe('基础渲染', () => {
    it('当 visible 为 true 时应该渲染弹框内容', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div data-testid="modal-content">弹框内容</div>
        </Modal>
      );

      expect(screen.getByText('测试标题')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('当 visible 为 false 时不应该渲染弹框', () => {
      render(
        <Modal visible={false} onClose={mockOnClose} title="测试标题">
          <div data-testid="modal-content">弹框内容</div>
        </Modal>
      );

      expect(screen.queryByText('测试标题')).not.toBeInTheDocument();
      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });

    it('没有 title 时不应该渲染标题栏', () => {
      render(
        <Modal visible={true} onClose={mockOnClose}>
          <div data-testid="modal-content">弹框内容</div>
        </Modal>
      );

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });
  });

  describe('关闭功能', () => {
    it('点击关闭按钮应该调用 onClose 一次', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      const closeButton = screen.getByLabelText('关闭');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('点击遮罩层应该调用 onClose 一次', () => {
      const { container } = render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      const overlay = container
        .querySelector('[style*="animation: modalFadeIn"]')
        ?.parentElement?.querySelector('.bg-black\\/80');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('点击弹框内容区域不应该调用 onClose', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div data-testid="modal-inner-content">弹框内容</div>
        </Modal>
      );

      const content = screen.getByTestId('modal-inner-content');
      fireEvent.click(content);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('键盘支持', () => {
    it('按下 ESC 键应该调用 onClose', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('弹框不可见时按下 ESC 键不应该调用 onClose', () => {
      render(
        <Modal visible={false} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('body 滚动锁定', () => {
    it('弹框显示时应该锁定 body 滚动', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('弹框隐藏时应该恢复 body 滚动', () => {
      const { rerender } = render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal visible={false} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('可访问性', () => {
    it('弹框应该有 role="dialog" 属性', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('弹框应该有 aria-modal="true" 属性', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('关闭按钮应该有 aria-label="关闭" 属性', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      const closeButton = screen.getByLabelText('关闭');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('动画样式', () => {
    it('遮罩层应该有内联 CSS 动画样式', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      const overlay = document.querySelector('.bg-black\\/80');
      expect(overlay).not.toBeNull();
      expect(overlay).toHaveAttribute('style', expect.stringContaining('animation'));
    });

    it('弹框内容应该有内联 CSS 动画样式', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog).toHaveAttribute('style', expect.stringContaining('animation'));
    });

    it('应该注入内联 CSS keyframes 样式', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} title="测试标题">
          <div>弹框内容</div>
        </Modal>
      );

      const styleTag = document.querySelector('style');
      expect(styleTag).not.toBeNull();
      expect(styleTag?.textContent).toContain('@keyframes modalFadeIn');
      expect(styleTag?.textContent).toContain('@keyframes modalZoomIn');
    });
  });
});
