/**
 * E2E 测试 - 比赛管理流程
 * 测试比赛的查询、更新、清空比分等完整流程
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import axios, { AxiosInstance } from 'axios';

// API 配置
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 测试账号
const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

// 比赛状态枚举
enum MatchStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  FINISHED = 'finished',
}

describe('E2E 测试 - 比赛管理流程', () => {
  let apiClient: AxiosInstance;
  let authClient: AxiosInstance;
  let authToken: string;

  beforeAll(async () => {
    // 创建基础客户端
    apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 登录获取 token
    const loginResponse = await apiClient.post('/admin/auth/login', VALID_CREDENTIALS);
    authToken = loginResponse.data.access_token;

    // 创建带认证的客户端
    authClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
  });

  describe('1. 获取比赛列表', () => {
    it('应该返回比赛列表（公开访问）', async () => {
      const response = await apiClient.get('/matches');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('应该返回正确的响应格式', async () => {
      const response = await apiClient.get('/matches');

      expect(response.status).toBe(200);
      if (response.data.length > 0) {
        const match = response.data[0];
        expect(match).toHaveProperty('id');
        expect(match).toHaveProperty('team_a_id');
        expect(match).toHaveProperty('team_b_id');
        expect(match).toHaveProperty('score_a');
        expect(match).toHaveProperty('score_b');
        expect(match).toHaveProperty('status');
        expect(match).toHaveProperty('stage');
      }
    });

    it('应该支持按阶段筛选', async () => {
      const response = await apiClient.get('/matches', {
        params: { stage: 'swiss' },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('应该支持按淘汰赛阶段筛选', async () => {
      const response = await apiClient.get('/matches', {
        params: { stage: 'elimination' },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('2. 获取单个比赛', () => {
    it('应该返回指定比赛的详情', async () => {
      // 先获取比赛列表
      const listResponse = await apiClient.get('/matches');
      
      if (listResponse.data.length === 0) {
        console.log('没有比赛数据，跳过单个比赛详情测试');
        return;
      }

      const matchId = listResponse.data[0].id;
      const response = await apiClient.get(`/matches/${matchId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', matchId);
      expect(response.data).toHaveProperty('team_a_id');
      expect(response.data).toHaveProperty('team_b_id');
    });

    it('应该返回404当比赛不存在', async () => {
      try {
        await apiClient.get('/matches/nonexistent-match-id-12345');
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(404);
      }
    });
  });

  describe('3. 更新比赛', () => {
    let testMatchId: string;

    beforeAll(async () => {
      // 获取一个测试用的比赛ID
      const listResponse = await apiClient.get('/matches');
      if (listResponse.data.length > 0) {
        testMatchId = listResponse.data[0].id;
      }
    });

    it('应该成功更新比赛比分', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过更新测试');
        return;
      }

      const updateData = {
        score_a: 2,
        score_b: 1,
        status: MatchStatus.FINISHED,
        winner_id: 'team-a-id',
      };

      const response = await authClient.put(`/admin/matches/${testMatchId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.score_a).toBe(updateData.score_a);
      expect(response.data.score_b).toBe(updateData.score_b);
      expect(response.data.status).toBe(updateData.status);
    });

    it('应该成功更新比赛状态', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过状态更新测试');
        return;
      }

      const updateData = {
        status: MatchStatus.ONGOING,
      };

      const response = await authClient.put(`/admin/matches/${testMatchId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.status).toBe(updateData.status);
    });

    it('应该成功更新比赛开始时间', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过时间更新测试');
        return;
      }

      const updateData = {
        start_time: new Date().toISOString(),
      };

      const response = await authClient.put(`/admin/matches/${testMatchId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.start_time).toBeDefined();
    });

    it('应该成功同时更新多个字段', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过多字段更新测试');
        return;
      }

      const updateData = {
        score_a: 3,
        score_b: 2,
        status: MatchStatus.FINISHED,
      };

      const response = await authClient.put(`/admin/matches/${testMatchId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.score_a).toBe(updateData.score_a);
      expect(response.data.score_b).toBe(updateData.score_b);
      expect(response.data.status).toBe(updateData.status);
    });

    it('应该拒绝未认证的更新请求', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过未认证测试');
        return;
      }

      try {
        await apiClient.put(`/admin/matches/${testMatchId}`, {
          score_a: 1,
          score_b: 1,
        });
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('应该返回404当更新不存在的比赛', async () => {
      try {
        await authClient.put('/admin/matches/nonexistent-match-id-12345', {
          score_a: 1,
          score_b: 1,
        });
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(404);
      }
    });

    it('应该处理空更新请求', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过空更新测试');
        return;
      }

      const response = await authClient.put(`/admin/matches/${testMatchId}`, {});

      expect(response.status).toBe(200);
      // 数据应该保持不变
      expect(response.data.id).toBe(testMatchId);
    });

    it('应该拒绝无效的比赛状态', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过无效状态测试');
        return;
      }

      try {
        await authClient.put(`/admin/matches/${testMatchId}`, {
          status: 'invalid_status',
        });
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('应该拒绝负数的比分', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过负数比分测试');
        return;
      }

      try {
        await authClient.put(`/admin/matches/${testMatchId}`, {
          score_a: -1,
          score_b: 0,
        });
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('4. 清空比赛比分', () => {
    let testMatchId: string;

    beforeAll(async () => {
      // 获取一个测试用的比赛ID
      const listResponse = await apiClient.get('/matches');
      if (listResponse.data.length > 0) {
        testMatchId = listResponse.data[0].id;
      }
    });

    beforeEach(async () => {
      // 为每个测试设置初始比分
      if (testMatchId) {
        await authClient.put(`/admin/matches/${testMatchId}`, {
          score_a: 2,
          score_b: 1,
          status: MatchStatus.FINISHED,
        });
      }
    });

    it('应该成功清空比赛比分', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过清空比分测试');
        return;
      }

      const response = await authClient.delete(`/admin/matches/${testMatchId}/scores`);

      expect(response.status).toBe(200);
      expect(response.data.score_a).toBe(0);
      expect(response.data.score_b).toBe(0);
      expect(response.data.winner_id).toBeNull();
    });

    it('应该拒绝未认证的清空请求', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过未认证清空测试');
        return;
      }

      try {
        await apiClient.delete(`/admin/matches/${testMatchId}/scores`);
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('应该返回404当清空不存在的比赛比分', async () => {
      try {
        await authClient.delete('/admin/matches/nonexistent-match-id-12345/scores');
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(404);
      }
    });
  });

  describe('5. 瑞士轮比赛查询', () => {
    it('应该返回瑞士轮比赛列表', async () => {
      const response = await apiClient.get('/matches', {
        params: { stage: 'swiss' },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      // 验证返回的比赛都是瑞士轮阶段
       
      response.data.forEach((match: { stage: string }) => {
        expect(match.stage).toBe('swiss');
      });
    });

    it('应该返回正确的瑞士轮数据结构', async () => {
      const response = await apiClient.get('/matches', {
        params: { stage: 'swiss' },
      });

      expect(response.status).toBe(200);

      if (response.data.length > 0) {
        const match = response.data[0];
        expect(match).toHaveProperty('swiss_record');
        expect(match).toHaveProperty('swiss_day');
        expect(match).toHaveProperty('round');
      }
    });
  });

  describe('6. 淘汰赛比赛查询', () => {
    it('应该返回淘汰赛比赛列表', async () => {
      const response = await apiClient.get('/matches', {
        params: { stage: 'elimination' },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      // 验证返回的比赛都是淘汰赛阶段
       
      response.data.forEach((match: { stage: string }) => {
        expect(match.stage).toBe('elimination');
      });
    });

    it('应该返回正确的淘汰赛数据结构', async () => {
      const response = await apiClient.get('/matches', {
        params: { stage: 'elimination' },
      });

      expect(response.status).toBe(200);

      if (response.data.length > 0) {
        const match = response.data[0];
        expect(match).toHaveProperty('elimination_bracket');
        expect(match).toHaveProperty('elimination_game_number');
      }
    });
  });

  describe('7. 完整比赛管理流程', () => {
    let testMatchId: string;

    beforeAll(async () => {
      // 获取一个测试用的比赛ID
      const listResponse = await apiClient.get('/matches');
      if (listResponse.data.length > 0) {
        testMatchId = listResponse.data[0].id;
      }
    });

    it('应该完成更新比分-清空比分的完整流程', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过完整流程测试');
        return;
      }

      // 1. 更新比分
      const updateResponse = await authClient.put(`/admin/matches/${testMatchId}`, {
        score_a: 2,
        score_b: 1,
        status: MatchStatus.FINISHED,
      });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.score_a).toBe(2);
      expect(updateResponse.data.score_b).toBe(1);

      // 2. 验证更新
      const getResponse = await apiClient.get(`/matches/${testMatchId}`);
      expect(getResponse.data.score_a).toBe(2);
      expect(getResponse.data.score_b).toBe(1);

      // 3. 清空比分
      const clearResponse = await authClient.delete(`/admin/matches/${testMatchId}/scores`);
      expect(clearResponse.status).toBe(200);
      expect(clearResponse.data.score_a).toBe(0);
      expect(clearResponse.data.score_b).toBe(0);

      // 4. 验证清空
      const verifyResponse = await apiClient.get(`/matches/${testMatchId}`);
      expect(verifyResponse.data.score_a).toBe(0);
      expect(verifyResponse.data.score_b).toBe(0);
    });
  });

  describe('8. 边界值测试', () => {
    let testMatchId: string;

    beforeAll(async () => {
      // 获取一个测试用的比赛ID
      const listResponse = await apiClient.get('/matches');
      if (listResponse.data.length > 0) {
        testMatchId = listResponse.data[0].id;
      }
    });

    it('应该处理超大比分', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过大比分测试');
        return;
      }

      try {
        const response = await authClient.put(`/admin/matches/${testMatchId}`, {
          score_a: 999,
          score_b: 999,
        });
        expect(response.status).toBe(200);
      } catch (error: unknown) {
        // 如果限制比分大小也是合理的
        const axiosError = error as { response?: { status: number } };
        expect([200, 400]).toContain(axiosError.response?.status || 200);
      }
    });

    it('应该处理零比分', async () => {
      if (!testMatchId) {
        console.log('没有比赛数据，跳过零比分测试');
        return;
      }

      const response = await authClient.put(`/admin/matches/${testMatchId}`, {
        score_a: 0,
        score_b: 0,
      });

      expect(response.status).toBe(200);
      expect(response.data.score_a).toBe(0);
      expect(response.data.score_b).toBe(0);
    });
  });

  describe('9. 性能测试', () => {
    it('获取比赛列表响应时间应该小于 1 秒', async () => {
      const startTime = Date.now();
      await apiClient.get('/matches');
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000);
    });

    it('获取瑞士轮比赛响应时间应该小于 1 秒', async () => {
      const startTime = Date.now();
      await apiClient.get('/matches', { params: { stage: 'swiss' } });
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000);
    });

    it('更新比赛响应时间应该小于 2 秒', async () => {
      const listResponse = await apiClient.get('/matches');
      if (listResponse.data.length === 0) {
        console.log('没有比赛数据，跳过更新性能测试');
        return;
      }

      const matchId = listResponse.data[0].id;
      const startTime = Date.now();
      await authClient.put(`/admin/matches/${matchId}`, {
        score_a: 1,
        score_b: 1,
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('10. 并发测试', () => {
    it('应该处理并发更新请求', async () => {
      const listResponse = await apiClient.get('/matches');
      if (listResponse.data.length === 0) {
        console.log('没有比赛数据，跳过并发测试');
        return;
      }

      const matchId = listResponse.data[0].id;

      // 发送多个并发更新请求
      const promises = Array(5).fill(null).map((_, i) =>
        authClient.put(`/admin/matches/${matchId}`, {
          score_a: i,
          score_b: i + 1,
        })
      );

      const responses = await Promise.all(promises);

      // 所有请求都应该成功
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
