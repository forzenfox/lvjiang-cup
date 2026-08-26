import { resolveBo } from './buildSwissColumns';
import type { SwissColumnConfig, SwissStageConfig } from './types';

/** BO1/BO3 快捷视图配置 */
export interface SwissViewConfig {
  bo1: { columns: number[]; records: string[] };
  bo3: { columns: number[]; records: string[] };
}

/**
 * 推导 BO1/BO3 快捷视图的可见列与高亮战绩组（技术设计方案 §7.3）
 * - bo1 取前 min(4, N) 列、bo3 取后 min(4, N) 列（0 起索引的滑动 4 列视窗）
 * - records 为对应 BO 的比赛记录组 record 值（按列顺序、列内顺序收集）
 */
export function getSwissViewConfig(
  columns: SwissColumnConfig[],
  stage: SwissStageConfig
): SwissViewConfig {
  const windowSize = Math.min(4, columns.length);
  const bo1Columns = Array.from({ length: windowSize }, (_, i) => i);
  const bo3Columns = Array.from({ length: windowSize }, (_, i) => columns.length - windowSize + i);

  const bo1Records: string[] = [];
  const bo3Records: string[] = [];
  for (const column of columns) {
    for (const recordConfig of column.records) {
      if (recordConfig.type !== 'matches') continue;
      const bo = resolveBo(
        recordConfig.record,
        stage.winThreshold,
        stage.lossThreshold,
        stage.boRule
      );
      if (bo === 'BO1') {
        bo1Records.push(recordConfig.record);
      } else {
        bo3Records.push(recordConfig.record);
      }
    }
  }

  return {
    bo1: { columns: bo1Columns, records: bo1Records },
    bo3: { columns: bo3Columns, records: bo3Records },
  };
}
