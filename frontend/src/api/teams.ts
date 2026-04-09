import apiClient from './axios';
import type {
  ApiResponse,
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  PaginatedResponse,
} from './types';

/**
 * 战队 API
 */

/**
 * 获取所有战队
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 战队列表
 */
export async function getAll(page = 1, pageSize = 10): Promise<PaginatedResponse<Team>> {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Team>>>('/teams', {
    params: { page, pageSize },
  });
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取战队列表失败');
  }

  return responseData.data;
}

/**
 * 根据 ID 获取战队
 * @param id 战队 ID
 * @returns 战队信息
 */
export async function getById(id: string): Promise<Team> {
  const response = await apiClient.get<ApiResponse<Team>>(`/teams/${id}`);
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取战队信息失败');
  }

  return responseData.data;
}

/**
 * 创建战队
 * @param data 创建战队数据
 * @returns 创建的战队信息
 */
export async function create(data: CreateTeamRequest): Promise<Team> {
  const response = await apiClient.post<ApiResponse<Team>>('/admin/teams', data);
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '创建战队失败');
  }

  return responseData.data;
}

/**
 * 更新战队
 * @param data 更新战队数据
 * @returns 更新后的战队信息
 */
export async function update(data: UpdateTeamRequest): Promise<Team> {
  const { id, ...updateData } = data;
  const response = await apiClient.put<ApiResponse<Team>>(`/admin/teams/${id}`, updateData);
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '更新战队失败');
  }

  return responseData.data;
}

/**
 * 删除战队
 * @param id 战队 ID
 */
export async function remove(id: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(`/admin/teams/${id}`);
  const responseData = response.data;

  if (!responseData.success) {
    throw new Error(responseData.message || '删除战队失败');
  }
}

/**
 * 上传战队图标
 * @param teamId 战队 ID
 * @param file 文件对象
 * @returns 上传结果 { url, thumbnailUrl }
 */
export async function uploadTeamLogo(
  teamId: string,
  file: File
): Promise<{ url: string; thumbnailUrl?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'logo');
  formData.append('id', teamId);

  const response = await apiClient.post<ApiResponse<{ url: string; thumbnailUrl?: string }>>(
    '/admin/upload/image',
    formData,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || '上传失败');
  }

  return response.data.data;
}

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  uploadTeamLogo,
};
