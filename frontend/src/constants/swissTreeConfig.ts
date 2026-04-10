/**
 * 瑞士轮树形结构配置
 * 定义6列布局的固定槽位和晋升关系
 */

export interface SwissColumnConfig {
  id: number;
  name: string;
  records: SwissRecordConfig[];
  hasPromotionList: boolean;
  hasEliminationList: boolean;
}

export interface SwissRecordConfig {
  record: string;
  label: string;
  matchCount: number;
  type: 'matches' | 'promotion' | 'elimination';
  slotIds: string[];
}

/**
 * 6列配置
 */
export const SWISS_COLUMNS: SwissColumnConfig[] = [
  // 第1列: 第一轮 (0-0)
  {
    id: 1,
    name: '第一轮',
    records: [
      {
        record: '0-0',
        label: '0-0',
        matchCount: 8,
        type: 'matches',
        slotIds: ['r1-0-0-1', 'r1-0-0-2', 'r1-0-0-3', 'r1-0-0-4', 'r1-0-0-5', 'r1-0-0-6', 'r1-0-0-7', 'r1-0-0-8'],
      },
    ],
    hasPromotionList: false,
    hasEliminationList: false,
  },
  // 第2列: 第二轮 (1-0 / 0-1)
  {
    id: 2,
    name: '第二轮',
    records: [
      {
        record: '1-0',
        label: '1-0',
        matchCount: 4,
        type: 'matches',
        slotIds: ['r2-1-0-1', 'r2-1-0-2', 'r2-1-0-3', 'r2-1-0-4'],
      },
      {
        record: '0-1',
        label: '0-1',
        matchCount: 4,
        type: 'matches',
        slotIds: ['r2-0-1-1', 'r2-0-1-2', 'r2-0-1-3', 'r2-0-1-4'],
      },
    ],
    hasPromotionList: false,
    hasEliminationList: false,
  },
  // 第3列: 第三轮 (2-0 / 1-1 / 0-2) - 只有对战，无晋级/淘汰名单
  {
    id: 3,
    name: '第三轮',
    records: [
      {
        record: '2-0',
        label: '2-0',
        matchCount: 2,
        type: 'matches',
        slotIds: ['r3-2-0-1', 'r3-2-0-2'],
      },
      {
        record: '1-1',
        label: '1-1',
        matchCount: 4,
        type: 'matches',
        slotIds: ['r3-1-1-1', 'r3-1-1-2', 'r3-1-1-3', 'r3-1-1-4'],
      },
      {
        record: '0-2',
        label: '0-2',
        matchCount: 2,
        type: 'matches',
        slotIds: ['r3-0-2-1', 'r3-0-2-2'],
      },
    ],
    hasPromotionList: false,
    hasEliminationList: false,
  },
  // 第4列: 第四轮 (3-0 / 2-1 / 1-2 / 0-3) - 有晋级/淘汰名单
  {
    id: 4,
    name: '第四轮',
    records: [
      {
        record: '3-0',
        label: '3-0',
        matchCount: 0,
        type: 'promotion',
        slotIds: [],
      },
      {
        record: '2-1',
        label: '2-1',
        matchCount: 3,
        type: 'matches',
        slotIds: ['r4-2-1-1', 'r4-2-1-2', 'r4-2-1-3'],
      },
      {
        record: '1-2',
        label: '1-2',
        matchCount: 3,
        type: 'matches',
        slotIds: ['r4-1-2-1', 'r4-1-2-2', 'r4-1-2-3'],
      },
      {
        record: '0-3',
        label: '0-3',
        matchCount: 0,
        type: 'elimination',
        slotIds: [],
      },
    ],
    hasPromotionList: true,
    hasEliminationList: true,
  },
  // 第5列: 第五轮 (3-1 / 2-2 / 1-3) - 有晋级/淘汰名单
  {
    id: 5,
    name: '第五轮',
    records: [
      {
        record: '3-1',
        label: '3-1',
        matchCount: 0,
        type: 'promotion',
        slotIds: [],
      },
      {
        record: '2-2',
        label: '2-2',
        matchCount: 2,
        type: 'matches',
        slotIds: ['r5-2-2-1', 'r5-2-2-2'],
      },
      {
        record: '1-3',
        label: '1-3',
        matchCount: 0,
        type: 'elimination',
        slotIds: [],
      },
    ],
    hasPromotionList: true,
    hasEliminationList: true,
  },
  // 第6列: 最终结果 (3-2 / 2-3) - 只有晋级/淘汰名单
  {
    id: 6,
    name: '最终结果',
    records: [
      {
        record: '3-2',
        label: '3-2',
        matchCount: 0,
        type: 'promotion',
        slotIds: [],
      },
      {
        record: '2-3',
        label: '2-3',
        matchCount: 0,
        type: 'elimination',
        slotIds: [],
      },
    ],
    hasPromotionList: true,
    hasEliminationList: true,
  },
];

/**
 * 视图配置
 */
export const SWISS_VIEW_CONFIG = {
  bo1: {
    columns: [1, 2, 3, 4], // BO1显示第1-4列
    indicatorRatio: {
      bo1: 0.75, // 75%
      bo3: 0.25, // 25%
    },
  },
  bo3: {
    columns: [3, 4, 5, 6], // BO3显示第3-6列
    indicatorRatio: {
      bo1: 0.25, // 25%
      bo3: 0.75, // 75%
    },
  },
};

