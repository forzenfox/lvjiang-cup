import { Page } from '@playwright/test';
import type { Team } from '../../../src/types';
import { TeamsPage } from '../pages';

export interface TeamData {
  id: string;
  name: string;
  logo: string;
  battleCry: string;
  players: Array<{ name: string; position: string }>;
}

export interface MatchDataFixture {
  matchId: string;
  teamAName: string;
  teamBName: string;
  boFormat: 'BO1' | 'BO3' | 'BO5';
  gameNumber: number;
  gameDuration: string;
  winner: 'red' | 'blue';
  videoBvid?: string;
}

export interface GameCheckResponse {
  success: boolean;
  code: number;
  data: { hasData: boolean; gameCount: number };
}

export interface SeriesGame {
  gameNumber: number;
  winner?: string;
  winnerTeamId?: string | null;
  duration?: string;
  gameDuration?: string;
  status?: number;
  hasData?: boolean;
}

export interface SeriesTeam {
  name: string;
  id: string;
}

export interface SeriesResponse {
  success: boolean;
  code: number;
  data: {
    matchId: string;
    teamA: SeriesTeam;
    teamB: SeriesTeam;
    boFormat: string;
    games: SeriesGame[];
  };
}

export interface TeamStats {
  teamId?: string;
  teamName?: string;
  name?: string;
  side?: string;
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  towers: number;
  dragons: number;
  barons: number;
  isWinner?: boolean;
}

export interface PlayerStat {
  id: number;
  side: 'red' | 'blue';
  position: string;
  nickname: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gold: number;
  damageDealt: number;
  damageTaken: number;
  level: number;
  visionScore: number;
  wardsPlaced: number;
  mvp: boolean;
  playerId?: string;
  playerName?: string;
  teamId?: string;
  teamName?: string;
  kda?: string;
  firstBlood?: boolean;
}

export interface GameResponse {
  success: boolean;
  code: number;
  data: {
    matchId: string;
    gameNumber: number;
    gameDuration?: string;
    gameStartTime?: string;
    videoBvid?: string;
    winner?: string;
    winnerTeamId?: string;
    blueTeam: TeamStats;
    redTeam: TeamStats;
    playerStats: PlayerStat[];
  };
}

const DEFAULT_POSITIONS = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

const DEFAULT_PLAYER_TEMPLATES = [
  { position: 'TOP', championName: '格温', kills: 2, deaths: 2, assists: 11, cs: 349, gold: 17315, damageDealt: 28500, damageTaken: 32000, level: 18, visionScore: 45, wardsPlaced: 12 },
  { position: 'JUNGLE', championName: '潘森', kills: 4, deaths: 7, assists: 10, cs: 261, gold: 14855, damageDealt: 22000, damageTaken: 28000, level: 16, visionScore: 38, wardsPlaced: 8 },
  { position: 'MID', championName: '奎桑提', kills: 13, deaths: 0, assists: 11, cs: 339, gold: 19592, damageDealt: 35000, damageTaken: 18000, level: 18, visionScore: 42, wardsPlaced: 6 },
  { position: 'ADC', championName: '艾希', kills: 7, deaths: 3, assists: 10, cs: 368, gold: 19385, damageDealt: 32000, damageTaken: 21000, level: 18, visionScore: 35, wardsPlaced: 4 },
  { position: 'SUPPORT', championName: '萨勒芬妮', kills: 0, deaths: 3, assists: 22, cs: 47, gold: 11580, damageDealt: 8500, damageTaken: 15000, level: 15, visionScore: 78, wardsPlaced: 18 },
  { position: 'TOP', championName: '奎桑提', kills: 1, deaths: 3, assists: 8, cs: 289, gold: 15200, damageDealt: 21000, damageTaken: 35000, level: 17, visionScore: 42, wardsPlaced: 10 },
  { position: 'JUNGLE', championName: '蔚', kills: 3, deaths: 5, assists: 9, cs: 198, gold: 12500, damageDealt: 18000, damageTaken: 26000, level: 15, visionScore: 36, wardsPlaced: 9 },
  { position: 'MID', championName: '阿狸', kills: 5, deaths: 6, assists: 7, cs: 312, gold: 16800, damageDealt: 25000, damageTaken: 19000, level: 17, visionScore: 38, wardsPlaced: 5 },
  { position: 'ADC', championName: '厄斐琉斯', kills: 6, deaths: 5, assists: 6, cs: 352, gold: 17500, damageDealt: 28000, damageTaken: 22000, level: 18, visionScore: 32, wardsPlaced: 3 },
  { position: 'SUPPORT', championName: '烈娜塔', kills: 3, deaths: 6, assists: 5, cs: 38, gold: 9800, damageDealt: 7500, damageTaken: 18000, level: 14, visionScore: 82, wardsPlaced: 20 },
];

