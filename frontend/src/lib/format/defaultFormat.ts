import type { FormatConfig } from './types';

/**
 * 内置默认赛制配置（不落库）
 * 无激活配置时的兜底配置，与现状"16 队瑞士轮 3 胜 3 败 + 8 强单败"行为一致（技术设计方案 §3.3）
 */
export const BUILTIN_DEFAULT_FORMAT: FormatConfig = {
  version: 1,
  name: '默认赛制（16队瑞士轮 + 8强单败）',
  stages: [
    {
      type: 'swiss',
      name: '瑞士轮',
      teamCount: 16,
      winThreshold: 3,
      lossThreshold: 3,
      boRule: 'auto',
      advanceToStage: 1,
    },
    {
      type: 'elimination',
      name: '淘汰赛',
      teamCount: 8,
      advanceToStage: null,
      roundNames: ['四分之一决赛', '半决赛', '决赛'],
      boFormat: 'BO5',
    },
  ],
};
