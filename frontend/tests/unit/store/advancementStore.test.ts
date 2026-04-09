import { describe, it, expect, beforeEach } from 'vitest';
import { useAdvancementStore, calculateAdvancement } from '@/store/advancementStore';

const cleanup = () => {
  localStorage.clear();
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

      expect(state.advancement.top8).toEqual(['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8']);
      expect(state.advancement.eliminated).toEqual(['team9', 'team10', 'team11', 'team12', 'team13', 'team14', 'team15', 'team16']);
      expect(state.advancement.rankings).toHaveLength(16);
    });

    it('应该有 lastUpdated 时间戳', () => {
      const state = useAdvancementStore.getState();
      expect(state.lastUpdated).toBeDefined();
      expect(typeof state.lastUpdated).toBe('string');
    });
  });

  describe('setAdvancement', () => {
    it('应该能设置新的 advancement 数据', () => {
      const store = useAdvancementStore.getState();

      const newAdvancement = {
        top8: ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8'],
        eliminated: ['team9', 'team10', 'team11', 'team12', 'team13', 'team14', 'team15', 'team16'],
        rankings: [
          { teamId: 'team1', record: '3-0', rank: 1 },
          { teamId: 'team2', record: '3-0', rank: 2 },
        ],
      };

      store.setAdvancement(newAdvancement);

      const state = useAdvancementStore.getState();
      expect(state.advancement).toEqual(newAdvancement);
      expect(state.lastUpdated).toBeDefined();
    });
  });

  describe('getAllTeamIds', () => {
    it('应该返回所有队伍ID（top8 + eliminated）', () => {
      const store = useAdvancementStore.getState();

      const allIds = store.getAllTeamIds();

      expect(allIds).toContain('team1');
      expect(allIds).toContain('team2');
      expect(allIds).toContain('team8');
      expect(allIds).toContain('team9');
      expect(allIds).toContain('team16');
      expect(allIds.length).toBe(16);
    });
  });

  describe('restoreDefault', () => {
    it('应该恢复到默认数据', () => {
      const store = useAdvancementStore.getState();

      const newAdvancement = {
        top8: ['team9', 'team10', 'team11', 'team12', 'team13', 'team14', 'team15', 'team16'],
        eliminated: ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8'],
        rankings: [],
      };
      store.setAdvancement(newAdvancement);

      store.restoreDefault();

      const state = useAdvancementStore.getState();
      expect(state.advancement.top8).toEqual(['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8']);
      expect(state.advancement.eliminated).toEqual(['team9', 'team10', 'team11', 'team12', 'team13', 'team14', 'team15', 'team16']);
    });
  });

  describe('calculateAdvancement', () => {
    it('应该根据比赛结果正确计算晋级名单', () => {
      const matches = [
        { stage: 'swiss', status: 'finished', winnerId: 'team1', teamAId: 'team1', teamBId: 'team2' },
        { stage: 'swiss', status: 'finished', winnerId: 'team2', teamAId: 'team3', teamBId: 'team2' },
        { stage: 'swiss', status: 'finished', winnerId: 'team3', teamAId: 'team3', teamBId: 'team4' },
        { stage: 'swiss', status: 'finished', winnerId: 'team4', teamAId: 'team5', teamBId: 'team4' },
        { stage: 'swiss', status: 'finished', winnerId: 'team5', teamAId: 'team6', teamBId: 'team5' },
        { stage: 'swiss', status: 'finished', winnerId: 'team6', teamAId: 'team7', teamBId: 'team6' },
        { stage: 'swiss', status: 'finished', winnerId: 'team7', teamAId: 'team8', teamBId: 'team7' },
        { stage: 'swiss', status: 'finished', winnerId: 'team8', teamAId: 'team9', teamBId: 'team8' },
      ];

      const teams = [
        { id: 'team1' }, { id: 'team2' }, { id: 'team3' }, { id: 'team4' },
        { id: 'team5' }, { id: 'team6' }, { id: 'team7' }, { id: 'team8' },
        { id: 'team9' }, { id: 'team10' },
      ];

      const result = calculateAdvancement(matches, teams);

      expect(result.top8).toContain('team1');
      expect(result.top8).toContain('team8');
      expect(result.eliminated).toContain('team9');
      expect(result.rankings).toHaveLength(10);
    });

    it('应该正确排序：胜场多的在前，负场少的在前', () => {
      const matches = [
        { stage: 'swiss', status: 'finished', winnerId: 'team1', teamAId: 'team1', teamBId: 'team2' },
        { stage: 'swiss', status: 'finished', winnerId: 'team1', teamAId: 'team1', teamBId: 'team3' },
        { stage: 'swiss', status: 'finished', winnerId: 'team1', teamAId: 'team1', teamBId: 'team4' },
      ];

      const teams = [
        { id: 'team1' }, { id: 'team2' }, { id: 'team3' }, { id: 'team4' },
      ];

      const result = calculateAdvancement(matches, teams);

      expect(result.rankings[0].teamId).toBe('team1');
      expect(result.rankings[0].record).toBe('3-0');
    });

    it('应该忽略非瑞士轮比赛', () => {
      const matches = [
        { stage: 'elimination', status: 'finished', winnerId: 'team1', teamAId: 'team1', teamBId: 'team2' },
        { stage: 'swiss', status: 'finished', winnerId: 'team1', teamAId: 'team1', teamBId: 'team2' },
        { stage: 'swiss', status: 'finished', winnerId: 'team2', teamAId: 'team3', teamBId: 'team2' },
        { stage: 'swiss', status: 'finished', winnerId: 'team3', teamAId: 'team3', teamBId: 'team4' },
        { stage: 'swiss', status: 'finished', winnerId: 'team4', teamAId: 'team5', teamBId: 'team4' },
        { stage: 'swiss', status: 'finished', winnerId: 'team5', teamAId: 'team6', teamBId: 'team5' },
        { stage: 'swiss', status: 'finished', winnerId: 'team6', teamAId: 'team7', teamBId: 'team6' },
        { stage: 'swiss', status: 'finished', winnerId: 'team7', teamAId: 'team8', teamBId: 'team7' },
        { stage: 'swiss', status: 'finished', winnerId: 'team8', teamAId: 'team9', teamBId: 'team8' },
      ];

      const teams = [
        { id: 'team1' }, { id: 'team2' }, { id: 'team3' }, { id: 'team4' },
        { id: 'team5' }, { id: 'team6' }, { id: 'team7' }, { id: 'team8' },
        { id: 'team9' }, { id: 'team10' },
      ];

      const result = calculateAdvancement(matches, teams);

      expect(result.top8).toContain('team1');
      expect(result.eliminated).toContain('team9');
    });

    it('应该忽略未结束的比赛', () => {
      const matches = [
        { stage: 'swiss', status: 'ongoing', winnerId: null, teamAId: 'team1', teamBId: 'team2' },
        { stage: 'swiss', status: 'finished', winnerId: 'team1', teamAId: 'team1', teamBId: 'team2' },
        { stage: 'swiss', status: 'finished', winnerId: 'team2', teamAId: 'team3', teamBId: 'team2' },
        { stage: 'swiss', status: 'finished', winnerId: 'team3', teamAId: 'team3', teamBId: 'team4' },
        { stage: 'swiss', status: 'finished', winnerId: 'team4', teamAId: 'team5', teamBId: 'team4' },
        { stage: 'swiss', status: 'finished', winnerId: 'team5', teamAId: 'team6', teamBId: 'team5' },
        { stage: 'swiss', status: 'finished', winnerId: 'team6', teamAId: 'team7', teamBId: 'team6' },
        { stage: 'swiss', status: 'finished', winnerId: 'team7', teamAId: 'team8', teamBId: 'team7' },
        { stage: 'swiss', status: 'finished', winnerId: 'team8', teamAId: 'team9', teamBId: 'team8' },
      ];

      const teams = [
        { id: 'team1' }, { id: 'team2' }, { id: 'team3' }, { id: 'team4' },
        { id: 'team5' }, { id: 'team6' }, { id: 'team7' }, { id: 'team8' },
        { id: 'team9' }, { id: 'team10' },
      ];

      const result = calculateAdvancement(matches, teams);

      expect(result.top8).toContain('team1');
      expect(result.eliminated).toContain('team9');
    });
  });
});