const RED_TEAM_NAMES = ['洞主', '凯哥', '啧啧', '伏羲', '小溪'];
const BLUE_TEAM_NAMES = ['余小C', '阿亮', '二泽', '恶意', '阿瓜'];

let teamCounter = 0;

function generateUniqueName(base: string): string {
  teamCounter++;
  return `${base}_${Date.now()}_${teamCounter}`;
}

export function createTeamData(overrides: Partial<TeamData> = {}): TeamData {
  const index = teamCounter;
  return {
    id: overrides.id || `team-${Date.now()}-${index}`,
    name: overrides.name || generateUniqueName('TestTeam'),
    logo: overrides.logo || `https://picsum.photos/seed/test${index}/200/200`,
    battleCry: overrides.battleCry || `${overrides.name || 'Test'}战队`,
    players: overrides.players || DEFAULT_POSITIONS.map(pos => ({
      name: `Player_${pos}_${index}`,
      position: pos,
    })),
  };
}

export function createMatchDataFixture(overrides: Partial<MatchDataFixture> = {}): MatchDataFixture {
  return {
    matchId: overrides.matchId || `test-match-${Date.now()}`,
    teamAName: overrides.teamAName || 'BLG',
    teamBName: overrides.teamBName || 'WBG',
    boFormat: overrides.boFormat || 'BO3',
    gameNumber: overrides.gameNumber || 1,
    gameDuration: overrides.gameDuration || '32:45',
    winner: overrides.winner || 'red',
    videoBvid: overrides.videoBvid,
  };
}

export function createGameCheckResponse(hasData: boolean, gameCount: number): GameCheckResponse {
  return {
    success: true,
    code: 20000,
    data: { hasData, gameCount },
  };
}

export function createSeriesResponse(
  matchData: MatchDataFixture,
  games: SeriesGame[] = []
): SeriesResponse {
  const gameList = games.length > 0 ? games : [
    { gameNumber: 1, winner: 'red', duration: '32:45', status: 1 },
  ];

  return {
    success: true,
    code: 20000,
    data: {
      matchId: matchData.matchId,
      teamA: { name: matchData.teamAName, id: 'team-a' },
      teamB: { name: matchData.teamBName, id: 'team-b' },
      boFormat: matchData.boFormat,
      games: gameList,
    },
  };
}

