import type { BoFormat, EliminationStageConfig } from './types';

/** 淘汰赛层级（阶段）信息 */
export interface EliminationStageInfo {
  /** 层级 key：r{level} */
  key: string;
  /** 阶段名（roundNames[level]） */
  name: string;
  /** 列下标（= level） */
  colIndex: number;
  /** 该级场次数 */
  matchCount: number;
}

/** 淘汰赛单场比赛 */
export interface EliminationGame {
  /** 比赛 key：r{level}-{indexInLevel} */
  key: string;
  /** 全局连续编号（1..teamCount-1） */
  gameNumber: number;
  level: number;
  /** 级内序号（1 起） */
  indexInLevel: number;
}

/** 层级间连接线 */
export interface EliminationConnector {
  from: string;
  to: string;
}

/** 淘汰赛视图模型 */
export interface EliminationViewModel {
  levels: number;
  stages: EliminationStageInfo[];
  games: EliminationGame[];
  gameNumberToStage: Record<number, { level: number; indexInLevel: number; key: string }>;
  connectors: EliminationConnector[];
  boFormat: BoFormat;
}

/**
 * 构建淘汰赛视图模型（技术设计方案 §5.6 / §7.4）
 * levels = log2(teamCount)；比赛按级别顺序连续编号；
 * 连接线规则：第 i 级第 k 场 → 第 i+1 级第 ceil(k/2) 场
 */
export function buildEliminationStages(stage: EliminationStageConfig): EliminationViewModel {
  const { teamCount, roundNames, boFormat } = stage;
  const levels = Math.log2(teamCount);

  const stages: EliminationStageInfo[] = [];
  const games: EliminationGame[] = [];
  const gameNumberToStage: Record<number, { level: number; indexInLevel: number; key: string }> =
    {};

  let gameNumber = 0;
  for (let level = 0; level < levels; level++) {
    const matchCount = teamCount / Math.pow(2, level + 1);
    stages.push({
      key: `r${level}`,
      name: roundNames[level],
      colIndex: level,
      matchCount,
    });
    for (let indexInLevel = 1; indexInLevel <= matchCount; indexInLevel++) {
      gameNumber += 1;
      const key = `r${level}-${indexInLevel}`;
      games.push({ key, gameNumber, level, indexInLevel });
      gameNumberToStage[gameNumber] = { level, indexInLevel, key };
    }
  }

  // 连接线：第 i 级第 k 场 → 第 i+1 级第 ceil(k/2) 场（决赛无下游）
  const connectors: EliminationConnector[] = [];
  for (const game of games) {
    if (game.level === levels - 1) continue;
    connectors.push({
      from: game.key,
      to: `r${game.level + 1}-${Math.ceil(game.indexInLevel / 2)}`,
    });
  }

  return { levels, stages, games, gameNumberToStage, connectors, boFormat };
}
