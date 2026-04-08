import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerDetailModal } from '@/components/team/PlayerDetailModal';
import type { Player } from '@/api/types';
import { PositionType } from '@/types/position';

const mockPlayer: Player = {
  id: 'player-1',
  nickname: '亚索',
  avatarUrl: 'https://example.com/avatar.png',
  position: 'MID' as PositionType,
  teamId: 'team-1',
  gameId: 'Yasuo123',
  bio: '十年磨剑，只为一剑。',
  championPool: ['疾风剑豪·亚索', '刀锋舞者·艾瑞莉娅', '封魔剑魂·永恩'],
  rating: 96, // 96分对应4.8星 (96/100*5=4.8)
  isCaptain: true,
  liveUrl: 'https://twitch.tv/yasuo',
};

const mockPlayerWithoutOptional: Player = {
  id: 'player-2',
  nickname: '简单选手',
  position: 'TOP' as PositionType,
  teamId: 'team-2',
};

describe('PlayerDetailModal 组件', () => {
  describe('基础渲染', () => {
    it('当 isOpen 为 true 时应该渲染弹框', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByTestId('player-detail-modal')).toBeInTheDocument();
    });

    it('当 isOpen 为 false 时不应该渲染弹框', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={false} onClose={vi.fn()} />);
      expect(screen.queryByTestId('player-detail-modal')).not.toBeInTheDocument();
    });

    it('应该显示选手昵称', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByRole('heading', { name: '亚索' })).toBeInTheDocument();
    });

    it('应该显示队长标识当 isCaptain 为 true', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('队长')).toBeInTheDocument();
    });

    it('不应该显示队长标识当 isCaptain 为 false', () => {
      const nonCaptainPlayer = { ...mockPlayer, isCaptain: false };
      render(<PlayerDetailModal player={nonCaptainPlayer} isOpen={true} onClose={vi.fn()} />);
      expect(screen.queryByText('队长')).not.toBeInTheDocument();
    });

    it('应该显示位置信息（中文标签）', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('中单')).toBeInTheDocument();
    });

    it('应该显示游戏ID', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText(/游戏ID:/)).toBeInTheDocument();
    });
  });

  describe('个人简介', () => {
    it('应该显示个人简介当 bio 存在', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('十年磨剑，只为一剑。')).toBeInTheDocument();
    });

    it('当 bio 不存在时应该显示暂无简介', () => {
      const playerNoBio = { ...mockPlayer, bio: undefined };
      render(<PlayerDetailModal player={playerNoBio} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('暂无简介')).toBeInTheDocument();
    });
  });

  describe('英雄池展示', () => {
    it('应该显示常用英雄标题', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('常用英雄')).toBeInTheDocument();
    });

    it('应该显示所有英雄头像', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      const championImages = screen.getAllByTestId(/^champion-icon-/);
      expect(championImages).toHaveLength(3);
    });

    it('每个英雄头像容器应该存在', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      const championIcons = screen.getAllByTestId(/^champion-icon-/);
      championIcons.forEach((icon) => {
        expect(icon).toBeInTheDocument();
      });
    });

    it('应该显示英雄名称（截断显示）', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      const allYasuo = screen.getAllByText('亚索');
      expect(allYasuo.length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('艾瑞莉娅').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('永恩').length).toBeGreaterThanOrEqual(1);
    });

    it('当 championPool 为空时应该显示暂无常用英雄', () => {
      const playerNoChampions = { ...mockPlayer, championPool: [] };
      render(<PlayerDetailModal player={playerNoChampions} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('暂无常用英雄')).toBeInTheDocument();
    });

    it('当 championPool 为 undefined 时应该显示暂无常用英雄', () => {
      const playerNoChampions = { ...mockPlayer, championPool: undefined };
      render(<PlayerDetailModal player={playerNoChampions} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('暂无常用英雄')).toBeInTheDocument();
    });
  });

  describe('评分展示', () => {
    it('应该显示评分标题', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('评分')).toBeInTheDocument();
    });

    it('应该显示评分数值', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('96.0')).toBeInTheDocument();
    });

    it('应该显示星级评分', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      const stars = screen.getAllByTestId('rating-star');
      expect(stars.length).toBe(5);
    });

    it('应该正确将100分制转换为5星制', () => {
      // 60分应该显示3颗星 (60/100*5=3)
      const player60 = { ...mockPlayer, rating: 60 };
      render(<PlayerDetailModal player={player60} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('60.0')).toBeInTheDocument();
    });

    it('0分应该显示0星', () => {
      const player0 = { ...mockPlayer, rating: 0 };
      render(<PlayerDetailModal player={player0} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('0.0')).toBeInTheDocument();
    });

    it('100分应该显示5星', () => {
      const player100 = { ...mockPlayer, rating: 100 };
      render(<PlayerDetailModal player={player100} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('100.0')).toBeInTheDocument();
    });

    it('当 rating 为 undefined 时不应该显示评分区域', () => {
      const playerNoRating = { ...mockPlayer, rating: undefined };
      render(<PlayerDetailModal player={playerNoRating} isOpen={true} onClose={vi.fn()} />);
      expect(screen.queryByText('评分')).not.toBeInTheDocument();
    });
  });

  describe('直播入口', () => {
    it('当有 liveUrl 时应该显示正在直播状态', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByTestId('live-indicator')).toBeInTheDocument();
      expect(screen.getByText('正在直播')).toBeInTheDocument();
    });

    it('当有 liveUrl 时应该显示观看直播按钮', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      const watchButton = screen.getByTestId('watch-live-button');
      expect(watchButton).toBeInTheDocument();
    });

    it('当 liveUrl 为 undefined 时不应该显示直播入口', () => {
      const playerNoLive = { ...mockPlayer, liveUrl: undefined };
      render(<PlayerDetailModal player={playerNoLive} isOpen={true} onClose={vi.fn()} />);
      expect(screen.queryByTestId('live-indicator')).not.toBeInTheDocument();
      expect(screen.queryByText('正在直播')).not.toBeInTheDocument();
    });
  });

  describe('关闭功能', () => {
    it('点击关闭按钮应该调用 onClose', () => {
      const onCloseMock = vi.fn();
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={onCloseMock} />);

      const closeButton = screen.getByTestId('close-modal-button');
      fireEvent.click(closeButton);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('点击遮罩层应该调用 onClose', () => {
      const onCloseMock = vi.fn();
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={onCloseMock} />);

      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('头像展示', () => {
    it('应该显示选手大头像', () => {
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
      const avatar = screen.getByTestId('player-avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar.getAttribute('src')).toBe('https://example.com/avatar.png');
    });

    it('当 avatarUrl 为 undefined 时应该显示默认头像', () => {
      const playerNoAvatar = { ...mockPlayer, avatarUrl: undefined };
      render(<PlayerDetailModal player={playerNoAvatar} isOpen={true} onClose={vi.fn()} />);
      const avatar = screen.getByTestId('player-avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('数据完整性', () => {
    it('应该处理只有必需字段的选手数据', () => {
      render(<PlayerDetailModal player={mockPlayerWithoutOptional} isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('简单选手')).toBeInTheDocument();
    });
  });

  describe('键盘支持', () => {
    it('按下 ESC 键应该关闭弹框', () => {
      const onCloseMock = vi.fn();
      render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={onCloseMock} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });
});

describe('PlayerDetailModal 可访问性', () => {
  it('关闭按钮应该有 aria-label', () => {
    render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
    const closeButton = screen.getByTestId('close-modal-button');
    expect(closeButton).toHaveAttribute('aria-label');
  });

  it('弹框应该有 role="dialog" 属性', () => {
    render(<PlayerDetailModal player={mockPlayer} isOpen={true} onClose={vi.fn()} />);
    const modal = screen.getByTestId('player-detail-modal');
    expect(modal).toHaveAttribute('role', 'dialog');
  });
});
