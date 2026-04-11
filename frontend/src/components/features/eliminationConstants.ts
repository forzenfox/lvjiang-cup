import { Match } from '@/types';

// 画布尺寸 - 更紧凑的布局
export const BOARD_WIDTH = 900;
export const BOARD_HEIGHT = 450;

// 比赛位置配置（8队单败赛制）
// 官方UI布局：QF(左侧) -> SF(中间) -> F(右侧)
// 卡片高度73px，间距紧凑
export const ELIMINATION_POSITIONS = {
  // 四分之一决赛 - 左侧（4场比赛，垂直分布）
  qf1: { x: 20, y: 30 },
  qf2: { x: 20, y: 120 },
  qf3: { x: 20, y: 210 },
  qf4: { x: 20, y: 300 },
  // 半决赛 - 中间（2场比赛，位于QF中间位置）
  sf1: { x: 350, y: 75 },   // 在qf1和qf2中间
  sf2: { x: 350, y: 255 },  // 在qf3和qf4中间
  // 决赛 - 右侧（1场比赛，位于SF中间位置）
  f: { x: 680, y: 165 },    // 在sf1和sf2中间
};

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

// 游戏编号类型
type GameKey = 'qf1' | 'qf2' | 'qf3' | 'qf4' | 'sf1' | 'sf2' | 'f';

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
export const getPositionByGameKey = (key: GameKey) => {
  return ELIMINATION_POSITIONS[key];
};

// 获取所有游戏键
export const GAME_KEYS: GameKey[] = ['qf1', 'qf2', 'qf3', 'qf4', 'sf1', 'sf2', 'f'];

// BO5 赛制标识
export const ELIMINATION_BO_FORMAT = 'BO5';

// 阶段配置
export const ELIMINATION_STAGES = [
  { key: 'qf', name: '四分之一决赛', x: 20 },
  { key: 'sf', name: '半决赛', x: 350 },
  { key: 'f', name: '决赛', x: 680 },
] as const;
