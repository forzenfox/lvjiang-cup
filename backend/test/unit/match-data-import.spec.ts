import { describe, it, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import {
  parseMatchDataExcel,
  validateMatchInfo,
  validateTeamStats,
  validatePlayerStats,
} from '../../src/modules/utils/match-excel.util';

describe('match-excel.util', () => {
  let validExcelBuffer: Buffer;

  beforeAll(() => {
    // 创建一个有效的Excel文件用于测试
    const workbook = xlsx.utils.book_new();

    // MatchInfo 表头和数据（新增一血和MVP字段）
    const matchInfoHeaders = ['红方战队名', '蓝方战队名', '局数', '比赛时间', '游戏时长', '获胜方', '一血', 'MVP'];
    const matchInfoData = ['BLG', 'WBG', 1, '2026-04-16 14:00', '32:45', 'red', 'red', 'Knight'];

    // TeamStats 表头和数据（移除一血字段）
    const teamStatsHeaders = ['阵营', '战队名', '总击杀', '总死亡', '总助攻', '总经济', '推塔数', '控龙数', '控 Baron 数'];
    const redTeamStats = ['red', 'BLG', 25, 18, 47, 65000, 9, 3, 1];
    const blueTeamStats = ['blue', 'WBG', 18, 25, 35, 58000, 3, 1, 0];

    // PlayerStats 表头和数据（移除是否MVP字段）
    const playerStatsHeaders = ['阵营', '位置', '选手昵称', '英雄名', '击杀', '死亡', '助攻', '补刀', '经济', '伤害', '承伤', '等级', '视野得分', '插眼数', '排眼数'];
    
    const redPlayers = [
      ['red', 'TOP', 'Bin', '格温', 2, 2, 11, 349, 17315, 28500, 32000, 18, 45, 12, 12],
      ['red', 'JUNGLE', 'Xun', '潘森', 4, 7, 10, 261, 14855, 22000, 28000, 16, 38, 8, 8],
      ['red', 'MID', 'Knight', '奎桑提', 13, 0, 11, 339, 19592, 35000, 18000, 18, 42, 6, 6],
      ['red', 'ADC', 'Viper', '艾希', 7, 3, 10, 368, 19385, 32000, 21000, 18, 35, 4, 4],
      ['red', 'SUPPORT', 'ON', '萨勒芬妮', 0, 3, 22, 47, 11580, 8500, 15000, 15, 78, 18, 18],
    ];

    const bluePlayers = [
      ['blue', 'TOP', 'TheShy', '奎桑提', 1, 3, 8, 289, 15200, 21000, 35000, 17, 42, 10, 10],
      ['blue', 'JUNGLE', 'Tian', '蔚', 3, 5, 9, 198, 12500, 18000, 26000, 15, 36, 9, 9],
      ['blue', 'MID', 'Rookie', '阿狸', 5, 6, 7, 312, 16800, 25000, 19000, 17, 38, 5, 5],
      ['blue', 'ADC', 'Hope', '厄斐琉斯', 6, 5, 6, 352, 17500, 28000, 22000, 18, 32, 3, 3],
      ['blue', 'SUPPORT', 'Crisp', '烈娜塔', 3, 6, 5, 38, 9800, 7500, 18000, 14, 82, 20, 20],
    ];

    // 构建完整的数据
    const data = [
      matchInfoHeaders,
      matchInfoData,
      teamStatsHeaders,
      redTeamStats,
      blueTeamStats,
      playerStatsHeaders,
      ...redPlayers,
      ...bluePlayers,
    ];

    const worksheet = xlsx.utils.aoa_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'MatchData');

    // 生成 buffer
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    validExcelBuffer = excelBuffer as Buffer;
  });

  describe('parseMatchDataExcel', () => {
    it('应该成功解析有效的Excel文件', () => {
      const result = parseMatchDataExcel(validExcelBuffer);

      expect(result).toBeDefined();
      expect(result.matchInfo).toBeDefined();
      expect(result.teamStats).toBeDefined();
      expect(result.playerStats).toBeDefined();
    });

    it('应该正确解析MatchInfo数据', () => {
      const result = parseMatchDataExcel(validExcelBuffer);

      expect(result.matchInfo.redTeamName).toBe('BLG');
      expect(result.matchInfo.blueTeamName).toBe('WBG');
      expect(result.matchInfo.gameNumber).toBe(1);
      expect(result.matchInfo.gameStartTime).toBe('2026-04-16 14:00');
      expect(result.matchInfo.gameDuration).toBe('32:45');
      expect(result.matchInfo.winner).toBe('red');
      expect(result.matchInfo.firstBlood).toBe('red');
      expect(result.matchInfo.mvp).toBe('Knight');
    });

    it('应该正确解析TeamStats数据（2行）', () => {
      const result = parseMatchDataExcel(validExcelBuffer);

      expect(result.teamStats).toHaveLength(2);
      
      // 红方数据
      expect(result.teamStats[0].side).toBe('red');
      expect(result.teamStats[0].teamName).toBe('BLG');
      expect(result.teamStats[0].kills).toBe(25);
      expect(result.teamStats[0].gold).toBe(65000);

      // 蓝方数据
      expect(result.teamStats[1].side).toBe('blue');
      expect(result.teamStats[1].teamName).toBe('WBG');
      expect(result.teamStats[1].kills).toBe(18);
      expect(result.teamStats[1].gold).toBe(58000);
    });

    it('应该正确解析PlayerStats数据（10行）', () => {
      const result = parseMatchDataExcel(validExcelBuffer);

      expect(result.playerStats).toHaveLength(10);

      // 红方选手
      expect(result.playerStats[0].side).toBe('red');
      expect(result.playerStats[0].position).toBe('TOP');
      expect(result.playerStats[0].nickname).toBe('Bin');
      expect(result.playerStats[0].championName).toBe('格温');

      // 蓝方选手
      expect(result.playerStats[5].side).toBe('blue');
      expect(result.playerStats[5].position).toBe('TOP');
      expect(result.playerStats[5].nickname).toBe('TheShy');
      expect(result.playerStats[5].championName).toBe('奎桑提');
    });

    it('应该将位置转换为大写', () => {
      const result = parseMatchDataExcel(validExcelBuffer);

      result.playerStats.forEach(player => {
        expect(player.position).toBe(player.position.toUpperCase());
      });
    });

    it('当Excel行数不足时应抛出错误', () => {
      // 创建一个只有5行的无效Excel
      const workbook = xlsx.utils.book_new();
      const data = [
        ['表头'],
        ['数据1'],
        ['数据2'],
        ['数据3'],
        ['数据4'],
      ];
      const worksheet = xlsx.utils.aoa_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet, 'MatchData');
      const invalidBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

      expect(() => parseMatchDataExcel(invalidBuffer)).toThrow('Excel文件行数不足');
    });

    it('当选手数据不完整时应抛出错误', () => {
      // 创建只有5个选手的Excel（应该有10个）
      const workbook = xlsx.utils.book_new();
      
      const matchInfoHeaders = ['红方战队名', '蓝方战队名', '局数', '比赛时间', '游戏时长', '获胜方', '一血', 'MVP'];
      const matchInfoData = ['BLG', 'WBG', 1, '2026-04-16 14:00', '32:45', 'red', 'red', 'Knight'];
      const teamStatsHeaders = ['阵营', '战队名', '总击杀', '总死亡', '总助攻', '总经济', '推塔数', '控龙数', '控 Baron 数'];
      const redTeamStats = ['red', 'BLG', 25, 18, 47, 65000, 9, 3, 1];
      const blueTeamStats = ['blue', 'WBG', 18, 25, 35, 58000, 3, 1, 0];
      const playerStatsHeaders = ['阵营', '位置', '选手昵称', '英雄名', '击杀', '死亡', '助攻', '补刀', '经济', '伤害', '承伤', '等级', '视野得分', '插眼数', '排眼数'];
      
      // 只添加5个选手
      const incompletePlayers = [
        ['red', 'TOP', 'Bin', '格温', 2, 2, 11, 349, 17315, 28500, 32000, 18, 45, 12, 12],
        ['red', 'JUNGLE', 'Xun', '潘森', 4, 7, 10, 261, 14855, 22000, 28000, 16, 38, 8, 8],
        ['red', 'MID', 'Knight', '奎桑提', 13, 0, 11, 339, 19592, 35000, 18000, 18, 42, 6, 6],
        ['blue', 'TOP', 'TheShy', '奎桑提', 1, 3, 8, 289, 15200, 21000, 35000, 17, 42, 10, 10],
        ['blue', 'JUNGLE', 'Tian', '蔚', 3, 5, 9, 198, 12500, 18000, 26000, 15, 36, 9, 9],
      ];

      // 构建16行的数据，用空字符串填充缺失的选手行
      const data = [
        matchInfoHeaders,
        matchInfoData,
        teamStatsHeaders,
        redTeamStats,
        blueTeamStats,
        playerStatsHeaders,
        ...incompletePlayers,
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ];

      const worksheet = xlsx.utils.aoa_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet, 'MatchData');
      const invalidBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

      expect(() => parseMatchDataExcel(invalidBuffer)).toThrow('选手数据行');
    });

    it('当战队数据不完整时应抛出错误', () => {
      const workbook = xlsx.utils.book_new();
      
      const matchInfoHeaders = ['红方战队名', '蓝方战队名', '局数', '比赛时间', '游戏时长', '获胜方', '一血', 'MVP'];
      const matchInfoData = ['BLG', 'WBG', 1, '2026-04-16 14:00', '32:45', 'red', 'red', 'Knight'];
      const teamStatsHeaders = ['阵营', '战队名', '总击杀', '总死亡', '总助攻', '总经济', '推塔数', '控龙数', '控 Baron 数'];
      const redTeamStats = ['red', 'BLG', 25, 18, 47, 65000, 9, 3, 1];
      const playerStatsHeaders = ['阵营', '位置', '选手昵称', '英雄名', '击杀', '死亡', '助攻', '补刀', '经济', '伤害', '承伤', '等级', '视野得分', '插眼数', '排眼数'];
      
      // 只添加1个战队数据（应该有2个）
      const redPlayers = [
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

      const data = [
        matchInfoHeaders,
        matchInfoData,
        teamStatsHeaders,
        redTeamStats,
        ['', '', '', '', '', '', '', '', ''],
        playerStatsHeaders,
        ...redPlayers,
      ];

      const worksheet = xlsx.utils.aoa_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet, 'MatchData');
      const invalidBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

      expect(() => parseMatchDataExcel(invalidBuffer)).toThrow('战队数据行');
    });
  });

  describe('validateMatchInfo', () => {
    it('应该验证有效的MatchInfo', () => {
      const validData = {
        redTeamName: 'BLG',
        blueTeamName: 'WBG',
        gameNumber: 1,
        gameStartTime: '2026-04-16 14:00',
        gameDuration: '32:45',
        winner: 'red',
        firstBlood: 'red',
        mvp: 'Knight',
      };

      const result = validateMatchInfo(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝空的战队名称', () => {
      const invalidData = {
        redTeamName: '',
        blueTeamName: 'WBG',
        gameNumber: 1,
        gameStartTime: '2026-04-16 14:00',
        gameDuration: '32:45',
        winner: 'red',
        firstBlood: 'red',
        mvp: 'Knight',
      };

      const result = validateMatchInfo(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('红方战队名称不能为空');
    });

    it('应该拒绝无效的获胜方', () => {
      const invalidData = {
        redTeamName: 'BLG',
        blueTeamName: 'WBG',
        gameNumber: 1,
        gameStartTime: '2026-04-16 14:00',
        gameDuration: '32:45',
        winner: 'invalid',
        firstBlood: 'red',
        mvp: 'Knight',
      };

      const result = validateMatchInfo(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('获胜方必须是 red 或 blue');
    });

    it('应该支持中文获胜方', () => {
      const validData = {
        redTeamName: 'BL局G',
        blueTeamName: 'WBG',
        gameNumber: 1,
        gameStartTime: '2026-04-16 14:00',
        gameDuration: '32:45',
        winner: '红方',
        firstBlood: '红方',
        mvp: 'Knight',
      };

      const result = validateMatchInfo(validData);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateTeamStats', () => {
    it('应该验证有效的TeamStats', () => {
      const validData = {
        side: 'red',
        teamName: 'BLG',
        kills: 25,
        deaths: 18,
        assists: 47,
        gold: 65000,
        towers: 9,
        dragons: 3,
        barons: 1,
      };

      const result = validateTeamStats(validData, 4);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝负数的击杀数', () => {
      const invalidData = {
        side: 'red',
        teamName: 'BLG',
        kills: -1,
        deaths: 18,
        assists: 47,
        gold: 65000,
        towers: 9,
        dragons: 3,
        barons: 1,
      };

      const result = validateTeamStats(invalidData, 4);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('击杀数不能为负数');
    });
  });

  describe('validatePlayerStats', () => {
    it('应该验证有效的PlayerStats', () => {
      const validData = {
        side: 'red',
        position: 'TOP',
        nickname: 'Bin',
        championName: '格温',
        kills: 2,
        deaths: 2,
        assists: 11,
        cs: 349,
        gold: 17315,
        damageDealt: 28500,
        damageTaken: 32000,
        level: 18,
        visionScore: 45,
        wardsPlaced: 12,
        wardsCleared: 12,
      };

      const result = validatePlayerStats(validData, 7);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该拒绝无效的位置', () => {
      const invalidData = {
        side: 'red',
        position: 'INVALID',
        nickname: 'Bin',
        championName: '格温',
        kills: 2,
        deaths: 2,
        assists: 11,
        cs: 349,
        gold: 17315,
        damageDealt: 28500,
        damageTaken: 32000,
        level: 18,
        visionScore: 45,
        wardsPlaced: 12,
        wardsCleared: 12,
      };

      const result = validatePlayerStats(invalidData, 7);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('位置必须是 TOP/JUNGLE/MID/ADC/SUPPORT 之一');
    });

    it('应该拒绝超出范围的等级', () => {
      const invalidData = {
        side: 'red',
        position: 'TOP',
        nickname: 'Bin',
        championName: '格温',
        kills: 2,
        deaths: 2,
        assists: 11,
        cs: 349,
        gold: 17315,
        damageDealt: 28500,
        damageTaken: 32000,
        level: 20,
        visionScore: 45,
        wardsPlaced: 12,
        wardsCleared: 12,
      };

      const result = validatePlayerStats(invalidData, 7);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('等级必须在1-18之间');
    });
  });
});
