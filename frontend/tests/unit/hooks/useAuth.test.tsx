import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import * as authApi from '@/api/auth';

// Mock auth API
vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
}));

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/**
 * useAuth Hook 测试套件
 *
 * 测试覆盖：
 * - 初始状态检查
 * - 登录功能
 * - 登出功能
 * - Token 管理
 * - 错误处理
 * - 自动跳转
 */
describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * 初始状态测试
   */
  describe('初始状态', () => {
    it('初始状态应该是未认证', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('没有 Token 时应该结束加载并保持未认证状态', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('有有效 Token 时应该自动认证', async () => {
      const mockUser = { id: '1', username: 'admin', role: 'admin' };
      localStorage.setItem('token', 'valid-token');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('Token 无效时应该清除 Token 并保持未认证', async () => {
      localStorage.setItem('token', 'invalid-token');
      vi.mocked(authApi.getCurrentUser).mockRejectedValue(new Error('Invalid token'));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  /**
   * 登录功能测试
   */
  describe('登录功能', () => {
    it('登录成功应该更新认证状态并保存 Token', async () => {
      const mockUser = { id: '1', username: 'admin', role: 'admin' };
      const mockResponse = { user: mockUser, token: 'new-token' };
      vi.mocked(authApi.login).mockResolvedValue(mockResponse);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // 等待初始加载完成
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 执行登录
      await act(async () => {
        await result.current.login({ username: 'admin', password: 'password123' });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(localStorage.getItem('token')).toBe('new-token');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });

    it('登录失败应该显示错误信息', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('用户名或密码错误'));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.login({ username: 'admin', password: 'wrong' });
        } catch {
          // 预期会抛出错误
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('用户名或密码错误');
    });

    it('登录时应该显示加载状态', async () => {
      vi.mocked(authApi.login).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ user: { id: '1', username: 'admin' }, token: 'token' }), 100)
          )
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.login({ username: 'admin', password: 'password123' });
      });

      // 立即检查加载状态
      expect(result.current.loading).toBe(true);
    });
  });

  /**
   * 登出功能测试
   */
  describe('登出功能', () => {
    it('登出应该清除认证状态并跳转', async () => {
      const mockUser = { id: '1', username: 'admin', role: 'admin' };
      localStorage.setItem('token', 'valid-token');
      vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);

      // Mock logout 函数来实际清除 token
      vi.mocked(authApi.logout).mockImplementation(() => {
        localStorage.removeItem('token');
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // 验证 token 存在
      expect(localStorage.getItem('token')).toBe('valid-token');

      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
    });
  });

  /**
   * 清除错误功能测试
   */
  describe('清除错误', () => {
    it('clearError 应该清除错误信息', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('登录失败'));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.login({ username: 'admin', password: 'wrong' });
        } catch {
          // 预期错误
        }
      });

      expect(result.current.error).toBe('登录失败');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  /**
   * 刷新用户信息测试
   */
  describe('刷新用户信息', () => {
    it('refreshUser 应该更新用户信息', async () => {
      const mockUser = { id: '1', username: 'admin', role: 'admin' };
      const updatedUser = { id: '1', username: 'admin', role: 'superadmin' };

      localStorage.setItem('token', 'valid-token');
      vi.mocked(authApi.getCurrentUser)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      expect(result.current.user).toEqual(mockUser);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user).toEqual(updatedUser);
    });

    it('未认证时 refreshUser 不应该执行', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter>{children}</MemoryRouter>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);

      // 不应该抛出错误或调用 API
      await act(async () => {
        await result.current.refreshUser();
      });

      // getCurrentUser 不应该被调用（因为没有 token）
      expect(authApi.getCurrentUser).not.toHaveBeenCalled();
    });
  });
});
