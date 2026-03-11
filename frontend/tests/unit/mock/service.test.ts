import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockService } from '@/mock/service';
import { initialTeams, initialMatches, initialStreamInfo } from '@/mock/data';
import type { Team, Match, StreamInfo } from '@/types';

describe('mockService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Team APIs', () => {
    describe('getTeams', () => {
      it('应该返回战队列表', async () => {
        const teams = await mockService.getTeams();
        expect(Array.isArray(teams)).toBe(true);
        expect(teams.length).toBeGreaterThan(0);
      });

      it('应该返回新的数组引用', async () => {
        const teams1 = await mockService.getTeams();
        const teams2 = await mockService.getTeams();
        expect(teams1).not.toBe(teams2);
        expect(teams1).toEqual(teams2);
      });

      it('应该模拟延迟', async () => {
        const startTime = Date.now();
        await mockService.getTeams();
        const endTime = Date.now();
        expect(endTime - startTime).toBeGreaterThanOrEqual(400); // 约 500ms 延迟
      });
    });

    describe('addTeam', () => {
      it('应该添加新战队', async () => {
        const newTeam: Team = {
          id: 'test-team',
          name: 'Test Team',
          logo: 'test-logo.png',
          description: 'Test Description',
          players: []
        };

        const result = await mockService.addTeam(newTeam);
        expect(result).toEqual(newTeam);

        const teams = await mockService.getTeams();
        expect(teams).toContainEqual(newTeam);
      });

      it('应该将新战队保存到 localStorage', async () => {
        const newTeam: Team = {
          id: 'test-team-2',
          name: 'Test Team 2',
          logo: 'test-logo.png',
          description: 'Test',
          players: []
        };

        await mockService.addTeam(newTeam);
        const stored = localStorage.getItem('teams');
        expect(stored).toBeTruthy();
        const parsed = JSON.parse(stored!);
        expect(parsed).toContainEqual(newTeam);
      });

      it('应该模拟延迟', async () => {
        const newTeam: Team = {
          id: 'test-team-3',
          name: 'Test Team 3',
          logo: 'test-logo.png',
          description: 'Test',
          players: []
        };

        const startTime = Date.now();
        await mockService.addTeam(newTeam);
        const endTime = Date.now();
        expect(endTime - startTime).toBeGreaterThanOrEqual(400);
      });
    });

    describe('updateTeam', () => {
      it('应该更新战队信息', async () => {
        const teams = await mockService.getTeams();
        const teamToUpdate = { ...teams[0], name: 'Updated Name' };

        const result = await mockService.updateTeam(teamToUpdate);
        expect(result.name).toBe('Updated Name');

        const updatedTeams = await mockService.getTeams();
        const found = updatedTeams.find(t => t.id === teamToUpdate.id);
        expect(found?.name).toBe('Updated Name');
      });

      it('应该将更新保存到 localStorage', async () => {
        const teams = await mockService.getTeams();
        const teamToUpdate = { ...teams[0], name: 'Updated Name 2' };

        await mockService.updateTeam(teamToUpdate);
        const stored = localStorage.getItem('teams');
        const parsed = JSON.parse(stored!);
        const found = parsed.find((t: Team) => t.id === teamToUpdate.id);
        expect(found.name).toBe('Updated Name 2');
      });

      it('更新不存在的战队应该静默处理', async () => {
        const nonExistentTeam: Team = {
          id: 'non-existent',
          name: 'Non Existent',
          logo: '',
          description: '',
          players: []
        };

        const result = await mockService.updateTeam(nonExistentTeam);
        expect(result).toEqual(nonExistentTeam);
      });
    });

    describe('deleteTeam', () => {
      it('应该删除战队', async () => {
        const teams = await mockService.getTeams();
        const initialCount = teams.length;
        const teamToDelete = teams[0];

        await mockService.deleteTeam(teamToDelete.id);

        const remainingTeams = await mockService.getTeams();
        expect(remainingTeams.length).toBe(initialCount - 1);
        expect(remainingTeams.find(t => t.id === teamToDelete.id)).toBeUndefined();
      });

      it('应该更新 localStorage', async () => {
        const teams = await mockService.getTeams();
        const teamToDelete = teams[0];

        await mockService.deleteTeam(teamToDelete.id);

        const stored = localStorage.getItem('teams');
        const parsed = JSON.parse(stored!);
        expect(parsed.find((t: Team) => t.id === teamToDelete.id)).toBeUndefined();
      });

      it('删除不存在的战队应该静默处理', async () => {
        await expect(mockService.deleteTeam('non-existent')).resolves.not.toThrow();
      });
    });
  });

  describe('Match APIs', () => {
    describe('getMatches', () => {
      it('应该返回比赛列表', async () => {
        const matches = await mockService.getMatches();
        expect(Array.isArray(matches)).toBe(true);
        expect(matches.length).toBeGreaterThan(0);
      });

      it('应该 enrich 战队数据', async () => {
        // 先重置数据确保有战队数据
        await mockService.resetAllData();
        const matches = await mockService.getMatches();
        const matchWithTeams = matches.find(m => m.teamAId && m.teamBId);

        if (matchWithTeams) {
          // teamA 和 teamB 可能为 undefined（如果战队已被删除）
          // 但至少应该尝试 enrich
          expect(matchWithTeams).toHaveProperty('teamA');
          expect(matchWithTeams).toHaveProperty('teamB');
        }
      });

      it('应该返回新的数组引用', async () => {
        const matches1 = await mockService.getMatches();
        const matches2 = await mockService.getMatches();
        expect(matches1).not.toBe(matches2);
      });
    });

    describe('addMatch', () => {
      it('应该添加新比赛', async () => {
        const newMatch = {
          teamAId: 'team1',
          teamBId: 'team2',
          scoreA: 0,
          scoreB: 0,
          winnerId: null,
          round: 'Test Round',
          status: 'upcoming' as const,
          startTime: new Date().toISOString(),
          stage: 'swiss' as const,
        };

        const result = await mockService.addMatch(newMatch);
        expect(result.id).toBeDefined();
        expect(result.teamAId).toBe(newMatch.teamAId);
      });

      it('应该生成唯一 ID', async () => {
        const newMatch1 = {
          teamAId: 'team1',
          teamBId: 'team2',
          scoreA: 0,
          scoreB: 0,
          winnerId: null,
          round: 'Test Round 1',
          status: 'upcoming' as const,
          startTime: new Date().toISOString(),
          stage: 'swiss' as const,
        };

        const newMatch2 = {
          teamAId: 'team3',
          teamBId: 'team4',
          scoreA: 0,
          scoreB: 0,
          winnerId: null,
          round: 'Test Round 2',
          status: 'upcoming' as const,
          startTime: new Date().toISOString(),
          stage: 'swiss' as const,
        };

        const result1 = await mockService.addMatch(newMatch1);
        const result2 = await mockService.addMatch(newMatch2);

        expect(result1.id).not.toBe(result2.id);
      });
    });

    describe('updateMatch', () => {
      it('应该更新比赛信息', async () => {
        const matches = await mockService.getMatches();
        const matchToUpdate = { ...matches[0], scoreA: 2, scoreB: 1 };

        const result = await mockService.updateMatch(matchToUpdate);
        expect(result.scoreA).toBe(2);
        expect(result.scoreB).toBe(1);
      });
    });

    describe('deleteMatch', () => {
      it('应该删除比赛', async () => {
        const matches = await mockService.getMatches();
        const initialCount = matches.length;
        const matchToDelete = matches[0];

        await mockService.deleteMatch(matchToDelete.id);

        const remainingMatches = await mockService.getMatches();
        expect(remainingMatches.length).toBe(initialCount - 1);
      });
    });
  });

  describe('Stream APIs', () => {
    describe('getStreamInfo', () => {
      it('应该返回直播信息', async () => {
        const streamInfo = await mockService.getStreamInfo();
        expect(streamInfo).toHaveProperty('title');
        expect(streamInfo).toHaveProperty('url');
        expect(streamInfo).toHaveProperty('isLive');
      });

      it('应该返回新的对象引用', async () => {
        const info1 = await mockService.getStreamInfo();
        const info2 = await mockService.getStreamInfo();
        expect(info1).not.toBe(info2);
        expect(info1).toEqual(info2);
      });
    });

    describe('updateStreamInfo', () => {
      it('应该更新直播信息', async () => {
        const newInfo: StreamInfo = {
          title: 'New Title',
          url: 'https://example.com',
          isLive: true
        };

        const result = await mockService.updateStreamInfo(newInfo);
        expect(result).toEqual(newInfo);

        const stored = await mockService.getStreamInfo();
        expect(stored).toEqual(newInfo);
      });

      it('应该保存到 localStorage', async () => {
        const newInfo: StreamInfo = {
          title: 'Test Title',
          url: 'https://test.com',
          isLive: false
        };

        await mockService.updateStreamInfo(newInfo);
        const stored = localStorage.getItem('streamInfo');
        expect(stored).toBeTruthy();
        expect(JSON.parse(stored!)).toEqual(newInfo);
      });
    });
  });

  describe('resetAllData', () => {
    it('应该重置所有数据为初始值', async () => {
      // 先修改一些数据
      const teams = await mockService.getTeams();
      await mockService.deleteTeam(teams[0].id);

      // 重置数据
      await mockService.resetAllData();

      // 验证数据已恢复
      const restoredTeams = await mockService.getTeams();
      expect(restoredTeams.length).toBe(initialTeams.length);
    });

    it('应该清除 advancement-storage', async () => {
      localStorage.setItem('advancement-storage', JSON.stringify({ test: 'data' }));
      await mockService.resetAllData();
      expect(localStorage.getItem('advancement-storage')).toBeNull();
    });

    it('应该移除清空标志', async () => {
      localStorage.setItem('data_cleared', 'true');
      await mockService.resetAllData();
      expect(localStorage.getItem('data_cleared')).toBeNull();
    });

    it('应该将数据保存到 localStorage', async () => {
      await mockService.resetAllData();
      expect(localStorage.getItem('teams')).toBeTruthy();
      expect(localStorage.getItem('matches')).toBeTruthy();
      expect(localStorage.getItem('streamInfo')).toBeTruthy();
    });
  });

  describe('clearAllData', () => {
    it('应该清空所有数据', async () => {
      await mockService.clearAllData();

      const teams = await mockService.getTeams();
      const matches = await mockService.getMatches();

      expect(teams).toEqual([]);
      expect(matches).toEqual([]);
    });

    it('应该从 localStorage 移除数据', async () => {
      await mockService.clearAllData();

      expect(localStorage.getItem('teams')).toBeNull();
      expect(localStorage.getItem('matches')).toBeNull();
      expect(localStorage.getItem('streamInfo')).toBeNull();
    });

    it('应该设置清空标志', async () => {
      await mockService.clearAllData();
      expect(localStorage.getItem('data_cleared')).toBe('true');
    });
  });
});
