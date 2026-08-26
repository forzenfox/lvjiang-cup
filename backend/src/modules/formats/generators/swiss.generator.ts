import type { GeneratedSlot } from './generator.registry';
import { BoFormat, SwissBoRule, SwissStageConfig } from '../format.types';

/**
 * 解析单场比赛的 BO 格式（决定性比赛判定）
 * - all-bo1 / all-bo3：整体覆盖
 * - auto：该场胜者将达晋级阈值、或败者将达淘汰阈值时为 BO3，否则 BO1
 */
export function resolveBo(
  record: string,
  winThreshold: number,
  lossThreshold: number,
  boRule: SwissBoRule,
): BoFormat {
  if (boRule === 'all-bo1') {
    return 'BO1';
  }
  if (boRule === 'all-bo3') {
    return 'BO3';
  }
  const [wins, losses] = record.split('-').map(Number);
  const decisive = wins + 1 >= winThreshold || losses + 1 >= lossThreshold;
  return decisive ? 'BO3' : 'BO1';
}

/** 解析战绩组键 'w-l' 为数值对 */
function parseRecord(key: string): [number, number] {
  const [wins, losses] = key.split('-').map(Number);
  return [wins, losses];
}

/**
 * 瑞士轮槽位生成器（纯函数）
 *
 * 按瑞士轮 B 树结构推导：
 * 1. 轮次数 = winThreshold + lossThreshold - 1
 * 2. 每轮对"需比赛"战绩组（wins<晋级阈值 且 losses<淘汰阈值 且 队数>0）
 *    生成 队数/2 个槽位；胜者进 (wins+1)-losses 组、败者进 wins-(losses+1) 组
 * 3. 达阈值（晋级/淘汰）的队伍在每轮结算后退场，不再参与后续配对
 * 4. 每轮内战绩组按 wins 降序排列（如 R3: 2-0, 1-1, 0-2）
 */
export function generateSwissSlots(stage: SwissStageConfig): GeneratedSlot[] {
  const { teamCount, winThreshold, lossThreshold, boRule } = stage;
  const rounds = winThreshold + lossThreshold - 1;
  const slots: GeneratedSlot[] = [];

  // 战绩组 → 队数（初始全员 0-0）
  let recordMap = new Map<string, number>([['0-0', teamCount]]);

  for (let round = 1; round <= rounds; round++) {
    // 筛选本轮需比赛的战绩组，并按 wins 降序排列
    const activeGroups = [...recordMap.entries()]
      .filter(([key, count]) => {
        const [wins, losses] = parseRecord(key);
        return count > 0 && wins < winThreshold && losses < lossThreshold;
      })
      .sort((a, b) => parseRecord(b[0])[0] - parseRecord(a[0])[0]);

    const nextMap = new Map<string, number>(recordMap);
    let seq = 0; // 轮内连续编号（从 1 开始）

    for (const [key, count] of activeGroups) {
      const [wins, losses] = parseRecord(key);
      const matchCount = count / 2;
      const boFormat = resolveBo(key, winThreshold, lossThreshold, boRule);

      for (let i = 0; i < matchCount; i++) {
        seq += 1;
        slots.push({
          id: `swiss-r${round}-${seq}`,
          round: `Round ${round}`,
          stage: 'swiss',
          status: 'upcoming',
          swissRecord: key,
          swissRound: round,
          boFormat,
        });
      }

      // 演进：胜者进胜场+1 组，败者进负场+1 组；本组全部比赛完毕清零
      const winnerKey = `${wins + 1}-${losses}`;
      const loserKey = `${wins}-${losses + 1}`;
      nextMap.set(winnerKey, (nextMap.get(winnerKey) || 0) + matchCount);
      nextMap.set(loserKey, (nextMap.get(loserKey) || 0) + matchCount);
      nextMap.set(key, 0);
    }

    // 每轮结算后移除达阈值（晋级/淘汰退场）与已清空的组
    for (const [key, count] of [...nextMap.entries()]) {
      const [wins, losses] = parseRecord(key);
      const reachedThreshold = wins >= winThreshold || losses >= lossThreshold;
      if (reachedThreshold || count === 0) {
        nextMap.delete(key);
      }
    }
    recordMap = nextMap;
  }

  return slots;
}
