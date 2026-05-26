import React, { useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Edit3 } from 'lucide-react';
import MatchDataHeader from './MatchDataHeader';
import MatchSeriesHeader from './MatchSeriesHeader';
import GameSwitcher from './GameSwitcher';
import TeamStatsBar from './TeamStatsBar';
import PlayerStatsList from './PlayerStatsList';
import type {
  MatchSeriesInfo,
  MatchGameData,
  PlayerStat,
  TeamGameData,
  BanData,
  PositionType,
  GameSummary,
} from '@/types/matchData';
import MatchDataEmptyState from './MatchDataEmptyState';
import { initChampionMap } from '@/utils/championUtils';
import { isTokenValid } from '@/utils/tokenUtils';
import { adminPath } from '@/constants/routes';

// 直接导入静态 JSON 数据
import matchesData from '@/data/s2-matches.json';
import teamsData from '@/data/s2-teams.json';
import teamMembersData from '@/data/s2-team-members.json';
import matchGamesData from '@/data/s2-match-games.json';
import playerStatsData from '@/data/s2-player-stats.json';

const POSITION_ORDER: PositionType[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

// 原始数据行类型定义（snake_case JSON 结构）
interface RawMatch {
  id: string;
  team_a_id: string;
  team_b_id: string;
  score_a: number;
  score_b: number;
  winner_id: string | null;
  round: string;
  status: string;
  start_time: string;
  stage: string;
  swiss_record: string | null;
  swiss_round: number | null;
  bo_format: string | null;
  elimination_bracket: string | null;
  elimination_game_number: number | null;
}

interface RawTeam {
  id: string;
  name: string;
  logo: string;
}

interface RawTeamMember {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
}

interface RawMatchGame {
  id: number;
  match_id: string;
  game_number: number;
  winner_team_id: string | null;
  game_duration: string;
  game_start_time: string | null;
  blue_team_id: string;
  red_team_id: string;
  blue_kills: number;
  blue_gold: number;
  blue_towers: number;
  blue_dragons: number;
  blue_barons: number;
  red_kills: number;
  red_gold: number;
  red_towers: number;
  red_dragons: number;
  red_barons: number;
  red_ban: string | null;
  blue_ban: string | null;
  status: number;
  video_bvid: string | null;
}

interface RawPlayerStat {
  id: number;
  match_game_id: number;
  player_id: string;
  team_id: string;
  position: string;
  champion_name: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gold: number;
  damage_dealt: number;
  damage_taken: number;
  vision_score: number;
  wards_placed: number;
  level: number;
  first_blood: number;
  mvp: number;
}

// 构建队伍名称映射
const teamNameMap = new Map<string, string>();
for (const team of teamsData as RawTeam[]) {
  teamNameMap.set(team.id, team.name);
}

// 构建队员昵称映射
const memberNameMap = new Map<string, string>();
const memberAvatarMap = new Map<string, string>();
for (const member of teamMembersData as RawTeamMember[]) {
  if (member.nickname) memberNameMap.set(member.id, member.nickname);
  if (member.avatar_url) memberAvatarMap.set(member.id, member.avatar_url);
}

// 解析 JSON 字符串格式的 BAN 列表
function parseBanList(banStr: string | null): string[] {
  if (!banStr) return [];
  try {
    return JSON.parse(banStr) as string[];
  } catch {
    return [];
  }
}

// 查找匹配的原始数据
function findRawMatch(id: string): RawMatch | undefined {
  return (matchesData as RawMatch[]).find(m => m.id === id);
}

function findMatchGames(matchId: string): RawMatchGame[] {
  return (matchGamesData as RawMatchGame[]).filter(g => g.match_id === matchId);
}

function findPlayerStats(matchGameId: number): RawPlayerStat[] {
  return (playerStatsData as RawPlayerStat[]).filter(p => p.match_game_id === matchGameId);
}

// 构建 MatchSeriesInfo
function buildSeriesInfo(matchId: string): MatchSeriesInfo | null {
  const rawMatch = findRawMatch(matchId);
  if (!rawMatch) return null;

  const games = findMatchGames(matchId);
  const gameSummaries: GameSummary[] = games.map(g => ({
    gameNumber: g.game_number,
    winnerTeamId: g.winner_team_id,
    gameDuration: g.game_duration,
    hasData: true,
  }));

  return {
    matchId: rawMatch.id,
    teamA: {
      id: rawMatch.team_a_id,
      name: teamNameMap.get(rawMatch.team_a_id) || '队伍A',
    },
    teamB: {
      id: rawMatch.team_b_id,
      name: teamNameMap.get(rawMatch.team_b_id) || '队伍B',
    },
    format: (rawMatch.bo_format as 'BO1' | 'BO3' | 'BO5') || 'BO1',
    games: gameSummaries,
  };
}

// 构建单局 MatchGameData
function buildGameData(matchId: string, gameNumber: number): MatchGameData | null {
  const rawGames = findMatchGames(matchId);
  const rawGame = rawGames.find(g => g.game_number === gameNumber);
  if (!rawGame) return null;

  const rawStats = findPlayerStats(rawGame.id);

  const blueTeam: TeamGameData = {
    teamId: rawGame.blue_team_id,
    teamName: teamNameMap.get(rawGame.blue_team_id) || '蓝色方',
    side: 'blue',
    kills: rawGame.blue_kills,
    gold: rawGame.blue_gold,
    towers: rawGame.blue_towers,
    dragons: rawGame.blue_dragons,
    barons: rawGame.blue_barons,
    isWinner: rawGame.winner_team_id === rawGame.blue_team_id,
  };

  const redTeam: TeamGameData = {
    teamId: rawGame.red_team_id,
    teamName: teamNameMap.get(rawGame.red_team_id) || '红色方',
    side: 'red',
    kills: rawGame.red_kills,
    gold: rawGame.red_gold,
    towers: rawGame.red_towers,
    dragons: rawGame.red_dragons,
    barons: rawGame.red_barons,
    isWinner: rawGame.winner_team_id === rawGame.red_team_id,
  };

  const bans: BanData = {
    red: parseBanList(rawGame.red_ban),
    blue: parseBanList(rawGame.blue_ban),
  };

  const playerStats: PlayerStat[] = rawStats.map(s => ({
    id: s.id,
    playerId: s.player_id,
    playerName: memberNameMap.get(s.player_id) || '未知选手',
    teamId: s.team_id,
    teamName: teamNameMap.get(s.team_id) || '未知队伍',
    position: s.position as PositionType,
    championName: s.champion_name,
    kills: s.kills,
    deaths: s.deaths,
    assists: s.assists,
    kda: `${s.kills}/${s.deaths}/${s.assists}`,
    cs: s.cs,
    gold: s.gold,
    damageDealt: s.damage_dealt,
    damageTaken: s.damage_taken,
    visionScore: s.vision_score,
    wardsPlaced: s.wards_placed,
    level: s.level,
    firstBlood: s.first_blood === 1,
    mvp: s.mvp === 1,
    playerAvatarUrl: memberAvatarMap.get(s.player_id) || undefined,
  }));

  // 注入团队总伤害/承伤
  const blueDamage = playerStats
    .filter(p => p.teamId === rawGame.blue_team_id)
    .reduce((sum, p) => sum + p.damageDealt, 0);
  const blueDamageTaken = playerStats
    .filter(p => p.teamId === rawGame.blue_team_id)
    .reduce((sum, p) => sum + p.damageTaken, 0);
  const redDamage = playerStats
    .filter(p => p.teamId === rawGame.red_team_id)
    .reduce((sum, p) => sum + p.damageDealt, 0);
  const redDamageTaken = playerStats
    .filter(p => p.teamId === rawGame.red_team_id)
    .reduce((sum, p) => sum + p.damageTaken, 0);

  return {
    id: rawGame.id,
    matchId: rawGame.match_id,
    gameNumber: rawGame.game_number,
    winnerTeamId: rawGame.winner_team_id,
    gameDuration: rawGame.game_duration,
    gameStartTime: rawGame.game_start_time,
    videoBvid: rawGame.video_bvid,
    blueTeam: { ...blueTeam, totalDamage: blueDamage, totalDamageTaken: blueDamageTaken },
    redTeam: { ...redTeam, totalDamage: redDamage, totalDamageTaken: redDamageTaken },
    bans,
    playerStats,
  };
}

/**
 * 对战数据详情页面
 * 使用静态 JSON 数据直接渲染，无需 API 调用
 */
const MatchDataPage: React.FC = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentGameNumber = parseInt(searchParams.get('game') || '1', 10);

  // 管理员鉴权状态
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAdmin(!!token && isTokenValid(token));
  }, []);

  // 使用 useMemo 计算系列赛信息（依赖 matchId）
  const seriesInfo = useMemo<MatchSeriesInfo | null>(() => {
    if (!matchId) return null;
    return buildSeriesInfo(matchId);
  }, [matchId]);

  // 使用 useMemo 计算当前局数据（依赖 matchId 和 currentGameNumber）
  const gameData = useMemo<MatchGameData | null>(() => {
    if (!matchId) return null;
    return buildGameData(matchId, currentGameNumber);
  }, [matchId, currentGameNumber]);

  // 修正 gameNumber：如果当前游戏编号不在有效范围内，跳转到第一个游戏
  React.useEffect(() => {
    if (seriesInfo && seriesInfo.games.length > 0) {
      const validNumbers = seriesInfo.games.map(g => g.gameNumber);
      if (!validNumbers.includes(currentGameNumber)) {
        setSearchParams({ game: String(validNumbers[0]) });
      }
    }
  }, [seriesInfo, currentGameNumber, setSearchParams]);

  // 页面加载时初始化英雄数据
  React.useEffect(() => {
    initChampionMap();
  }, []);

  // 跳转到编辑页面
  const handleEditClick = React.useCallback(() => {
    if (!matchId || !isAdmin) return;
    const gameNum = currentGameNumber || 1;
    navigate(adminPath(`matches/${matchId}/games/${gameNum}/edit`));
  }, [matchId, currentGameNumber, isAdmin, navigate]);

  const renderHeaderAction = () => {
    if (!isAdmin) return null;
    return (
      <button
        onClick={handleEditClick}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#2d2d2d] hover:bg-[#3d3d3d] rounded-lg transition-colors"
        aria-label="编辑对战数据"
      >
        <Edit3 className="w-4 h-4" />
        编辑
      </button>
    );
  };

  const handleGameChange = React.useCallback(
    (gameNumber: number) => {
      setSearchParams({ game: gameNumber.toString() });
    },
    [setSearchParams]
  );

  const handleBack = React.useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const [expandedPosition, setExpandedPosition] = React.useState<string | null>(null);

  const handleTogglePosition = React.useCallback((position: string) => {
    setExpandedPosition(prev => (prev === position ? null : position));
  }, []);

  const getPlayersBySide = React.useCallback(
    (playerStats: PlayerStat[], side: 'blue' | 'red') => {
      return playerStats.filter(p => {
        if (side === 'blue') {
          return p.teamId === gameData?.blueTeam.teamId;
        } else {
          return p.teamId === gameData?.redTeam.teamId;
        }
      });
    },
    [gameData]
  );

  const filteredBluePlayers = React.useMemo(() => {
    if (!gameData) return [];
    return getPlayersBySide(gameData.playerStats, 'blue');
  }, [gameData, getPlayersBySide]);

  const filteredRedPlayers = React.useMemo(() => {
    if (!gameData) return [];
    return getPlayersBySide(gameData.playerStats, 'red');
  }, [gameData, getPlayersBySide]);

  const sortedBluePlayers = React.useMemo(() => {
    return POSITION_ORDER.map(pos => filteredBluePlayers.find(p => p.position === pos)).filter(
      (p): p is PlayerStat => p !== undefined
    );
  }, [filteredBluePlayers]);

  const sortedRedPlayers = React.useMemo(() => {
    return POSITION_ORDER.map(pos => filteredRedPlayers.find(p => p.position === pos)).filter(
      (p): p is PlayerStat => p !== undefined
    );
  }, [filteredRedPlayers]);

  const renderContent = () => {
    if (!gameData) return null;

    return (
      <>
        <MatchSeriesHeader seriesInfo={seriesInfo} gameData={gameData} />

        <GameSwitcher
          games={seriesInfo?.games || []}
          currentGame={currentGameNumber}
          onChange={handleGameChange}
          format={seriesInfo?.format}
        />

        <TeamStatsBar
          blueTeam={gameData.blueTeam}
          redTeam={gameData.redTeam}
          bans={gameData.bans}
          gameDuration={gameData.gameDuration}
        />

        <PlayerStatsList
          bluePlayers={sortedBluePlayers}
          redPlayers={sortedRedPlayers}
          expandedPosition={expandedPosition}
          onToggle={handleTogglePosition}
          gameDuration={gameData.gameDuration}
          redTeamStats={gameData.redTeam}
          blueTeamStats={gameData.blueTeam}
        />
      </>
    );
  };

  // 错误状态
  if (!matchId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
        <MatchDataHeader onBack={handleBack} action={renderHeaderAction()} />
        <div className="flex flex-col items-center justify-center mt-8">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg mb-2">缺少比赛ID</p>
          <p className="text-sm text-gray-400 mb-6">数据加载失败</p>
        </div>
      </div>
    );
  }

  // 空数据状态（只有系列赛信息但没有游戏数据）
  if (!gameData && seriesInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
        <MatchDataHeader
          onBack={handleBack}
          subtitle={
            seriesInfo
              ? `${seriesInfo.teamA.name} vs ${seriesInfo.teamB.name} - ${seriesInfo.format}`
              : undefined
          }
          action={renderHeaderAction()}
        />
        <MatchDataEmptyState matchId={matchId} />
      </div>
    );
  }

  // 未找到比赛
  if (!seriesInfo && !gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
        <MatchDataHeader onBack={handleBack} action={renderHeaderAction()} />
        <div className="flex flex-col items-center justify-center mt-8">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg mb-2">未找到比赛数据</p>
          <p className="text-sm text-gray-400 mb-6">比赛 ID: {matchId}</p>
        </div>
      </div>
    );
  }

  // 正常渲染（无加载中状态，数据立即可用）
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] to-[#1a1a2e] text-white">
      <MatchDataHeader
        onBack={handleBack}
        subtitle={
          seriesInfo
            ? `${seriesInfo.teamA.name} vs ${seriesInfo.teamB.name} - ${seriesInfo.format}`
            : undefined
        }
        action={renderHeaderAction()}
      />

      <div className="container mx-auto px-4 py-6">{renderContent()}</div>
    </div>
  );
};

export default React.memo(MatchDataPage);
