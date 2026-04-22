import * as xlsx from 'xlsx';
import { findChampionId } from '../teams/utils/champion-map.util';

// ============= 接口定义 =============

export interface MatchInfoData {
  redTeamName: string;
  blueTeamName: string;
  gameNumber: number;
  gameStartTime: string;
  gameDuration: string;
  winner: string;
}

export interface TeamStatsData {
  side: string;
  teamName: string;
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  towers: number;
  dragons: number;
  barons: number;
  firstBlood: boolean;
}

export interface PlayerStatsData {
  side: string;
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
  wardsCleared: number;
  mvp: boolean;
}

export interface ParsedMatchData {
  matchInfo: MatchInfoData;
  teamStats: TeamStatsData[];
  playerStats: PlayerStatsData[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface MatchResultData {
  matchInfo: MatchInfoData;
  teamStats: TeamStatsData[];
  playerStats: PlayerStatsData[];
  validations: ValidationResult;
}

// ============= 辅助函数 =============

function extractCellValue(cellValue: any): string {
  if (cellValue === null || cellValue === undefined) {
    return '';
  }
  if (typeof cellValue === 'string') {
    return cellValue.trim();
  }
  return String(cellValue).trim();
}

function extractNumericValue(cellValue: any): number {
  if (cellValue === null || cellValue === undefined || cellValue === '') {
    return 0;
  }
  const num = Number(cellValue);
  return isNaN(num) ? 0 : num;
}

function extractBooleanValue(cellValue: any): boolean {
  if (cellValue === null || cellValue === undefined || cellValue === '') {
    return false;
  }
  if (typeof cellValue === 'boolean') {
    return cellValue;
  }
  const strValue = String(cellValue).trim().toLowerCase();
  return strValue === 'true' || strValue === '是' || strValue === '1' || strValue === 'yes';
}

// ============= 数据验证函数 =============

export function validateMatchInfo(data: MatchInfoData): ValidationResult {
  const errors: string[] = [];

  if (!data.redTeamName) {
    errors.push('红方战队名称不能为空');
  }
  if (!data.blueTeamName) {
    errors.push('蓝方战队名称不能为空');
  }
  if (data.gameNumber < 1 || data.gameNumber > 5) {
    errors.push('局数必须在1-5之间');
  }
  if (!data.gameStartTime) {
    errors.push('游戏开始时间不能为空');
  }
  if (!data.gameDuration) {
    errors.push('游戏时长不能为空');
  } else if (!isValidDurationFormat(data.gameDuration)) {
    errors.push('游戏时长格式错误，应为 MM:SS 格式');
  }
  if (!data.winner) {
    errors.push('获胜方不能为空');
  } else if (!['red', 'blue', 'Red', 'Blue', '红方', '蓝方'].includes(data.winner)) {
    errors.push('获胜方必须是 red 或 blue');
  }

  return { valid: errors.length === 0, errors };
}

export function validateTeamStats(data: TeamStatsData, rowIndex: number): ValidationResult {
  const errors: string[] = [];

  if (!data.side) {
    errors.push(`第${rowIndex}行: 阵营不能为空`);
  } else if (!['red', 'blue', 'Red', 'Blue', '红方', '蓝方'].includes(data.side)) {
    errors.push(`第${rowIndex}行: 阵营必须是 red 或 blue`);
  }
  if (!data.teamName) {
    errors.push(`第${rowIndex}行: 战队名称不能为空`);
  }
  if (data.kills < 0) {
    errors.push(`第${rowIndex}行: 击杀数不能为负数`);
  }
  if (data.deaths < 0) {
    errors.push(`第${rowIndex}行: 死亡数不能为负数`);
  }
  if (data.assists < 0) {
    errors.push(`第${rowIndex}行: 助攻数不能为负数`);
  }
  if (data.gold < 0) {
    errors.push(`第${rowIndex}行: 经济不能为负数`);
  }
  if (data.towers < 0) {
    errors.push(`第${rowIndex}行: 推塔数不能为负数`);
  }
  if (data.dragons < 0) {
    errors.push(`第${rowIndex}行: 控龙数不能为负数`);
  }
  if (data.barons < 0) {
    errors.push(`第${rowIndex}行: 控Baron数不能为负数`);
  }

  return { valid: errors.length === 0, errors };
}

export function validatePlayerStats(data: PlayerStatsData, rowIndex: number): ValidationResult {
  const errors: string[] = [];

  if (!data.side) {
    errors.push(`第${rowIndex}行: 阵营不能为空`);
  } else if (!['red', 'blue', 'Red', 'Blue', '红方', '蓝方'].includes(data.side)) {
    errors.push(`第${rowIndex}行: 阵营必须是 red 或 blue`);
  }
  if (!data.position) {
    errors.push(`第${rowIndex}行: 位置不能为空`);
  } else if (!isValidPosition(data.position)) {
    errors.push(`第${rowIndex}行: 位置必须是 TOP/JUNGLE/MID/ADC/SUPPORT 之一`);
  }
  if (!data.nickname) {
    errors.push(`第${rowIndex}行: 选手昵称不能为空`);
  }
  if (!data.championName) {
    errors.push(`第${rowIndex}行: 使用英雄不能为空`);
  }
  if (data.kills < 0) {
    errors.push(`第${rowIndex}行: 击杀数不能为负数`);
  }
  if (data.deaths < 0) {
    errors.push(`第${rowIndex}行: 死亡数不能为负数`);
  }
  if (data.assists < 0) {
    errors.push(`第${rowIndex}行: 助攻数不能为负数`);
  }
  if (data.cs < 0) {
    errors.push(`第${rowIndex}行: 补刀数不能为负数`);
  }
  if (data.gold < 0) {
    errors.push(`第${rowIndex}行: 经济不能为负数`);
  }
  if (data.damageDealt < 0) {
    errors.push(`第${rowIndex}行: 伤害不能为负数`);
  }
  if (data.damageTaken < 0) {
    errors.push(`第${rowIndex}行: 承伤不能为负数`);
  }
  if (data.level < 1 || data.level > 18) {
    errors.push(`第${rowIndex}行: 等级必须在1-18之间`);
  }
  if (data.visionScore < 0) {
    errors.push(`第${rowIndex}行: 视野得分不能为负数`);
  }
  if (data.wardsPlaced < 0) {
    errors.push(`第${rowIndex}行: 插眼数不能为负数`);
  }
  if (data.wardsCleared < 0) {
    errors.push(`第${rowIndex}行: 排眼数不能为负数`);
  }

  return { valid: errors.length === 0, errors };
}

export function isValidDurationFormat(duration: string): boolean {
  if (!duration) return false;
  const match = duration.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return false;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  return minutes >= 0 && seconds >= 0 && seconds < 60;
}

export function isValidPosition(position: string): boolean {
  const validPositions = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
  return validPositions.includes(position.toUpperCase());
}

// ============= 匹配函数 =============

export function matchTeamName(teamName: string, existingTeamNames: string[]): string | null {
  if (!teamName || !existingTeamNames.length) {
    return null;
  }
  const normalizedInput = teamName.trim();
  for (const name of existingTeamNames) {
    if (name.trim() === normalizedInput) {
      return name;
    }
  }
  return null;
}

export function matchPlayerNickname(nickname: string, existingNicknames: string[]): string | null {
  if (!nickname || !existingNicknames.length) {
    return null;
  }
  const normalizedInput = nickname.trim().toLowerCase();
  for (const nick of existingNicknames) {
    if (nick.trim().toLowerCase() === normalizedInput) {
      return nick;
    }
  }
  return null;
}

export function matchChampionName(championName: string): string | null {
  if (!championName) {
    return null;
  }
  const championId = findChampionId(championName);
  return championId;
}

// ============= Excel解析核心函数 =============

export function parseMatchDataExcel(buffer: Buffer): ParsedMatchData {
  try {
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    if (workbook.SheetNames.length === 0) {
      throw new Error('Excel文件中没有工作表');
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    if (jsonData.length < 16) {
      throw new Error('Excel文件行数不足，应为16行');
    }

    // 解析第2行: MatchInfo数据
    const matchInfoRow = jsonData[1];
    const matchInfo = parseMatchInfoRow(matchInfoRow);

    // 解析第4-5行: TeamStats数据
    const teamStats: TeamStatsData[] = [];
    for (let i = 3; i <= 4; i++) {
      if (jsonData[i]) {
        teamStats.push(parseTeamStatsRow(jsonData[i], i + 1));
      }
    }

    // 解析第7-16行: PlayerStats数据
    const playerStats: PlayerStatsData[] = [];
    for (let i = 6; i <= 15; i++) {
      if (jsonData[i]) {
        playerStats.push(parsePlayerStatsRow(jsonData[i], i + 1));
      }
    }

    return { matchInfo, teamStats, playerStats };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('解析Excel文件时发生未知错误');
  }
}

function parseMatchInfoRow(row: any[]): MatchInfoData {
  return {
    redTeamName: extractCellValue(row[0]),
    blueTeamName: extractCellValue(row[1]),
    gameNumber: extractNumericValue(row[2]),
    gameStartTime: extractCellValue(row[3]),
    gameDuration: extractCellValue(row[4]),
    winner: extractCellValue(row[5]),
  };
}

function parseTeamStatsRow(row: any[], _rowIndex: number): TeamStatsData {
  return {
    side: extractCellValue(row[0]),
    teamName: extractCellValue(row[1]),
    kills: extractNumericValue(row[2]),
    deaths: extractNumericValue(row[3]),
    assists: extractNumericValue(row[4]),
    gold: extractNumericValue(row[5]),
    towers: extractNumericValue(row[6]),
    dragons: extractNumericValue(row[7]),
    barons: extractNumericValue(row[8]),
    firstBlood: extractBooleanValue(row[9]),
  };
}

function parsePlayerStatsRow(row: any[], _rowIndex: number): PlayerStatsData {
  return {
    side: extractCellValue(row[0]),
    position: extractCellValue(row[1]).toUpperCase(),
    nickname: extractCellValue(row[2]),
    championName: extractCellValue(row[3]),
    kills: extractNumericValue(row[4]),
    deaths: extractNumericValue(row[5]),
    assists: extractNumericValue(row[6]),
    cs: extractNumericValue(row[7]),
    gold: extractNumericValue(row[8]),
    damageDealt: extractNumericValue(row[9]),
    damageTaken: extractNumericValue(row[10]),
    level: extractNumericValue(row[11]),
    visionScore: extractNumericValue(row[12]),
    wardsPlaced: extractNumericValue(row[13]),
    wardsCleared: extractNumericValue(row[14]),
    mvp: extractBooleanValue(row[15]),
  };
}
