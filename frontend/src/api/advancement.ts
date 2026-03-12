import apiClient from './axios';
import type { ApiResponse, AdvancementRule, UpdateAdvancementRequest } from './types';

/**
 * 晋级 API
 */

/**
 * 获取晋级规则
 * @param stage 阶段名称，如果不传则获取所有阶段的晋级规则
 * @returns 晋级规则信息或列表
 */
export async function get(stage?: string): Promise<AdvancementRule | AdvancementRule[]> {
  const url = stage ? `/advancement/${stage}` : '/advancement';
  const response = await apiClient.get<ApiResponse<AdvancementRule | AdvancementRule[]>>(url);
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取晋级规则失败');
  }
  
  return responseData.data;
}

/**
 * 获取特定阶段的晋级规则
 * @param stage 阶段名称
 * @returns 晋级规则信息
 */
export async function getByStage(stage: string): Promise<AdvancementRule> {
  const response = await apiClient.get<ApiResponse<AdvancementRule>>(`/advancement/${stage}`);
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取晋级规则失败');
  }
  
  return responseData.data;
}

/**
 * 更新晋级规则
 * @param data 更新晋级规则数据
 * @returns 更新后的晋级规则信息
 */
export async function update(data: UpdateAdvancementRequest): Promise<AdvancementRule> {
  const response = await apiClient.put<ApiResponse<AdvancementRule>>('/admin/advancement', data);
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '更新晋级规则失败');
  }

  return responseData.data;
}

export default {
  get,
  getByStage,
  update,
};
