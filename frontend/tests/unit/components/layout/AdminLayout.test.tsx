import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';

// Mock requestCache - 必须在 vi.mock 工厂函数内定义
vi.mock('@/utils/requestCache', () => {
  const mockDisable = vi.fn();
  const mockEnable = vi.fn();
  const mockIsEnabled = vi.fn().mockReturnValue(true);

  return {
    requestCache: {
      disable: mockDisable,
      enable: mockEnable,
      isEnabled: mockIsEnabled,
    },
    disableFrontendCache: () => mockDisable(),
    enableFrontendCache: () => mockEnable(),
  };
});

// 导入 mock 后的模块以获取 mock 函数
const { requestCache } = await import('@/utils/requestCache');

describe('AdminLayout 导航菜单', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

// 新增测试：缓存禁用功能
describe('AdminLayout 缓存管理', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('isAdmin', 'true');
  });

  it('挂载时应该调用 disableFrontendCache 禁用前端缓存', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Test Content</div>
        </AdminLayout>
      </MemoryRouter>
    );

    // 验证 requestCache.disable 被调用（通过 disableFrontendCache 间接调用）
    expect(requestCache.disable).toHaveBeenCalledTimes(1);
  });

  it('进入管理后台后前端缓存应该被禁用', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminLayout>
          <div>Test Content</div>
        </AdminLayout>
      </MemoryRouter>
    );

    // 验证 requestCache.disable 被调用
    expect(requestCache.disable).toHaveBeenCalledTimes(1);
  });
});
