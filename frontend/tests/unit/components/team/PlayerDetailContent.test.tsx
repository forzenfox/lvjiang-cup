import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Player } from '@/api/types';
import { PositionType } from '@/types/position';
import PlayerDetailContent from '@/components/team/PlayerDetailContent';

vi.mock('@/utils/championUtils', () => ({
  getChampionIconByEn: vi.fn((id: string) => (id ? `https://example.com/${id}.png` : '')),
  getChampionTitleByEn: vi.fn((id: string) => (id ? `${id} Title` : '')),
}));

vi.mock('@/utils/levelColors', () => ({
  getLevelBadgeClasses: vi.fn((level: string, additionalClasses: string = '') => {
    const colors: Record<string, string> = {
      S: 'text-amber-300',
      A: 'text-purple-300',
      B: 'text-blue-300',
      C: 'text-green-300',
      D: 'text-gray-300',
    };
    return `level-badge ${colors[level] || ''} ${additionalClasses}`.trim();
  }),
  getCaptainBadgeClasses: vi.fn((additionalClasses: string = '') => {
    return `captain-badge ${additionalClasses}`.trim();
  }),
}));

vi.mock('@/utils/upload', () => ({
  getUploadUrl: vi.fn((url: string) => `https://cdn.example.com/${url}`),
}));

const createMockPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'player-1',
  nickname: 'TestPlayer',
  position: 'MID' as PositionType,
  teamId: 'team-1',
  avatarUrl: 'avatar.jpg',
  gameId: 'TP123',
  bio: '这是一段测试简介',
  championPool: ['Ahri', 'Yasuo', 'Zed'],
  rating: 85,
  isCaptain: false,
  liveUrl: undefined,
  level: 'A',
  ...overrides,
});

