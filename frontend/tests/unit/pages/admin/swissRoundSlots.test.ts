import { describe, it, expect } from 'vitest';
import {
  swissRoundSlots,
  getRoundFormat,
  getSlotByRecord,
  getTotalSlots,
} from '@/pages/admin/swissRoundSlots';

describe('swissRoundSlots', () => {
  describe('swissRoundSlots 数据', () => {
    it('应该包含 6 个轮次槽位', () => {
      expect(swissRoundSlots).toHaveLength(6);
    });

    it('应该包含所有必需的战绩类型', () => {
      const records = swissRoundSlots.map(slot => slot.swissRecord);
      expect(records).toContain('0-0');
      expect(records).toContain('1-0');
      expect(records).toContain('0-1');
      expect(records).toContain('1-1');
      expect(records).toContain('0-2');
      expect(records).toContain('1-2');
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

    it('0-0 战绩应该有 4 个比赛槽位', () => {
      const slot0_0 = swissRoundSlots.find(s => s.swissRecord === '0-0');
      expect(slot0_0?.maxMatches).toBe(4);
    });

    it('1-0 战绩应该有 2 个比赛槽位', () => {
      const slot1_0 = swissRoundSlots.find(s => s.swissRecord === '1-0');
      expect(slot1_0?.maxMatches).toBe(2);
    });

    it('0-1 战绩应该有 2 个比赛槽位', () => {
      const slot0_1 = swissRoundSlots.find(s => s.swissRecord === '0-1');
      expect(slot0_1?.maxMatches).toBe(2);
    });

    it('1-1 战绩应该有 2 个比赛槽位', () => {
      const slot1_1 = swissRoundSlots.find(s => s.swissRecord === '1-1');
      expect(slot1_1?.maxMatches).toBe(2);
    });

    it('0-2 战绩应该有 1 个比赛槽位', () => {
      const slot0_2 = swissRoundSlots.find(s => s.swissRecord === '0-2');
      expect(slot0_2?.maxMatches).toBe(1);
    });

    it('1-2 战绩应该有 3 个比赛槽位', () => {
      const slot1_2 = swissRoundSlots.find(s => s.swissRecord === '1-2');
      expect(slot1_2?.maxMatches).toBe(3);
    });
  });

  describe('getRoundFormat', () => {
    it('0-0 战绩应该返回 BO1', () => {
      expect(getRoundFormat('0-0')).toBe('BO1');
    });

    it('1-0 战绩应该返回 BO3', () => {
      expect(getRoundFormat('1-0')).toBe('BO3');
    });

    it('0-1 战绩应该返回 BO3', () => {
      expect(getRoundFormat('0-1')).toBe('BO3');
    });

    it('1-1 战绩应该返回 BO3', () => {
      expect(getRoundFormat('1-1')).toBe('BO3');
    });

    it('0-2 战绩应该返回 BO3', () => {
      expect(getRoundFormat('0-2')).toBe('BO3');
    });

    it('1-2 战绩应该返回 BO3', () => {
      expect(getRoundFormat('1-2')).toBe('BO3');
    });

    it('2-0 战绩应该返回 BO3', () => {
      expect(getRoundFormat('2-0')).toBe('BO3');
    });

    it('空字符串应该返回 BO3', () => {
      expect(getRoundFormat('')).toBe('BO3');
    });

    it('无效战绩应该返回 BO3', () => {
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

    it('应该找到 1-0 战绩的槽位', () => {
      const slot = getSlotByRecord('1-0');
      expect(slot).toBeDefined();
      expect(slot?.swissRecord).toBe('1-0');
      expect(slot?.roundName).toBe('Round 2 High');
    });

    it('应该找到 0-1 战绩的槽位', () => {
      const slot = getSlotByRecord('0-1');
      expect(slot).toBeDefined();
      expect(slot?.swissRecord).toBe('0-1');
      expect(slot?.roundName).toBe('Round 2 Low');
    });

    it('应该找到 1-1 战绩的槽位', () => {
      const slot = getSlotByRecord('1-1');
      expect(slot).toBeDefined();
      expect(slot?.swissRecord).toBe('1-1');
      expect(slot?.roundName).toBe('Round 3 Mid');
    });

    it('应该找到 0-2 战绩的槽位', () => {
      const slot = getSlotByRecord('0-2');
      expect(slot).toBeDefined();
      expect(slot?.swissRecord).toBe('0-2');
      expect(slot?.roundName).toBe('Round 3 Low');
    });

    it('应该找到 1-2 战绩的槽位', () => {
      const slot = getSlotByRecord('1-2');
      expect(slot).toBeDefined();
      expect(slot?.swissRecord).toBe('1-2');
      expect(slot?.roundName).toBe('Last Chance');
    });

    it('不存在的战绩应该返回 undefined', () => {
      const slot = getSlotByRecord('non-existent');
      expect(slot).toBeUndefined();
    });

    it('空字符串应该返回 undefined', () => {
      const slot = getSlotByRecord('');
      expect(slot).toBeUndefined();
    });
  });

  describe('getTotalSlots', () => {
    it('应该返回正确的总槽位数', () => {
      const total = getTotalSlots();
      // 4 + 2 + 2 + 2 + 1 + 3 = 14
      expect(total).toBe(14);
    });

    it('返回值应该是正整数', () => {
      const total = getTotalSlots();
      expect(total).toBeGreaterThan(0);
      expect(Number.isInteger(total)).toBe(true);
    });
  });
});
