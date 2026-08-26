import type {
  BoFormat,
  SwissBoRule,
  SwissColumnConfig,
  SwissRecordConfig,
  SwissStageConfig,
} from './types';

/** 战绩组推导信息（B 树节点） */
export interface SwissGroupInfo {
  /** 战绩，如 '2-1' */
  record: string;
  wins: number;
  losses: number;
  /** 组内队伍数 */
  teamCount: number;
}

/** 单轮推导结果 */
export interface SwissRoundInfo {
  /** 轮次（1 起） */
  round: number;
  /** 该轮需比赛的战绩组（按 wins 降序） */
  groups: SwissGroupInfo[];
  /** 该轮比赛结束后新产生的晋级组（按 wins 降序） */
  promotions: SwissGroupInfo[];
  /** 该轮比赛结束后新产生的淘汰组（按 wins 降序） */
  eliminations: SwissGroupInfo[];
}

/**
 * 瑞士轮 B 树结构推导（与后端算法同源，技术设计方案 §5.2）
 * 轮数 = winThreshold + lossThreshold - 1；
 * 每轮对需比赛组（未达阈值且队数 > 0）生成 队数/2 槽位；
 * 胜者进入 wins+1 组、败者进入 losses+1 组；达阈值组退场
 */
export function deriveSwissRounds(stage: SwissStageConfig): SwissRoundInfo[] {
  const { teamCount, winThreshold, lossThreshold } = stage;
  const totalRounds = winThreshold + lossThreshold - 1;

  // 当前存活（未退场）战绩组 → 队数
  let alive = new Map<string, number>([['0-0', teamCount]]);
  const rounds: SwissRoundInfo[] = [];

  for (let round = 1; round <= totalRounds; round++) {
    // 需比赛组：未达晋级/淘汰阈值且队数 > 0
    const groups: SwissGroupInfo[] = [];
    for (const [record, count] of alive) {
      const [wins, losses] = record.split('-').map(Number);
      if (wins < winThreshold && losses < lossThreshold && count > 0) {
        groups.push({ record, wins, losses, teamCount: count });
      }
    }
    groups.sort((a, b) => b.wins - a.wins);

    // 演进：胜者进 wins+1 组、败者进 losses+1 组
    const next = new Map(alive);
    for (const group of groups) {
      next.delete(group.record);
      const half = group.teamCount / 2;
      const winnerRecord = `${group.wins + 1}-${group.losses}`;
      const loserRecord = `${group.wins}-${group.losses + 1}`;
      next.set(winnerRecord, (next.get(winnerRecord) ?? 0) + half);
      next.set(loserRecord, (next.get(loserRecord) ?? 0) + half);
    }

    // 本轮新产生的晋级/淘汰组（达阈值的流入组）
    const promotions: SwissGroupInfo[] = [];
    const eliminations: SwissGroupInfo[] = [];
    for (const [record, count] of next) {
      const [wins, losses] = record.split('-').map(Number);
      if (wins >= winThreshold) {
        promotions.push({ record, wins, losses, teamCount: count });
      } else if (losses >= lossThreshold) {
        eliminations.push({ record, wins, losses, teamCount: count });
      }
    }
    promotions.sort((a, b) => b.wins - a.wins);
    eliminations.sort((a, b) => b.wins - a.wins);

    rounds.push({ round, groups, promotions, eliminations });

    // 达阈值组退场，仅保留下一轮仍存活的组
    alive = new Map();
    for (const [record, count] of next) {
      const [wins, losses] = record.split('-').map(Number);
      if (wins < winThreshold && losses < lossThreshold && count > 0) {
        alive.set(record, count);
      }
    }
  }

  return rounds;
}

/**
 * 解析战绩组的 BO 格式（PRD 2.2.1 / 技术设计方案 §5.2）
 * auto 规则：该组比赛的胜者将达晋级阈值或败者将达淘汰阈值 → BO3（决定性比赛），否则 BO1
 */
export function resolveBo(
  record: string,
  winThreshold: number,
  lossThreshold: number,
  boRule: SwissBoRule
): BoFormat {
  if (boRule === 'all-bo1') return 'BO1';
  if (boRule === 'all-bo3') return 'BO3';
  const [wins, losses] = record.split('-').map(Number);
  const decisive = wins + 1 >= winThreshold || losses + 1 >= lossThreshold;
  return decisive ? 'BO3' : 'BO1';
}

/** 第 1-5 轮的中文列名，超出后使用数字列名 */
const CHINESE_ROUND_NAMES = ['第一轮', '第二轮', '第三轮', '第四轮', '第五轮'];

function roundColumnName(round: number): string {
  return CHINESE_ROUND_NAMES[round - 1] ?? `第${round}轮`;
}

/** 生成槽位 id：r{轮}-{战绩}-{序号}（序号从 1 起） */
function slotIdsFor(round: number, record: string, matchCount: number): string[] {
  return Array.from({ length: matchCount }, (_, i) => `r${round}-${record}-${i + 1}`);
}

function toRecordConfig(
  round: number,
  group: SwissGroupInfo,
  type: 'matches' | 'promotion' | 'elimination'
): SwissRecordConfig {
  const matchCount = type === 'matches' ? group.teamCount / 2 : 0;
  return {
    record: group.record,
    label: group.record,
    matchCount,
    type,
    slotIds: type === 'matches' ? slotIdsFor(round, group.record, matchCount) : [],
  };
}

/**
 * 构建瑞士轮树形视图模型（技术设计方案 §5.6）
 * 列结构：第 r 列 = 第 r-1 轮产生的晋级组 + 第 r 轮比赛组 + 第 r-1 轮产生的淘汰组；
 * 追加"最终结果"列（仅含第 R 轮产生的晋级 + 淘汰组）
 * 输出与 constants/swissTreeConfig.ts 的 SwissColumnConfig 同构，视觉组件可零改造接入
 */
export function buildSwissColumns(stage: SwissStageConfig): SwissColumnConfig[] {
  const rounds = deriveSwissRounds(stage);
  const columns: SwissColumnConfig[] = [];

  rounds.forEach((roundInfo, index) => {
    const previous = index > 0 ? rounds[index - 1] : null;
    const records: SwissRecordConfig[] = [
      ...(previous?.promotions ?? []).map(g => toRecordConfig(roundInfo.round, g, 'promotion')),
      ...roundInfo.groups.map(g => toRecordConfig(roundInfo.round, g, 'matches')),
      ...(previous?.eliminations ?? []).map(g => toRecordConfig(roundInfo.round, g, 'elimination')),
    ];
    columns.push({
      id: roundInfo.round,
      name: roundColumnName(roundInfo.round),
      records,
      hasPromotionList: records.some(r => r.type === 'promotion'),
      hasEliminationList: records.some(r => r.type === 'elimination'),
    });
  });

  // 最终结果列：第 R 轮产生的晋级 + 淘汰组
  const lastRound = rounds[rounds.length - 1];
  const finalRecords: SwissRecordConfig[] = [
    ...lastRound.promotions.map(g => toRecordConfig(lastRound.round, g, 'promotion')),
    ...lastRound.eliminations.map(g => toRecordConfig(lastRound.round, g, 'elimination')),
  ];
  columns.push({
    id: rounds.length + 1,
    name: '最终结果',
    records: finalRecords,
    hasPromotionList: finalRecords.some(r => r.type === 'promotion'),
    hasEliminationList: finalRecords.some(r => r.type === 'elimination'),
  });

  return columns;
}
