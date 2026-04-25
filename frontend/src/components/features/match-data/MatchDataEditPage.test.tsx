import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MatchDataEditPage from './MatchDataEditPage';

/**
 * MatchDataEditPage 组件测试 - 功能已禁用
 */

describe('MatchDataEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithParams = () => {
    return render(
      <MemoryRouter initialEntries={['/admin/matches/swiss-r2-h1/games/1/edit']}>
        <Routes>
          <Route
            path="/admin/matches/:matchId/games/:gameNumber/edit"
            element={<MatchDataEditPage />}
          />
        </Routes>
      </MemoryRouter>
    );
  };

  it('页面标题显示为"对战数据详情编辑"', async () => {
    renderWithParams();

    await waitFor(() => {
      expect(screen.getByText('对战数据详情编辑')).toBeInTheDocument();
    });
  });

  it('显示"功能暂时禁用"提示', async () => {
    renderWithParams();

    await waitFor(() => {
      expect(screen.getByText('功能暂时禁用')).toBeInTheDocument();
    });
  });

  it('显示禁用说明文字', async () => {
    renderWithParams();

    await waitFor(() => {
      // 文本被 <br/> 标签分成了两行，使用正则匹配
      expect(screen.getByText(/对战数据编辑功能暂时禁用/)).toBeInTheDocument();
      expect(screen.getByText(/如有需要请联系管理员/)).toBeInTheDocument();
    });
  });

  it('显示返回按钮', async () => {
    renderWithParams();

    await waitFor(() => {
      expect(screen.getByText('返回上一页')).toBeInTheDocument();
      expect(screen.getByText('返回')).toBeInTheDocument();
    });
  });

  it('不再显示编辑界面的内容', async () => {
    renderWithParams();

    await waitFor(() => {
      // 禁用提示应该存在
      expect(screen.getByText('功能暂时禁用')).toBeInTheDocument();
    });

    // 正常的编辑界面内容不应该存在
    expect(screen.queryByText('保存')).not.toBeInTheDocument();
    expect(screen.queryByText('取消')).not.toBeInTheDocument();
  });
});
