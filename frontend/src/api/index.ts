/**
 * API 客户端导出
 */

// Axios 实例
export { default as apiClient } from './axios';

// 类型定义
export * from './types';

// 认证 API
export { default as authApi, login, getCurrentUser, logout, isAuthenticated } from './auth';

// 战队 API
export {
  default as teamsApi,
  getAll as getAllTeams,
  getById as getTeamById,
  create as createTeam,
  update as updateTeam,
  remove as removeTeam,
} from './teams';

// 比赛 API
export {
  default as matchesApi,
  getAll as getAllMatches,
  getById as getMatchById,
  update as updateMatch,
  findByStage as findMatchesByStage,
  findByRound as findMatchesByRound,
  clearScores as clearMatchScores,
} from './matches';

// 直播 API
export {
  default as streamsApi,
  get as getStream,
  getAll as getAllStreams,
  update as updateStream,
  create as createStream,
  remove as removeStream,
} from './streams';

// 晋级 API
export {
  default as advancementApi,
  get as getAdvancement,
  update as updateAdvancement,
} from './advancement';
