import apiClient from './axios';
import type { ApiResponse, LoginRequest, LoginResponse, UserInfo } from './types';

/**
 * 认证 API
 */

/**
 * 用户登录
 * @param data 登录信息
 * @returns 登录响应（包含 Token 和用户信息）
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '登录失败');
  }
  
  // 登录成功后自动保存 Token
  if (responseData.data.token) {
    localStorage.setItem('token', responseData.data.token);
  }
  
  return responseData.data;
}

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export async function getCurrentUser(): Promise<UserInfo> {
  const response = await apiClient.get<ApiResponse<UserInfo>>('/auth/me');
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取用户信息失败');
  }
  
  return responseData.data;
}

/**
 * 退出登录
 */
export function logout(): void {
  // 清除 Token
  localStorage.removeItem('token');
  
  // 跳转到登录页
  window.location.href = '/admin/login';
}

/**
 * 检查是否已登录
 * @returns 是否已登录
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export default {
  login,
  getCurrentUser,
  logout,
  isAuthenticated,
};
