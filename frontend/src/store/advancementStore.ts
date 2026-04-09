import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SwissAdvancementResult } from '@/types';

interface AdvancementStore {
  // 当前生效的名单
  advancement: SwissAdvancementResult;

  // 元数据
  lastUpdated: string;

  // 操作方法
  setAdvancement: (data: SwissAdvancementResult) => void;
  reset: () => void;
  restoreDefault: () => void;
  getAllTeamIds: () => string[];
}

// 默认晋级名单（16队，前8名晋级）
const defaultAdvancement: SwissAdvancementResult = {
  top8: ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8'],
  eliminated: ['team9', 'team10', 'team11', 'team12', 'team13', 'team14', 'team15', 'team16'],
  rankings: [
    { teamId: 'team1', record: '3-0', rank: 1 },
    { teamId: 'team2', record: '3-0', rank: 2 },
    { teamId: 'team3', record: '2-1', rank: 3 },
    { teamId: 'team4', record: '2-1', rank: 4 },
    { teamId: 'team5', record: '2-1', rank: 5 },
    { teamId: 'team6', record: '2-1', rank: 6 },
    { teamId: 'team7', record: '1-2', rank: 7 },
    { teamId: 'team8', record: '1-2', rank: 8 },
    { teamId: 'team9', record: '1-2', rank: 9 },
    { teamId: 'team10', record: '0-3', rank: 10 },
    { teamId: 'team11', record: '0-3', rank: 11 },
    { teamId: 'team12', record: '0-3', rank: 12 },
    { teamId: 'team13', record: '0-3', rank: 13 },
    { teamId: 'team14', record: '0-3', rank: 14 },
    { teamId: 'team15', record: '0-3', rank: 15 },
    { teamId: 'team16', record: '0-3', rank: 16 },
  ],
};

export const useAdvancementStore = create<AdvancementStore>()(
  persist(
    (set, get) => ({
      advancement: defaultAdvancement,
      lastUpdated: new Date().toISOString(),

      // 设置完整的晋级名单
      setAdvancement: (data) =>
        set({
          advancement: data,
          lastUpdated: new Date().toISOString(),
        }),

      // 重置到上次保存的状态（从 localStorage 重新加载）
      reset: () => {
        const persisted = localStorage.getItem('advancement-storage');
        if (persisted) {
          try {
            const data = JSON.parse(persisted);
            if (data.state) {
              set({
                advancement: data.state.advancement || defaultAdvancement,
                lastUpdated: data.state.lastUpdated || new Date().toISOString(),
              });
            }
          } catch (e) {
            console.error('Failed to parse advancement storage:', e);
          }
        }
      },

      // 恢复到默认数据
      restoreDefault: () =>
        set({
          advancement: defaultAdvancement,
          lastUpdated: new Date().toISOString(),
        }),

      // 获取所有队伍ID（top8 + eliminated）
      getAllTeamIds: () => {
        const { advancement } = get();
        return [...advancement.top8, ...advancement.eliminated];
      },
    }),
    {
      name: 'advancement-storage',
      partialize: state => ({
        advancement: state.advancement,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

/**
 * 根据比赛结果自动计算晋级名单
 * @param matches - 所有比赛数组
 * @param teams - 所有队伍数组
 * @returns 晋级结果（top8和eliminated）
 */
export function calculateAdvancement(
  matches: { stage: string; status: string; winnerId: string | null; teamAId: string; teamBId: string }[],
  teams: { id: string }[]
): SwissAdvancementResult {
  const teamRecords = new Map<string, { wins: number; losses: number }>();

  // 初始化所有队伍的战绩
  teams.forEach(team => {
    teamRecords.set(team.id, { wins: 0, losses: 0 });
  });

  // 遍历所有瑞士轮比赛，统计每支队伍的战绩
  matches
    .filter(m => m.stage === 'swiss' && m.status === 'finished' && m.winnerId)
    .forEach(match => {
      const winnerId = match.winnerId!;
      const loserId = match.teamAId === winnerId ? match.teamBId : match.teamAId;

      // 更新胜者战绩
      const winnerRecord = teamRecords.get(winnerId)!;
      teamRecords.set(winnerId, { wins: winnerRecord.wins + 1, losses: winnerRecord.losses });

      // 更新败者战绩
      const loserRecord = teamRecords.get(loserId)!;
      teamRecords.set(loserId, { wins: loserRecord.wins, losses: loserRecord.losses + 1 });
    });

  // 按战绩排序
  const sortedTeams = [...teamRecords.entries()]
    .map(([teamId, record]) => ({ teamId, record: `${record.wins}-${record.losses}` }))
    .sort((a, b) => {
      const [aWins, aLosses] = a.record.split('-').map(Number);
      const [bWins, bLosses] = b.record.split('-').map(Number);
      if (aWins !== bWins) return bWins - aWins;
      return bLosses - aLosses;
    });

  return {
    top8: sortedTeams.slice(0, 8).map(t => t.teamId),
    eliminated: sortedTeams.slice(8).map(t => t.teamId),
    rankings: sortedTeams.map((t, index) => ({ ...t, rank: index + 1 })),
  };
}
