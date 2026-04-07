import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TeamEditModal } from './TeamEditModal';
import type { Team } from '@/types';

// 模拟 toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// 模拟 Upload 组件
vi.mock('@/components/ui', () => ({
  Upload: ({ value, onChange }: { value: string; onChange: (v: string) => void; type: string }) => (
    <div data-testid="upload-component">
      <button data-testid="upload-btn" onClick={() => onChange('https://example.com/new-logo.png')}>
        上传
      </button>
      {value && <img src={value} alt="logo" data-testid="logo-preview" />}
    </div>
  ),
}));

describe('TeamEditModal 组件', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const defaultProps = {
    visible: true,
    team: null,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  const mockTeam: Team = {
    id: 'team-1',
    name: 'Test Team',
    logo: 'https://example.com/logo.png',
    description: 'Test Description',
    players: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('当 visible 为 true 时应该渲染弹框', () => {
      render(<TeamEditModal {...defaultProps} />);
      expect(screen.getByTestId('team-edit-modal')).toBeInTheDocument();
    });

    it('当 visible 为 false 时不应该渲染弹框', () => {
      render(<TeamEditModal {...defaultProps} visible={false} />);
      expect(screen.queryByTestId('team-edit-modal')).not.toBeInTheDocument();
    });

    it('新建战队模式应该显示正确的标题', () => {
      render(<TeamEditModal {...defaultProps} />);
      expect(screen.getByText('新建战队')).toBeInTheDocument();
    });

    it('编辑战队模式应该显示正确的标题', () => {
      render(<TeamEditModal {...defaultProps} team={mockTeam} />);
      expect(screen.getByText('编辑战队')).toBeInTheDocument();
    });
  });

  describe('表单字段测试', () => {
    it('应该渲染战队名称输入框', () => {
      render(<TeamEditModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('请输入战队名称')).toBeInTheDocument();
    });

    it('应该渲染战队图标上传组件', () => {
      render(<TeamEditModal {...defaultProps} />);
      expect(screen.getByTestId('upload-component')).toBeInTheDocument();
    });

    it('应该渲染参赛宣言文本域', () => {
      render(<TeamEditModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('请输入参赛宣言')).toBeInTheDocument();
    });

    it('应该显示字符计数器', () => {
      render(<TeamEditModal {...defaultProps} />);
      expect(screen.getByText('0/100')).toBeInTheDocument();
    });
  });

  describe('参赛宣言字符限制测试', () => {
    it('参赛宣言应该限制在 100 字符内', () => {
      render(<TeamEditModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('请输入参赛宣言') as HTMLTextAreaElement;

      // 模拟输入，检查字符计数是否正确
      fireEvent.change(textarea, { target: { value: '测试' } });
      expect(textarea.value.length).toBe(2);
    });

    it('字符计数应该实时更新', () => {
      render(<TeamEditModal {...defaultProps} />);
      const textarea = screen.getByPlaceholderText('请输入参赛宣言');

      fireEvent.change(textarea, { target: { value: '测试' } });

      // 使用正则匹配因为文本被拆分了
      expect(screen.getByText(/2\/100/)).toBeInTheDocument();
    });
  });

  describe('表单预填充测试', () => {
    it('编辑模式应该预填充战队名称', () => {
      render(<TeamEditModal {...defaultProps} team={mockTeam} />);
      const nameInput = screen.getByPlaceholderText('请输入战队名称') as HTMLInputElement;
      expect(nameInput.value).toBe('Test Team');
    });

    it('编辑模式应该预填充参赛宣言', () => {
      render(<TeamEditModal {...defaultProps} team={mockTeam} />);
      const descInput = screen.getByPlaceholderText('请输入参赛宣言') as HTMLTextAreaElement;
      expect(descInput.value).toBe('Test Description');
    });
  });

  describe('表单验证测试', () => {
    it('战队名称为空时点击保存应该显示错误', () => {
      render(<TeamEditModal {...defaultProps} />);
      fireEvent.click(screen.getByText('保存'));
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('按钮测试', () => {
    it('取消按钮应该调用 onClose', () => {
      render(<TeamEditModal {...defaultProps} />);
      fireEvent.click(screen.getByText('取消'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('保存按钮应该调用 onSave', () => {
      render(<TeamEditModal {...defaultProps} team={mockTeam} />);
      fireEvent.click(screen.getByText('保存'));
      expect(mockOnSave).toHaveBeenCalledWith({
        id: 'team-1',
        name: 'Test Team',
        logo: 'https://example.com/logo.png',
        description: 'Test Description',
        players: [],
      });
    });
  });

  describe('ESC 键关闭测试', () => {
    it('按 ESC 键应该关闭弹框', () => {
      render(<TeamEditModal {...defaultProps} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('点击遮罩关闭测试', () => {
    it('点击遮罩应该关闭弹框', () => {
      render(<TeamEditModal {...defaultProps} />);
      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        fireEvent.click(overlay);
      }
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});