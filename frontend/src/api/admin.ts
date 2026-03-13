import apiClient from './axios';
import type { ApiResponse } from './types';

/**
 * 管理后台 API
 */

/**
 * 初始化比赛槽位
 * @returns 初始化结果
 */
export async function initSlots(): Promise<{ message: string; count: number }> {
  const response = await apiClient.post<ApiResponse<{ message: string; count: number }>>('/admin/init-slots');
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '初始化比赛槽位失败');
  }

  return responseData.data;
}

export default {
  initSlots,
};
