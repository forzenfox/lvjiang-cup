import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import PrizePoolPanel from '@/components/features/HeroSection/PrizePoolPanel';
import type { PrizePoolData } from '@/data/types';

describe('PrizePoolPanel', () => {
  const mockData: PrizePoolData = {
    prizePoolTotal: 125600,
    regular: {
      total: 109000,
      championRatio: 0.7,
      runnerUpRatio: 0.3,
    },
    specialAwards: [
      { id: 1, content: '测试奖项1' },
      { id: 2, content: '测试奖项2' },
    ],
  };

  it('渲染赛事奖金池总额', async () => {
    render(<PrizePoolPanel data={mockData} />);
    await waitFor(() => {
      expect(screen.getByText('¥125,600')).toBeInTheDocument();
    });
  });

  it('渲染常规奖金总额', () => {
    render(<PrizePoolPanel data={mockData} />);
    expect(screen.getByTestId('regular-total')).toHaveTextContent('¥109,000');
  });

  it('根据比例计算冠军奖金与占比', () => {
    render(<PrizePoolPanel data={mockData} />);
    expect(screen.getByTestId('champion-card')).toHaveTextContent('¥76,300');
    expect(screen.getByText(/冠军.*70%/)).toBeInTheDocument();
  });

  it('根据比例计算亚军奖金与占比', () => {
    render(<PrizePoolPanel data={mockData} />);
    expect(screen.getByTestId('runner-up-card')).toHaveTextContent('¥32,700');
    expect(screen.getByText(/亚军.*30%/)).toBeInTheDocument();
  });

  it('支持手动配置冠亚军金额（覆盖自动计算）', () => {
    const customData: PrizePoolData = {
      ...mockData,
      regular: {
        total: 100000,
        champion: 80000,
        runnerUp: 20000,
        championRatio: 0.7,
        runnerUpRatio: 0.3,
      },
    };
    render(<PrizePoolPanel data={customData} />);
    expect(screen.getByTestId('champion-card')).toHaveTextContent('¥80,000');
    expect(screen.getByTestId('runner-up-card')).toHaveTextContent('¥20,000');
  });

  it('渲染特殊奖项列表', () => {
    render(<PrizePoolPanel data={mockData} />);
    expect(screen.getByText('测试奖项1')).toBeInTheDocument();
    expect(screen.getByText('测试奖项2')).toBeInTheDocument();
  });

  it('特殊奖项不展示赞助人名称', () => {
    render(<PrizePoolPanel data={mockData} />);
    expect(screen.queryByText('为何如此衰')).not.toBeInTheDocument();
  });

  it('无特殊奖项时仅展示常规奖金', () => {
    const noSpecial = { ...mockData, specialAwards: [] };
    render(<PrizePoolPanel data={noSpecial} />);
    expect(screen.getByTestId('regular-total')).toHaveTextContent('¥109,000');
    expect(screen.queryByText('特殊奖项')).not.toBeInTheDocument();
  });

  it('无常规奖金时仅展示特殊奖项', () => {
    const noRegular = {
      ...mockData,
      regular: { total: 0, championRatio: 0.7, runnerUpRatio: 0.3 },
    };
    render(<PrizePoolPanel data={noRegular} />);
    expect(screen.queryByText('常规奖金')).not.toBeInTheDocument();
    expect(screen.getByText('测试奖项1')).toBeInTheDocument();
  });
});
