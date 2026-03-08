export interface Player {
  id: string;
  name: string;
  avatar: string;
  position: string;
  description: string;
  teamId?: string;
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
  eliminationBracket?: EliminationBracket; // 淘汰赛分组
  eliminationGameNumber?: number; // 淘汰赛比赛编号
  // 树状图连接关系
  nextMatchId?: string; // 晋级后的下一场比赛ID
  nextMatchSlot?: 'teamA' | 'teamB'; // 晋级后进入哪个位置
  previousMatchIds?: string[]; // 来源比赛ID（用于败者组）
}

export interface StreamInfo {
  title: string;
  url: string;
  platform: string;
  isLive: boolean;
}
