import { describe, it, expect } from '@jest/globals';
import * as xlsx from 'xlsx';
import {
  validateSheetDataIntegrity,
  parseMatchDataExcel,
} from '../../src/modules/utils/match-excel.util';

describe('match-data-import - undefined row handling', () => {
  describe('validateSheetDataIntegrity - BAN数据行检查', () => {
    it('应该检测出BAN表头行为undefined的情况', () => {
      const sheetData = createValidSheetData();
      (sheetData as any[])[16] = undefined;

      const result = validateSheetDataIntegrity(sheetData);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('第17行'))).toBe(true);
    });

    it('应该检测出BAN数据行为undefined的情况', () => {
      const sheetData = createValidSheetData();
      (sheetData as any[])[17] = undefined;

      const result = validateSheetDataIntegrity(sheetData);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('第18行'))).toBe(true);
    });

    it('应该检测出BAN表头行为空数组的情况', () => {
      const sheetData = createValidSheetData();
      sheetData[16] = [];

      const result = validateSheetDataIntegrity(sheetData);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('第17行'))).toBe(true);
    });

    it('应该检测出BAN数据行为空数组的情况', () => {
      const sheetData = createValidSheetData();
      sheetData[17] = [];

      const result = validateSheetDataIntegrity(sheetData);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('第18行'))).toBe(true);
    });

    it('当BAN数据行完整时应通过验证', () => {
      const sheetData = createValidSheetData();
      const result = validateSheetDataIntegrity(sheetData);
      expect(result.valid).toBe(true);
    });
  });

  describe('parseMatchDataExcel - BAN数据解析', () => {
    it('应该成功解析包含完整BAN数据的Excel文件', () => {
      const workbook = createExcelWithBanData([
        '亚托克斯',
        '格雷福斯',
        '阿狸',
        '卡莎',
        '锤石',
        '雷克顿',
        '李青',
        '辛德拉',
        '厄斐琉斯',
        '蕾欧娜',
      ]);

      expect(() => parseMatchDataExcel(workbook)).not.toThrow();

      const result = parseMatchDataExcel(workbook);
      expect(result.bans.redBans).toHaveLength(5);
      expect(result.bans.blueBans).toHaveLength(5);
    });

    it('应该处理BAN数据行为空的Excel文件', () => {
      const workbook = createExcelWithBanData(['', '', '', '', '', '', '', '', '', '']);

      expect(() => parseMatchDataExcel(workbook)).not.toThrow();

      const result = parseMatchDataExcel(workbook);
      expect(result.bans.redBans).toHaveLength(0);
      expect(result.bans.blueBans).toHaveLength(0);
    });

    it('应该处理BAN数据部分为空的Excel文件', () => {
      const workbook = createExcelWithBanData([
        '亚托克斯',
        '',
        '',
        '',
        '',
        '雷克顿',
        '',
        '',
        '',
        '',
      ]);

      expect(() => parseMatchDataExcel(workbook)).not.toThrow();

      const result = parseMatchDataExcel(workbook);
      expect(result.bans.redBans).toHaveLength(1);
      expect(result.bans.blueBans).toHaveLength(1);
    });
  });
});

function createValidSheetData(): any[][] {
  const matchInfoHeaders = [
    'teamA',
    'teamB',
    '局数',
    '比赛时间',
    '游戏时长',
    '获胜方',
    'MVP',
    '视频BV号',
  ];
  const matchInfoData = [
    'BLG',
    'WBG',
    1,
    '2026-04-16 14:00',
    '32:45',
    'red',
    'Knight',
    'BV1Ab4y1X7zK',
  ];
  const teamStatsHeaders = [
    '阵营',
    '战队名',
    '总击杀',
    '总死亡',
    '总助攻',
    '总经济',
    '推塔数',
    '控龙数',
    '控 Baron 数',
  ];
  const redTeamStats = ['red', 'BLG', 25, 18, 47, 65000, 9, 3, 1];
  const blueTeamStats = ['blue', 'WBG', 18, 25, 35, 58000, 3, 1, 0];
  const playerStatsHeaders = [
    '阵营',
    '位置',
    '选手昵称',
    '英雄名',
    '击杀',
    '死亡',
    '助攻',
    '补刀',
    '经济',
    '伤害',
    '承伤',
    '等级',
    '视野得分',
    '插眼数',
    '排眼数',
  ];
  const players = [
    ['red', 'TOP', 'Bin', '格温', 2, 2, 11, 349, 17315, 28500, 32000, 18, 45, 12, 12],
    ['red', 'JUNGLE', 'Xun', '潘森', 4, 7, 10, 261, 14855, 22000, 28000, 16, 38, 8, 8],
    ['red', 'MID', 'Knight', '奎桑提', 13, 0, 11, 339, 19592, 35000, 18000, 18, 42, 6, 6],
    ['red', 'ADC', 'Viper', '艾希', 7, 3, 10, 368, 19385, 32000, 21000, 18, 35, 4, 4],
    ['red', 'SUPPORT', 'ON', '萨勒芬妮', 0, 3, 22, 47, 11580, 8500, 15000, 15, 78, 18, 18],
    ['blue', 'TOP', 'TheShy', '奎桑提', 1, 3, 8, 289, 15200, 21000, 35000, 17, 42, 10, 10],
    ['blue', 'JUNGLE', 'Tian', '蔚', 3, 5, 9, 198, 12500, 18000, 26000, 15, 36, 9, 9],
    ['blue', 'MID', 'Rookie', '阿狸', 5, 6, 7, 312, 16800, 25000, 19000, 17, 38, 5, 5],
    ['blue', 'ADC', 'Hope', '厄斐琉斯', 6, 5, 6, 352, 17500, 28000, 22000, 18, 32, 3, 3],
    ['blue', 'SUPPORT', 'Crisp', '烈娜塔', 3, 6, 5, 38, 9800, 7500, 18000, 14, 82, 20, 20],
  ];
  const banHeaders = [
    '红方BAN1',
    '红方BAN2',
    '红方BAN3',
    '红方BAN4',
    '红方BAN5',
    '蓝方BAN1',
    '蓝方BAN2',
    '蓝方BAN3',
    '蓝方BAN4',
    '蓝方BAN5',
  ];
  const banData = [
    '亚托克斯',
    '格雷福斯',
    '阿狸',
    '卡莎',
    '锤石',
    '雷克顿',
    '李青',
    '辛德拉',
    '厄斐琉斯',
    '蕾欧娜',
  ];

  return [
    matchInfoHeaders,
    matchInfoData,
    teamStatsHeaders,
    redTeamStats,
    blueTeamStats,
    playerStatsHeaders,
    ...players,
    banHeaders,
    banData,
  ];
}

