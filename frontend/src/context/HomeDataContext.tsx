import React, { createContext, useContext } from 'react';
import type { Team, Match, Stream, Streamer, VideoItem, Player, TeamWithMembers } from '@/types';
import { PositionType } from '@/types/position';
import { getUploadUrl } from '@/utils/upload';

/**
 * 首页统一数据 Context
 *
 * 直接从静态 JSON 文件导入 S2 赛季数据，提供同步的数据访问。
 * 不再依赖 API 调用，不再有 loading/error 状态。
 */

// 导入静态 JSON 数据
import streamData from '@/data/s2-stream.json';
import teamsData from '@/data/s2-teams.json';
import teamMembersData from '@/data/s2-team-members.json';
import matchesData from '@/data/s2-matches.json';
import videosData from '@/data/s2-videos.json';
import streamersData from '@/data/s2-streamers.json';

interface HomeDataContextValue {
  stream: Stream | null;
  teams: Team[];
  teamsWithMembers: TeamWithMembers[];
  matches: Match[];
  videos: VideoItem[];
  streamers: Streamer[];
}

const HomeDataContext = createContext<HomeDataContextValue | null>(null);

export const useHomeData = () => {
  const context = useContext(HomeDataContext);
  if (!context) {
    throw new Error('useHomeData must be used within HomeDataProvider');
  }
  return context;
};

interface HomeDataProviderProps {
  children: React.ReactNode;
}

/**
 * 将 JSON 中的 snake_case 字段转换为 camelCase
 */
function convertStream(raw: (typeof streamData)[0]): Stream {
  return {
    id: raw.id,
    title: raw.title,
    url: raw.url,
    isLive: raw.is_live === 1,
  };
}

