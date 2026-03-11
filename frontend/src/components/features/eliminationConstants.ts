import { Match } from '@/types';

// 画布尺寸
export const BOARD_WIDTH = 1200;
export const BOARD_HEIGHT = 650;

// 比赛位置配置（固定坐标）
export const ELIMINATION_POSITIONS = {
  g1: { x: 20, y: 20 },
  g2: { x: 20, y: 160 },
  g3: { x: 20, y: 340 },
  g4: { x: 20, y: 480 },
  g5: { x: 300, y: 90 },
  g6: { x: 300, y: 410 },
  g7: { x: 580, y: 410 },
  g8: { x: 860, y: 250 },
};

// 连接线配置
export const ELIMINATION_CONNECTORS = [
  // G1 -> G5 (胜者路径)
  { from: 'g1' as const, to: 'g5' as const },
  // G2 -> G5 (胜者路径)
  { from: 'g2' as const, to: 'g5' as const },
  // G3 -> G6 (败者路径)
  { from: 'g3' as const, to: 'g6' as const },
  // G4 -> G6 (败者路径)
  { from: 'g4' as const, to: 'g6' as const },
  // G5 -> G8 (胜者组决赛)
  { from: 'g5' as const, to: 'g8' as const },
  // G6 -> G7 (败者组晋级)
  { from: 'g6' as const, to: 'g7' as const },
  // G7 -> G8 (总决赛)
  { from: 'g7' as const, to: 'g8' as const },
];

// 游戏编号类型
type GameKey = 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'g7' | 'g8';

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
  eliminationGameNumber: gameNum
});

// 根据比赛编号获取位置
export const getPositionByGameKey = (key: GameKey) => {
  return ELIMINATION_POSITIONS[key];
};

// 获取所有游戏键
export const GAME_KEYS: GameKey[] = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];