export function createGameResponse(
  gameNumber: number,
  matchData: MatchDataFixture,
  overrides: Partial<GameResponse['data']> = {}
): GameResponse {
  const playerStats = overrides.playerStats || createDefaultPlayerStats(matchData);

  return {
    success: true,
    code: 20000,
    data: {
      matchId: matchData.matchId,
      gameNumber,
      gameDuration: overrides.gameDuration || matchData.gameDuration,
      gameStartTime: overrides.gameStartTime || '2026-04-16 14:00',
      videoBvid: overrides.videoBvid || matchData.videoBvid,
      winner: overrides.winner || matchData.winner,
      winnerTeamId: overrides.winnerTeamId,
      blueTeam: {
        teamId: overrides.blueTeam?.teamId || 'team-b',
        teamName: overrides.blueTeam?.teamName || matchData.teamBName,
        side: 'blue',
        kills: overrides.blueTeam?.kills ?? 18,
        deaths: overrides.blueTeam?.deaths ?? 25,
        assists: overrides.blueTeam?.assists ?? 35,
        gold: overrides.blueTeam?.gold ?? 58000,
        towers: overrides.blueTeam?.towers ?? 3,
        dragons: overrides.blueTeam?.dragons ?? 1,
        barons: overrides.blueTeam?.barons ?? 0,
        isWinner: overrides.blueTeam?.isWinner,
      },
      redTeam: {
        teamId: overrides.redTeam?.teamId || 'team-a',
        teamName: overrides.redTeam?.teamName || matchData.teamAName,
        side: 'red',
        kills: overrides.redTeam?.kills ?? 25,
        deaths: overrides.redTeam?.deaths ?? 18,
        assists: overrides.redTeam?.assists ?? 47,
        gold: overrides.redTeam?.gold ?? 65000,
        towers: overrides.redTeam?.towers ?? 9,
        dragons: overrides.redTeam?.dragons ?? 3,
        barons: overrides.redTeam?.barons ?? 1,
        isWinner: overrides.redTeam?.isWinner,
      },
      playerStats,
    },
  };
}

export function createDefaultPlayerStats(
  matchData: MatchDataFixture,
  options: { mvpIndex?: number; useExtendedFormat?: boolean } = {}
): PlayerStat[] {
  const { mvpIndex = 2, useExtendedFormat = false } = options;

  return DEFAULT_PLAYER_TEMPLATES.map((tpl, i) => {
    const side: 'red' | 'blue' = i < 5 ? 'red' : 'blue';
    const nickname = i < 5 ? RED_TEAM_NAMES[i] : BLUE_TEAM_NAMES[i - 5];

    const base: PlayerStat = {
      id: i + 1,
      side,
      position: tpl.position,
      nickname,
      championName: tpl.championName,
      kills: tpl.kills,
      deaths: tpl.deaths,
      assists: tpl.assists,
      cs: tpl.cs,
      gold: tpl.gold,
      damageDealt: tpl.damageDealt,
      damageTaken: tpl.damageTaken,
      level: tpl.level,
      visionScore: tpl.visionScore,
      wardsPlaced: tpl.wardsPlaced,
      mvp: i === mvpIndex,
    };

    if (useExtendedFormat) {
      base.playerId = `player-${i + 1}`;
      base.playerName = nickname;
      base.teamId = side === 'red' ? 'team-a' : 'team-b';
      base.teamName = side === 'red' ? matchData.teamAName : matchData.teamBName;
      base.kda = `${tpl.kills}.${tpl.deaths}`;
      base.firstBlood = false;
    }

    return base;
  });
}

export function createFilledPlayerStats(count: number, matchData: MatchDataFixture): PlayerStat[] {
  return Array(count).fill(null).map((_, i) => ({
    id: i + 1,
    side: i < 5 ? 'red' : 'blue',
    position: DEFAULT_POSITIONS[i % 5],
    nickname: `Player${i + 1}`,
    championName: '英雄',
    kills: 1,
    deaths: 1,
    assists: 1,
    cs: 100,
    gold: 10000,
    damageDealt: 10000,
    damageTaken: 10000,
    level: 15,
    visionScore: 20,
    wardsPlaced: 5,
    mvp: false,
  }));
}

export async function ensureTeamsExist(
  page: Page,
  teamsPage: TeamsPage,
  count: number = 2
): Promise<TeamData[]> {
  const createdTeams: TeamData[] = [];

  for (let i = 0; i < count; i++) {
    const teamData = createTeamData();
    const success = await teamsPage.createTeam({
      name: teamData.name,
      logo: teamData.logo,
      battleCry: teamData.battleCry,
    });

    if (success) {
      createdTeams.push(teamData);
    }
  }

  return createdTeams;
}
