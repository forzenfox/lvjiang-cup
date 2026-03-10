import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';

describe('AdminLayout 导航菜单', () => {
  it('不应该显示晋级名单菜单项', () => {
    // 模拟已登录状态
    localStorage.setItem('isAdmin', 'true');

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Test Content</div>
        </AdminLayout>
      </MemoryRouter>
    );

    // 不应该显示晋级名单菜单
    expect(screen.queryByText('晋级名单')).not.toBeInTheDocument();
  });

  it('应该显示仪表盘菜单项', () => {
    localStorage.setItem('isAdmin', 'true');

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Test Content</div>
        </AdminLayout>
      </MemoryRouter>
    );

    // 应该显示仪表盘菜单
    expect(screen.getByText('仪表盘')).toBeInTheDocument();
  });

  it('应该显示赛程管理菜单项', () => {
    localStorage.setItem('isAdmin', 'true');

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Test Content</div>
        </AdminLayout>
      </MemoryRouter>
    );

    // 应该显示赛程管理菜单
    expect(screen.getByText('赛程管理')).toBeInTheDocument();
  });

  it('应该显示战队管理菜单项', () => {
    localStorage.setItem('isAdmin', 'true');

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Test Content</div>
        </AdminLayout>
      </MemoryRouter>
    );

    // 应该显示战队管理菜单
    expect(screen.getByText('战队管理')).toBeInTheDocument();
  });

  it('应该显示直播配置菜单项', () => {
    localStorage.setItem('isAdmin', 'true');

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Test Content</div>
        </AdminLayout>
      </MemoryRouter>
    );

    // 应该显示直播配置菜单
    expect(screen.getByText('直播配置')).toBeInTheDocument();
  });
});
