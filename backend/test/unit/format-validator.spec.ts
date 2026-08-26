import { validateFormat } from '../../src/modules/formats/format-validator';
import {
  BUILTIN_DEFAULT_FORMAT,
  FormatConfig,
  SwissStageConfig,
  EliminationStageConfig,
} from '../../src/modules/formats/format.types';

/** 构造 16队3胜+8强淘汰赛的合法配置（除 stages 外可覆盖任意字段） */
function makeFormat(stages: FormatConfig['stages'], name = '测试赛制'): FormatConfig {
  return { version: 1, name, stages };
}

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

function makeElimStage(overrides: Partial<EliminationStageConfig> = {}): EliminationStageConfig {
  return {
    type: 'elimination',
    name: '淘汰赛',
    teamCount: 8,
    advanceToStage: null,
    roundNames: ['四分之一决赛', '半决赛', '决赛'],
    boFormat: 'BO5',
    ...overrides,
  };
}

describe('FormatValidator - validateFormat', () => {
  describe('合法配置', () => {
    it('内置默认配置应通过校验（返回空错误列表）', () => {
      expect(validateFormat(BUILTIN_DEFAULT_FORMAT)).toEqual([]);
    });

    it('8队2胜 + 4强淘汰赛应通过校验', () => {
      const format = makeFormat([
        makeSwissStage({ teamCount: 8, winThreshold: 2, lossThreshold: 2 }),
        makeElimStage({ teamCount: 4, roundNames: ['半决赛', '决赛'], boFormat: 'BO3' }),
      ]);
      expect(validateFormat(format)).toEqual([]);
    });

    it('仅单个淘汰赛赛段应通过校验（无瑞士轮直接单败）', () => {
      const format = makeFormat([makeElimStage({ advanceToStage: null })]);
      expect(validateFormat(format)).toEqual([]);
    });

    it('2胜制合法组合：4/8/16/32 队均通过结构校验', () => {
      for (const teamCount of [4, 8, 16, 32]) {
        const format = makeFormat([
          makeSwissStage({ teamCount, winThreshold: 2, lossThreshold: 2, advanceToStage: null }),
        ]);
        expect(validateFormat(format)).toEqual([]);
      }
    });

    it('3胜制合法组合：16/32 队通过结构校验', () => {
      for (const teamCount of [16, 32]) {
        const format = makeFormat([
          makeSwissStage({ teamCount, winThreshold: 3, lossThreshold: 3, advanceToStage: null }),
        ]);
        expect(validateFormat(format)).toEqual([]);
      }
    });
  });

  describe('赛段序列校验', () => {
    it('stages 为空数组应报错', () => {
      const errors = validateFormat(makeFormat([]));
      expect(errors.length).toBeGreaterThan(0);
    });

    it('末段 advanceToStage 非 null 应报错', () => {
      const format = makeFormat([
        makeSwissStage({ advanceToStage: null }),
        makeElimStage({ advanceToStage: 2 } as any),
      ]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('advanceToStage'))).toBe(true);
    });

    it('非末段 advanceToStage 不等于自身下标+1 应报错', () => {
      const format = makeFormat([makeSwissStage({ advanceToStage: null }), makeElimStage()]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('advanceToStage'))).toBe(true);
    });

    it('elimination 赛段不在末段应报错（它是终局）', () => {
      const format = makeFormat([
        makeElimStage({ advanceToStage: 1 } as any),
        makeSwissStage({ advanceToStage: null }),
      ]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('elimination'))).toBe(true);
    });
  });

  describe('瑞士轮校验', () => {
    it('teamCount 为奇数应报错', () => {
      const format = makeFormat([makeSwissStage({ teamCount: 7 })]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('teamCount'))).toBe(true);
    });

    it('teamCount 小于 4 应报错', () => {
      const format = makeFormat([makeSwissStage({ teamCount: 2 })]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('teamCount'))).toBe(true);
    });

    it('teamCount 大于 32 应报错', () => {
      const format = makeFormat([makeSwissStage({ teamCount: 64 })]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('teamCount'))).toBe(true);
    });

    it('winThreshold 不等于 lossThreshold 应报错', () => {
      const format = makeFormat([makeSwissStage({ winThreshold: 3, lossThreshold: 2 })]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('winThreshold') || e.includes('lossThreshold'))).toBe(
        true,
      );
    });

    it('阈值不在 {2,3} 内应报错', () => {
      const format = makeFormat([makeSwissStage({ winThreshold: 1, lossThreshold: 1 })]);
      const errors = validateFormat(format);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('8队3胜制应报结构错误（第4轮 2-1 组仅 3 队奇数）', () => {
      const format = makeFormat([makeSwissStage({ teamCount: 8 })]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('结构') || e.includes('战绩组'))).toBe(true);
    });
  });

  describe('淘汰赛校验', () => {
    it('teamCount 非 2 的幂应报错', () => {
      const format = makeFormat([makeElimStage({ teamCount: 6, roundNames: ['a', 'b', 'c'] })]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('2 的幂') || e.includes('teamCount'))).toBe(true);
    });

    it('teamCount 超过 32 应报错', () => {
      const format = makeFormat([makeElimStage({ teamCount: 64, roundNames: [] })]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('teamCount'))).toBe(true);
    });

    it('roundNames 数量与 log2(teamCount) 不匹配应报错', () => {
      const format = makeFormat([makeElimStage({ teamCount: 8, roundNames: ['半决赛', '决赛'] })]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('roundNames'))).toBe(true);
    });

    it('boFormat 不在 BO1/BO3/BO5 内应报错', () => {
      const format = makeFormat([
        makeElimStage({ boFormat: 'BO7' as EliminationStageConfig['boFormat'] }),
      ]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('boFormat'))).toBe(true);
    });
  });

  describe('赛段衔接校验', () => {
    it('后一赛段 teamCount 超过前一赛段晋级供给应报错（swiss 8队供给4 → 淘汰赛8队）', () => {
      const format = makeFormat([
        makeSwissStage({ teamCount: 8, winThreshold: 2, lossThreshold: 2 }),
        makeElimStage({ teamCount: 8 }),
      ]);
      const errors = validateFormat(format);
      expect(errors.some((e) => e.includes('衔接') || e.includes('晋级'))).toBe(true);
    });

    it('后一赛段 teamCount 等于前一赛段晋级供给应通过（swiss 8队供给4 → 淘汰赛4队）', () => {
      const format = makeFormat([
        makeSwissStage({ teamCount: 8, winThreshold: 2, lossThreshold: 2 }),
        makeElimStage({ teamCount: 4, roundNames: ['半决赛', '决赛'] }),
      ]);
      expect(validateFormat(format)).toEqual([]);
    });
  });
});
