import { PositionType } from './position';

export interface Player {
  id: string;
  nickname?: string;
  avatarUrl?: string;
  position: PositionType;
  bio?: string;
  teamId?: string;
  gameId?: string;
  championPool?: string[];
  rating?: number;
  isCaptain?: boolean;
  liveUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  players: Player[];
  description: string;
}

export type MatchStatus = 'upcoming' | 'ongoing' | 'finished';
export type MatchStage = 'swiss' | 'elimination';
export type EliminationBracket = 'winners' | 'losers' | 'grand_finals';

export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  teamA?: Team;
  teamB?: Team;
  scoreA: number;
  scoreB: number;
  winnerId: string | null;
  round: string;
  status: MatchStatus;
  startTime: string;
  // 新增字段
  stage: MatchStage;
  swissRecord?: string; // 瑞士轮战绩，如 "0-0", "1-0", "0-1", "1-1", "0-2", "1-2", "2-0", "2-1"
  swissDay?: number; // 瑞士轮第几天
  eliminationGameNumber?: number; // 淘汰赛比赛编号
  eliminationBracket?: EliminationBracket; // 淘汰赛分组
}

export interface StreamInfo {
  title: string;
  url: string;
  isLive: boolean;
}

// 瑞士轮晋级结果
export interface SwissAdvancementResult {
  winners2_0: string[]; // 2-0战绩晋级胜者组
  winners2_1: string[]; // 2-1战绩晋级胜者组
  losersBracket: string[]; // 晋级败者组
  eliminated3rd: string[]; // 积分第三淘汰
  eliminated0_3: string[]; // 0-3战绩淘汰
}

// 晋级名单分类类型
export type AdvancementCategory =
  | 'winners2_0'
  | 'winners2_1'
  | 'losersBracket'
  | 'eliminated3rd'
  | 'eliminated0_3';

// 晋级名单状态
export interface AdvancementState {
  advancement: SwissAdvancementResult;
  lastUpdated: string;
  updatedBy: string;
}