describe('PlayerDetailContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试：正确显示队员基本信息', () => {
    it('应该显示玩家昵称', () => {
      const player = createMockPlayer();
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText('TestPlayer')).toBeInTheDocument();
    });

    it('应该显示玩家位置', () => {
      const player = createMockPlayer();
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText('中单')).toBeInTheDocument();
    });

    it('应该显示游戏ID', () => {
      const player = createMockPlayer();
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText(/游戏ID: TP123/)).toBeInTheDocument();
    });

    it('应该显示玩家头像', () => {
      const player = createMockPlayer();
      render(<PlayerDetailContent player={player} />);

      const avatar = screen.getByTestId('player-avatar');
      expect(avatar).toBeInTheDocument();
    });

    it('应该显示个人简介', () => {
      const player = createMockPlayer();
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText('这是一段测试简介')).toBeInTheDocument();
    });

    it('应该显示常用英雄', () => {
      const player = createMockPlayer();
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText('常用英雄')).toBeInTheDocument();
    });
  });

  describe('空值处理', () => {
    it('无头像时应显示昵称首字母占位符', () => {
      const player = createMockPlayer({ avatarUrl: undefined });
      render(<PlayerDetailContent player={player} />);

      const avatar = screen.getByTestId('player-avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveTextContent('T');
    });

    it('无简介时应显示暂无简介', () => {
      const player = createMockPlayer({ bio: undefined });
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText('暂无简介')).toBeInTheDocument();
    });

    it('空字符串简介时应显示暂无简介', () => {
      const player = createMockPlayer({ bio: '' });
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText('暂无简介')).toBeInTheDocument();
    });

    it('无常用英雄时应显示暂无常用英雄', () => {
      const player = createMockPlayer({ championPool: [] });
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText('暂无常用英雄')).toBeInTheDocument();
    });

    it('championPool为undefined时应显示暂无常用英雄', () => {
      const player = createMockPlayer({ championPool: undefined });
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText('暂无常用英雄')).toBeInTheDocument();
    });

    it('无游戏ID时不应显示游戏ID标签', () => {
      const player = createMockPlayer({ gameId: undefined });
      render(<PlayerDetailContent player={player} />);

      expect(screen.queryByText(/游戏ID:/)).not.toBeInTheDocument();
    });
  });

  describe('队长标识', () => {
    it('isCaptain为true时应显示队长徽章', () => {
      const player = createMockPlayer({ isCaptain: true });
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText('队长')).toBeInTheDocument();
    });

    it('isCaptain为false时不应显示队长徽章', () => {
      const player = createMockPlayer({ isCaptain: false });
      render(<PlayerDetailContent player={player} />);

      expect(screen.queryByText('队长')).not.toBeInTheDocument();
    });

    it('isCaptain为undefined时不应显示队长徽章', () => {
      const player = createMockPlayer({ isCaptain: undefined });
      render(<PlayerDetailContent player={player} />);

      expect(screen.queryByText('队长')).not.toBeInTheDocument();
    });
  });

  describe('等级显示', () => {
    it('等级S应正确显示', () => {
      const player = createMockPlayer({ level: 'S' });
      render(<PlayerDetailContent player={player} />);

      const levelBadge = screen.getByText('S');
      expect(levelBadge).toBeInTheDocument();
      expect(levelBadge).toHaveClass('level-badge');
    });

    it('等级A应正确显示', () => {
      const player = createMockPlayer({ level: 'A' });
      render(<PlayerDetailContent player={player} />);

      const levelBadge = screen.getByText('A');
      expect(levelBadge).toBeInTheDocument();
    });

    it('等级B应正确显示', () => {
      const player = createMockPlayer({ level: 'B' });
      render(<PlayerDetailContent player={player} />);

      const levelBadge = screen.getByText('B');
      expect(levelBadge).toBeInTheDocument();
    });

    it('无等级时不应显示等级区块', () => {
      const player = createMockPlayer({ level: undefined });
      render(<PlayerDetailContent player={player} />);

      expect(screen.queryByText('实力等级')).not.toBeInTheDocument();
    });
  });

  describe('评分显示', () => {
    it('有rating时应显示评分区块', () => {
      const player = createMockPlayer({ rating: 85 });
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText('评分')).toBeInTheDocument();
    });

    it('应正确渲染StarRating组件的星星', () => {
      const player = createMockPlayer({ rating: 85 });
      render(<PlayerDetailContent player={player} />);

      const stars = screen.getAllByTestId('rating-star');
      expect(stars).toHaveLength(5);
    });

    it('应显示评分数值', () => {
      const player = createMockPlayer({ rating: 85 });
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText('85.0')).toBeInTheDocument();
    });

    it('无rating时不应显示评分区块', () => {
      const player = createMockPlayer({ rating: undefined });
      render(<PlayerDetailContent player={player} />);

      expect(screen.queryByText('评分')).not.toBeInTheDocument();
    });
  });

  describe('直播链接', () => {
    it('有liveUrl时应显示直播区块', () => {
      const player = createMockPlayer({ liveUrl: 'https://live.example.com/room' });
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByText('正在直播')).toBeInTheDocument();
    });

    it('有liveUrl时应显示观看直播按钮', () => {
      const player = createMockPlayer({ liveUrl: 'https://live.example.com/room' });
      render(<PlayerDetailContent player={player} />);

      const watchButton = screen.getByTestId('watch-live-button');
      expect(watchButton).toBeInTheDocument();
      expect(watchButton).toHaveAttribute('href', 'https://live.example.com/room');
      expect(watchButton).toHaveAttribute('target', '_blank');
    });

    it('应显示直播指示器', () => {
      const player = createMockPlayer({ liveUrl: 'https://live.example.com/room' });
      render(<PlayerDetailContent player={player} />);

      expect(screen.getByTestId('live-indicator')).toBeInTheDocument();
    });

    it('无liveUrl时不应显示直播区块', () => {
      const player = createMockPlayer({ liveUrl: undefined });
      render(<PlayerDetailContent player={player} />);

      expect(screen.queryByText('正在直播')).not.toBeInTheDocument();
      expect(screen.queryByTestId('watch-live-button')).not.toBeInTheDocument();
    });
  });
});