/**
 * 晋升关系映射
 * 定义从当前槽位晋升到下一个槽位的映射
 */
export const PROMOTION_PATHS: Record<string, string[]> = {
  // Round 1 -> Round 2
  'r1-0-0-1': ['r2-1-0-1'],
  'r1-0-0-2': ['r2-1-0-1'],
  'r1-0-0-3': ['r2-1-0-2'],
  'r1-0-0-4': ['r2-1-0-2'],
  'r1-0-0-5': ['r2-1-0-3'],
  'r1-0-0-6': ['r2-1-0-3'],
  'r1-0-0-7': ['r2-1-0-4'],
  'r1-0-0-8': ['r2-1-0-4'],
  
  // Round 1 -> Round 2 (loser)
  'r1-0-0-1-loser': ['r2-0-1-1'],
  'r1-0-0-2-loser': ['r2-0-1-1'],
  'r1-0-0-3-loser': ['r2-0-1-2'],
  'r1-0-0-4-loser': ['r2-0-1-2'],
  'r1-0-0-5-loser': ['r2-0-1-3'],
  'r1-0-0-6-loser': ['r2-0-1-3'],
  'r1-0-0-7-loser': ['r2-0-1-4'],
  'r1-0-0-8-loser': ['r2-0-1-4'],
  
  // Round 2 -> Round 3
  'r2-1-0-1': ['r3-2-0-1'],
  'r2-1-0-2': ['r3-2-0-1'],
  'r2-1-0-3': ['r3-2-0-2'],
  'r2-1-0-4': ['r3-2-0-2'],
  'r2-0-1-1': ['r3-1-1-1'],
  'r2-0-1-2': ['r3-1-1-2'],
  'r2-0-1-3': ['r3-1-1-3'],
  'r2-0-1-4': ['r3-1-1-4'],
  
  // Round 2 -> Round 3 (loser)
  'r2-1-0-1-loser': ['r3-1-1-1'],
  'r2-1-0-2-loser': ['r3-1-1-2'],
  'r2-1-0-3-loser': ['r3-1-1-3'],
  'r2-1-0-4-loser': ['r3-1-1-4'],
  'r2-0-1-1-loser': ['r3-0-2-1'],
  'r2-0-1-2-loser': ['r3-0-2-1'],
  'r2-0-1-3-loser': ['r3-0-2-2'],
  'r2-0-1-4-loser': ['r3-0-2-2'],
  
  // Round 3 -> Round 4
  'r3-2-0-1': ['promotion-3-0'],
  'r3-2-0-2': ['promotion-3-0'],
  'r3-1-1-1': ['r4-2-1-1'],
  'r3-1-1-2': ['r4-2-1-2'],
  'r3-1-1-3': ['r4-2-1-2'],
  'r3-1-1-4': ['r4-2-1-3'],
  
  // Round 3 -> Round 4 (loser)
  'r3-2-0-1-loser': ['r4-2-1-1'],
  'r3-2-0-2-loser': ['r4-2-1-2'],
  'r3-1-1-1-loser': ['r4-1-2-1'],
  'r3-1-1-2-loser': ['r4-1-2-2'],
  'r3-1-1-3-loser': ['r4-1-2-2'],
  'r3-1-1-4-loser': ['r4-1-2-3'],
  'r3-0-2-1': ['elimination-0-3'],
  'r3-0-2-2': ['elimination-0-3'],
  
  // Round 4 -> Round 5
  'r4-2-1-1': ['promotion-3-1'],
  'r4-2-1-2': ['promotion-3-1'],
  'r4-2-1-3': ['promotion-3-1'],
  'r4-1-2-1': ['r5-2-2-1'],
  'r4-1-2-2': ['r5-2-2-2'],
  'r4-1-2-3': ['r5-2-2-2'],
  
  // Round 4 -> Round 5 (loser)
  'r4-2-1-1-loser': ['r5-2-2-1'],
  'r4-2-1-2-loser': ['r5-2-2-1'],
  'r4-2-1-3-loser': ['r5-2-2-2'],
  'r4-1-2-1-loser': ['elimination-1-3'],
  'r4-1-2-2-loser': ['elimination-1-3'],
  'r4-1-2-3-loser': ['elimination-1-3'],
  
  // Round 5 -> Final
  'r5-2-2-1': ['promotion-3-2'],
  'r5-2-2-2': ['promotion-3-2'],
  
  // Round 5 -> Final (loser)
  'r5-2-2-1-loser': ['elimination-2-3'],
  'r5-2-2-2-loser': ['elimination-2-3'],
};

/**
 * 获取列配置
 */
export function getColumnConfig(columnId: number): SwissColumnConfig | undefined {
  return SWISS_COLUMNS.find(col => col.id === columnId);
}

/**
 * 获取战绩配置
 */
export function getRecordConfig(columnId: number, record: string): SwissRecordConfig | undefined {
  const column = getColumnConfig(columnId);
  return column?.records.find(r => r.record === record);
}

/**
 * 获取视图显示的列
 */
export function getViewColumns(view: 'bo1' | 'bo3'): number[] {
  return SWISS_VIEW_CONFIG[view].columns;
}

/**
 * 获取下划线指示器比例
 */
export function getIndicatorRatio(view: 'bo1' | 'bo3'): { bo1: number; bo3: number } {
  return SWISS_VIEW_CONFIG[view].indicatorRatio;
}
