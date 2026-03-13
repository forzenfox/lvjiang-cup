import apiClient from './axios';
import type { ApiResponse, Match, UpdateMatchRequest, PaginatedResponse, FindMatchesByStageRequest } from './types';

/**
 * 比赛 API
 */

/**
 * 获取所有比赛
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 比赛列表
 */
export async function getAll(page = 1, pageSize = 10): Promise<PaginatedResponse<Match>> {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Match>>>('/matches', {
    params: { page, pageSize },
  });
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取比赛列表失败');
  }
  
  return responseData.data;
}

/**
 * 根据 ID 获取比赛
 * @param id 比赛 ID
 * @returns 比赛信息
 */
export async function getById(id: string): Promise<Match> {
  const response = await apiClient.get<ApiResponse<Match>>(`/matches/${id}`);
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取比赛信息失败');
  }
  
  return responseData.data;
}

/**
 * 更新比赛
 * @param data 更新比赛数据
 * @returns 更新后的比赛信息
 */
export async function update(data: UpdateMatchRequest): Promise<Match> {
  const { id, ...updateData } = data;
  const response = await apiClient.put<ApiResponse<Match>>(`/admin/matches/${id}`, updateData);
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '更新比赛失败');
  }

  return responseData.data;
}

/**
 * 根据阶段查找比赛
 * @param params 查询参数（阶段、轮次）
 * @returns 比赛列表
 */
export async function findByStage(params: FindMatchesByStageRequest): Promise<Match[]> {
  const { stage, round } = params;
  const response = await apiClient.get<ApiResponse<Match[]>>(`/matches/stage/${stage}`, {
    params: { round },
  });
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取比赛列表失败');
  }
  
  return responseData.data;
}

/**
 * 根据轮次查找比赛
 * @param round 轮次
 * @returns 比赛列表
 */
export async function findByRound(round: number): Promise<Match[]> {
  const response = await apiClient.get<ApiResponse<Match[]>>(`/matches/round/${round}`);
  const responseData = response.data;
  
  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取比赛列表失败');
  }
  
  return responseData.data;
}

/**
 * 清空比赛比分
 * @param id 比赛 ID
 * @returns 清空比分后的比赛信息
 */
export async function clearScores(id: string): Promise<Match> {
  const response = await apiClient.delete<ApiResponse<Match>>(`/admin/matches/${id}/scores`);
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '清空比分失败');
  }

  return responseData.data;
}

export default {
  getAll,
  getById,
  update,
  findByStage,
  findByRound,
  clearScores,
};
