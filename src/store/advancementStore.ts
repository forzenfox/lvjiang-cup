import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SwissAdvancementResult, AdvancementCategory } from '@/types';

interface AdvancementStore {
  // 当前生效的名单
  advancement: SwissAdvancementResult;

  // 元数据
  lastUpdated: string;
  updatedBy: string;

  // 操作方法
  setAdvancement: (data: SwissAdvancementResult, user: string) => void;
  moveTeam: (teamId: string, from: AdvancementCategory | null, to: AdvancementCategory) => void;
  reset: () => void;
  restoreDefault: () => void;
  getAllTeamIds: () => string[];
  getUnassignedTeams: (allTeamIds: string[]) => string[];
}

// 默认晋级名单（与 data.ts 中的 swissAdvancement 保持一致）
const defaultAdvancement: SwissAdvancementResult = {
  winners2_0: ['team1', 'team2'], // 驴酱 / IC
  winners2_1: ['team4', 'team8'], // 小熊 / 雨酱
  losersBracket: ['team3', 'team7'], // PLG / 69
  eliminated3rd: ['team5'], // 搓搓鸟
  eliminated0_3: ['team6'] // 100J
};

export const useAdvancementStore = create<AdvancementStore>()(
  persist(
    (set, get) => ({
      advancement: defaultAdvancement,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system',

      // 设置完整的晋级名单
      setAdvancement: (data, user) =>
        set({
          advancement: data,
          lastUpdated: new Date().toISOString(),
          updatedBy: user
        }),

      // 移动队伍从一个分类到另一个分类
      moveTeam: (teamId, from, to) => {
        const { advancement } = get();
        const newAdvancement = { ...advancement };

        // 从原分类移除（如果提供了from）
        if (from && newAdvancement[from].includes(teamId)) {
          newAdvancement[from] = newAdvancement[from].filter(id => id !== teamId);
        }

        // 检查是否已经在目标分类中
        if (!newAdvancement[to].includes(teamId)) {
          // 添加到新分类
          newAdvancement[to] = [...newAdvancement[to], teamId];
        }

        set({
          advancement: newAdvancement,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'admin'
        });
      },

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
                updatedBy: data.state.updatedBy || 'system'
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
          updatedBy: 'system'
        }),

      // 获取所有已分配的队��ID
      getAllTeamIds: () => {
        const { advancement } = get();
        return [
          ...advancement.winners2_0,
          ...advancement.winners2_1,
          ...advancement.losersBracket,
          ...advancement.eliminated3rd,
          ...advancement.eliminated0_3
        ];
      },

      // 获取未分配的队伍
      getUnassignedTeams: (allTeamIds: string[]) => {
        const assignedIds = get().getAllTeamIds();
        return allTeamIds.filter(id => !assignedIds.includes(id));
      }
    }),
    {
      name: 'advancement-storage',
      partialize: state => ({
        advancement: state.advancement,
        lastUpdated: state.lastUpdated,
        updatedBy: state.updatedBy
      })
    }
  )
);

// 分类配置信息（用于界面展示）
export const categoryConfig: Record<
  AdvancementCategory,
  { label: string; color: string; description: string }
> = {
  winners2_0: {
    label: '2-0 晋级（胜者组）',
    color: 'bg-green-500',
    description: '2胜0负直接晋级胜者组'
  },
  winners2_1: {
    label: '2-1 晋级（胜者组）',
    color: 'bg-green-400',
    description: '2胜1负晋级胜者组'
  },
  losersBracket: {
    label: '晋级败者组',
    color: 'bg-orange-500',
    description: '1胜2负但积分前2名，晋级败者组'
  },
  eliminated3rd: {
    label: '积分第三淘汰',
    color: 'bg-red-500',
    description: '1胜2负积分第3名，被淘汰'
  },
  eliminated0_3: {
    label: '0-3 淘汰',
    color: 'bg-red-600',
    description: '0胜3负直接淘汰'
  }
};

// 分类顺序（用于界面展示）
export const categoryOrder: AdvancementCategory[] = [
  'winners2_0',
  'winners2_1',
  'losersBracket',
  'eliminated3rd',
  'eliminated0_3'
];
