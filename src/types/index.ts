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
}

export interface StreamInfo {
  title: string;
  url: string;
  platform: string;
  isLive: boolean;
}
