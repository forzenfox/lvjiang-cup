import { ImportTeamDto } from '../dto/import';
import { ImportErrorDto } from '../dto/import';
import { parsePosition, parseLevel, REVERSE_POSITION_MAP } from './excel.util';
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
const MIN_ROWS = 4; // 最少 1 支队伍×5 行 + 3 行表头 = 8 行，但允许最少 1 支队伍
const MAX_ROWS = 83; // 最多 16 支队伍×5 行 + 3 行表头 = 83 行
const RATING_MIN = 0;
const RATING_MAX = 100;
const MAX_CHAMPIONS = 5;

const FIELD_NAME_MAP: Record<string, string> = {
  'teamName': '战队名称',
  'members': '队员',
  'position': '位置',
  'avatarUrl': '队员头像URL',
  'rating': '评分',
  'isCaptain': '是否队长',
  'level': '实力等级',
  'championPool': '常用英雄',
  'liveRoom': '直播间号',
  'bio': '个人简介',
  'captain': '队长',
  'rowCount': '总行数',
  'teamCount': '战队数量',
  'teamLimit': '战队总数限制',
};

function getPositionDisplay(position: string): string {
  return REVERSE_POSITION_MAP[position] || position || '';
}

function getFieldDisplayName(field: string): string {
  return FIELD_NAME_MAP[field] || field;
}

export function validateImportData(data: ImportTeamDto[], totalRows: number): ValidationResult {
  const errors: ImportErrorDto[] = [];

  if (totalRows < MIN_ROWS || totalRows > MAX_ROWS) {
    return {
      valid: false,
      errors: [new ImportErrorDto(0, '', '', 'rowCount', `总行数必须在${MIN_ROWS}-${MAX_ROWS}之间（前 3 行为表头，数据行从第 4 行开始）`)],
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
  const positionMap = new Map<string, Set<string>>(); // 记录每个战队的位置

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
    positionMap.set(team.name, new Set<string>());

    if (team.members.length === 0) {
      errors.push(new ImportErrorDto(0, team.name, '', 'members', '战队至少需要 1 名队员'));
    } else if (team.members.length > 5) {
      errors.push(new ImportErrorDto(0, team.name, '', 'members', '战队最多 5 名队员'));
    }

    for (const member of team.members) {
      const position = member.position;
      const validPositions = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
      const row = member.rowIndex || 0;
      const positionDisplay = getPositionDisplay(position);
      if (!position) {
        errors.push(new ImportErrorDto(row, team.name, '', getFieldDisplayName('position'), '位置不能为空'));
      } else if (!validPositions.includes(position)) {
        errors.push(new ImportErrorDto(row, team.name, positionDisplay, getFieldDisplayName('position'), '位置枚举值无效'));
      } else {
        const teamPositions = positionMap.get(team.name)!;
        if (teamPositions.has(position)) {
          errors.push(new ImportErrorDto(row, team.name, positionDisplay, getFieldDisplayName('position'), '战队内位置不能重复'));
        } else {
          teamPositions.add(position);
        }
      }

      if (member.avatarUrl && !URL_REGEX.test(member.avatarUrl)) {
        errors.push(new ImportErrorDto(row, team.name, positionDisplay, getFieldDisplayName('avatarUrl'), '队员头像URL格式无效'));
      }

      if (member.rating !== undefined) {
        if (!Number.isInteger(member.rating) || member.rating < RATING_MIN || member.rating > RATING_MAX) {
          errors.push(new ImportErrorDto(row, team.name, positionDisplay, getFieldDisplayName('rating'), `评分必须在${RATING_MIN}-${RATING_MAX}之间`));
        }
      }

      if (member.isCaptainStr && !['是', '否'].includes(member.isCaptainStr)) {
        errors.push(new ImportErrorDto(row, team.name, positionDisplay, getFieldDisplayName('isCaptain'), '是否队长枚举值无效'));
      }

      if (member.level && !parseLevel(member.level)) {
        errors.push(new ImportErrorDto(row, team.name, positionDisplay, getFieldDisplayName('level'), '实力等级枚举值无效'));
      }

      if (member.championPoolStr) {
        const championValidation = validateChampionPool(member.championPoolStr);
        if (!championValidation.valid) {
          errors.push(new ImportErrorDto(row, team.name, positionDisplay, getFieldDisplayName('championPool'), `常用英雄名称无效: ${championValidation.invalidNames.join(', ')}`));
        }
      }

      if (member.liveRoom && !/^\d+$/.test(member.liveRoom)) {
        errors.push(new ImportErrorDto(row, team.name, positionDisplay, getFieldDisplayName('liveRoom'), '直播间号必须为纯数字'));
      }

      if (member.bio && member.bio.length > BIO_MAX_LENGTH) {
        errors.push(new ImportErrorDto(row, team.name, positionDisplay, getFieldDisplayName('bio'), `个人简介不能超过${BIO_MAX_LENGTH}个字符`));
      }

      if (member.isCaptainStr === '是') {
        captainCountMap.set(team.name, (captainCountMap.get(team.name) || 0) + 1);
      }
    }
  }

  for (const [teamName, captainCount] of captainCountMap) {
    if (captainCount > 1) {
      const firstMemberRow = data.find(t => t.name === teamName)?.members[0]?.rowIndex || 0;
      errors.push(new ImportErrorDto(firstMemberRow, teamName, '', getFieldDisplayName('captain'), '每队最多1名队长'));
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