interface RawTeam {
  id: string;
  name: string;
  logo: string | null;
  logo_url: string | null;
  logo_thumbnail_url: string | null;
  battle_cry: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface RawTeamMember {
  id: string;
  user_id: string | null;
  nickname: string;
  avatar_url: string;
  position: string;
  team_id: string;
  game_id: string;
  bio: string | null;
  champion_pool: string | null;
  rating: number;
  is_captain: number;
  live_url: string | null;
  sort_order: number | null;
  level: string;
  created_at: string;
  updated_at: string;
  auction_price: number;
}

interface RawMatch {
  id: string;
  team_a_id: string | null;
  team_b_id: string | null;
  score_a: number;
  score_b: number;
  winner_id: string | null;
  round: string;
  status: string;
  start_time: string | null;
  stage: string;
  swiss_record: string | null;
  swiss_round: number | null;
  bo_format: string | null;
  elimination_bracket: string | null;
  elimination_game_number: number | null;
  created_at: string;
  updated_at: string;
}

interface RawVideo {
  id: string;
  bvid: string;
  bilibili_title: string;
  custom_title: string | null;
  cover_url: string;
  order: number;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface RawStreamer {
  id: string;
  nickname: string;
  poster_url: string;
  bio: string;
  live_url: string;
  streamer_type: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function convertTeam(raw: RawTeam, members: Player[]): Team {
  return {
    id: raw.id,
    name: raw.name,
    logo:
      getUploadUrl(raw.logo || raw.logo_url) ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${raw.id}`,
    players: members,
    battleCry: raw.battle_cry || '暂无参赛宣言',
  };
}

function convertTeamWithMembers(raw: RawTeam, members: Player[]): TeamWithMembers {
  return {
    id: raw.id,
    name: raw.name,
    logo:
      getUploadUrl(raw.logo || raw.logo_url) ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${raw.id}`,
    players: members,
    battleCry: raw.battle_cry || '暂无参赛宣言',
    logoUrl: raw.logo_url || undefined,
    description: raw.description || undefined,
  };
}

function convertPlayer(raw: RawTeamMember): Player {
  return {
    id: raw.id,
    nickname: raw.nickname,
    avatarUrl: raw.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${raw.id}`,
    position: raw.position as PositionType,
    teamId: raw.team_id,
    gameId: raw.game_id,
    bio: raw.bio || undefined,
    championPool: raw.champion_pool ? JSON.parse(raw.champion_pool) : undefined,
    rating: raw.rating,
    isCaptain: raw.is_captain === 1,
    liveUrl: raw.live_url || undefined,
    level: raw.level as Player['level'],
    auctionPrice: raw.auction_price,
    sortOrder: raw.sort_order ?? undefined,
  };
}

function convertMatch(raw: RawMatch, teams: Team[]): Match {
  const matchStage = raw.stage === 'elimination' ? ('elimination' as const) : ('swiss' as const);
  const bracketMap: Record<string, Match['eliminationBracket']> = {
    quarterfinals: 'quarterfinals',
    semifinals: 'semifinals',
    finals: 'finals',
  };
  const eliminationBracket = raw.elimination_bracket
    ? bracketMap[raw.elimination_bracket] || undefined
    : undefined;

  const matchStatus = raw.status as Match['status'];

  return {
    id: raw.id,
    teamAId: raw.team_a_id || '',
    teamBId: raw.team_b_id || '',
    teamA: teams.find(t => t.id === raw.team_a_id) || undefined,
    teamB: teams.find(t => t.id === raw.team_b_id) || undefined,
    scoreA: raw.score_a,
    scoreB: raw.score_b,
    winnerId: raw.winner_id || null,
    round: raw.round,
    status: matchStatus,
    startTime: raw.start_time || undefined,
    stage: matchStage,
    swissRecord: raw.swiss_record || undefined,
    swissRound: raw.swiss_round ?? undefined,
    boFormat: (raw.bo_format as Match['boFormat']) || undefined,
    eliminationBracket,
    eliminationGameNumber: raw.elimination_game_number ?? undefined,
  };
}

function convertVideo(raw: RawVideo): VideoItem {
  return {
    id: raw.id,
    title: raw.custom_title || raw.bilibili_title,
    bvid: raw.bvid,
    page: 1,
    coverUrl: raw.cover_url,
  };
}

function convertStreamer(raw: RawStreamer): Streamer {
  return {
    id: raw.id,
    nickname: raw.nickname,
    posterUrl: raw.poster_url,
    bio: raw.bio,
    liveUrl: raw.live_url,
    streamerType: raw.streamer_type as Streamer['streamerType'],
    sortOrder: raw.sort_order,
  };
}

export const HomeDataProvider: React.FC<HomeDataProviderProps> = ({ children }) => {
  const stream = convertStream(streamData[0]);

  const rawTeams = teamsData as unknown as RawTeam[];
  const rawMembers = teamMembersData as unknown as RawTeamMember[];

  const playersMap = new Map<string, Player[]>();
  for (const raw of rawMembers) {
    const existing = playersMap.get(raw.team_id) || [];
    existing.push(convertPlayer(raw));
    playersMap.set(raw.team_id, existing);
  }

  const teams = rawTeams.map(raw => convertTeam(raw, playersMap.get(raw.id) || []));
  const teamsWithMembers = rawTeams.map(raw =>
    convertTeamWithMembers(raw, playersMap.get(raw.id) || [])
  );

  const rawMatches = matchesData as unknown as RawMatch[];
  const matches = rawMatches.map(raw => convertMatch(raw, teams));

  const rawVideos = videosData as unknown as RawVideo[];
  const videos = rawVideos.map(convertVideo);

  const rawStreamers = streamersData as unknown as RawStreamer[];
  const streamers = rawStreamers.map(convertStreamer);

  return (
    <HomeDataContext.Provider
      value={{
        stream,
        teams,
        teamsWithMembers,
        matches,
        videos,
        streamers,
      }}
    >
      {children}
    </HomeDataContext.Provider>
  );
};

export default HomeDataContext;
