import { describe, it, expect } from 'vitest';
import {
  swissRoundSlots,
  getRoundFormat,
  getSlotByRecord,
  getTotalSlots,
  getSwissRound,
  isEliminated,
  isQualified,
} from '@/pages/admin/swissRoundSlots';

describe('swissRoundSlots', () => {
  describe('swissRoundSlots 数据', () => {
    it('应该包含 13 个轮次槽位', () => {
      expect(swissRoundSlots).toHaveLength(13);
    });

    it('每个槽位应该有正确的结构', () => {
      swissRoundSlots.forEach(slot => {
        expect(slot).toHaveProperty('swissRecord');
        expect(slot).toHaveProperty('roundName');
        expect(slot).toHaveProperty('maxMatches');
        expect(typeof slot.swissRecord).toBe('string');
        expect(typeof slot.roundName).toBe('string');
        expect(typeof slot.maxMatches).toBe('number');
      });
    });

    it('maxMatches 应该是正整数', () => {
      swissRoundSlots.forEach(slot => {
        expect(slot.maxMatches).toBeGreaterThan(0);
        expect(Number.isInteger(slot.maxMatches)).toBe(true);
      });
    });

    it('BO1 战绩（0-0, 1-0, 0-1, 1-1）应该有正确的槽位数', () => {
      // 0-0: 8个, 1-0: 4个, 0-1: 4个, 1-1: 4个
      const bo1Records = ['0-0', '1-0', '0-1', '1-1'];
      bo1Records.forEach(record => {
        const slot = swissRoundSlots.find(s => s.swissRecord === record);
        expect(slot).toBeDefined();
        expect(slot?.maxMatches).toBeGreaterThan(0);
      });
      // 验证 0-0 有 8 个比赛槽位
      expect(swissRoundSlots.find(s => s.swissRecord === '0-0')?.maxMatches).toBe(8);
    });

    it('BO3 战绩（2-0, 0-2, 1-2, 2-1, 3-1, 2-2, 1-3）应该有正确的槽位数', () => {
      const bo3Records = ['2-0', '0-2', '1-2', '2-1', '3-1', '2-2', '1-3'];
      bo3Records.forEach(record => {
        const slot = swissRoundSlots.find(s => s.swissRecord === record);
        expect(slot).toBeDefined();
        expect(slot?.maxMatches).toBeGreaterThan(0);
      });
    });

    it('BO5 战绩（3-0, 0-3）应该各有 1 个槽位', () => {
      const bo5Records = ['3-0', '0-3'];
      bo5Records.forEach(record => {
        const slot = swissRoundSlots.find(s => s.swissRecord === record);
        expect(slot).toBeDefined();
        expect(slot?.maxMatches).toBe(1);
      });
    });
  });

  describe('getRoundFormat', () => {
    it('BO1 战绩应该返回 BO1', () => {
      expect(getRoundFormat('0-0')).toBe('BO1');
      expect(getRoundFormat('1-0')).toBe('BO1');
      expect(getRoundFormat('0-1')).toBe('BO1');
      expect(getRoundFormat('1-1')).toBe('BO1');
    });

    it('BO3 战绩应该返回 BO3', () => {
      expect(getRoundFormat('2-0')).toBe('BO3');
      expect(getRoundFormat('0-2')).toBe('BO3');
      expect(getRoundFormat('2-1')).toBe('BO3');
      expect(getRoundFormat('3-1')).toBe('BO3');
      expect(getRoundFormat('2-2')).toBe('BO3');
    });

    it('BO5 战绩应该返回 BO5', () => {
      expect(getRoundFormat('3-0')).toBe('BO5');
      expect(getRoundFormat('0-3')).toBe('BO5');
    });

    it('无效战绩应该返回 BO3', () => {
      expect(getRoundFormat('')).toBe('BO3');
      expect(getRoundFormat('invalid')).toBe('BO3');
    });
  });

  describe('getSlotByRecord', () => {
    it('应该找到 0-0 战绩的槽位', () => {
      const slot = getSlotByRecord('0-0');
      expect(slot).toBeDefined();
      expect(slot?.swissRecord).toBe('0-0');
      expect(slot?.roundName).toBe('Round 1');
    });

    it('不存在的战绩应该返回 undefined', () => {
      const slot = getSlotByRecord('non-existent');
      expect(slot).toBeUndefined();
    });
  });

  describe('getTotalSlots', () => {
    it('应该返回正确的总槽位数', () => {
      const total = getTotalSlots();
      // 8 + 4 + 4 + 2 + 4 + 2 + 1 + 3 + 3 + 1 + 2 + 2 + 2 = 38
      expect(total).toBe(38);
    });
  });

  describe('getSwissRound', () => {
    it('应该根据战绩计算轮次', () => {
      expect(getSwissRound('0-0')).toBe(0);
      expect(getSwissRound('1-0')).toBe(1);
      expect(getSwissRound('2-0')).toBe(2);
      expect(getSwissRound('3-0')).toBe(3);
      expect(getSwissRound('3-1')).toBe(4);
    });
  });

  describe('isEliminated', () => {
    it('应该正确判断是否被淘汰', () => {
      expect(isEliminated('0-3')).toBe(true);
      expect(isEliminated('1-2')).toBe(false);
      expect(isEliminated('2-1')).toBe(false);
      expect(isEliminated('3-0')).toBe(false);
    });
  });

  describe('isQualified', () => {
    it('应该正确判断是否已晋级', () => {
      expect(isQualified('3-0')).toBe(true);
      expect(isQualified('2-1')).toBe(false);
      expect(isQualified('1-2')).toBe(false);
      expect(isQualified('0-3')).toBe(false);
    });
  });
});
