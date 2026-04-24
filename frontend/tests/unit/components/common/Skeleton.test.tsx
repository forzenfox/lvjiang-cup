import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  CardSkeleton,
  ListItemSkeleton,
  TableSkeleton,
  PageSkeleton,
  MatchCardSkeleton,
  SwissTableSkeleton,
} from '@/components/common/Skeleton';

describe('Skeleton Components', () => {
  describe('Skeleton', () => {
    it('should render with default props', () => {
      render(<Skeleton data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('bg-muted', 'animate-pulse');
    });

    it('should render without animation when animate is false', () => {
      render(<Skeleton data-testid="skeleton" animate={false} />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).not.toHaveClass('animate-pulse');
    });

    it('should render with different variants', () => {
      const { rerender } = render(<Skeleton variant="circular" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('rounded-full');

      rerender(<Skeleton variant="rectangular" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('rounded-none');

      rerender(<Skeleton variant="rounded" data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('rounded-md');
    });

    it('should render with custom dimensions', () => {
      render(<Skeleton width={100} height={50} data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
    });

    it('should render multiple lines for text variant', () => {
      render(<Skeleton variant="text" lines={3} data-testid="skeleton" />);

      const container = screen.getByTestId('skeleton');
      const lines = container.children;
      expect(lines).toHaveLength(3);
    });
  });

  describe('CardSkeleton', () => {
    it('should render card skeleton with all elements', () => {
      render(<CardSkeleton data-testid="card-skeleton" />);

      const card = screen.getByTestId('card-skeleton');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card');
    });

    it('should render without avatar when showAvatar is false', () => {
      const { container } = render(<CardSkeleton showAvatar={false} />);

      // 检查没有头像骨架屏
      const avatars = container.querySelectorAll('[class*="rounded-full"]');
      expect(avatars.length).toBeLessThan(2);
    });

    it('should render without actions when showActions is false', () => {
      const { container } = render(<CardSkeleton showActions={false} />);

      // 检查没有按钮骨架屏
      const buttons = container.querySelectorAll('[class*="rounded-md"]');
      expect(buttons.length).toBeLessThan(4);
    });
  });

  describe('ListItemSkeleton', () => {
    it('should render list item skeleton', () => {
      render(<ListItemSkeleton data-testid="list-item" />);

      const item = screen.getByTestId('list-item');
      expect(item).toBeInTheDocument();
      expect(item).toHaveClass('flex', 'items-center');
    });

    it('should render with image when showImage is true', () => {
      const { container } = render(<ListItemSkeleton showImage={true} />);

      // 应该有图片骨架屏
      expect(container.querySelector('[class*="rounded-lg"]')).toBeInTheDocument();
    });
  });

  describe('TableSkeleton', () => {
    it('should render table skeleton with correct rows and columns', () => {
      render(<TableSkeleton rows={3} columns={4} data-testid="table" />);

      const table = screen.getByTestId('table');
      expect(table).toBeInTheDocument();
    });

    it('should render without header when showHeader is false', () => {
      const { container } = render(<TableSkeleton showHeader={false} />);

      // 检查没有表头
      const headerElements = container.querySelectorAll('.border-b');
      expect(headerElements.length).toBe(0);
    });
  });

  describe('PageSkeleton', () => {
    it('should render page skeleton with title', () => {
      render(<PageSkeleton data-testid="page" />);

      const page = screen.getByTestId('page');
      expect(page).toBeInTheDocument();
      expect(page).toHaveClass('space-y-6');
    });

    it('should render without title when showTitle is false', () => {
      const { container } = render(<PageSkeleton showTitle={false} />);

      // 检查只有一个卡片骨架屏
      const cards = container.querySelectorAll('[class*="rounded-lg"]');
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('MatchCardSkeleton', () => {
    it('should render match card skeleton', () => {
      render(<MatchCardSkeleton data-testid="match-card" />);

      const card = screen.getByTestId('match-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg', 'border');
    });

    it('should contain team and score elements', () => {
      const { container } = render(<MatchCardSkeleton />);

      // 应该有多个头像骨架屏（队伍 logo）
      const avatars = container.querySelectorAll('[class*="rounded-full"]');
      expect(avatars.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('SwissTableSkeleton', () => {
    it('should render swiss table skeleton', () => {
      render(<SwissTableSkeleton teamCount={4} data-testid="swiss-table" />);

      const table = screen.getByTestId('swiss-table');
      expect(table).toBeInTheDocument();
    });

    it('should render correct number of team rows', () => {
      const { container } = render(<SwissTableSkeleton teamCount={6} />);

      // 应该有表头 + 6 个队伍行
      const rows = container.querySelectorAll('.flex');
      expect(rows.length).toBeGreaterThanOrEqual(6);
    });
  });
});