function createExcelWithBanData(banData: string[]): Buffer {
  const workbook = xlsx.utils.book_new();

  const matchInfoHeaders = [
    'teamA',
    'teamB',
    '局数',
    '比赛时间',
    '游戏时长',
    '获胜方',
    'MVP',
    '视频BV号',
  ];
  const matchInfoData = [
    'BLG',
    'WBG',
    1,
    '2026-04-16 14:00',
    '32:45',
    'red',
    'Knight',
    'BV1Ab4y1X7zK',
  ];
  const teamStatsHeaders = [
    '阵营',
    '战队名',
    '总击杀',
    '总死亡',
    '总助攻',
    '总经济',
    '推塔数',
    '控龙数',
    '控 Baron 数',
  ];
  const redTeamStats = ['red', 'BLG', 25, 18, 47, 65000, 9, 3, 1];
  const blueTeamStats = ['blue', 'WBG', 18, 25, 35, 58000, 3, 1, 0];
  const playerStatsHeaders = [
    '阵营',
    '位置',
    '选手昵称',
    '英雄名',
    '击杀',
    '死亡',
    '助攻',
    '补刀',
    '经济',
    '伤害',
    '承伤',
    '等级',
    '视野得分',
    '插眼数',
    '排眼数',
  ];
  const players = [
    ['red', 'TOP', 'Bin', '格温', 2, 2, 11, 349, 17315, 28500, 32000, 18, 45, 12, 12],
    ['red', 'JUNGLE', 'Xun', '潘森', 4, 7, 10, 261, 14855, 22000, 28000, 16, 38, 8, 8],
    ['red', 'MID', 'Knight', '奎桑提', 13, 0, 11, 339, 19592, 35000, 18000, 18, 42, 6, 6],
    ['red', 'ADC', 'Viper', '艾希', 7, 3, 10, 368, 19385, 32000, 21000, 18, 35, 4, 4],
    ['red', 'SUPPORT', 'ON', '萨勒芬妮', 0, 3, 22, 47, 11580, 8500, 15000, 15, 78, 18, 18],
    ['blue', 'TOP', 'TheShy', '奎桑提', 1, 3, 8, 289, 15200, 21000, 35000, 17, 42, 10, 10],
    ['blue', 'JUNGLE', 'Tian', '蔚', 3, 5, 9, 198, 12500, 18000, 26000, 15, 36, 9, 9],
    ['blue', 'MID', 'Rookie', '阿狸', 5, 6, 7, 312, 16800, 25000, 19000, 17, 38, 5, 5],
    ['blue', 'ADC', 'Hope', '厄斐琉斯', 6, 5, 6, 352, 17500, 28000, 22000, 18, 32, 3, 3],
    ['blue', 'SUPPORT', 'Crisp', '烈娜塔', 3, 6, 5, 38, 9800, 7500, 18000, 14, 82, 20, 20],
  ];
  const banHeaders = [
    '红方BAN1',
    '红方BAN2',
    '红方BAN3',
    '红方BAN4',
    '红方BAN5',
    '蓝方BAN1',
    '蓝方BAN2',
    '蓝方BAN3',
    '蓝方BAN4',
    '蓝方BAN5',
  ];

  const data = [
    matchInfoHeaders,
    matchInfoData,
    teamStatsHeaders,
    redTeamStats,
    blueTeamStats,
    playerStatsHeaders,
    ...players,
    banHeaders,
    banData,
  ];

  const worksheet = xlsx.utils.aoa_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, 'MatchData');

  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}
