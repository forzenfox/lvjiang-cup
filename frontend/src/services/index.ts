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

// 视频数据服务
export { videoService, subscribeToVideoService } from './videoService';
export type { VideoServiceState } from './videoService';

// 主播数据服务
export { streamerService, subscribeToStreamerService } from './streamerService';
export type { StreamerServiceState } from './streamerService';

// 队员数据服务
export { memberService, subscribeToMemberService } from './memberService';
export type { MemberServiceState } from './memberService';

// 对战数据服务
export { matchDataService, subscribeToMatchDataService } from './matchDataService';
export type { MatchDataServiceState } from './matchDataService';

// 晋级名单数据服务
export { advancementService, subscribeToAdvancementService } from './advancementService';
export type { AdvancementServiceState } from './advancementService';

// 管理后台数据服务
export { adminService, subscribeToAdminService } from './adminService';
export type { AdminServiceState } from './adminService';

// 导入服务用于默认导出和工具函数
import { teamService } from './teamService';
import { matchService } from './matchService';
import { streamService } from './streamService';
import { videoService } from './videoService';
import { streamerService } from './streamerService';
import { memberService } from './memberService';
import { matchDataService } from './matchDataService';
import { advancementService } from './advancementService';
import { adminService } from './adminService';

// 默认导出所有服务
export { teamService as teamServiceDefault };
export { matchService as matchServiceDefault };
export { streamService as streamServiceDefault };

/**
 * 服务集合对象，便于批量使用
 */
export const services = {
  team: teamService,
  match: matchService,
  stream: streamService,
  video: videoService,
  streamer: streamerService,
  member: memberService,
  matchData: matchDataService,
  advancement: advancementService,
  admin: adminService,
} as const;

/**
 * 重置所有服务状态
 * 在应用退出登录或需要清理状态时使用
 */
export function resetAllServices(): void {
  teamService.resetState();
  matchService.resetState();
  streamService.resetState();
  videoService.resetState();
  streamerService.resetState();
  memberService.resetState();
  matchDataService.resetState();
  advancementService.resetState();
  adminService.resetState();
}

/**
 * 清除所有服务错误
 */
export function clearAllServiceErrors(): void {
  teamService.clearError();
  matchService.clearError();
  streamService.clearError();
  videoService.clearError();
  streamerService.clearError();
  memberService.clearError();
  matchDataService.clearError();
  advancementService.clearError();
  adminService.clearError();
}

// 默认导出服务集合
export default services;
