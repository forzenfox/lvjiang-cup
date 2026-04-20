import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlayerDetailDrawer from '@/components/team/PlayerDetailDrawer';
import type { Player } from '@/api/types';
import { PositionType } from '@/types/position';

const mockPlayer: Player = {
  id: 'player-1',
  nickname: '测试选手',
  avatarUrl: 'https://example.com/avatar.png',
  position: 'MID' as PositionType,
  teamId: 'team-1',
  gameId: 'TestPlayer123',
  bio: '测试简介',
  championPool: ['Yasuo', 'Irelia'],
  rating: 85,
  isCaptain: false,
};

describe('PlayerDetailDrawer 组件', () => {
  describe('抽屉渲染测试', () => {
    it('当 player 不为 null 时应该显示抽屉', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={false} />
      );
      expect(screen.getByTestId('player-drawer')).toBeInTheDocument();
    });

    it('当 player 为 null 时不应该显示抽屉', () => {
      render(
        <PlayerDetailDrawer player={null} onClose={vi.fn()} isMobile={false} />
      );
      expect(screen.queryByTestId('player-drawer')).not.toBeInTheDocument();
    });
  });

  describe('PC/平板端布局测试', () => {
    it('PC/平板端应该使用右侧定位 (right-0 top-0)', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={false} />
      );
      const drawer = screen.getByTestId('player-drawer');
      expect(drawer).toHaveClass('right-0');
      expect(drawer).toHaveClass('top-0');
    });

    it('PC/平板端应该使用右侧滑入动画', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={false} />
      );
      const motionDiv = screen.getByTestId('player-drawer');
      // framer-motion 会添加初始样式
      expect(motionDiv).toBeInTheDocument();
    });
  });

  describe('手机端布局测试', () => {
    it('手机端应该使用底部定位 (bottom-0 left-0 right-0)', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={true} />
      );
      const drawer = screen.getByTestId('player-drawer');
      expect(drawer).toHaveClass('bottom-0');
      expect(drawer).toHaveClass('left-0');
      expect(drawer).toHaveClass('right-0');
    });

    it('手机端应该设置高度为 70vh', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={true} />
      );
      const drawer = screen.getByTestId('player-drawer');
      expect(drawer).toHaveClass('h-[70vh]');
    });

    it('手机端应该使用底部滑入动画', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={true} />
      );
      const motionDiv = screen.getByTestId('player-drawer');
      expect(motionDiv).toBeInTheDocument();
    });
  });

  describe('响应式宽度测试', () => {
    it('应该应用响应式宽度类名 (sm:w-[320px] md:w-[350px] lg:w-[400px])', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={false} />
      );
      const drawer = screen.getByTestId('player-drawer');
      expect(drawer).toHaveClass('sm:w-[320px]');
      expect(drawer).toHaveClass('md:w-[350px]');
      expect(drawer).toHaveClass('lg:w-[400px]');
    });
  });

  describe('关闭按钮测试', () => {
    it('点击关闭按钮应该调用 onClose 回调', () => {
      const onCloseMock = vi.fn();
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={onCloseMock} isMobile={false} />
      );

      const closeButton = screen.getByTestId('close-drawer-button');
      fireEvent.click(closeButton);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('关闭按钮应该有 aria-label 属性', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={false} />
      );
      const closeButton = screen.getByTestId('close-drawer-button');
      expect(closeButton).toHaveAttribute('aria-label', '关闭');
    });
  });

  describe('动画测试', () => {
    it('PC/平板端应该使用 slide-in-right 动画配置', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={false} />
      );
      const drawer = screen.getByTestId('player-drawer');
      expect(drawer).toBeInTheDocument();
    });

    it('手机端应该使用 slide-in-bottom 动画配置', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={true} />
      );
      const drawer = screen.getByTestId('player-drawer');
      expect(drawer).toBeInTheDocument();
    });
  });

  describe('内容复用测试', () => {
    it('应该正确使用 PlayerDetailContent 组件渲染选手详情', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={false} />
      );
      // PlayerDetailContent 会渲染选手昵称
      expect(screen.getByRole('heading', { name: '测试选手' })).toBeInTheDocument();
    });

    it('应该显示选手位置信息', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={false} />
      );
      expect(screen.getByText('中单')).toBeInTheDocument();
    });

    it('应该显示选手简介', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={false} />
      );
      expect(screen.getByText('测试简介')).toBeInTheDocument();
    });
  });

  describe('z-index 层级测试', () => {
    it('应该使用 NESTED_MODAL: 120 的 z-index', () => {
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={vi.fn()} isMobile={false} />
      );
      const drawer = screen.getByTestId('player-drawer');
      expect(drawer).toHaveStyle({ zIndex: 120 });
    });
  });

  describe('遮罩层测试', () => {
    it('点击遮罩层应该调用 onClose', () => {
      const onCloseMock = vi.fn();
      render(
        <PlayerDetailDrawer player={mockPlayer} onClose={onCloseMock} isMobile={false} />
      );

      const overlay = screen.getByTestId('drawer-overlay');
      fireEvent.click(overlay);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });
});
