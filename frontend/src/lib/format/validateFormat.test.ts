import { describe, it, expect } from 'vitest';
import { validateFormat } from './validateFormat';
import { BUILTIN_DEFAULT_FORMAT } from './defaultFormat';
import type { EliminationStageConfig, FormatConfig, SwissStageConfig } from './types';

/** 深拷贝内置默认配置（避免用例间修改共享常量） */
const cloneDefaultFormat = (): FormatConfig =>
  JSON.parse(JSON.stringify(BUILTIN_DEFAULT_FORMAT)) as FormatConfig;

/** 构造"8队2胜 + 4强淘汰赛"合法配置（技术方案附录 13.2 示例） */
const buildEightTeamFormat = (): FormatConfig => ({
  version: 1,
  name: '8队瑞士轮（2胜制）+ 4强',
  stages: [
    {
      type: 'swiss',
      name: '瑞士轮',
      teamCount: 8,
      winThreshold: 2,
      lossThreshold: 2,
      boRule: 'auto',
      advanceToStage: 1,
    },
    {
      type: 'elimination',
      name: '淘汰赛',
      teamCount: 4,
      advanceToStage: null,
      roundNames: ['半决赛', '决赛'],
      boFormat: 'BO3',
    },
  ],
});

describe('validateFormat', () => {
  it('内置默认配置（16队3胜瑞士轮 + 8强淘汰赛）通过校验', () => {
    expect(validateFormat(BUILTIN_DEFAULT_FORMAT)).toEqual([]);
  });

  it('8队2胜制 + 4强淘汰赛通过校验', () => {
    expect(validateFormat(buildEightTeamFormat())).toEqual([]);
  });

  it('单一瑞士轮赛段（末段出口为 null）通过校验', () => {
    const format: FormatConfig = {
      version: 1,
      name: '纯瑞士轮',
      stages: [
        {
          type: 'swiss',
          name: '瑞士轮',
          teamCount: 16,
          winThreshold: 3,
          lossThreshold: 3,
          boRule: 'auto',
          advanceToStage: null,
        },
      ],
    };
    expect(validateFormat(format)).toEqual([]);
  });

  it('赛段序列为空时报错', () => {
    const errors = validateFormat({ version: 1, name: '空配置', stages: [] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('末段晋级出口非 null 报错', () => {
    const format = cloneDefaultFormat();
    (format.stages[1] as EliminationStageConfig).advanceToStage = 0 as unknown as null;
    const errors = validateFormat(format);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('null'))).toBe(true);
  });

  it('中间赛段晋级出口不指向下一段报错', () => {
    const format = cloneDefaultFormat();
    (format.stages[0] as SwissStageConfig).advanceToStage = 2;
    const errors = validateFormat(format);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('下一段'))).toBe(true);
  });

  it('8队3胜制结构非法：第4轮 2-1 组为奇数（3队）报错', () => {
    const format = buildEightTeamFormat();
    const swiss = format.stages[0] as SwissStageConfig;
    swiss.winThreshold = 3;
    swiss.lossThreshold = 3;
    const errors = validateFormat(format);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('2-1'))).toBe(true);
  });

  it('瑞士轮队伍数为奇数报错', () => {
    const format = cloneDefaultFormat();
    (format.stages[0] as SwissStageConfig).teamCount = 15;
    // 淘汰赛同步缩为 4 强并补齐阶段名，隔离"队伍数奇偶"这一项错误
    const elim = format.stages[1] as EliminationStageConfig;
    elim.teamCount = 4;
    elim.roundNames = ['半决赛', '决赛'];
    const errors = validateFormat(format);
    expect(errors.some(e => e.includes('偶数'))).toBe(true);
  });

  it('瑞士轮队伍数超出 4-32 范围报错', () => {
    const format = buildEightTeamFormat();
    (format.stages[0] as SwissStageConfig).teamCount = 34;
    const errors = validateFormat(format);
    expect(errors.some(e => e.includes('4-32'))).toBe(true);
  });

  it('瑞士轮阈值不对称报错', () => {
    const format = buildEightTeamFormat();
    (format.stages[0] as SwissStageConfig).winThreshold = 3;
    const errors = validateFormat(format);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('阈值'))).toBe(true);
  });

  it('瑞士轮阈值不属于 {2,3} 报错', () => {
    const format = buildEightTeamFormat();
    const swiss = format.stages[0] as SwissStageConfig;
    swiss.winThreshold = 4;
    swiss.lossThreshold = 4;
    const errors = validateFormat(format);
    expect(errors.some(e => e.includes('阈值'))).toBe(true);
  });

  it('淘汰赛队伍数非 2 的幂报错', () => {
    const format = buildEightTeamFormat();
    (format.stages[1] as EliminationStageConfig).teamCount = 6;
    const errors = validateFormat(format);
    expect(errors.some(e => e.includes('2 的幂'))).toBe(true);
  });

  it('淘汰赛 roundNames 数量与 log2(teamCount) 不符报错', () => {
    const format = cloneDefaultFormat();
    (format.stages[1] as EliminationStageConfig).roundNames = ['半决赛', '决赛'];
    const errors = validateFormat(format);
    expect(errors.some(e => e.includes('阶段名称'))).toBe(true);
  });

  it('淘汰赛不在末段报错', () => {
    const format: FormatConfig = {
      version: 1,
      name: '淘汰赛居前',
      stages: [
        {
          type: 'elimination',
          name: '淘汰赛',
          teamCount: 4,
          advanceToStage: 1 as unknown as null,
          roundNames: ['半决赛', '决赛'],
          boFormat: 'BO3',
        },
        {
          type: 'swiss',
          name: '瑞士轮',
          teamCount: 4,
          winThreshold: 2,
          lossThreshold: 2,
          boRule: 'auto',
          advanceToStage: null,
        },
      ],
    };
    const errors = validateFormat(format);
    expect(errors.some(e => e.includes('末段'))).toBe(true);
  });

  it('赛段衔接超额：后段队伍数超过前段供给报错', () => {
    const format = buildEightTeamFormat();
    const elim = format.stages[1] as EliminationStageConfig;
    elim.teamCount = 8;
    elim.roundNames = ['四分之一决赛', '半决赛', '决赛'];
    const errors = validateFormat(format);
    expect(errors.some(e => e.includes('超出'))).toBe(true);
  });
});
