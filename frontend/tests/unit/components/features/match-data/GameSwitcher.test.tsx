import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GameSwitcher from '@/components/features/match-data/GameSwitcher';
import type { GameSummary } from '@/types/matchData';

const createMockGameSummary = (
  overrides: Partial<GameSummary> & { gameNumber: number }
): GameSummary => ({
  gameNumber: 1,
  winnerTeamId: null,
  gameDuration: null,
  hasData: false,
  ...overrides,
});

describe('GameSwitcher', () => {
  describe('BO1不显示切换器', () => {
    it('BO1赛制不应该显示切换器', () => {
      const games: GameSummary[] = [createMockGameSummary({ gameNumber: 1 })];

      render(<GameSwitcher games={games} currentGame={1} onChange={vi.fn()} isBO1={true} />);

      expect(screen.queryByText('第 1 局')).not.toBeInTheDocument();
    });
  });

  describe('BO3显示3个按钮', () => {
    it('BO3赛制应该显示3个按钮', () => {
      const games: GameSummary[] = [
        createMockGameSummary({ gameNumber: 1 }),
        createMockGameSummary({ gameNumber: 2 }),
        createMockGameSummary({ gameNumber: 3 }),
      ];

      render(<GameSwitcher games={games} currentGame={1} onChange={vi.fn()} isBO1={false} />);

      expect(screen.getByText('第 1 局')).toBeInTheDocument();
      expect(screen.getByText('第 2 局')).toBeInTheDocument();
      expect(screen.getByText('第 3 局')).toBeInTheDocument();
    });
  });

  describe('BO5显示5个按钮', () => {
    it('BO5赛制应该显示5个按钮', () => {
      const games: GameSummary[] = [
        createMockGameSummary({ gameNumber: 1 }),
        createMockGameSummary({ gameNumber: 2 }),
        createMockGameSummary({ gameNumber: 3 }),
        createMockGameSummary({ gameNumber: 4 }),
        createMockGameSummary({ gameNumber: 5 }),
      ];

      render(<GameSwitcher games={games} currentGame={1} onChange={vi.fn()} isBO1={false} />);

      expect(screen.getByText('第 1 局')).toBeInTheDocument();
      expect(screen.getByText('第 2 局')).toBeInTheDocument();
      expect(screen.getByText('第 3 局')).toBeInTheDocument();
      expect(screen.getByText('第 4 局')).toBeInTheDocument();
      expect(screen.getByText('第 5 局')).toBeInTheDocument();
    });
  });

  describe('当前局高亮样式', () => {
    it('当前局应该有金色高亮', () => {
      const games: GameSummary[] = [
        createMockGameSummary({ gameNumber: 1 }),
        createMockGameSummary({ gameNumber: 2 }),
      ];

      const { container } = render(
        <GameSwitcher games={games} currentGame={2} onChange={vi.fn()} isBO1={false} />
      );

      const activeButton = container.querySelector('.text-\\[\\#c49f58\\]');
      expect(activeButton).toBeInTheDocument();
    });

    it('当前局按钮应该有激活样式', () => {
      const games: GameSummary[] = [
        createMockGameSummary({ gameNumber: 1 }),
        createMockGameSummary({ gameNumber: 2 }),
      ];

      const { container } = render(
        <GameSwitcher games={games} currentGame={2} onChange={vi.fn()} isBO1={false} />
      );

      const activeButton = container.querySelector('.border-\\[\\#c49f58\\]');
      expect(activeButton).toBeInTheDocument();
    });
  });

  describe('未上传数据局禁用', () => {
    it('未上传数据的局应该有禁用样式', () => {
      const games: GameSummary[] = [
        createMockGameSummary({ gameNumber: 1, hasData: true }),
        createMockGameSummary({ gameNumber: 2, hasData: false }),
      ];

      const { container } = render(
        <GameSwitcher games={games} currentGame={1} onChange={vi.fn()} isBO1={false} />
      );

      const disabledButton = container.querySelector('.opacity-50');
      expect(disabledButton).toBeInTheDocument();
    });
  });

  describe('点击切换', () => {
    it('点击按钮应该调用onChange', () => {
      const handleChange = vi.fn();
      const games: GameSummary[] = [
        createMockGameSummary({ gameNumber: 1, hasData: true }),
        createMockGameSummary({ gameNumber: 2, hasData: true }),
      ];

      render(<GameSwitcher games={games} currentGame={1} onChange={handleChange} isBO1={false} />);

      fireEvent.click(screen.getByText('第 2 局'));
      expect(handleChange).toHaveBeenCalledWith(2);
    });
  });
});
