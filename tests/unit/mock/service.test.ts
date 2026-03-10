import { describe, it, expect, beforeEach } from 'vitest';
import { mockService } from '@/mock/service';
import { initialTeams, initialMatches, initialStreamInfo } from '@/mock/data';

describe('mockService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('resetAllData', () => {
    it('应该重置所有数据为初始值', async () => {
      await mockService.resetAllData();

      const teams = await mockService.getTeams();
      const matches = await mockService.getMatches();
      const streamInfo = await mockService.getStreamInfo();

      expect(teams).toHaveLength(initialTeams.length);
      expect(matches).toHaveLength(initialMatches.length);
      expect(streamInfo).toEqual(initialStreamInfo);
    });

    it('应该将数据保存到 localStorage', async () => {
      await mockService.resetAllData();

      expect(localStorage.getItem('teams')).toBeTruthy();
      expect(localStorage.getItem('matches')).toBeTruthy();
      expect(localStorage.getItem('streamInfo')).toBeTruthy();
    });

    it('应该清除 advancement-storage', async () => {
      // 先设置一些数据到 advancement-storage
      localStorage.setItem('advancement-storage', JSON.stringify({
        state: {
          advancement: { winners2_0: [], winners2_1: [], losersBracket: [], eliminated3rd: [], eliminated0_3: [] },
          lastUpdated: new Date().toISOString(),
          updatedBy: 'test'
        }
      }));

      await mockService.resetAllData();

      expect(localStorage.getItem('advancement-storage')).toBeNull();
    });
  });

  describe('clearAllData', () => {
    it('应该清空所有数据', async () => {
      await mockService.resetAllData();
      await mockService.clearAllData();

      const teams = await mockService.getTeams();
      const matches = await mockService.getMatches();

      expect(teams).toHaveLength(0);
      expect(matches).toHaveLength(0);
    });

    it('应该从 localStorage 中移除所有数据', async () => {
      await mockService.resetAllData();
      await mockService.clearAllData();

      expect(localStorage.getItem('teams')).toBeNull();
      expect(localStorage.getItem('matches')).toBeNull();
      expect(localStorage.getItem('streamInfo')).toBeNull();
    });
  });

  describe('loadFromStorage', () => {
    it('resetAllData 后数据应该保存到 localStorage', async () => {
      await mockService.resetAllData();

      const teams = await mockService.getTeams();
      const matches = await mockService.getMatches();

      expect(teams).toHaveLength(initialTeams.length);
      expect(matches).toHaveLength(initialMatches.length);

      // 验证 localStorage 中有数据
      expect(localStorage.getItem('teams')).toBeTruthy();
      expect(localStorage.getItem('matches')).toBeTruthy();
    });

    it('clearAllData 后 localStorage 应该被清空', async () => {
      await mockService.resetAllData();
      await mockService.clearAllData();

      // 验证 localStorage 被清空
      expect(localStorage.getItem('teams')).toBeNull();
      expect(localStorage.getItem('matches')).toBeNull();
      expect(localStorage.getItem('streamInfo')).toBeNull();
    });
  });
});
