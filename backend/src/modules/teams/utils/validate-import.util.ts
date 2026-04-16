import { ImportTeamDto } from '../dto/import';
import { ImportErrorDto } from '../dto/import';
import { parsePosition, parseLevel } from './excel.util';
import { validateChampionPool } from './champion-map.util';

export interface ValidationResult {
  valid: boolean;
  errors: ImportErrorDto[];
  teamCount: number;
}

const URL_REGEX = /^https?:\/\/.+/i;
const TEAM_NAME_MAX_LENGTH = 20;
const BIO_MAX_LENGTH = 200;
const MIN_TEAMS = 1;
const MAX_TEAMS = 16;
const MIN_ROWS = 5;
const MAX_ROWS = 80;
const RATING_MIN = 0;
const RATING_MAX = 100;
const MAX_CHAMPIONS = 5;

export function validateImportData(data: ImportTeamDto[], totalRows: number): ValidationResult {
  const errors: ImportErrorDto[] = [];

  if (totalRows < MIN_ROWS || totalRows > MAX_ROWS) {
    return {
      valid: false,
      errors: [new ImportErrorDto(0, '', '', 'rowCount', `数据行数必须在${MIN_ROWS}-${MAX_ROWS}之间`)],
      teamCount: data.length,
    };
  }

  if (data.length < MIN_TEAMS || data.length > MAX_TEAMS) {
    return {
      valid: false,
      errors: [new ImportErrorDto(0, '', '', 'teamCount', `战队数量必须在${MIN_TEAMS}-${MAX_TEAMS}之间`)],
      teamCount: data.length,
    };
  }

  const teamNames = new Set<string>();
  const captainCountMap = new Map<string, number>();

  for (const team of data) {
    if (!team.name || !team.name.trim()) {
      errors.push(new ImportErrorDto(0, team.name || '(空)', '', 'teamName', '战队名称不能为空'));
    } else if (team.name.length > TEAM_NAME_MAX_LENGTH) {
      errors.push(new ImportErrorDto(0, team.name, '', 'teamName', `战队名称不能超过${TEAM_NAME_MAX_LENGTH}个字符`));
    } else if (teamNames.has(team.name)) {
      errors.push(new ImportErrorDto(0, team.name, '', 'teamName', '战队名称在文件中不能重复'));
    } else {
      teamNames.add(team.name);
    }

    captainCountMap.set(team.name, 0);

    for (const member of team.members) {
      const position = member.position;
      if (!position) {
        errors.push(new ImportErrorDto(0, team.name, '', 'position', '位置不能为空'));
      } else if (!parsePosition(position)) {
        errors.push(new ImportErrorDto(0, team.name, position, 'position', '位置枚举值无效'));
      }

      if (member.avatarUrl && !URL_REGEX.test(member.avatarUrl)) {
        errors.push(new ImportErrorDto(0, team.name, position, 'avatarUrl', '队员头像URL格式无效'));
      }

      if (member.rating !== undefined) {
        if (!Number.isInteger(member.rating) || member.rating < RATING_MIN || member.rating > RATING_MAX) {
          errors.push(new ImportErrorDto(0, team.name, position, 'rating', `评分必须在${RATING_MIN}-${RATING_MAX}之间`));
        }
      }

      if (member.isCaptainStr && !['是', '否'].includes(member.isCaptainStr)) {
        errors.push(new ImportErrorDto(0, team.name, position, 'isCaptain', '是否队长枚举值无效'));
      }

      if (member.level && !parseLevel(member.level)) {
        errors.push(new ImportErrorDto(0, team.name, position, 'level', '实力等级枚举值无效'));
      }

      if (member.championPoolStr) {
        const championValidation = validateChampionPool(member.championPoolStr);
        if (!championValidation.valid) {
          errors.push(new ImportErrorDto(0, team.name, position, 'championPool', `常用英雄名称无效: ${championValidation.invalidNames.join(', ')}`));
        }
      }

      if (member.liveRoom && !/^\d+$/.test(member.liveRoom)) {
        errors.push(new ImportErrorDto(0, team.name, position, 'liveRoom', '直播间号必须为纯数字'));
      }

      if (member.bio && member.bio.length > BIO_MAX_LENGTH) {
        errors.push(new ImportErrorDto(0, team.name, position, 'bio', `个人简介不能超过${BIO_MAX_LENGTH}个字符`));
      }

      if (member.isCaptainStr === '是') {
        captainCountMap.set(team.name, (captainCountMap.get(team.name) || 0) + 1);
      }
    }
  }

  for (const [teamName, captainCount] of captainCountMap) {
    if (captainCount > 1) {
      errors.push(new ImportErrorDto(0, teamName, '', 'captain', '每队最多1名队长'));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    teamCount: data.length,
  };
}

export function validateSheetName(workbook: any): boolean {
  return workbook.worksheets && workbook.worksheets.some((ws: any) => ws.name === '战队与队员信息导入');
}

export function validateColumnHeaders(headers: string[]): { valid: boolean; missing: string[] } {
  const required = [
    '战队名称', '队标URL', '参赛宣言', '位置', '队员昵称',
    '队员游戏ID', '队员头像URL', '评分', '是否队长',
    '实力等级', '常用英雄', '直播间号', '个人简介'
  ];

  const missing = required.filter(h => !headers.includes(h));
  return { valid: missing.length === 0, missing };
}
