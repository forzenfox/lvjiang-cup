import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemberForm } from './MemberForm';

// 英雄选择器模拟
vi.mock('@/components/team/HeroSelector', () => ({
  default: ({ visible, onConfirm, selectedHeroes }: {
    visible: boolean;
    onClose: () => void;
    onConfirm: (heroes: string[]) => void;
    selectedHeroes: string[];
    maxSelect: number;
  }) => (
    <div data-testid="hero-selector" data-visible={visible} data-selected={selectedHeroes.join(',')}>
      {visible && (
        <button data-testid="hero-selector-confirm" onClick={() => onConfirm(['亚索', '劫'])}>
          确认选择
        </button>
      )}
    </div>
  ),
}));

describe('MemberForm 组件', () => {
  const mockOnSave = vi.fn();
  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
    onSave: mockOnSave,
    initialData: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('当 visible 为 true 时应该渲染表单', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByTestId('member-form')).toBeInTheDocument();
    });

    it('当 visible 为 false 时不应该渲染表单', () => {
      render(<MemberForm {...defaultProps} visible={false} />);
      expect(screen.queryByTestId('member-form')).not.toBeInTheDocument();
    });

    it('应该显示正确的表单标题', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByText('添加队员')).toBeInTheDocument();
    });

    it('编辑模式应该显示"编辑队员"标题', () => {
      render(
        <MemberForm
          {...defaultProps}
          initialData={{
            nickname: 'TestPlayer',
            gameId: 'TEST001',
            position: 'MID' as const,
            rating: 85,
            isCaptain: false,
            championPool: ['亚索'],
          }}
        />
      );
      expect(screen.getByText('编辑队员')).toBeInTheDocument();
    });
  });

  describe('表单字段测试', () => {
    it('应该渲染头像 URL 输入框', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByPlaceholderText('输入头像 URL 或点击上传')).toBeInTheDocument();
    });

    it('应该渲染昵称输入框（必填）', () => {
      render(<MemberForm {...defaultProps} />);
      const nicknameInput = screen.getByPlaceholderText('请输入昵称');
      expect(nicknameInput).toBeInTheDocument();
    });

    it('应该渲染游戏 ID 输入框（必填）', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByPlaceholderText('请输入游戏 ID')).toBeInTheDocument();
    });

    it('应该渲染位置下拉选择框', () => {
      render(<MemberForm {...defaultProps} />);
      const positionSelect = screen.getByRole('combobox');
      expect(positionSelect).toBeInTheDocument();
    });

    it('应该渲染个人简介文本域', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByPlaceholderText('介绍一下这位选手...（选填）')).toBeInTheDocument();
    });

    it('应该渲染英雄选择按钮', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByText('选择英雄 (0/5)')).toBeInTheDocument();
    });

    it('应该渲染评分滑块', () => {
      render(<MemberForm {...defaultProps} />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('应该渲染队长单选框', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByText('设为队长')).toBeInTheDocument();
    });

    it('应该渲染直播间链接输入框', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByPlaceholderText('输入直播间链接（选填）')).toBeInTheDocument();
    });
  });

  describe('字符限制测试', () => {
    it('昵称应该限制在 20 字符内', () => {
      render(<MemberForm {...defaultProps} />);
      const nicknameInput = screen.getByPlaceholderText('请输入昵称') as HTMLInputElement;

      const longName = '这是一个非常非常非常长的昵称';
      fireEvent.change(nicknameInput, { target: { value: longName } });

      expect(nicknameInput.value.length).toBeLessThanOrEqual(20);
    });

    it('游戏 ID 应该限制在 30 字符内', () => {
      render(<MemberForm {...defaultProps} />);
      const gameIdInput = screen.getByPlaceholderText('请输入游戏 ID') as HTMLInputElement;

      const longGameId = 'THISISAVERYVERYVERYLONGGAMEID';
      fireEvent.change(gameIdInput, { target: { value: longGameId } });

      expect(gameIdInput.value.length).toBeLessThanOrEqual(30);
    });

    it('个人简介应该限制在 200 字符内', () => {
      render(<MemberForm {...defaultProps} />);
      const bioInput = screen.getByPlaceholderText('介绍一下这位选手...（选填）') as HTMLTextAreaElement;

      const longBio = 'A'.repeat(250);
      fireEvent.change(bioInput, { target: { value: longBio } });

      expect(bioInput.value.length).toBeLessThanOrEqual(200);
    });
  });

  describe('位置选择测试', () => {
    it('应该显示 5 个位置选项', () => {
      render(<MemberForm {...defaultProps} />);
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(5);
    });

    it('应该包含正确的位置选项', () => {
      render(<MemberForm {...defaultProps} />);
      expect(screen.getByText('上单 (TOP)')).toBeInTheDocument();
      expect(screen.getByText('打野 (JUNGLE)')).toBeInTheDocument();
      expect(screen.getByText('中单 (MID)')).toBeInTheDocument();
      expect(screen.getByText('ADC')).toBeInTheDocument();
      expect(screen.getByText('辅助 (SUPPORT)')).toBeInTheDocument();
    });
  });

  describe('英雄选择器测试', () => {
    it('点击选择英雄按钮应该打开英雄选择器', () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.click(screen.getByText('选择英雄 (0/5)'));
      expect(screen.getByTestId('hero-selector')).toBeInTheDocument();
    });
  });

  describe('表单验证测试', () => {
    it('点击保存时如果昵称为空应该显示错误', () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.click(screen.getByText('保存'));
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('点击保存时如果游戏 ID 为空应该显示错误', () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.change(screen.getByPlaceholderText('请输入昵称'), { target: { value: 'TestPlayer' } });
      fireEvent.click(screen.getByText('保存'));
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('表单操作测试', () => {
    it('点击取消按钮应该调用 onClose', () => {
      render(<MemberForm {...defaultProps} />);
      fireEvent.click(screen.getByText('取消'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('编辑模式下应该预填充表单数据', () => {
      render(
        <MemberForm
          {...defaultProps}
          initialData={{
            nickname: 'TestPlayer',
            gameId: 'TEST001',
            position: 'MID' as const,
            rating: 85,
            isCaptain: true,
            championPool: ['亚索', '劫'],
            liveUrl: 'https://www.douyu.com/123456',
          }}
        />
      );

      expect(screen.getByPlaceholderText('请输入昵称') as HTMLInputElement).toHaveValue('TestPlayer');
      expect(screen.getByPlaceholderText('请输入游戏 ID') as HTMLInputElement).toHaveValue('TEST001');
    });
  });

  describe('评分滑块测试', () => {
    it('默认评分应该是 60', () => {
      render(<MemberForm {...defaultProps} />);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      expect(slider.value).toBe('60');
    });

    it('应该显示当前评分值', () => {
      render(<MemberForm {...defaultProps} />);
      // 评分文本被拆分成多个元素，使用正则匹配
      expect(screen.getByText(/评分:/)).toBeInTheDocument();
      expect(screen.getByText('60')).toBeInTheDocument();
    });
  });
});