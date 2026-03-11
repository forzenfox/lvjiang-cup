/**
 * 数据服务层统一导出
 * 
 * 本模块提供前端应用的数据服务层，封装了 API 调用并管理状态。
 * 每个服务都包含：
 * - 数据操作方法（CRUD）
 * - 状态管理（loading、error、data）
 * - 错误处理
 * - 状态订阅机制
 * 
 * @module services
 */

// 战队数据服务
export { teamService, subscribeToTeamService } from './teamService';
export type { TeamServiceState } from './teamService';

// 比赛数据服务
export { matchService, subscribeToMatchService } from './matchService';
export type { MatchServiceState } from './matchService';

// 直播数据服务
export { streamService, subscribeToStreamService } from './streamService';
export type { StreamServiceState } from './streamService';

// 晋级数据服务
export { advancementService, subscribeToAdvancementService } from './advancementService';
export type { AdvancementServiceState } from './advancementService';

// 导入服务用于默认导出和工具函数
import { teamService } from './teamService';
import { matchService } from './matchService';
import { streamService } from './streamService';
import { advancementService } from './advancementService';

// 默认导出所有服务
export { teamService as teamServiceDefault };
export { matchService as matchServiceDefault };
export { streamService as streamServiceDefault };
export { advancementService as advancementServiceDefault };

/**
 * 服务集合对象，便于批量使用
 */
export const services = {
  team: teamService,
  match: matchService,
  stream: streamService,
  advancement: advancementService,
} as const;

/**
 * 重置所有服务状态
 * 在应用退出登录或需要清理状态时使用
 */
export function resetAllServices(): void {
  teamService.resetState();
  matchService.resetState();
  streamService.resetState();
  advancementService.resetState();
}

/**
 * 清除所有服务错误
 */
export function clearAllServiceErrors(): void {
  teamService.clearError();
  matchService.clearError();
  streamService.clearError();
  advancementService.clearError();
}

// 默认导出服务集合
export default services;
