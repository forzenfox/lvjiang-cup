import { describe, it, expect, beforeEach } from 'vitest';
import { useAdvancementStore, categoryConfig, categoryOrder } from '../advancementStore';
import type { SwissAdvancementResult } from '@/types';

// 清理 localStorage 和 store 状态
const cleanup = () => {
  localStorage.clear();
  // 重置 store 到初始状态
  const store = useAdvancementStore.getState();
  store.restoreDefault();
};

describe('advancementStore', () => {
  beforeEach(() => {
    cleanup();
  });

  describe('初始状态', () => {
    it('应该有正确的初始 advancement 数据', () => {
      const state = useAdvancementStore.getState();

      expect(state.advancement.winners2_0).toEqual(['team1', 'team2']);
      expect(state.advancement.winners2_1).toEqual(['team4', 'team8']);
      expect(state.advancement.losersBracket).toEqual(['team3', 'team7']);
      expect(state.advancement.eliminated3rd).toEqual(['team5']);
      expect(state.advancement.eliminated0_3).toEqual(['team6']);
    });

    it('应该有正确的初始元数据', () => {
      const state = useAdvancementStore.getState();

      expect(state.updatedBy).toBe('system');
      expect(state.lastUpdated).toBeDefined();
    });
  });

  describe('setAdvancement', () => {
    it('应该能设置新的 advancement 数据', () => {
      const store = useAdvancementStore.getState();

      const newAdvancement: SwissAdvancementResult = {
        winners2_0: ['team1'],
        winners2_1: ['team2', 'team4'],
        losersBracket: ['team3', 'team7', 'team8'],
        eliminated3rd: ['team5'],
        eliminated0_3: ['team6']
      };

      store.setAdvancement(newAdvancement, 'admin');

      const state = useAdvancementStore.getState();
      expect(state.advancement).toEqual(newAdvancement);
      expect(state.updatedBy).toBe('admin');
      expect(state.lastUpdated).toBeDefined();
    });
  });

  describe('moveTeam', () => {
    it('应该能将队伍从一个分类移动到另一个分类', () => {
      const store = useAdvancementStore.getState();

      // 将 team1 从 winners2_0 移动到 winners2_1
      store.moveTeam('team1', 'winners2_0', 'winners2_1');

      const state = useAdvancementStore.getState();
      expect(state.advancement.winners2_0).not.toContain('team1');
      expect(state.advancement.winners2_1).toContain('team1');
      expect(state.updatedBy).toBe('admin');
    });

    it('应该能添加新队伍到分类', () => {
      const store = useAdvancementStore.getState();

      // 假设有一个未分配的队伍
      store.moveTeam('team9', null, 'winners2_0');

      const state = useAdvancementStore.getState();
      expect(state.advancement.winners2_0).toContain('team9');
    });

    it('不应该重复添加已存在的队伍', () => {
      const store = useAdvancementStore.getState();

      // team1 已经在 winners2_0 中
      const originalLength = store.advancement.winners2_0.length;
      store.moveTeam('team1', null, 'winners2_0');

      const state = useAdvancementStore.getState();
      expect(state.advancement.winners2_0.length).toBe(originalLength);
    });
  });

  describe('getAllTeamIds', () => {
    it('应该返回所有已分配的队伍ID', () => {
      const store = useAdvancementStore.getState();

      const allIds = store.getAllTeamIds();

      expect(allIds).toContain('team1');
      expect(allIds).toContain('team2');
      expect(allIds).toContain('team3');
      expect(allIds).toContain('team4');
      expect(allIds).toContain('team5');
      expect(allIds).toContain('team6');
      expect(allIds).toContain('team7');
      expect(allIds).toContain('team8');
      expect(allIds.length).toBe(8);
    });
  });

  describe('getUnassignedTeams', () => {
    it('应该返回未分配的队伍', () => {
      const store = useAdvancementStore.getState();

      const allTeamIds = ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8', 'team9'];
      const unassigned = store.getUnassignedTeams(allTeamIds);

      expect(unassigned).toEqual(['team9']);
    });

    it('当所有队伍都已分配时应该返回空数组', () => {
      const store = useAdvancementStore.getState();

      const allTeamIds = ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8'];
      const unassigned = store.getUnassignedTeams(allTeamIds);

      expect(unassigned).toEqual([]);
    });
  });

  describe('restoreDefault', () => {
    it('应该恢复到默认数据', () => {
      const store = useAdvancementStore.getState();

      // 先修改数据
      store.moveTeam('team1', 'winners2_0', 'winners2_1');

      // 恢复默认
      store.restoreDefault();

      const state = useAdvancementStore.getState();
      expect(state.advancement.winners2_0).toEqual(['team1', 'team2']);
      expect(state.advancement.winners2_1).toEqual(['team4', 'team8']);
      expect(state.updatedBy).toBe('system');
    });
  });

  describe('categoryConfig', () => {
    it('应该有正确的分类配置', () => {
      expect(categoryConfig.winners2_0.label).toBe('2-0 晋级（胜者组）');
      expect(categoryConfig.winners2_0.color).toBe('bg-green-500');

      expect(categoryConfig.winners2_1.label).toBe('2-1 晋级（胜者组）');
      expect(categoryConfig.winners2_1.color).toBe('bg-green-400');

      expect(categoryConfig.losersBracket.label).toBe('晋级败者组');
      expect(categoryConfig.losersBracket.color).toBe('bg-orange-500');

      expect(categoryConfig.eliminated3rd.label).toBe('积分第三淘汰');
      expect(categoryConfig.eliminated3rd.color).toBe('bg-red-500');

      expect(categoryConfig.eliminated0_3.label).toBe('0-3 淘汰');
      expect(categoryConfig.eliminated0_3.color).toBe('bg-red-600');
    });
  });

  describe('categoryOrder', () => {
    it('应该有正确的分类顺序', () => {
      expect(categoryOrder).toEqual([
        'winners2_0',
        'winners2_1',
        'losersBracket',
        'eliminated3rd',
        'eliminated0_3'
      ]);
    });
  });
});
