import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlayerFilter from '@/components/features/match-data/PlayerFilter';
import type { PositionType } from '@/types/matchData';

describe('PlayerFilter', () => {
  describe('默认显示', () => {
    it('应该显示筛选标签', () => {
      render(
        <PlayerFilter
          teamFilter="all"
          positionFilter="all"
          onTeamChange={vi.fn()}
          onPositionChange={vi.fn()}
        />
      );

      expect(screen.getByText('筛选')).toBeInTheDocument();
    });

    it('应该显示全部战队选项', () => {
      render(
        <PlayerFilter
          teamFilter="all"
          positionFilter="all"
          onTeamChange={vi.fn()}
          onPositionChange={vi.fn()}
        />
      );

      expect(screen.getByText('全部战队')).toBeInTheDocument();
    });

    it('应该显示全部位置选项', () => {
      render(
        <PlayerFilter
          teamFilter="all"
          positionFilter="all"
          onTeamChange={vi.fn()}
          onPositionChange={vi.fn()}
        />
      );

      expect(screen.getByText('全部位置')).toBeInTheDocument();
    });
  });

  describe('战队筛选', () => {
    it('应该显示战队选项', () => {
      render(
        <PlayerFilter
          teamFilter="all"
          positionFilter="all"
          teamAName="BLG"
          teamBName="WBG"
          onTeamChange={vi.fn()}
          onPositionChange={vi.fn()}
        />
      );

      expect(screen.getByText('BLG')).toBeInTheDocument();
      expect(screen.getByText('WBG')).toBeInTheDocument();
    });

    it('选择战队应该调用onTeamChange', () => {
      const handleTeamChange = vi.fn();
      render(
        <PlayerFilter
          teamFilter="all"
          positionFilter="all"
          teamAName="BLG"
          teamBName="WBG"
          onTeamChange={handleTeamChange}
          onPositionChange={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('BLG'));
      expect(handleTeamChange).toHaveBeenCalledWith('teamA');
    });

    it('已选中战队应该有高亮样式', () => {
      const { container } = render(
        <PlayerFilter
          teamFilter="teamA"
          positionFilter="all"
          teamAName="BLG"
          teamBName="WBG"
          onTeamChange={vi.fn()}
          onPositionChange={vi.fn()}
        />
      );

      const activeFilter = container.querySelector('.bg-\\[\\#c49f58\\]');
      expect(activeFilter).toBeInTheDocument();
    });
  });

  describe('位置筛选', () => {
    it('应该显示TOP选项', () => {
      render(
        <PlayerFilter
          teamFilter="all"
          positionFilter="all"
          onTeamChange={vi.fn()}
          onPositionChange={vi.fn()}
        />
      );

      expect(screen.getByText('TOP')).toBeInTheDocument();
    });

    it('应该显示MID选项', () => {
      render(
        <PlayerFilter
          teamFilter="all"
          positionFilter="all"
          onTeamChange={vi.fn()}
          onPositionChange={vi.fn()}
        />
      );

      expect(screen.getByText('MID')).toBeInTheDocument();
    });

    it('应该显示ADC选项', () => {
      render(
        <PlayerFilter
          teamFilter="all"
          positionFilter="all"
          onTeamChange={vi.fn()}
          onPositionChange={vi.fn()}
        />
      );

      expect(screen.getByText('ADC')).toBeInTheDocument();
    });

    it('应该显示SUPPORT选项', () => {
      render(
        <PlayerFilter
          teamFilter="all"
          positionFilter="all"
          onTeamChange={vi.fn()}
          onPositionChange={vi.fn()}
        />
      );

      expect(screen.getByText('SUPPORT')).toBeInTheDocument();
    });

    it('选择位置应该调用onPositionChange', () => {
      const handlePositionChange = vi.fn();
      render(
        <PlayerFilter
          teamFilter="all"
          positionFilter="all"
          onTeamChange={vi.fn()}
          onPositionChange={handlePositionChange}
        />
      );

      fireEvent.click(screen.getByText('TOP'));
      expect(handlePositionChange).toHaveBeenCalledWith('TOP');
    });
  });

  describe('重置功能', () => {
    it('有激活筛选时应该显示重置按钮', () => {
      render(
        <PlayerFilter
          teamFilter="teamA"
          positionFilter="all"
          onTeamChange={vi.fn()}
          onPositionChange={vi.fn()}
        />
      );

      expect(screen.getByText('重置')).toBeInTheDocument();
    });

    it('无激活筛选时不应该显示重置按钮', () => {
      render(
        <PlayerFilter
          teamFilter="all"
          positionFilter="all"
          onTeamChange={vi.fn()}
          onPositionChange={vi.fn()}
        />
      );

      expect(screen.queryByText('重置')).not.toBeInTheDocument();
    });

    it('点击重置应该调用onTeamChange和onPositionChange', () => {
      const handleTeamChange = vi.fn();
      const handlePositionChange = vi.fn();
      render(
        <PlayerFilter
          teamFilter="teamA"
          positionFilter="MID"
          onTeamChange={handleTeamChange}
          onPositionChange={handlePositionChange}
        />
      );

      fireEvent.click(screen.getByText('重置'));
      expect(handleTeamChange).toHaveBeenCalledWith('all');
      expect(handlePositionChange).toHaveBeenCalledWith('all');
    });
  });
});
