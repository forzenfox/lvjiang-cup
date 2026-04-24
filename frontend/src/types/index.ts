import { PositionType } from './position';

// 队员实力等级
export type PlayerLevel = 'S' | 'A' | 'B' | 'C' | 'D';

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
  level?: PlayerLevel;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  players: Player[];
  battleCry: string;
}

export type MatchStatus = 'upcoming' | 'ongoing' | 'finished';
export type MatchStage = 'swiss' | 'elimination';
export type EliminationBracket = 'quarterfinals' | 'semifinals' | 'finals';

export interface Match {
  id: string;
  teamAId?: string;
  teamBId?: string;
  teamA?: Team;
  teamB?: Team;
  scoreA: number;
  scoreB: number;
  winnerId?: string | null;
  round: string;
  status: MatchStatus;
  startTime?: string;
  stage: MatchStage;
  swissRecord?: string;
  swissRound?: number;
  boFormat?: 'BO1' | 'BO3' | 'BO5';
  eliminationBracket?: EliminationBracket;
  eliminationGameNumber?: number;
}

export interface StreamInfo {
  title: string;
  url: string;
  isLive: boolean;
}

// 瑞士轮晋级结果
export interface SwissAdvancementResult {
  top8: string[]; // 前8名晋级淘汰赛
  eliminated: string[]; // 被淘汰队伍
  rankings?: { teamId: string; record: string; rank: number }[];
}

// 晋级名单分类类型
export type AdvancementCategory = 'top8' | 'eliminated';

// 晋级名单状态
export interface AdvancementState {
  advancement: SwissAdvancementResult;
  lastUpdated: string;
  updatedBy: string;
}
