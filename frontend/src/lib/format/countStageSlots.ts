import { deriveSwissRounds } from './buildSwissColumns';
import type { FormatConfig } from './types';

/** 按赛段类型统计的槽位（比赛）数量 */
export interface StageSlotCounts {
  /** 瑞士轮总场次（各轮各战绩组场次之和） */
  swiss: number;
  /** 淘汰赛总场次（teamCount - 1） */
  elimination: number;
  /** 全部赛段合计 */
  total: number;
}

/**
 * 按生效配置统计各赛段应生成的槽位数量（技术设计方案 §7 管理端文案推导）
 * - 瑞士轮：各轮"需比赛战绩组"的队数 / 2 之和（与 buildSwissColumns 同源的 B 树推导）
 * - 淘汰赛：单败制 teamCount - 1
 */
export function countStageSlots(format: FormatConfig): StageSlotCounts {
  let swiss = 0;
  let elimination = 0;

  for (const stage of format.stages) {
    if (stage.type === 'swiss') {
      for (const round of deriveSwissRounds(stage)) {
        swiss += round.groups.reduce((sum, group) => sum + group.teamCount / 2, 0);
      }
    } else {
      elimination += stage.teamCount - 1;
    }
  }

  return { swiss, elimination, total: swiss + elimination };
}
