import { Match } from '@/types';

// 画布尺寸 - 使用百分比宽度，支持响应式
export const BOARD_WIDTH = '100%';
export const BOARD_MIN_WIDTH = 1200;
export const BOARD_HEIGHT = 700;

// 卡片尺寸配置 - 进一步增大尺寸
export const CARD_WIDTH = 320;
export const CARD_HEIGHT = 110; // 55px * 2
export const CARD_TIME_HEIGHT = 28; // 时间标签高度

/**
 * 计算淘汰赛布局位置（通用版本，技术设计方案 §7.4）
 * 采用多列均匀分布，垂直方向平均分布的算法
 * @param containerWidth 容器宽度
 * @param levels 层级数（= log2(teamCount)）
 * @param matchCountByLevel 各层级场次数（如 8 队为 [4, 2, 1]）
 * @returns 各比赛的坐标，key 为 `r{level}-{indexInLevel}`（与视图模型 game.key 一致）
 */
export const calculateEliminationPositions = (
  containerWidth: number = 1200,
  levels: number = 3,
  matchCountByLevel: number[] = [4, 2, 1]
): Record<string, { x: number; y: number }> => {
  // 计算每列的宽度（均匀分布）
  const colWidth = containerWidth / levels;

  // 计算每列的X坐标（列中心点）
  const getColX = (colIndex: number) => {
    return colIndex * colWidth + (colWidth - CARD_WIDTH) / 2;
  };

  // 垂直可用高度（减去顶部标题区域）
  const availableHeight = BOARD_HEIGHT - 120; // 120px 为顶部预留空间
  const topOffset = 70; // 顶部偏移量

  const positions: Record<string, { x: number; y: number }> = {};

  for (let level = 0; level < levels; level++) {
    const matchCount = matchCountByLevel[level] ?? 0;
    for (let indexInLevel = 1; indexInLevel <= matchCount; indexInLevel++) {
      // 垂直均布：每行高度 = availableHeight / matchCount，卡片在行内垂直居中
      const rowHeight = availableHeight / matchCount;
      positions[`r${level}-${indexInLevel}`] = {
        x: getColX(level),
        y:
          topOffset +
          rowHeight * (indexInLevel - 1) +
          (rowHeight - CARD_HEIGHT - CARD_TIME_HEIGHT) / 2,
      };
    }
  }

  return positions;
};

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
