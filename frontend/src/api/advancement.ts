import apiClient from './axios';
import type { ApiResponse, Advancement, UpdateAdvancementRequest } from './types';

/**
 * 晋级 API
 */

/**
 * 获取晋级名单
 * @returns 晋级名单信息
 */
export async function get(): Promise<Advancement> {
  const response = await apiClient.get<ApiResponse<Advancement>>('/advancement');
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取晋级名单失败');
  }
  
  return responseData.data;
}

/**
 * 更新晋级名单
 * @param data 更新晋级名单数据
 * @returns 更新后的晋级名单信息
 */
export async function update(data: UpdateAdvancementRequest): Promise<Advancement> {
  const response = await apiClient.put<ApiResponse<Advancement>>('/admin/advancement', data);
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '更新晋级名单失败');
  }

  return responseData.data;
}

export default {
  get,
  update,
};
