import apiClient from './axios';
import type { ApiResponse } from './types';
import type {
  MatchGameData,
  MatchSeriesInfo,
  MatchDataCheckResponse,
  ImportMatchDataResponse,
  UpdateMatchDataResponse,
} from '../types/matchData';

/**
 * 对战数据 API
 */

/**
 * 检查对战数据是否存在
 * @param matchId 比赛 ID
 * @returns 数据存在性检查结果
 */
export async function checkMatchDataExists(matchId: string): Promise<MatchDataCheckResponse> {
  const response = await apiClient.get<ApiResponse<MatchDataCheckResponse>>(
    `/matches/${matchId}/games/check`
  );
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '检查对战数据失败');
  }

  return responseData.data;
}

/**
 * 获取对战系列信息
 * @param matchId 比赛 ID
 * @returns 系列赛信息（含各局概要）
 */
export async function getMatchSeries(matchId: string): Promise<MatchSeriesInfo> {
  const response = await apiClient.get<ApiResponse<MatchSeriesInfo>>(`/matches/${matchId}/series`);
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取对战系列信息失败');
  }

  return responseData.data;
}

/**
 * 获取单局对战数据详情
 * @param matchId 比赛 ID
 * @param gameNumber 局数 (1-5)
 * @returns 单局完整对战数据
 */
export async function getMatchGameData(
  matchId: string,
  gameNumber: number
): Promise<MatchGameData> {
  const response = await apiClient.get<ApiResponse<MatchGameData>>(
    `/matches/${matchId}/games/${gameNumber}`
  );
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取对战数据失败');
  }

  return responseData.data;
}

/**
 * 导入对战数据（Excel 文件）
 * @param matchId 比赛 ID
 * @param file Excel 文件
 * @returns 导入结果
 */
export async function importMatchData(
  matchId: string,
  file: File
): Promise<ImportMatchDataResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<ImportMatchDataResponse>>(
    `/admin/matches/${matchId}/games/import`,
    formData
  );
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '导入对战数据失败');
  }

  return responseData.data;
}

/**
 * 更新对战数据
 * @param matchId 比赛 ID
 * @param gameId 对战记录 ID
 * @param data 更新的对战数据
 * @returns 更新结果
 */
export async function updateMatchGameData(
  matchId: string,
  gameId: number,
  data: unknown
): Promise<UpdateMatchDataResponse> {
  const response = await apiClient.put<ApiResponse<UpdateMatchDataResponse>>(
    `/admin/matches/${matchId}/games/${gameId}`,
    data
  );
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '更新对战数据失败');
  }

  return responseData.data;
}

/**
 * 下载对战数据导入模板
 * @returns 模板文件 Blob
 */
export async function downloadMatchDataTemplate(): Promise<Blob> {
  const response = await apiClient.get<Blob>('/admin/matches/import/template', {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * 下载对战数据导入错误报告
 * @param errors 错误列表
 * @returns 错误报告文件 Blob
 */
export async function downloadMatchDataErrorReport(errors: any[]): Promise<Blob> {
  const response = await apiClient.post<Blob>(
    '/admin/matches/import/error-report',
    { errors },
    {
      responseType: 'blob',
    }
  );
  return response.data;
}

export default {
  checkMatchDataExists,
  getMatchSeries,
  getMatchGameData,
  importMatchData,
  updateMatchGameData,
  downloadMatchDataTemplate,
  downloadMatchDataErrorReport,
};
