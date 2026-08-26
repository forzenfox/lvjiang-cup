import { describe, it, expect } from 'vitest';
import { countStageSlots } from './countStageSlots';
import { BUILTIN_DEFAULT_FORMAT } from './defaultFormat';
import type { FormatConfig } from './types';

describe('countStageSlots', () => {
  it('默认配置：瑞士轮 33 场（8+8+8+6+3）、淘汰赛 7 场、合计 40 场', () => {
    const counts = countStageSlots(BUILTIN_DEFAULT_FORMAT);
    expect(counts.swiss).toBe(33);
    expect(counts.elimination).toBe(7);
    expect(counts.total).toBe(40);
  });

  it('8队 2胜制：瑞士轮 10 场（4+2+2+2）、淘汰赛（4队）3 场', () => {
    const format: FormatConfig = {
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
    };
    const counts = countStageSlots(format);
    expect(counts.swiss).toBe(10);
    expect(counts.elimination).toBe(3);
    expect(counts.total).toBe(13);
  });

  it('仅有瑞士轮赛段时淘汰赛场数为 0', () => {
    const format: FormatConfig = {
      version: 1,
      name: '仅瑞士轮',
      stages: [
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
    const counts = countStageSlots(format);
    expect(counts.swiss).toBe(5); // R1 2场 + R2 2场 + R3 1场
    expect(counts.elimination).toBe(0);
  });

  it('仅有淘汰赛赛段时瑞士轮场数为 0', () => {
    const format: FormatConfig = {
      version: 1,
      name: '仅淘汰赛',
      stages: [
        {
          type: 'elimination',
          name: '淘汰赛',
          teamCount: 2,
          advanceToStage: null,
          roundNames: ['决赛'],
          boFormat: 'BO5',
        },
      ],
    };
    const counts = countStageSlots(format);
    expect(counts.swiss).toBe(0);
    expect(counts.elimination).toBe(1);
    expect(counts.total).toBe(1);
  });

  it('4队 2胜2败瑞士轮推导：R1 2场 + R2 2场 + R3 1场 = 5 场', () => {
    const format: FormatConfig = {
      version: 1,
      name: '4队瑞士轮',
      stages: [
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
    const counts = countStageSlots(format);
    expect(counts.swiss).toBe(5);
  });
});
