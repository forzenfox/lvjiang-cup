import { Match } from '@/types';

// 画布尺寸
export const BOARD_WIDTH = 800;
export const BOARD_HEIGHT = 650;

// 比赛位置配置（8队单败赛制）
export const ELIMINATION_POSITIONS = {
  qf1: { x: 20, y: 30 },
  qf2: { x: 20, y: 190 },
  qf3: { x: 20, y: 350 },
  qf4: { x: 20, y: 510 },
  sf1: { x: 300, y: 110 },
  sf2: { x: 300, y: 430 },
  f: { x: 580, y: 270 },
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