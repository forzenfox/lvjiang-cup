import { describe, it, expect } from 'vitest';
import { swissRoundSlots, getRoundFormat } from '@/pages/admin/swissRoundSlots';

describe('SwissRoundSlots 槽位配置', () => {
  it('应该包含所有轮次配置', () => {
    expect(swissRoundSlots.length).toBe(6);

    const records = swissRoundSlots.map(s => s.swissRecord);
    expect(records).toContain('0-0');
    expect(records).toContain('1-0');
    expect(records).toContain('0-1');
    expect(records).toContain('1-1');
    expect(records).toContain('0-2');
    expect(records).toContain('1-2');
  });

  it('每个轮次应该有正确的场次数', () => {
    const round1 = swissRoundSlots.find(s => s.swissRecord === '0-0');
    expect(round1?.maxMatches).toBe(4);

    const round2High = swissRoundSlots.find(s => s.swissRecord === '1-0');
    expect(round2High?.maxMatches).toBe(2);

    const round2Low = swissRoundSlots.find(s => s.swissRecord === '0-1');
    expect(round2Low?.maxMatches).toBe(2);

    const round3Mid = swissRoundSlots.find(s => s.swissRecord === '1-1');
    expect(round3Mid?.maxMatches).toBe(2);

    const round3Low = swissRoundSlots.find(s => s.swissRecord === '0-2');
    expect(round3Low?.maxMatches).toBe(1);

    const round4 = swissRoundSlots.find(s => s.swissRecord === '1-2');
    expect(round4?.maxMatches).toBe(3);
  });

  it('getRoundFormat 应该正确返回赛制', () => {
    expect(getRoundFormat('0-0')).toBe('BO1');
    expect(getRoundFormat('1-0')).toBe('BO3');
    expect(getRoundFormat('0-1')).toBe('BO3');
    expect(getRoundFormat('1-1')).toBe('BO3');
    expect(getRoundFormat('0-2')).toBe('BO3');
    expect(getRoundFormat('1-2')).toBe('BO3');
  });

  it('每个轮次应该有正确的名称', () => {
    const round1 = swissRoundSlots.find(s => s.swissRecord === '0-0');
    expect(round1?.roundName).toBe('Round 1');

    const round2High = swissRoundSlots.find(s => s.swissRecord === '1-0');
    expect(round2High?.roundName).toBe('Round 2 High');

    const round2Low = swissRoundSlots.find(s => s.swissRecord === '0-1');
    expect(round2Low?.roundName).toBe('Round 2 Low');
  });

  it('总场次数应该为14场', () => {
    const total = swissRoundSlots.reduce((sum, slot) => sum + slot.maxMatches, 0);
    expect(total).toBe(14);
  });
});
