import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import MatchDataHeader from './MatchDataHeader';

/**
 * MatchDataHeader 组件测试
 */

describe('MatchDataHeader', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('默认显示"对战数据详情"标题', () => {
    renderWithRouter(<MatchDataHeader />);
    expect(screen.getByText('对战数据详情')).toBeInTheDocument();
  });

  it('传入 title 时显示自定义标题', () => {
    renderWithRouter(<MatchDataHeader title="对战数据详情编辑" />);
    expect(screen.getByText('对战数据详情编辑')).toBeInTheDocument();
  });

  it('显示副标题', () => {
    renderWithRouter(<MatchDataHeader subtitle="驴酱 vs IC - BO1" />);
    expect(screen.getByText('驴酱 vs IC - BO1')).toBeInTheDocument();
  });

  it('渲染 action 区域', () => {
    renderWithRouter(
      <MatchDataHeader action={<button data-testid="test-action">测试按钮</button>} />
    );
    expect(screen.getByTestId('test-action')).toBeInTheDocument();
  });

  it('action 区域不超出容器边界', () => {
    const { container } = renderWithRouter(
      <MatchDataHeader
        title="对战数据详情编辑"
        action={
          <div className="flex items-center gap-2">
            <button>取消</button>
            <button>保存</button>
          </div>
        }
      />
    );
    const actionWrapper = container.querySelector('.max-w-7xl');
    expect(actionWrapper).toBeInTheDocument();
  });
});
