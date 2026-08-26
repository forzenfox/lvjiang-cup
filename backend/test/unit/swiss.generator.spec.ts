import {
  generateSwissSlots,
  resolveBo,
} from '../../src/modules/formats/generators/swiss.generator';
import { SwissStageConfig } from '../../src/modules/formats/format.types';
import { GeneratedSlot } from '../../src/modules/formats/generators/generator.registry';

/** 构造瑞士轮赛段配置的辅助函数 */
function makeSwissStage(overrides: Partial<SwissStageConfig> = {}): SwissStageConfig {
  return {
    type: 'swiss',
    name: '瑞士轮',
    teamCount: 16,
    winThreshold: 3,
    lossThreshold: 3,
    boRule: 'auto',
    advanceToStage: 1,
    ...overrides,
  };
}

/** 提取指定轮次的槽位 */
function roundOf(slots: GeneratedSlot[], round: number): GeneratedSlot[] {
  return slots.filter((s) => s.swissRound === round);
}

/** 统计指定战绩组的槽位数量 */
function countOf(slots: GeneratedSlot[], record: string): number {
  return slots.filter((s) => s.swissRecord === record).length;
}

describe('SwissGenerator - generateSwissSlots', () => {
  describe('16队3胜制（内置默认配置基准）', () => {
    const slots = generateSwissSlots(makeSwissStage());

    it('应生成 33 场比赛', () => {
      expect(slots).toHaveLength(33);
    });

    it('第1轮：0-0 组 8 场 BO1', () => {
      const r1 = roundOf(slots, 1);
      expect(r1).toHaveLength(8);
      expect(r1.every((s) => s.swissRecord === '0-0')).toBe(true);
      expect(r1.every((s) => s.boFormat === 'BO1')).toBe(true);
      expect(r1.every((s) => s.round === 'Round 1')).toBe(true);
    });

    it('第1轮槽位 id 应为 swiss-r1-1 ~ swiss-r1-8（轮内连续编号）', () => {
      const ids = roundOf(slots, 1).map((s) => s.id);
      expect(ids).toEqual([
        'swiss-r1-1',
        'swiss-r1-2',
        'swiss-r1-3',
        'swiss-r1-4',
        'swiss-r1-5',
        'swiss-r1-6',
        'swiss-r1-7',
        'swiss-r1-8',
      ]);
    });

    it('第2轮：1-0×4 + 0-1×4，全部 BO1', () => {
      const r2 = roundOf(slots, 2);
      expect(r2).toHaveLength(8);
      expect(countOf(r2, '1-0')).toBe(4);
      expect(countOf(r2, '0-1')).toBe(4);
      expect(r2.every((s) => s.boFormat === 'BO1')).toBe(true);
    });

    it('第2轮战绩组顺序应为 wins 降序（1-0 在前，0-1 在后）', () => {
      const r2 = roundOf(slots, 2);
      expect(r2.slice(0, 4).every((s) => s.swissRecord === '1-0')).toBe(true);
      expect(r2.slice(4).every((s) => s.swissRecord === '0-1')).toBe(true);
    });

    it('第3轮：2-0×2(BO3) + 1-1×4(BO1) + 0-2×2(BO3)', () => {
      const r3 = roundOf(slots, 3);
      expect(r3).toHaveLength(8);
      expect(countOf(r3, '2-0')).toBe(2);
      expect(countOf(r3, '1-1')).toBe(4);
      expect(countOf(r3, '0-2')).toBe(2);
      expect(r3.filter((s) => s.swissRecord === '2-0').every((s) => s.boFormat === 'BO3')).toBe(
        true,
      );
      expect(r3.filter((s) => s.swissRecord === '1-1').every((s) => s.boFormat === 'BO1')).toBe(
        true,
      );
      expect(r3.filter((s) => s.swissRecord === '0-2').every((s) => s.boFormat === 'BO3')).toBe(
        true,
      );
    });

    it('第3轮战绩组顺序应为 wins 降序（2-0 → 1-1 → 0-2）', () => {
      const r3 = roundOf(slots, 3);
      expect(r3.slice(0, 2).every((s) => s.swissRecord === '2-0')).toBe(true);
      expect(r3.slice(2, 6).every((s) => s.swissRecord === '1-1')).toBe(true);
      expect(r3.slice(6).every((s) => s.swissRecord === '0-2')).toBe(true);
    });

    it('第4轮：2-1×3 + 1-2×3，全部 BO3', () => {
      const r4 = roundOf(slots, 4);
      expect(r4).toHaveLength(6);
      expect(countOf(r4, '2-1')).toBe(3);
      expect(countOf(r4, '1-2')).toBe(3);
      expect(r4.every((s) => s.boFormat === 'BO3')).toBe(true);
    });

    it('第5轮：2-2 组 3 场 BO3', () => {
      const r5 = roundOf(slots, 5);
      expect(r5).toHaveLength(3);
      expect(r5.every((s) => s.swissRecord === '2-2')).toBe(true);
      expect(r5.every((s) => s.boFormat === 'BO3')).toBe(true);
      expect(r5.map((s) => s.id)).toEqual(['swiss-r5-1', 'swiss-r5-2', 'swiss-r5-3']);
    });

    it('所有槽位 stage 为 swiss、status 为 upcoming', () => {
      expect(slots.every((s) => s.stage === 'swiss')).toBe(true);
      expect(slots.every((s) => s.status === 'upcoming')).toBe(true);
    });
  });

  describe('8队2胜制', () => {
    const slots = generateSwissSlots(
      makeSwissStage({ teamCount: 8, winThreshold: 2, lossThreshold: 2 }),
    );

    it('应生成 10 场比赛（2-0/0-2 组达阈值退场不比赛）', () => {
      expect(slots).toHaveLength(10);
    });

    it('第1轮：0-0 组 4 场 BO1', () => {
      const r1 = roundOf(slots, 1);
      expect(r1).toHaveLength(4);
      expect(r1.every((s) => s.swissRecord === '0-0')).toBe(true);
      expect(r1.every((s) => s.boFormat === 'BO1')).toBe(true);
    });

    it('第2轮：1-0×2 + 0-1×2，全部 BO3（决定性比赛）', () => {
      const r2 = roundOf(slots, 2);
      expect(r2).toHaveLength(4);
      expect(countOf(r2, '1-0')).toBe(2);
      expect(countOf(r2, '0-1')).toBe(2);
      expect(r2.every((s) => s.boFormat === 'BO3')).toBe(true);
    });

    it('第3轮：1-1 组 2 场 BO3', () => {
      const r3 = roundOf(slots, 3);
      expect(r3).toHaveLength(2);
      expect(r3.every((s) => s.swissRecord === '1-1')).toBe(true);
      expect(r3.every((s) => s.boFormat === 'BO3')).toBe(true);
    });
  });

  describe('4队2胜制', () => {
    it('应生成 5 场：R1 2场BO1 + R2 2场BO3 + R3 1场BO3(1-1)', () => {
      const slots = generateSwissSlots(
        makeSwissStage({ teamCount: 4, winThreshold: 2, lossThreshold: 2, advanceToStage: null }),
      );
      expect(slots).toHaveLength(5);

      const r1 = roundOf(slots, 1);
      expect(r1).toHaveLength(2);
      expect(r1.every((s) => s.boFormat === 'BO1')).toBe(true);

      const r2 = roundOf(slots, 2);
      expect(r2).toHaveLength(2);
      expect(countOf(r2, '1-0')).toBe(1);
      expect(countOf(r2, '0-1')).toBe(1);
      expect(r2.every((s) => s.boFormat === 'BO3')).toBe(true);

      const r3 = roundOf(slots, 3);
      expect(r3).toHaveLength(1);
      expect(r3[0].swissRecord).toBe('1-1');
      expect(r3[0].boFormat).toBe('BO3');
    });
  });

  describe('32队3胜制', () => {
    it('结构合法：共 66 场、5 轮、第5轮 2-2 组 6 场', () => {
      const slots = generateSwissSlots(makeSwissStage({ teamCount: 32 }));
      expect(slots).toHaveLength(66);
      expect(roundOf(slots, 5)).toHaveLength(6);
      expect(countOf(roundOf(slots, 5), '2-2')).toBe(6);
    });
  });
});

