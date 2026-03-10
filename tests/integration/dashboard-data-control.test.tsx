import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '@/pages/admin/Dashboard';

describe('Dashboard Data Control', () => {
  it('应该渲染数据管理按钮', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('加载 Mock 数据')).toBeInTheDocument();
    expect(screen.getByText('清空所有数据')).toBeInTheDocument();
  });
});
