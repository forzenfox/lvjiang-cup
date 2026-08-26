import type { GeneratedSlot } from './generator.registry';
import { EliminationStageConfig } from '../format.types';

/** 淘汰赛 bracket 枚举类型（受 matches 表 CHECK 约束限制） */
type EliminationBracket = 'quarterfinals' | 'semifinals' | 'finals';

/**
 * 淘汰赛 bracket 枚举映射（受 DB CHECK 约束限制）
 * - levels=1（2队）：仅决赛 finals
 * - levels=2（4队）：首轮 quarterfinals、次轮 finals
 * - levels=3（8队）：quarterfinals / semifinals / finals（与现状一致）
 * - levels=4（16队）：前三级 quarterfinals、末级 finals
 */
function resolveBracket(level: number, levels: number): EliminationBracket {
  if (level === levels - 1) {
    return 'finals';
  }
  if (levels === 3 && level === 1) {
    return 'semifinals';
  }
  return 'quarterfinals';
}

/**
 * 淘汰赛槽位生成器（纯函数）
 * - levels = log2(teamCount)；第 i 级场次 = teamCount / 2^(i+1)
 * - round 取 roundNames[i]，boFormat 取配置值
 * - eliminationGameNumber 全程连续编号 1..(teamCount-1)
 * - 槽位 id 按 elim-r{级}-{级内序号} 命名
 */
export function generateEliminationSlots(stage: EliminationStageConfig): GeneratedSlot[] {
  const { teamCount, roundNames, boFormat } = stage;
  const levels = Math.log2(teamCount);
  const slots: GeneratedSlot[] = [];
  let gameNumber = 0;

  for (let level = 0; level < levels; level++) {
    const count = teamCount / Math.pow(2, level + 1);
    for (let seq = 1; seq <= count; seq++) {
      gameNumber += 1;
      slots.push({
        id: `elim-r${level}-${seq}`,
        round: roundNames[level],
        stage: 'elimination',
        status: 'upcoming',
        eliminationBracket: resolveBracket(level, levels),
        eliminationGameNumber: gameNumber,
        boFormat,
      });
    }
  }

  return slots;
}
