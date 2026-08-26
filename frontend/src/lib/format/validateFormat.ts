import { deriveSwissRounds } from './buildSwissColumns';
import type { EliminationStageConfig, FormatConfig, StageConfig, SwissStageConfig } from './types';

/**
 * 校验赛制配置（技术设计方案 §3.4，规则与后端共用）
 * 返回错误消息数组；空数组表示配置合法
 */
export function validateFormat(format: FormatConfig): string[] {
  const stages = format?.stages;
  if (!Array.isArray(stages) || stages.length === 0) {
    return ['赛段序列不能为空'];
  }

  const errors: string[] = [];

  stages.forEach((stage, index) => {
    const label = `第 ${index + 1} 段（${stage?.name ?? '未命名'}）`;
    const isLast = index === stages.length - 1;

    // 出口校验：末段必须为 null，非末段必须指向下一段下标
    if (isLast) {
      if (stage.advanceToStage !== null) {
        errors.push(`${label}为末段，晋级出口必须为 null，当前为 ${stage.advanceToStage}`);
      }
    } else if (stage.advanceToStage !== index + 1) {
      errors.push(
        `${label}的晋级出口必须指向下一段（下标 ${index + 1}），当前为 ${stage.advanceToStage}`
      );
    }

    // 淘汰赛必须为末段
    if (stage?.type === 'elimination' && !isLast) {
      errors.push(`${label}为淘汰赛，必须为末段`);
    }

    // 赛段类型化校验
    if (stage?.type === 'swiss') {
      validateSwissStage(stage, label, errors);
    } else if (stage?.type === 'elimination') {
      validateEliminationStage(stage, label, errors);
    }

    // 赛段衔接：后段队伍数 ≤ 前段供给
    if (index > 0) {
      const supply = stageSupply(stages[index - 1]);
      if (supply !== null && stage.teamCount > supply) {
        errors.push(`${label}队伍数 ${stage.teamCount} 超出上一赛段可供给的 ${supply} 队`);
      }
    }
  });

  return errors;
}

/** 各赛段类型的晋级出口供给数：瑞士轮 = teamCount / 2，淘汰赛 = 1（冠军） */
function stageSupply(stage: StageConfig): number | null {
  if (!stage || typeof stage.teamCount !== 'number') return null;
  if (stage.type === 'swiss') return stage.teamCount / 2;
  return 1;
}

function validateSwissStage(stage: SwissStageConfig, label: string, errors: string[]): void {
  const { teamCount, winThreshold, lossThreshold } = stage;
  const baseErrorCount = errors.length;

  if (!Number.isInteger(teamCount) || teamCount < 4 || teamCount > 32 || teamCount % 2 !== 0) {
    errors.push(`${label}瑞士轮队伍数必须为偶数且在 4-32 之间，当前为 ${teamCount}`);
  }

  if (winThreshold !== lossThreshold || ![2, 3].includes(winThreshold)) {
    errors.push(
      `${label}瑞士轮晋级/淘汰阈值必须对称且属于 {2, 3}，当前为 ${winThreshold}-${lossThreshold}`
    );
  }

  // 基础字段非法时跳过 B 树推导（避免产生误导性的连锁错误）
  if (errors.length > baseErrorCount) return;

  // B 树结构合法性：需比赛战绩组的队数必须为正偶数（0 队 = 无比赛合法，奇数非法）
  for (const round of deriveSwissRounds(stage)) {
    for (const group of round.groups) {
      if (group.teamCount % 2 !== 0) {
        errors.push(
          `${label}第 ${round.round} 轮战绩组 ${group.record} 的队数为奇数（${group.teamCount}），无法配对`
        );
      }
    }
  }
}

function validateEliminationStage(
  stage: EliminationStageConfig,
  label: string,
  errors: string[]
): void {
  const { teamCount, roundNames } = stage;

  const isPowerOfTwo =
    Number.isInteger(teamCount) &&
    teamCount >= 2 &&
    teamCount <= 32 &&
    (teamCount & (teamCount - 1)) === 0;

  if (!isPowerOfTwo) {
    errors.push(`${label}淘汰赛队伍数必须为 2 的幂且在 2-32 之间，当前为 ${teamCount}`);
    return;
  }

  const expectedLevels = Math.log2(teamCount);
  if (!Array.isArray(roundNames) || roundNames.length !== expectedLevels) {
    errors.push(
      `${label}阶段名称数量必须等于 log2(队伍数) = ${expectedLevels}，当前为 ${roundNames?.length ?? 0}`
    );
  }
}
