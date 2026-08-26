import apiClient from './axios';
import type { ApiResponse } from './types';

/**
 * 管理后台 API
 */

/** 按生效配置生成槽位的结果 */
export interface InitSlotsResult {
  message?: string;
  /** 新创建的槽位数 */
  created: number;
  /** 已存在跳过的槽位数 */
  skipped: number;
  /** 生效配置应有的槽位总数 */
  total: number;
}

/**
 * 初始化比赛槽位（按生效配置生成，幂等：已存在槽位跳过不触碰）
 * @returns 初始化结果（created/skipped/total）
 */
export async function initSlots(): Promise<InitSlotsResult> {
  const response = await apiClient.post<ApiResponse<InitSlotsResult>>('/admin/init-slots');
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '初始化比赛槽位失败');
  }

  return responseData.data;
}

export default {
  initSlots,
};
