import apiClient from './axios';
import type { ApiResponse } from './types';
import type { FormatConfig } from '@/lib/format/types';

/**
 * 赛制配置 API
 */

/** 生效配置响应 */
export interface ActiveFormatResponse {
  /** 来源：builtin（内置默认）/ config（激活配置） */
  source: 'builtin' | 'config';
  /** 配置 ID（builtin 时为 null） */
  id: string | null;
  /** 赛制配置 */
  config: FormatConfig;
}

/** 配置记录（列表项） */
export interface FormatRecord {
  id: string;
  name: string;
  config: FormatConfig;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** 槽位生成结果 */
export interface GenerateSlotsResult {
  message?: string;
  created: number;
  skipped: number;
  total: number;
}

/**
 * 获取当前生效配置（公开接口，无激活配置时返回内置默认）
 */
export async function getActive(): Promise<ActiveFormatResponse> {
  const response = await apiClient.get<ApiResponse<ActiveFormatResponse>>('/format/active');
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取赛制配置失败');
  }

  return responseData.data;
}

/**
 * 获取赛制配置列表（需认证）
 */
export async function listFormats(): Promise<FormatRecord[]> {
  const response = await apiClient.get<ApiResponse<FormatRecord[]>>('/admin/formats');
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '获取赛制配置列表失败');
  }

  return responseData.data;
}

/**
 * 保存新赛制配置（校验后落库，不自动生成槽位）
 */
export async function createFormat(config: FormatConfig, name?: string): Promise<FormatRecord> {
  const response = await apiClient.post<ApiResponse<FormatRecord>>('/admin/formats', {
    config,
    name,
  });
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '保存赛制配置失败');
  }

  return responseData.data;
}

/**
 * 编辑赛制配置
 */
export async function updateFormat(id: string, config: FormatConfig): Promise<FormatRecord> {
  const response = await apiClient.put<ApiResponse<FormatRecord>>(`/admin/formats/${id}`, {
    config,
  });
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '更新赛制配置失败');
  }

  return responseData.data;
}

/**
 * 删除赛制配置（已激活配置需先停用）
 */
export async function deleteFormat(id: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/admin/formats/${id}`);
  const responseData = response.data;

  if (!responseData.success) {
    throw new Error(responseData.message || '删除赛制配置失败');
  }
}

/**
 * 激活赛制配置（切换生效配置指针）
 */
export async function activateFormat(id: string): Promise<void> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    `/admin/formats/${id}/activate`
  );
  const responseData = response.data;

  if (!responseData.success) {
    throw new Error(responseData.message || '激活赛制配置失败');
  }
}

/**
 * 停用全部配置（切回内置默认配置）
 */
export async function deactivateFormat(): Promise<void> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/admin/format/default');
  const responseData = response.data;

  if (!responseData.success) {
    throw new Error(responseData.message || '切回默认配置失败');
  }
}

/**
 * 按生效配置生成比赛槽位（幂等：仅补缺失槽位，不触碰已有数据）
 */
export async function generateSlots(formatId?: string): Promise<GenerateSlotsResult> {
  const response = await apiClient.post<ApiResponse<GenerateSlotsResult>>(
    '/admin/slots/generate',
    formatId ? { formatId } : {}
  );
  const responseData = response.data;

  if (!responseData.success || !responseData.data) {
    throw new Error(responseData.message || '生成比赛槽位失败');
  }

  return responseData.data;
}

export default {
  getActive,
  listFormats,
  createFormat,
  updateFormat,
  deleteFormat,
  activateFormat,
  deactivateFormat,
  generateSlots,
};
