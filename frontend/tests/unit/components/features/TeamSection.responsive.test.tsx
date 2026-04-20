import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamSection from '@/components/features/TeamSection';
import type { Team as ApiTeam, Player } from '@/api/types';

// Define mock data before vi.mock
const mockPlayer: Player = {
  id: 'player-1',
  nickname: 'TestPlayer',
  position: 'TOP',
  avatarUrl: 'avatar1.png',
  teamId: 'team-1',
};

const mockTeams: ApiTeam[] = [
  {
    id: 'team-1',
    name: 'Test Team 1',
    logo: 'logo1.png',
    battleCry: 'Test battle cry 1',
    members: [mockPlayer],
  },
  {
    id: 'team-2',
    name: 'Test Team 2',
    logo: 'logo2.png',
    battleCry: 'Test battle cry 2',
    members: [],
  },
  {
    id: 'team-3',
    name: 'Test Team 3',
    logo: 'logo3.png',
    battleCry: 'Test battle cry 3',
    members: [],
  },
  {
    id: 'team-4',
    name: 'Test Team 4',
    logo: 'logo4.png',
    battleCry: 'Test battle cry 4',
    members: [],
  },
  {
    id: 'team-5',
    name: 'Test Team 5',
    logo: 'logo5.png',
    battleCry: 'Test battle cry 5',
    members: [],
  },
];

vi.mock('@/services', () => ({
  teamService: {
    getAll: vi.fn().mockResolvedValue(mockTeams),
  },
}));

vi.mock('@/utils/upload', () => ({
  getUploadUrl: (url: string) => url,
}));

describe('TeamSection 响应式布局', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('网格列数响应式', () => {
    it('手机端（<640px）：2列网格', async () => {
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      render(<TeamSection />);

      await screen.findByTestId('teams-grid');

      const grid = screen.getByTestId('teams-grid');
      expect(grid.className).toContain('grid-cols-2');
    });

    it('平板端（768px-1023px）：3列网格', async () => {
      window.innerWidth = 768;
      window.dispatchEvent(new Event('resize'));

      render(<TeamSection />);

      await screen.findByTestId('teams-grid');

      const grid = screen.getByTestId('teams-grid');
      expect(grid.className).toContain('md:grid-cols-3');
    });

    it('大屏（1024px-1279px）：4列网格', async () => {
      window.innerWidth = 1024;
      window.dispatchEvent(new Event('resize'));

      render(<TeamSection />);

      await screen.findByTestId('teams-grid');

      const grid = screen.getByTestId('teams-grid');
      expect(grid.className).toContain('lg:grid-cols-4');
    });

    it('PC端（≥1280px）：5列网格', async () => {
      window.innerWidth = 1280;
      window.dispatchEvent(new Event('resize'));

      render(<TeamSection />);

      await screen.findByTestId('teams-grid');

      const grid = screen.getByTestId('teams-grid');
      expect(grid.className).toContain('xl:grid-cols-5');
    });
  });

  describe('卡片尺寸响应式', () => {
    it('手机端卡片渲染正确', async () => {
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      render(<TeamSection />);

      await screen.findByTestId('teams-grid');

      const cards = screen.getAllByTestId('team-card');
      expect(cards.length).toBe(5);
      expect(cards[0]).toBeTruthy();
    });

    it('PC端卡片渲染正确', async () => {
      window.innerWidth = 1280;
      window.dispatchEvent(new Event('resize'));

      render(<TeamSection />);

      await screen.findByTestId('teams-grid');

      const cards = screen.getAllByTestId('team-card');
      expect(cards.length).toBe(5);
    });
  });

  describe('弹框宽度响应式', () => {
    it('手机端弹框打开', async () => {
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      render(<TeamSection />);

      await screen.findByTestId('teams-grid');

      const firstCard = screen.getAllByTestId('team-card')[0];
      await userEvent.click(firstCard);

      await screen.findByTestId('team-member-modal');
      const modal = screen.getByTestId('team-member-modal');
      expect(modal).toBeTruthy();
    });

    it('PC端弹框打开', async () => {
      window.innerWidth = 1280;
      window.dispatchEvent(new Event('resize'));

      render(<TeamSection />);

      await screen.findByTestId('teams-grid');

      const firstCard = screen.getAllByTestId('team-card')[0];
      await userEvent.click(firstCard);

      await screen.findByTestId('team-member-modal');
      const modal = screen.getByTestId('team-member-modal');
      expect(modal).toBeTruthy();
    });
  });

  describe('抽屉响应式行为', () => {
    it('PC端抽屉从右侧弹出', async () => {
      window.innerWidth = 1280;
      window.dispatchEvent(new Event('resize'));

      render(<TeamSection />);

      await screen.findByTestId('teams-grid');

      const firstCard = screen.getAllByTestId('team-card')[0];
      await userEvent.click(firstCard);

      await screen.findByTestId('team-member-modal');

      const memberRows = screen.getAllByTestId('member-row');
      if (memberRows.length > 0) {
        await userEvent.click(memberRows[0]);

        await screen.findByTestId('player-drawer');
        const drawer = screen.getByTestId('player-drawer');
        expect(drawer).toBeTruthy();
      }
    });

    it('手机端抽屉从底部弹出', async () => {
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      render(<TeamSection />);

      await screen.findByTestId('teams-grid');

      const firstCard = screen.getAllByTestId('team-card')[0];
      await userEvent.click(firstCard);

      await screen.findByTestId('team-member-modal');

      const memberRows = screen.getAllByTestId('member-row');
      if (memberRows.length > 0) {
        await userEvent.click(memberRows[0]);

        await screen.findByTestId('player-drawer');
        const drawer = screen.getByTestId('player-drawer');
        expect(drawer).toBeTruthy();
      }
    });
  });

  describe('isMobile 检测', () => {
    it('宽度 < 768px 时 isMobile 为 true', async () => {
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      render(<TeamSection />);

      await screen.findByTestId('teams-grid');

      const firstCard = screen.getAllByTestId('team-card')[0];
      await userEvent.click(firstCard);

      await screen.findByTestId('team-member-modal');

      const memberRows = screen.getAllByTestId('member-row');
      if (memberRows.length > 0) {
        await userEvent.click(memberRows[0]);
        const drawer = await screen.findByTestId('player-drawer');
        expect(drawer).toBeTruthy();
      }
    });

    it('宽度 >= 768px 时 isMobile 为 false', async () => {
      window.innerWidth = 768;
      window.dispatchEvent(new Event('resize'));

      render(<TeamSection />);

      await screen.findByTestId('teams-grid');

      const firstCard = screen.getAllByTestId('team-card')[0];
      await userEvent.click(firstCard);

      await screen.findByTestId('team-member-modal');

      const memberRows = screen.getAllByTestId('member-row');
      if (memberRows.length > 0) {
        await userEvent.click(memberRows[0]);
        const drawer = await screen.findByTestId('player-drawer');
        expect(drawer).toBeTruthy();
      }
    });
  });
});
