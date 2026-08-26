/** —— 基础类型 —— */
export type StageType = 'swiss' | 'elimination';
export type BoFormat = 'BO1' | 'BO3' | 'BO5';
export type SwissBoRule = 'auto' | 'all-bo1' | 'all-bo3';

/** —— 瑞士轮赛段 —— */
export interface SwissStageConfig {
  type: 'swiss';
  /** 展示名，如"瑞士轮" */
  name: string;
  /** 参赛队伍数（偶数，4~32） */
  teamCount: number;
  /** 晋级阈值（2 或 3） */
  winThreshold: number;
  /** 淘汰阈值（2 或 3，与 winThreshold 对称） */
  lossThreshold: number;
  /** BO 规则 */
  boRule: SwissBoRule;
  /** 晋级出口（下一赛段下标，末段为 null） */
  advanceToStage: number | null;
}

/** —— 淘汰赛赛段 —— */
export interface EliminationStageConfig {
  type: 'elimination';
  /** 展示名，如"淘汰赛" */
  name: string;
  /** 参赛队伍数（2 的幂） */
  teamCount: number;
  /** 末段固定为 null */
  advanceToStage: null;
  /** 各级名称，从首轮到决赛 */
  roundNames: string[];
  /** 各级统一 BO（本期不逐级配置） */
  boFormat: BoFormat;
}

export type StageConfig = SwissStageConfig | EliminationStageConfig;

/** —— 赛制配置 —— */
export interface FormatConfig {
  version: 1;
  /** 配置名称 */
  name: string;
  /** 赛段序列（顺序即赛程先后） */
  stages: StageConfig[];
}

/** 内置默认配置（不落库，无激活配置时的兜底，AC-007 兼容迁移） */
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
