import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamMemberModal } from '@/components/team/TeamMemberModal';
import type { Team, Player } from '@/api/types';
import { PositionType } from '@/types/position';
import { ZIndexLayers } from '@/constants/zIndex';

const mockPlayer1: Player = {
  id: 'player-1',
  nickname: '亚索',
  avatarUrl: 'https://example.com/avatar1.png',
  position: 'MID' as PositionType,
  teamId: 'team-1',
  isCaptain: true,
  level: 'S',
};

const mockPlayer2: Player = {
  id: 'player-2',
  nickname: '盲僧',
  avatarUrl: 'https://example.com/avatar2.png',
  position: 'JUNGLE' as PositionType,
  teamId: 'team-1',
};

const mockTeam: Team = {
  id: 'team-1',
  name: 'IG战队',
  logoUrl: 'https://example.com/logo.png',
  members: [mockPlayer1, mockPlayer2],
};

const mockTeamEmpty: Team = {
  id: 'team-2',
  name: '空战队',
  logoUrl: 'https://example.com/logo2.png',
  members: [],
};

describe('TeamMemberModal 组件', () => {
  describe('弹框渲染测试', () => {
    it('isOpen=true 时应该显示弹框', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      expect(screen.getByTestId('team-member-modal')).toBeInTheDocument();
    });

    it('isOpen=false 时不应该显示弹框', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={false}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      expect(screen.queryByTestId('team-member-modal')).not.toBeInTheDocument();
    });
  });

  describe('弹框头部测试', () => {
    it('应该正确显示战队Logo', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      const logo = screen.getByTestId('team-logo');
      expect(logo).toBeInTheDocument();
      expect(logo.getAttribute('src')).toBe('https://example.com/logo.png');
    });

    it('应该正确显示队名', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      expect(screen.getByText('IG战队')).toBeInTheDocument();
    });
  });

  describe('成员列表渲染测试', () => {
    it('应该渲染所有成员', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      const memberRows = screen.getAllByTestId('member-row');
      expect(memberRows).toHaveLength(2);
    });

    it('成员行应该显示选手ID（昵称）', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      expect(screen.getByText('亚索')).toBeInTheDocument();
      expect(screen.getByText('盲僧')).toBeInTheDocument();
    });

    it('成员行应该显示位置图标', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      const positionIcons = screen.getAllByTestId('member-position-icon');
      expect(positionIcons).toHaveLength(2);
    });

    it('成员行不应该显示照片', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      // 检查没有成员头像元素
      const memberAvatars = screen.queryAllByTestId('member-avatar');
      expect(memberAvatars).toHaveLength(0);
    });
  });

  describe('成员行点击测试', () => {
    it('点击成员行应该触发 onPlayerClick 回调', () => {
      const onPlayerClick = vi.fn();
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={onPlayerClick}
        />
      );
      const memberRows = screen.getAllByTestId('member-row');
      fireEvent.click(memberRows[0]);
      expect(onPlayerClick).toHaveBeenCalledTimes(1);
      expect(onPlayerClick).toHaveBeenCalledWith(mockPlayer1);
    });

    it('点击第二个成员应该传递正确的 player 对象', () => {
      const onPlayerClick = vi.fn();
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={onPlayerClick}
        />
      );
      const memberRows = screen.getAllByTestId('member-row');
      fireEvent.click(memberRows[1]);
      expect(onPlayerClick).toHaveBeenCalledTimes(1);
      expect(onPlayerClick).toHaveBeenCalledWith(mockPlayer2);
    });
  });

  describe('关闭交互测试', () => {
    it('点击遮罩层应该调用 onClose', () => {
      const onClose = vi.fn();
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={onClose}
          onPlayerClick={vi.fn()}
        />
      );
      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('点击关闭按钮应该调用 onClose', () => {
      const onClose = vi.fn();
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={onClose}
          onPlayerClick={vi.fn()}
        />
      );
      const closeButton = screen.getByTestId('close-modal-button');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('按下 ESC 键应该调用 onClose', () => {
      const onClose = vi.fn();
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={onClose}
          onPlayerClick={vi.fn()}
        />
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('空成员列表测试', () => {
    it('当成员列表为空时应该显示"暂无队员"提示', () => {
      render(
        <TeamMemberModal
          team={mockTeamEmpty}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      expect(screen.getByText('暂无队员')).toBeInTheDocument();
    });

    it('当成员列表为空时不应该渲染成员行', () => {
      render(
        <TeamMemberModal
          team={mockTeamEmpty}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      expect(screen.queryAllByTestId('member-row')).toHaveLength(0);
    });
  });

  describe('loading 骨架屏测试', () => {
    it('loading=true 时应该显示骨架屏', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
          loading={true}
        />
      );
      const skeletons = screen.getAllByTestId('skeleton-line');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('loading=false 时不应该显示骨架屏', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
          loading={false}
        />
      );
      expect(screen.queryByTestId('skeleton-line')).not.toBeInTheDocument();
    });

    it('loading 未传时不应该显示骨架屏（默认 false）', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      expect(screen.queryByTestId('skeleton-line')).not.toBeInTheDocument();
    });
  });

  describe('z-index 层级测试', () => {
    it('遮罩层应该使用 NESTED_MODAL: 120 层级', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      const modal = screen.getByTestId('team-member-modal');
      const zIndexStyle = modal.style.zIndex;
      expect(zIndexStyle).toBe(String(ZIndexLayers.NESTED_MODAL));
    });
  });

  describe('可访问性测试', () => {
    it('弹框应该有 role="dialog" 属性', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      const modal = screen.getByTestId('team-member-modal');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('关闭按钮应该有 aria-label', () => {
      render(
        <TeamMemberModal
          team={mockTeam}
          isOpen={true}
          onClose={vi.fn()}
          onPlayerClick={vi.fn()}
        />
      );
      const closeButton = screen.getByTestId('close-modal-button');
      expect(closeButton).toHaveAttribute('aria-label');
    });
  });
});
