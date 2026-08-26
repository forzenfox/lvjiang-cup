/**
 * 赛制可配置化 - 类型定义
 * 与后端 FormatConfig 结构逐字段一致（技术设计方案 §3.2）
 */

// —— 基础类型 ——
export type StageType = 'swiss' | 'elimination';
export type BoFormat = 'BO1' | 'BO3' | 'BO5';
export type SwissBoRule = 'auto' | 'all-bo1' | 'all-bo3';

// —— 瑞士轮赛段 ——
export interface SwissStageConfig {
  type: 'swiss';
  /** 展示名，如"瑞士轮" */
  name: string;
  /** 参赛队伍数（偶数，4-32） */
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

// —— 淘汰赛赛段 ——
export interface EliminationStageConfig {
  type: 'elimination';
  /** 展示名，如"淘汰赛" */
  name: string;
  /** 参赛队伍数（2 的幂，2-32） */
  teamCount: number;
  /** 末段固定为 null */
  advanceToStage: null;
  /** 各级名称，从首轮到决赛 */
  roundNames: string[];
  /** 各级统一 BO */
  boFormat: BoFormat;
}

export type StageConfig = SwissStageConfig | EliminationStageConfig;

// —— 赛制配置 ——
export interface FormatConfig {
  /** 配置模型版本 */
  version: 1;
  /** 配置名称 */
  name: string;
  /** 赛段序列（顺序即赛程先后） */
  stages: StageConfig[];
}

// —— 瑞士轮视图模型（与 constants/swissTreeConfig.ts 的接口同构，字段名完全一致）——
export interface SwissRecordConfig {
  record: string;
  label: string;
  matchCount: number;
  type: 'matches' | 'promotion' | 'elimination';
  slotIds: string[];
}

export interface SwissColumnConfig {
  id: number;
  name: string;
  records: SwissRecordConfig[];
  hasPromotionList: boolean;
  hasEliminationList: boolean;
}
