/**
 * API 类型定义
 */

/**
 * 通用响应类型
 */
export interface ApiResponse<T = unknown> {
  /** 响应状态码 */
  code: number;
  /** 响应数据 */
  data?: T;
  /** 响应消息 */
  message?: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * 错误响应类型
 */
export interface ApiError {
  /** 错误码 */
  code: number;
  /** 错误消息 */
  message: string;
  /** 错误详情 */
  details?: unknown;
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  data: T[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页大小 */
  pageSize: number;
}

/**
 * 通用请求参数类型
 */
export interface BaseRequestParams {
  /** 页码，默认为 1 */
  page?: number;
  /** 每页数量，默认为 10 */
  pageSize?: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 asc|desc */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 登录相关类型
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  /** 用户信息 */
  user?: UserInfo;
  /** 访问令牌 (后端返回 access_token) */
  access_token?: string;
  /** 令牌类型 */
  token_type?: string;
  /** 兼容旧版本 */
  token?: string;
  /** 刷新令牌 */
  refreshToken?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 队员相关类型
 */
// 从API响应接收的队员类型(包含teamId)
export interface Player {
  id: string;
  name: string;
  avatar?: string;
  position: 'top' | 'jungle' | 'mid' | 'bot' | 'support';
  teamId: string;
}

// 发送到API的队员类型(不包含teamId)
export interface CreatePlayerRequest {
  id: string;
  name: string;
  avatar?: string;
  position: 'top' | 'jungle' | 'mid' | 'bot' | 'support';
}

/**
 * 战队相关类型
 */
export interface Team {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  players?: Player[];
  createdAt?: string;
  updatedAt?: string;
}

// 后端期望的创建战队请求格式
export interface CreateTeamRequest {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  players?: CreatePlayerRequest[];
}

export interface UpdateTeamRequest extends Partial<CreateTeamRequest> {
  id: string;
}

/**
 * 比赛相关类型
 */
export interface Match {
  id: string;
  stage: 'swiss' | 'elimination';
  round: string;
  teamAId?: string;
  teamBId?: string;
  teamA?: Team;
  teamB?: Team;
  scoreA: number;
  scoreB: number;
  winnerId?: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  startTime?: string;
  swissRecord?: string;
  swissDay?: number;
  eliminationBracket?: 'winners' | 'losers' | 'grand_finals';
  eliminationGameNumber?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateMatchRequest {
  id: string;
  teamAId?: string;
  teamBId?: string;
  scoreA?: number;
  scoreB?: number;
  winnerId?: string;
  status?: 'upcoming' | 'ongoing' | 'finished';
  startTime?: string;
}

export interface FindMatchesByStageRequest {
  stage: string;
  round?: number;
}

/**
 * 直播相关类型
 */
export interface Stream {
  id: string;
  title: string;
  url: string;
  isLive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateStreamRequest {
  id: string;
  title?: string;
  url?: string;
  isLive?: boolean;
}

/**
 * 晋级相关类型
 */
export interface Advancement {
  winners2_0: string[];
  winners2_1: string[];
  losersBracket: string[];
  eliminated3rd: string[];
  eliminated0_3: string[];
}

export interface UpdateAdvancementRequest {
  winners2_0?: string[];
  winners2_1?: string[];
  losersBracket?: string[];
  eliminated3rd?: string[];
  eliminated0_3?: string[];
}