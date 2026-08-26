import * as formatApi from '@/api/format';
import type { ActiveFormatResponse, FormatRecord } from '@/api/format';
import type { FormatConfig } from '@/lib/format/types';
import { BUILTIN_DEFAULT_FORMAT } from '@/lib/format/defaultFormat';
import { unifiedCache } from '@/utils/unifiedCache';

/**
 * 赛制配置服务
 *
 * 轻量服务（无状态订阅）：赛制配置属于低频、小体量资源，
 * 仅提供生效配置获取（含内置默认兜底 + 缓存）与管理端 CRUD 封装。
 */

/** 生效配置解析结果（含兜底后的配置对象，config 恒不为空） */
export interface ResolvedActiveFormat {
  source: 'builtin' | 'config';
  id: string | null;
  config: FormatConfig;
}

/** 缓存键 */
const ACTIVE_FORMAT_CACHE_KEY = 'format-active';

/**
 * 获取当前生效配置
 * - 接口异常或返回空时兜底内置默认配置（保证展示端永不因配置缺失而崩溃）
 * - 使用 unifiedCache 缓存，激活/停用/生成后由调用方 clearActiveFormatCache 失效
 */
export async function getActiveFormat(): Promise<ResolvedActiveFormat> {
  const cached = unifiedCache.get<ResolvedActiveFormat>(ACTIVE_FORMAT_CACHE_KEY);
  if (cached) {
    return cached;
  }

  let result: ResolvedActiveFormat;
  try {
    const data: ActiveFormatResponse = await formatApi.getActive();
    result = { source: data.source, id: data.id, config: data.config };
  } catch (error) {
    // 接口不可用（如后端未升级、网络异常）时兜底内置默认配置
    console.error('获取赛制配置失败，使用内置默认配置兜底:', error);
    result = { source: 'builtin', id: null, config: BUILTIN_DEFAULT_FORMAT };
  }

  unifiedCache.set(ACTIVE_FORMAT_CACHE_KEY, result);
  return result;
}

/** 失效生效配置缓存（激活/停用/重新生成后调用） */
export function clearActiveFormatCache(): void {
  unifiedCache.clear(ACTIVE_FORMAT_CACHE_KEY);
}

/** 获取配置列表 */
export async function listFormats(): Promise<FormatRecord[]> {
  return formatApi.listFormats();
}

/** 保存新配置 */
export async function createFormat(config: FormatConfig, name?: string): Promise<FormatRecord> {
  return formatApi.createFormat(config, name);
}

/** 更新配置 */
export async function updateFormat(id: string, config: FormatConfig): Promise<FormatRecord> {
  return formatApi.updateFormat(id, config);
}

/** 删除配置（已激活配置需先停用） */
export async function deleteFormat(id: string): Promise<void> {
  return formatApi.deleteFormat(id);
}

/** 激活配置（切换生效指针） */
export async function activateFormat(id: string): Promise<void> {
  await formatApi.activateFormat(id);
  clearActiveFormatCache();
}

/** 停用全部配置（切回内置默认） */
export async function deactivateFormat(): Promise<void> {
  await formatApi.deactivateFormat();
  clearActiveFormatCache();
}

/** 按生效配置生成比赛槽位（幂等） */
export async function generateSlots(formatId?: string) {
  return formatApi.generateSlots(formatId);
}

export const formatService = {
  getActiveFormat,
  clearActiveFormatCache,
  listFormats,
  createFormat,
  updateFormat,
  deleteFormat,
  activateFormat,
  deactivateFormat,
  generateSlots,
};

export default formatService;
