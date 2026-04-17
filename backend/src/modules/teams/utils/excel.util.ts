import * as ExcelJS from 'exceljs';
import { parseChampionPool } from './champion-map.util';
import { ImportTeamDto, ImportMemberDto } from '../dto/import';

export interface ParsedRow {
  rowIndex: number;
  teamName: string;
  logoUrl: string;
  battleCry: string;
  position: string;
  nickname: string;
  gameId: string;
  avatarUrl: string;
  rating: number;
  isCaptain: boolean;
  isCaptainStr: string;
  level: string;
  championPoolStr: string;
  liveRoom: string;
  bio: string;
}

export interface PositionMapping {
  [key: string]: 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
}

export const POSITION_MAP: PositionMapping = {
  '上单': 'TOP',
  '打野': 'JUNGLE',
  '中单': 'MID',
  'ADC': 'ADC',
  '辅助': 'SUPPORT',
};

export const REVERSE_POSITION_MAP: { [key: string]: string } = {
  'TOP': '上单',
  'JUNGLE': '打野',
  'MID': '中单',
  'ADC': 'ADC',
  'SUPPORT': '辅助',
};

export function parsePosition(position: string): 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT' | null {
  const normalized = position?.trim();
  return POSITION_MAP[normalized] || null;
}

export function parseRating(rating: any): number {
  if (rating === null || rating === undefined || rating === '') {
    return 60;
  }
  const num = Number(rating);
  if (isNaN(num)) {
    return 60;
  }
  return Math.round(num);
}

export function parseIsCaptain(value: any): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  const strValue = String(value).trim();
  return strValue === '是';
}

export function parseLevel(level: any): 'S' | 'A' | 'B' | 'C' | 'D' | null {
  if (!level) return null;
  const strValue = String(level).trim().toUpperCase();
  if (['S', 'A', 'B', 'C', 'D'].includes(strValue)) {
    return strValue as 'S' | 'A' | 'B' | 'C' | 'D';
  }
  return null;
}

export function parseLiveUrl(liveRoom: string): string {
  if (!liveRoom || !liveRoom.trim()) {
    return '';
  }
  const trimmed = liveRoom.trim();
  if (/^\d+$/.test(trimmed)) {
    return `https://www.douyu.com/${trimmed}`;
  }
  return trimmed;
}

export async function parseExcel(filePath: string): Promise<ImportTeamDto[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet('战队与队员信息导入');
  if (!sheet) {
    throw new Error('Sheet "战队与队员信息导入" not found');
  }

  const rows: ParsedRow[] = [];
  let currentTeamName = '';
  let currentLogoUrl = '';
  let currentBattleCry = '';

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber < 4) {
      return;
    }

    const rowData = row.values as any[];
    const teamName = String(rowData[1] || '').trim();
    const logoUrl = String(rowData[2] || '').trim();
    const battleCry = String(rowData[3] || '').trim();
    const position = String(rowData[4] || '').trim();
    const nickname = String(rowData[5] || '').trim();
    const gameId = String(rowData[6] || '').trim();
    const avatarUrl = String(rowData[7] || '').trim();
    const rating = rowData[8];
    const isCaptainRaw = rowData[9]; // 保留原始值
    const isCaptain = parseIsCaptain(isCaptainRaw);
    const isCaptainStr = typeof isCaptainRaw === 'string' ? isCaptainRaw.trim() : (isCaptain ? '是' : '否');
    const level = rowData[10];
    const championPoolStr = String(rowData[11] || '').trim();
    const liveRoom = String(rowData[12] || '').trim();
    const bio = String(rowData[13] || '').trim();

    if (teamName) {
      currentTeamName = teamName;
      currentLogoUrl = logoUrl;
      currentBattleCry = battleCry;
    }

    if (currentTeamName && position) {
      rows.push({
        rowIndex: rowNumber,
        teamName: currentTeamName,
        logoUrl: currentLogoUrl,
        battleCry: currentBattleCry,
        position,
        nickname,
        gameId,
        avatarUrl,
        rating: parseRating(rating),
        isCaptain,
        isCaptainStr,
        level: String(level || '').trim(),
        championPoolStr,
        liveRoom,
        bio,
      });
    }
  });

  const teamMap = new Map<string, ImportTeamDto>();

  for (const row of rows) {
    if (!teamMap.has(row.teamName)) {
      teamMap.set(row.teamName, {
        name: row.teamName,
        logoUrl: row.logoUrl || undefined,
        battleCry: row.battleCry || undefined,
        members: [],
      });
    }

    const parsedPosition = parsePosition(row.position);
    if (!parsedPosition) {
      continue;
    }

    const member: ImportMemberDto = {
      rowIndex: row.rowIndex,
      nickname: row.nickname || undefined,
      avatarUrl: row.avatarUrl || undefined,
      position: parsedPosition,
      gameId: row.gameId || undefined,
      bio: row.bio || undefined,
      championPoolStr: row.championPoolStr,
      rating: row.rating,
      isCaptainStr: row.isCaptainStr,
      isCaptain: row.isCaptain,
      level: parseLevel(row.level) || undefined,
      liveRoom: row.liveRoom,
      personalBio: row.bio || undefined,
    };

    teamMap.get(row.teamName)!.members.push(member);
  }

  return Array.from(teamMap.values());
}

export async function getExcelRowCount(filePath: string): Promise<number> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet('战队与队员信息导入');
  if (!sheet) {
    return 0;
  }

  return sheet.rowCount;
}

export async function validateExcelHeaders(filePath: string): Promise<{ valid: boolean; missingHeaders: string[] }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet('战队与队员信息导入');
  if (!sheet) {
    return { valid: false, missingHeaders: ['战队与队员信息导入'] };
  }

  const headerRow = sheet.getRow(3);
  const headers = headerRow.values as string[];

  const requiredHeaders = [
    '战队名称', '队标URL', '参赛宣言', '位置', '队员昵称',
    '队员游戏ID', '队员头像URL', '评分', '是否队长',
    '实力等级', '常用英雄', '直播间号', '个人简介'
  ];

  const missingHeaders: string[] = [];
  for (const required of requiredHeaders) {
    if (!headers.includes(required)) {
      missingHeaders.push(required);
    }
  }

  return {
    valid: missingHeaders.length === 0,
    missingHeaders,
  };
}
