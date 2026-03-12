import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SwissMatchStatusBadge from '@/components/features/swiss/SwissMatchStatusBadge';

describe('SwissMatchStatusBadge', () => {
  it('应该正确显示"未开始"状态', () => {
    const { container } = render(<SwissMatchStatusBadge status="upcoming" />);

    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('未开始');
    expect(badge).toHaveClass('bg-blue-900/40', 'text-blue-400');
  });

  it('应该正确显示"进行中"状态', () => {
    const { container } = render(<SwissMatchStatusBadge status="ongoing" />);

    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('进行中');
    expect(badge).toHaveClass('bg-green-900/50', 'text-green-400', 'animate-pulse');
  });

  it('应该正确显示"已结束"状态', () => {
    const { container } = render(<SwissMatchStatusBadge status="finished" />);

    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('已结束');
    expect(badge).toHaveClass('bg-gray-700/50', 'text-gray-400');
  });

  it('应该使用绝对定位', () => {
    const { container } = render(<SwissMatchStatusBadge status="upcoming" />);

    const badge = container.querySelector('span');
    expect(badge).toHaveClass('absolute', 'top-0', 'right-0');
  });
});
