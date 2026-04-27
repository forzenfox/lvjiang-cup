import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SwissRoundTabs from '@/components/features/swiss/SwissRoundTabs';

describe('SwissRoundTabs', () => {
  const defaultProps = {
    selectedRound: 1,
    onRoundChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应正确渲染所有轮次标签（1-5轮 + 最终结果）', () => {
    render(<SwissRoundTabs {...defaultProps} showFinalResult />);

    expect(screen.getByText('第一轮')).toBeInTheDocument();
    expect(screen.getByText('第二轮')).toBeInTheDocument();
    expect(screen.getByText('第三轮')).toBeInTheDocument();
    expect(screen.getByText('第四轮')).toBeInTheDocument();
    expect(screen.getByText('第五轮')).toBeInTheDocument();
    expect(screen.getByText('最终结果')).toBeInTheDocument();
  });

  it('当 showFinalResult=false 时不显示"最终结果"标签', () => {
    render(<SwissRoundTabs {...defaultProps} showFinalResult={false} />);

    expect(screen.queryByText('最终结果')).not.toBeInTheDocument();
    expect(screen.getByText('第一轮')).toBeInTheDocument();
    expect(screen.getByText('第五轮')).toBeInTheDocument();
  });

  it('选中态样式应正确应用', () => {
    render(<SwissRoundTabs {...defaultProps} selectedRound={3} showFinalResult />);

    const selectedTab = screen.getByTestId('swiss-round-tabs-tab-3');
    expect(selectedTab).toHaveAttribute('data-selected', 'true');

    // 验证未选中标签
    const unselectedTab = screen.getByTestId('swiss-round-tabs-tab-1');
    expect(unselectedTab).toHaveAttribute('data-selected', 'false');
  });

  it('标签应有 title 属性显示完整文字', () => {
    render(<SwissRoundTabs {...defaultProps} showFinalResult />);

    const firstRoundTab = screen.getByText('第一轮');
    expect(firstRoundTab.closest('button')).toHaveAttribute('title', '第一轮');

    const finalResultTab = screen.getByText('最终结果');
    expect(finalResultTab.closest('button')).toHaveAttribute('title', '最终结果');
  });

  it('标签按钮应有最小宽度防止文字截断', () => {
    const { container } = render(<SwissRoundTabs {...defaultProps} showFinalResult />);

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button.classList.toString()).toContain('min-w-[64px]');
    });
  });

  it('点击应触发 onRoundChange', () => {
    const handleRoundChange = vi.fn();
    render(<SwissRoundTabs {...defaultProps} onRoundChange={handleRoundChange} showFinalResult />);

    const thirdRoundTab = screen.getByText('第三轮');
    fireEvent.click(thirdRoundTab);

    expect(handleRoundChange).toHaveBeenCalledTimes(1);
    expect(handleRoundChange).toHaveBeenCalledWith(3);
  });

  it('未选中标签应有 hover 效果类名', () => {
    const { container } = render(
      <SwissRoundTabs {...defaultProps} selectedRound={1} showFinalResult />
    );

    const buttons = container.querySelectorAll('button');
    const unselectedButton = Array.from(buttons).find(
      btn => btn.getAttribute('data-selected') === 'false'
    );

    expect(unselectedButton).toBeTruthy();
    expect(unselectedButton!.classList.toString()).toContain('hover:bg-gray-700/50');
    expect(unselectedButton!.classList.toString()).toContain('hover:text-white');
  });

  it('应支持自定义 data-testid', () => {
    render(<SwissRoundTabs {...defaultProps} showFinalResult data-testid="custom-tabs" />);

    expect(screen.getByTestId('custom-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('custom-tabs-tab-1')).toBeInTheDocument();
  });

  it('应支持自定义 className', () => {
    const { container } = render(
      <SwissRoundTabs {...defaultProps} showFinalResult className="custom-class" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.toString()).toContain('custom-class');
  });

  it('标签容器应支持水平滚动', () => {
    const { container } = render(<SwissRoundTabs {...defaultProps} showFinalResult />);

    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('所有标签应保持最小高度 44px 符合触摸目标规范', () => {
    const { container } = render(<SwissRoundTabs {...defaultProps} showFinalResult />);

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button.classList.toString()).toContain('min-h-[44px]');
    });
  });
});
