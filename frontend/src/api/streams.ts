import apiClient from './axios';
import type { ApiResponse, Stream, UpdateStreamRequest } from './types';

/**
 * 直播 API
 */

/**
 * 获取直播信息
 * @param id 直播 ID，如果不传则获取当前活跃的直播
 * @returns 直播信息
 */
export async function get(id?: string): Promise<Stream> {
  const url = id ? `/streams/${id}` : '/streams/active';
  const response = await apiClient.get<ApiResponse<Stream>>(url);
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取直播信息失败');
  }
  
  return responseData.data;
}

/**
 * 获取所有直播
 * @returns 直播列表
 */
export async function getAll(): Promise<Stream[]> {
  const response = await apiClient.get<ApiResponse<Stream[]>>('/streams');
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取直播列表失败');
  }
  
  return responseData.data;
}

/**
 * 更新直播
 * @param data 更新直播数据
 * @returns 更新后的直播信息
 */
export async function update(data: UpdateStreamRequest): Promise<Stream> {
  const { id, ...updateData } = data;
  const response = await apiClient.patch<ApiResponse<Stream>>(`/streams/${id}`, updateData);
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '更新直播失败');
  }
  
  return responseData.data;
}

/**
 * 创建直播
 * @param data 创建直播数据
 * @returns 创建的直播信息
 */
export async function create(data: Partial<Stream>): Promise<Stream> {
  const response = await apiClient.post<ApiResponse<Stream>>('/streams', data);
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '创建直播失败');
  }
  
  return responseData.data;
}

/**
 * 删除直播
 * @param id 直播 ID
 */
export async function remove(id: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(`/streams/${id}`);
  const responseData = response.data;
  
  if (!responseData.success) {
    throw new Error(responseData.message || '删除直播失败');
  }
}

export default {
  get,
  getAll,
  update,
  create,
  remove,
};
