import {
  FormatConfig,
  StageConfig,
  SwissStageConfig,
  EliminationStageConfig,
} from './format.types';

/** 解析战绩组键 'w-l' 为数值对 */
function parseRecord(key: string): [number, number] {
  const [wins, losses] = key.split('-').map(Number);
  return [wins, losses];
}

/** 校验瑞士轮 B 树结构合法性：推导过程中需比赛战绩组的队数必须为正偶数 */
function validateSwissStructure(stage: SwissStageConfig, prefix: string): string[] {
  const { teamCount, winThreshold, lossThreshold } = stage;
  const rounds = winThreshold + lossThreshold - 1;
  let recordMap = new Map<string, number>([['0-0', teamCount]]);

  for (let round = 1; round <= rounds; round++) {
    // 检查本轮需比赛战绩组的队数（奇数或负数非法；0 合法=无比赛）
    for (const [key, count] of recordMap) {
      const [wins, losses] = parseRecord(key);
      if (wins >= winThreshold || losses >= lossThreshold) {
        continue; // 已达阈值退场，不参与配对
      }
      if (count === 0) {
        continue; // 无队伍，无比赛
      }
      if (count < 0 || count % 2 !== 0) {
        return [
          `${prefix}结构不合法：第 ${round} 轮 ${key} 战绩组队伍数为 ${count}（奇数或负数），无法配对`,
        ];
      }
    }

    // 演进：胜者进 wins+1 组、败者进 losses+1 组；本组比赛完毕清零
    const nextMap = new Map<string, number>(recordMap);
    for (const [key, count] of recordMap) {
      const [wins, losses] = parseRecord(key);
      if (count > 0 && wins < winThreshold && losses < lossThreshold) {
        const matchCount = count / 2;
        const winnerKey = `${wins + 1}-${losses}`;
        const loserKey = `${wins}-${losses + 1}`;
        nextMap.set(winnerKey, (nextMap.get(winnerKey) || 0) + matchCount);
        nextMap.set(loserKey, (nextMap.get(loserKey) || 0) + matchCount);
        nextMap.set(key, 0);
      }
    }

    // 每轮结算后移除达阈值与已清空的组
    for (const [key, count] of [...nextMap.entries()]) {
      const [wins, losses] = parseRecord(key);
      if (wins >= winThreshold || losses >= lossThreshold || count === 0) {
        nextMap.delete(key);
      }
    }
    recordMap = nextMap;
  }

  return [];
}

/** 校验单个瑞士轮赛段配置 */
function validateSwissStage(stage: SwissStageConfig, prefix: string): string[] {
  const errors: string[] = [];
  const { teamCount, winThreshold, lossThreshold, boRule } = stage;

  if (teamCount % 2 !== 0 || teamCount < 4 || teamCount > 32) {
    errors.push(`${prefix}teamCount 必须为偶数且在 4~32 之间（当前 ${teamCount}）`);
  }
  if (winThreshold !== lossThreshold || ![2, 3].includes(winThreshold)) {
    errors.push(
      `${prefix}winThreshold 必须等于 lossThreshold 且取值为 2 或 3（当前 win=${winThreshold}, loss=${lossThreshold}）`,
    );
  }
  if (!['auto', 'all-bo1', 'all-bo3'].includes(boRule)) {
    errors.push(`${prefix}boRule 必须为 auto / all-bo1 / all-bo3（当前 ${boRule}）`);
  }

  // 数值合法时才做 B 树结构校验（避免非法输入导致推导异常）
  if (errors.length === 0) {
    errors.push(...validateSwissStructure(stage, prefix));
  }
  return errors;
}

/** 校验单个淘汰赛赛段配置 */
function validateEliminationStage(stage: EliminationStageConfig, prefix: string): string[] {
  const errors: string[] = [];
  const { teamCount, roundNames, boFormat } = stage;

  const isPowerOfTwo = teamCount >= 2 && Number.isInteger(Math.log2(teamCount));
  if (!isPowerOfTwo || teamCount > 32) {
    errors.push(`${prefix}teamCount 必须为 2 的幂且在 2~32 之间（当前 ${teamCount}）`);
  }
  if (isPowerOfTwo && roundNames.length !== Math.log2(teamCount)) {
    errors.push(
      `${prefix}roundNames 数量必须等于 log2(teamCount)=${Math.log2(teamCount)}（当前 ${roundNames.length} 个）`,
    );
  }
  if (!['BO1', 'BO3', 'BO5'].includes(boFormat)) {
    errors.push(`${prefix}boFormat 必须为 BO1 / BO3 / BO5（当前 ${boFormat}）`);
  }
  return errors;
}

/**
 * 校验赛制配置合法性（纯函数）
 * 返回错误列表；空数组表示合法。
 * 规则见技术方案 §3.4：
 * - 赛段序列非空；末段 advanceToStage=null；非末段 === 自身下标+1
 * - elimination 必须是最后一个赛段（终局）
 * - swiss：teamCount 偶数且 4~32；winThreshold=lossThreshold∈{2,3}；B 树结构合法
 * - elimination：teamCount 为 2 的幂且 2~32；roundNames 数量=log2(teamCount)；boFormat ∈ BO1/BO3/BO5
 * - 赛段衔接：后一赛段 teamCount ≤ 前一赛段晋级出口供给数（swiss 供给 = teamCount/2）
 */
export function validateFormat(format: FormatConfig): string[] {
  const errors: string[] = [];
  const stages: StageConfig[] = format?.stages ?? [];

  if (!Array.isArray(stages) || stages.length === 0) {
    return ['赛段列表（stages）不能为空'];
  }

  stages.forEach((stage, index) => {
    const prefix = `赛段 ${index}（${stage?.type ?? '未知类型'}）：`;

    // 赛段类型校验
    if (stage?.type !== 'swiss' && stage?.type !== 'elimination') {
      errors.push(`${prefix}未注册的赛段类型`);
      return;
    }

    // 晋级出口校验
    const isLast = index === stages.length - 1;
    if (isLast) {
      if (stage.advanceToStage !== null) {
        errors.push(`${prefix}作为末段，advanceToStage 必须为 null`);
      }
    } else if (stage.advanceToStage !== index + 1) {
      errors.push(`${prefix}非末段的 advanceToStage 必须等于 ${index + 1}`);
    }

    // elimination 必须是最后一个赛段（它是终局，冠军即结束）
    if (stage.type === 'elimination' && !isLast) {
      errors.push(`${prefix}elimination 赛段必须是最后一个赛段`);
    }

    // 分类型校验
    if (stage.type === 'swiss') {
      errors.push(...validateSwissStage(stage as SwissStageConfig, prefix));
    } else if (stage.type === 'elimination') {
      errors.push(...validateEliminationStage(stage as EliminationStageConfig, prefix));
    }
  });

  // 赛段衔接校验：后一赛段 teamCount ≤ 前一赛段晋级出口供给数
  for (let i = 0; i < stages.length - 1; i++) {
    const current = stages[i];
    const next = stages[i + 1];
    if (current?.type === 'swiss') {
      const supply = (current as SwissStageConfig).teamCount / 2;
      if (next?.teamCount > supply) {
        errors.push(
          `赛段衔接不合法：赛段 ${i + 1} 的 teamCount(${next.teamCount}) 超过赛段 ${i} 的晋级出口供给数(${supply})`,
        );
      }
    }
  }

  return errors;
}
