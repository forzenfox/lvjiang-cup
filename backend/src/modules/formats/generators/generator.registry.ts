import { BoFormat, FormatConfig, StageConfig, StageType } from '../format.types';
import { generateSwissSlots } from './swiss.generator';
import { generateEliminationSlots } from './elimination.generator';

/** 生成器产出的比赛槽位 */
export interface GeneratedSlot {
  id: string;
  /** 轮次名称（瑞士轮为 Round N，淘汰赛取 roundNames 配置） */
  round: string;
  stage: StageType;
  status: 'upcoming';
  /** 瑞士轮特有：战绩组 'w-l' */
  swissRecord?: string;
  /** 瑞士轮特有：轮次号 */
  swissRound?: number;
  /** 淘汰赛特有：阶段枚举（受 matches 表 CHECK 约束限制） */
  eliminationBracket?: 'quarterfinals' | 'semifinals' | 'finals';
  /** 淘汰赛特有：全程连续场次编号 */
  eliminationGameNumber?: number;
  boFormat: BoFormat;
}

/** 槽位生成器：赛段配置 → 槽位清单（纯函数） */
export type SlotGenerator = (stage: StageConfig) => GeneratedSlot[];

/**
 * 赛段类型 → 槽位生成器注册表
 * 新增赛制类型只需新增生成器函数并在此注册，不修改既有生成器（扩展点）
 */
export const SLOT_GENERATOR_REGISTRY: Record<StageType, SlotGenerator> = {
  swiss: generateSwissSlots,
  elimination: generateEliminationSlots,
};

/** 按赛制配置生成全部赛段的槽位清单 */
export function generateAllSlots(format: FormatConfig): GeneratedSlot[] {
  return format.stages.flatMap((stage) => SLOT_GENERATOR_REGISTRY[stage.type](stage));
}
