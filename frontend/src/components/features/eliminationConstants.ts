import { Match } from '@/types';

// 画布尺寸 - 使用百分比宽度，支持响应式
export const BOARD_WIDTH = '100%';
export const BOARD_MIN_WIDTH = 1200;
export const BOARD_HEIGHT = 700;

// 卡片尺寸配置 - 进一步增大尺寸
export const CARD_WIDTH = 320;
export const CARD_HEIGHT = 110; // 55px * 2
export const CARD_TIME_HEIGHT = 28; // 时间标签高度

// 阶段配置 - 三列均匀分布
export const STAGE_CONFIG = {
  quarterfinals: {
    key: 'qf' as const,
    name: '四分之一决赛',
    matchCount: 4,
    colIndex: 0, // 第1列
  },
  semifinals: {
    key: 'sf' as const,
    name: '半决赛',
    matchCount: 2,
    colIndex: 1, // 第2列
  },
  finals: {
    key: 'f' as const,
    name: '决赛',
    matchCount: 1,
    colIndex: 2, // 第3列
  },
};

// 游戏编号类型
type GameKey = 'qf1' | 'qf2' | 'qf3' | 'qf4' | 'sf1' | 'sf2' | 'f';

/**
 * 计算淘汰赛布局位置
 * 采用三列均匀分布，垂直方向平均分布的算法
 * @param containerWidth 容器宽度
 * @returns 各比赛的位置坐标
 */
export const calculateEliminationPositions = (containerWidth: number = 1200) => {
  // 计算每列的宽度（均匀分布）
  const colWidth = containerWidth / 3;

  // 计算每列的X坐标（列中心点）
  const getColX = (colIndex: number) => {
    return colIndex * colWidth + (colWidth - CARD_WIDTH) / 2;
  };

  // 垂直可用高度（减去顶部标题区域）
  const availableHeight = BOARD_HEIGHT - 120; // 120px 为顶部预留空间
  const topOffset = 70; // 顶部偏移量

  // 计算每个阶段的位置
  const positions: Record<GameKey, { x: number; y: number }> = {
    // 四分之一决赛 - 4场比赛，垂直平均分布
    qf1: {
      x: getColX(0),
      y:
        topOffset +
        (availableHeight / 4) * 0 +
        (availableHeight / 4 - CARD_HEIGHT - CARD_TIME_HEIGHT) / 2,
    },
    qf2: {
      x: getColX(0),
      y:
        topOffset +
        (availableHeight / 4) * 1 +
        (availableHeight / 4 - CARD_HEIGHT - CARD_TIME_HEIGHT) / 2,
    },
    qf3: {
      x: getColX(0),
      y:
        topOffset +
        (availableHeight / 4) * 2 +
        (availableHeight / 4 - CARD_HEIGHT - CARD_TIME_HEIGHT) / 2,
    },
    qf4: {
      x: getColX(0),
      y:
        topOffset +
        (availableHeight / 4) * 3 +
        (availableHeight / 4 - CARD_HEIGHT - CARD_TIME_HEIGHT) / 2,
    },

    // 半决赛 - 2场比赛，垂直平均分布
    sf1: {
      x: getColX(1),
      y:
        topOffset +
        (availableHeight / 2) * 0 +
        (availableHeight / 2 - CARD_HEIGHT - CARD_TIME_HEIGHT) / 2,
    },
    sf2: {
      x: getColX(1),
      y:
        topOffset +
        (availableHeight / 2) * 1 +
        (availableHeight / 2 - CARD_HEIGHT - CARD_TIME_HEIGHT) / 2,
    },

    // 决赛 - 1场比赛，垂直居中
    f: { x: getColX(2), y: topOffset + (availableHeight - CARD_HEIGHT - CARD_TIME_HEIGHT) / 2 },
  };

  return positions;
};

// 默认位置配置（向后兼容）
export const ELIMINATION_POSITIONS = calculateEliminationPositions(1200);

// 连接线配置（单败赛制）
export const ELIMINATION_CONNECTORS = [
  // QF1 -> SF1
  { from: 'qf1' as const, to: 'sf1' as const },
  // QF2 -> SF1
  { from: 'qf2' as const, to: 'sf1' as const },
  // QF3 -> SF2
  { from: 'qf3' as const, to: 'sf2' as const },
  // QF4 -> SF2
  { from: 'qf4' as const, to: 'sf2' as const },
  // SF1 -> F
  { from: 'sf1' as const, to: 'f' as const },
  // SF2 -> F
  { from: 'sf2' as const, to: 'f' as const },
];

// 占位比赛数据生成
export const createPlaceholderMatch = (gameNum?: number): Match => ({
  id: `placeholder-${gameNum ?? 'na'}`,
  teamAId: '',
  teamBId: '',
  scoreA: 0,
  scoreB: 0,
  winnerId: null,
  round: '',
  status: 'upcoming',
  startTime: '',
  stage: 'elimination',
  eliminationGameNumber: gameNum,
  boFormat: 'BO5',
});

// 根据比赛编号获取位置
export const getPositionByGameKey = (key: GameKey, containerWidth?: number) => {
  const positions = containerWidth
    ? calculateEliminationPositions(containerWidth)
    : ELIMINATION_POSITIONS;
  return positions[key];
};

// 获取所有游戏键
export const GAME_KEYS: GameKey[] = ['qf1', 'qf2', 'qf3', 'qf4', 'sf1', 'sf2', 'f'];

// BO5 赛制标识
export const ELIMINATION_BO_FORMAT = 'BO5';

// 阶段配置 - 用于渲染阶段标签
export const ELIMINATION_STAGES = [
  { key: 'qf', name: '四分之一决赛', colIndex: 0 },
  { key: 'sf', name: '半决赛', colIndex: 1 },
  { key: 'f', name: '决赛', colIndex: 2 },
] as const;

// 游戏编号到阶段的映射
export const GAME_NUMBER_TO_STAGE: Record<number, { stage: string; index: number }> = {
  1: { stage: 'quarterfinals', index: 1 },
  2: { stage: 'quarterfinals', index: 2 },
  3: { stage: 'quarterfinals', index: 3 },
  4: { stage: 'quarterfinals', index: 4 },
  5: { stage: 'semifinals', index: 1 },
  6: { stage: 'semifinals', index: 2 },
  7: { stage: 'finals', index: 1 },
};
