import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MatchDataError from '@/components/features/match-data/MatchDataError';

describe('MatchDataError', () => {
  it('renders default error message', () => {
    render(<MatchDataError />);

    expect(screen.getByText('数据加载失败')).toBeInTheDocument();
    expect(screen.getByText('数据加载失败，请检查网络连接或稍后重试')).toBeInTheDocument();
  });

  it('renders custom error message', () => {
    render(<MatchDataError message="自定义错误信息" />);

    expect(screen.getByText('自定义错误信息')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<MatchDataError onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /刷新重试/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<MatchDataError />);

    const retryButton = screen.queryByRole('button', { name: /刷新重试/i });
    expect(retryButton).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<MatchDataError onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /刷新重试/i });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('disables retry button when retrying', () => {
    const onRetry = vi.fn();
    render(<MatchDataError onRetry={onRetry} retrying={true} />);

    const retryButton = screen.getByRole('button', { name: /加载中/i });
    expect(retryButton).toBeDisabled();
  });

  it('renders loading spinner when retrying', () => {
    const onRetry = vi.fn();
    render(<MatchDataError onRetry={onRetry} retrying={true} />);

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('renders alert icon', () => {
    const { container } = render(<MatchDataError />);

    // 检查是否存在 SVG 图标（AlertCircle）
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });
});