describe('SwissGenerator - resolveBo（决定性比赛判定）', () => {
  it('all-bo1 规则应始终返回 BO1', () => {
    expect(resolveBo('0-0', 3, 3, 'all-bo1')).toBe('BO1');
    expect(resolveBo('2-2', 3, 3, 'all-bo1')).toBe('BO1');
  });

  it('all-bo3 规则应始终返回 BO3', () => {
    expect(resolveBo('0-0', 3, 3, 'all-bo3')).toBe('BO3');
    expect(resolveBo('1-1', 2, 2, 'all-bo3')).toBe('BO3');
  });

  it('auto：3胜制 0-0 非决定性比赛应为 BO1', () => {
    expect(resolveBo('0-0', 3, 3, 'auto')).toBe('BO1');
  });

  it('auto：3胜制 1-1 非决定性比赛应为 BO1', () => {
    expect(resolveBo('1-1', 3, 3, 'auto')).toBe('BO1');
  });

  it('auto：3胜制 2-0 胜者将达晋级阈值应为 BO3', () => {
    expect(resolveBo('2-0', 3, 3, 'auto')).toBe('BO3');
  });

  it('auto：3胜制 0-2 败者将达淘汰阈值应为 BO3', () => {
    expect(resolveBo('0-2', 3, 3, 'auto')).toBe('BO3');
  });

  it('auto：2胜制 1-0 胜者将达晋级阈值应为 BO3', () => {
    expect(resolveBo('1-0', 2, 2, 'auto')).toBe('BO3');
  });

  it('auto：2胜制 0-1 败者将达淘汰阈值应为 BO3', () => {
    expect(resolveBo('0-1', 2, 2, 'auto')).toBe('BO3');
  });

  it('auto：2胜制 0-0 非决定性比赛应为 BO1', () => {
    expect(resolveBo('0-0', 2, 2, 'auto')).toBe('BO1');
  });
});
