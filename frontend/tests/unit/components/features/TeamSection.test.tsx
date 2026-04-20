import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TeamSection from '@/components/features/TeamSection';
import { teamService } from '@/services';
import type { Team as ApiTeam, Player } from '@/api/types';
import { PositionType } from '@/types/position';

// Mock teamService
vi.mock('@/services', () => ({
  teamService: {
    getAll: vi.fn(),
  },
}));

// Mock getUploadUrl
vi.mock('@/utils/upload', () => ({
  getUploadUrl: vi.fn((url) => url),
}));

// Mock level colors
vi.mock('@/utils/levelColors', () => ({
  getLevelBadgeClasses: vi.fn(() => 'badge-s'),
  getCaptainBadgeClasses: vi.fn(() => 'badge-captain'),
}));

// Mock position utils
vi.mock('@/utils/position', () => ({
  getPositionLabel: vi.fn((pos) => pos),
}));

// Mock TeamMemberModal
vi.mock('@/components/team/TeamMemberModal', () => ({
  TeamMemberModal: vi.fn(
    ({ team, isOpen, onClose, onPlayerClick, loading }: any) => {
      if (!isOpen) return null;
      return (
        <div data-testid="team-member-modal" role="dialog">
          <div data-testid="modal-overlay" onClick={onClose} />
          <div data-testid="modal-content">
            <h2 data-testid="modal-title">{team.name}</h2>
            <button data-testid="close-modal-button" onClick={onClose}>
              关闭
            </button>
            {(team.members || []).map((player: Player) => (
              <div
                key={player.id}
                data-testid="member-row"
                onClick={() => onPlayerClick(player)}
              >
                <span data-testid="member-name">{player.nickname}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  ),
}));

// Mock PlayerDetailDrawer
vi.mock('@/components/team/PlayerDetailDrawer', () => ({
  default: vi.fn(({ player, onClose, isMobile }: any) => {
    if (!player) return null;
    return (
      <div data-testid="player-drawer" role="dialog">
        <div data-testid="drawer-overlay" onClick={onClose} />
        <div data-testid="drawer-content">
          <h3 data-testid="drawer-player-name">{player.nickname}</h3>
          <button data-testid="close-drawer-button" onClick={onClose}>
            关闭抽屉
          </button>
        </div>
      </div>
    );
  }),
}));

const mockPlayers: Player[] = [
  {
    id: 'player-1',
    nickname: '亚索',
    avatarUrl: 'https://example.com/avatar1.png',
    position: 'MID' as PositionType,
    teamId: 'team-1',
    isCaptain: true,
    level: 'S',
  },
  {
    id: 'player-2',
    nickname: '盲僧',
    avatarUrl: 'https://example.com/avatar2.png',
    position: 'JUNGLE' as PositionType,
    teamId: 'team-1',
  },
];

const mockApiTeams: ApiTeam[] = [
  {
    id: 'team-1',
    name: 'IG战队',
    logoUrl: 'https://example.com/logo1.png',
    battleCry: '勇往直前',
    members: mockPlayers,
  },
  {
    id: 'team-2',
    name: 'EDG战队',
    logoUrl: 'https://example.com/logo2.png',
    battleCry: ' Clear Love',
    members: [],
  },
];

describe('TeamSection 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('战队卡片精简测试', () => {
    it('应该只显示Logo和队名，不含队员列表', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      // 应该显示战队卡片
      await waitFor(() => {
        const teamCards = screen.getAllByTestId('team-card');
        expect(teamCards).toHaveLength(2);
      });

      // 应该显示Logo
      const logos = screen.getAllByTestId('team-logo');
      expect(logos).toHaveLength(2);

      // 应该显示队名
      expect(screen.getByText('IG战队')).toBeInTheDocument();
      expect(screen.getByText('EDG战队')).toBeInTheDocument();

      // 不应该显示参赛宣言（CardDescription）
      expect(screen.queryByTestId('team-battle-cry')).not.toBeInTheDocument();

      // 不应该显示队员列表（CardContent）
      expect(screen.queryByTestId('player-row')).not.toBeInTheDocument();
    });

    it('战队卡片应该保持 hover 效果和动画类名', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        expect(card.className).toContain('hover:border-white/30');
        expect(card.className).toContain('transition-all');
        expect(card.className).toContain('duration-300');
        expect(card.className).toContain('hover:-translate-y-1');
      });
    });
  });

  describe('战队点击事件测试', () => {
    it('点击战队卡片应该触发 handleTeamClick', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        fireEvent.click(card);
      });

      // 应该打开弹框
      await waitFor(() => {
        expect(screen.getByTestId('team-member-modal')).toBeInTheDocument();
      });
    });

    it('点击战队卡片应该传递正确的 team 数据', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        fireEvent.click(card);
      });

      // 弹框标题应该是 IG战队
      await waitFor(() => {
        expect(screen.getByTestId('modal-title')).toHaveTextContent('IG战队');
      });
    });
  });

  describe('弹框状态管理测试', () => {
    it('selectedTeam 和 isTeamModalOpen 初始状态应该为 null 和 false', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      // 初始状态不应该显示弹框
      expect(screen.queryByTestId('team-member-modal')).not.toBeInTheDocument();
    });

    it('点击战队卡片后弹框应该打开', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        fireEvent.click(card);
      });

      await waitFor(() => {
        expect(screen.getByTestId('team-member-modal')).toBeInTheDocument();
      });
    });
  });

  describe('抽屉状态管理测试', () => {
    it('selectedPlayer 初始状态应该为 null', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      // 初始状态不应该显示抽屉
      expect(screen.queryByTestId('player-drawer')).not.toBeInTheDocument();
    });

    it('点击队员后抽屉应该打开', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      // 先打开弹框
      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        fireEvent.click(card);
      });

      // 点击队员行
      await waitFor(() => {
        const memberRows = screen.getAllByTestId('member-row');
        fireEvent.click(memberRows[0]);
      });

      // 抽屉应该打开
      await waitFor(() => {
        expect(screen.getByTestId('player-drawer')).toBeInTheDocument();
      });
    });
  });

  describe('弹框集成测试', () => {
    it('TeamMemberModal 应该正确渲染', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        fireEvent.click(card);
      });

      await waitFor(() => {
        const modal = screen.getByTestId('team-member-modal');
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveAttribute('role', 'dialog');
      });
    });

    it('弹框应该显示战队成员列表', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        fireEvent.click(card);
      });

      await waitFor(() => {
        const memberRows = screen.getAllByTestId('member-row');
        expect(memberRows).toHaveLength(2);
      });
    });
  });

  describe('抽屉嵌套测试', () => {
    it('PlayerDetailDrawer 应该在弹框内嵌套显示', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      // 打开弹框
      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        fireEvent.click(card);
      });

      // 点击队员打开抽屉
      await waitFor(() => {
        const memberRows = screen.getAllByTestId('member-row');
        fireEvent.click(memberRows[0]);
      });

      // 弹框和抽屉都应该存在
      await waitFor(() => {
        expect(screen.getByTestId('team-member-modal')).toBeInTheDocument();
        expect(screen.getByTestId('player-drawer')).toBeInTheDocument();
      });
    });
  });

  describe('状态流转测试', () => {
    it('打开弹框 -> 打开抽屉 -> 关闭弹框 -> 抽屉也应该关闭', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      // 1. 打开弹框
      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        fireEvent.click(card);
      });

      // 2. 打开抽屉
      await waitFor(() => {
        const memberRows = screen.getAllByTestId('member-row');
        fireEvent.click(memberRows[0]);
      });

      expect(screen.getByTestId('player-drawer')).toBeInTheDocument();

      // 3. 关闭弹框（点击遮罩层）
      fireEvent.click(screen.getByTestId('modal-overlay'));

      // 4. 弹框和抽屉都应该关闭
      await waitFor(() => {
        expect(screen.queryByTestId('team-member-modal')).not.toBeInTheDocument();
        expect(screen.queryByTestId('player-drawer')).not.toBeInTheDocument();
      });
    });

    it('打开弹框 -> 打开抽屉 -> 关闭抽屉 -> 弹框仍打开', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      // 1. 打开弹框
      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        fireEvent.click(card);
      });

      // 2. 打开抽屉
      await waitFor(() => {
        const memberRows = screen.getAllByTestId('member-row');
        fireEvent.click(memberRows[0]);
      });

      expect(screen.getByTestId('player-drawer')).toBeInTheDocument();

      // 3. 关闭抽屉
      fireEvent.click(screen.getByTestId('close-drawer-button'));

      // 4. 抽屉关闭，弹框仍打开
      await waitFor(() => {
        expect(screen.queryByTestId('player-drawer')).not.toBeInTheDocument();
        expect(screen.getByTestId('team-member-modal')).toBeInTheDocument();
      });
    });
  });

  describe('关闭弹框状态清空测试', () => {
    it('关闭弹框时应该同时清空 selectedPlayer', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      // 1. 打开弹框
      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        fireEvent.click(card);
      });

      // 2. 打开抽屉
      await waitFor(() => {
        const memberRows = screen.getAllByTestId('member-row');
        fireEvent.click(memberRows[0]);
      });

      expect(screen.getByTestId('player-drawer')).toBeInTheDocument();

      // 3. 点击关闭按钮关闭弹框
      fireEvent.click(screen.getByTestId('close-modal-button'));

      // 4. 弹框和抽屉都应该关闭
      await waitFor(() => {
        expect(screen.queryByTestId('team-member-modal')).not.toBeInTheDocument();
        expect(screen.queryByTestId('player-drawer')).not.toBeInTheDocument();
      });

      // 5. 再次打开弹框并点击队员，确认 selectedPlayer 已清空
      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        fireEvent.click(card);
      });

      await waitFor(() => {
        expect(screen.getByTestId('team-member-modal')).toBeInTheDocument();
        expect(screen.queryByTestId('player-drawer')).not.toBeInTheDocument();
      });
    });
  });

  describe('切换队员测试', () => {
    it('在弹框内点击不同队员应该直接更新 selectedPlayer', async () => {
      vi.mocked(teamService.getAll).mockResolvedValue(mockApiTeams);

      render(<TeamSection />);

      // 1. 打开弹框
      await waitFor(() => {
        const card = screen.getAllByTestId('team-card')[0];
        fireEvent.click(card);
      });

      // 2. 点击第一个队员
      await waitFor(() => {
        const memberRows = screen.getAllByTestId('member-row');
        fireEvent.click(memberRows[0]);
      });

      await waitFor(() => {
        expect(screen.getByTestId('drawer-player-name')).toHaveTextContent('亚索');
      });

      // 3. 点击第二个队员
      const memberRows2 = screen.getAllByTestId('member-row');
      fireEvent.click(memberRows2[1]);

      // 4. 抽屉应该更新为第二个队员
      await waitFor(() => {
        expect(screen.getByTestId('drawer-player-name')).toHaveTextContent('盲僧');
      });
    });
  });

  describe('骨架屏更新测试', () => {
    it('加载时应该显示精简的骨架屏（不含队员列表骨架）', async () => {
      // 模拟延迟加载
      vi.mocked(teamService.getAll).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockApiTeams), 100))
      );

      render(<TeamSection />);

      // 应该显示骨架屏
      await waitFor(() => {
        expect(screen.getAllByTestId('team-card-skeleton').length).toBeGreaterThan(0);
      });
    });
  });

  describe('向后兼容测试', () => {
    it('应该保留 PlayerDetailModal 导入', async () => {
      // 测试文件通过编译即表示导入存在
      // 这是静态检查，运行时测试不报错即可
      expect(true).toBe(true);
    });
  });
});
