import apiClient from './axios';
import type { ApiResponse, UpdateMemberRequest } from './types';

/**
 * 队员管理 API
 */

/**
 * 更新队员信息
 * @param id 队员 ID
 * @param data 更新数据
 * @returns 更新后的队员信息
 */
export async function updateMember(id: string, data: UpdateMemberRequest): Promise<unknown> {
  const response = await apiClient.put<ApiResponse<unknown>>(`/admin/members/${id}`, data);
  const responseData = response.data;

  if (!responseData.success) {
    throw new Error(responseData.message || '更新队员信息失败');
  }

  return responseData.data;
}

/**
 * 删除队员
 * @param id 队员 ID
 */
export async function removeMember(id: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/members/${id}`);
  const responseData = response.data;

  if (!responseData.success) {
    throw new Error(responseData.message || '删除队员失败');
  }
}

export default {
  updateMember,
  removeMember,
};
