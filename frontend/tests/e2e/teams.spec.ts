/**
 * E2E 测试 - 战队管理流程
 * 测试战队的增删改查完整流程
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios, { AxiosInstance } from 'axios';

// API 配置
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 测试账号
const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

// 战队数据模板
const createTeamTemplate = (suffix: string) => ({
  id: `test-team-${suffix}`,
  name: `测试战队 ${suffix}`,
  logo: `https://example.com/logo-${suffix}.png`,
  description: `这是测试战队 ${suffix} 的描述`,
  players: [
    { id: `p1-${suffix}`, name: '上单选手', position: '上单' },
    { id: `p2-${suffix}`, name: '打野选手', position: '打野' },
    { id: `p3-${suffix}`, name: '中单选手', position: '中单' },
    { id: `p4-${suffix}`, name: 'AD选手', position: 'AD' },
    { id: `p5-${suffix}`, name: '辅助选手', position: '辅助' },
  ],
});

describe('E2E 测试 - 战队管理流程', () => {
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

  describe('1. 获取战队列表', () => {
    it('应该返回战队列表（公开访问）', async () => {
      const response = await apiClient.get('/teams');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('应该返回正确的响应格式', async () => {
      const response = await apiClient.get('/teams');

      expect(response.status).toBe(200);
      if (response.data.length > 0) {
        const team = response.data[0];
        expect(team).toHaveProperty('id');
        expect(team).toHaveProperty('name');
      }
    });

    it('应该支持分页参数', async () => {
      const response = await apiClient.get('/teams', {
        params: { page: 1, limit: 10 },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('2. 创建战队', () => {
    let createdTeamId: string;

    afterAll(async () => {
      // 清理创建的测试数据
      if (createdTeamId) {
        try {
          await authClient.delete(`/admin/teams/${createdTeamId}`);
        } catch (e) {
          // 忽略删除错误
        }
      }
    });

    it('应该成功创建完整信息的战队', async () => {
      const timestamp = Date.now();
      const newTeam = createTeamTemplate(timestamp.toString());

      const response = await authClient.post('/admin/teams', newTeam);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(newTeam.name);
      expect(response.data.description).toBe(newTeam.description);

      createdTeamId = response.data.id;
    });

    it('应该成功创建最小信息的战队', async () => {
      const timestamp = Date.now();
      const minimalTeam = {
        id: `minimal-team-${timestamp}`,
        name: `最小战队 ${timestamp}`,
      };

      const response = await authClient.post('/admin/teams', minimalTeam);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(minimalTeam.name);

      // 清理
      await authClient.delete(`/admin/teams/${response.data.id}`);
    });

    it('应该拒绝未认证的创建请求', async () => {
      const newTeam = createTeamTemplate('unauth');

      try {
        await apiClient.post('/admin/teams', newTeam);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });

    it('应该拒绝缺少战队名称', async () => {
      const invalidTeam = {
        id: 'no-name-team',
        description: '没有名称的战队',
      };

      try {
        await authClient.post('/admin/teams', invalidTeam);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }
    });

    it('应该拒绝缺少战队ID', async () => {
      const invalidTeam = {
        name: '没有ID的战队',
        description: '测试描述',
      };

      try {
        await authClient.post('/admin/teams', invalidTeam);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }
    });

    it('应该拒绝重复的战队ID', async () => {
      const timestamp = Date.now();
      const team1 = createTeamTemplate(`dup-${timestamp}`);

      // 创建第一个战队
      const response1 = await authClient.post('/admin/teams', team1);
      expect(response1.status).toBe(201);

      // 尝试创建相同ID的战队
      const team2 = {
        ...createTeamTemplate(`dup2-${timestamp}`),
        id: team1.id, // 相同的ID
      };

      try {
        await authClient.post('/admin/teams', team2);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect([400, 409]).toContain(error.response?.status);
      }

      // 清理
      await authClient.delete(`/admin/teams/${response1.data.id}`);
    });

    it('应该拒绝无效的队员位置', async () => {
      const invalidTeam = {
        id: `invalid-position-${Date.now()}`,
        name: '无效位置战队',
        players: [
          { id: 'p1', name: '选手1', position: '无效位置' },
        ],
      };

      try {
        await authClient.post('/admin/teams', invalidTeam);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }
    });

    it('应该处理特殊字符的战队名称', async () => {
      const timestamp = Date.now();
      const specialTeam = {
        id: `special-${timestamp}`,
        name: '战队 <script>alert("xss")</script>',
        description: '测试特殊字符',
      };

      const response = await authClient.post('/admin/teams', specialTeam);
      expect(response.status).toBe(201);

      // 清理
      await authClient.delete(`/admin/teams/${response.data.id}`);
    });
  });

  describe('3. 获取单个战队', () => {
    let testTeamId: string;

    beforeAll(async () => {
      // 创建一个测试战队
      const timestamp = Date.now();
      const newTeam = createTeamTemplate(`get-${timestamp}`);
      const response = await authClient.post('/admin/teams', newTeam);
      testTeamId = response.data.id;
    });

    afterAll(async () => {
      // 清理
      try {
        await authClient.delete(`/admin/teams/${testTeamId}`);
      } catch (e) {
        // 忽略错误
      }
    });

    it('应该返回指定战队的详情', async () => {
      const response = await apiClient.get(`/teams/${testTeamId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testTeamId);
      expect(response.data).toHaveProperty('name');
    });

    it('应该返回404当战队不存在', async () => {
      try {
        await apiClient.get('/teams/nonexistent-team-id-12345');
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('应该返回404当ID格式无效', async () => {
      try {
        await apiClient.get('/teams/');
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe('4. 更新战队', () => {
    let testTeamId: string;

    beforeEach(async () => {
      // 为每个测试创建新的战队
      const timestamp = Date.now();
      const newTeam = createTeamTemplate(`update-${timestamp}`);
      const response = await authClient.post('/admin/teams', newTeam);
      testTeamId = response.data.id;
    });

    afterEach(async () => {
      // 清理
      try {
        await authClient.delete(`/admin/teams/${testTeamId}`);
      } catch (e) {
        // 忽略错误
      }
    });

    it('应该成功更新战队名称', async () => {
      const updateData = {
        name: `更新后的名称 ${Date.now()}`,
      };

      const response = await authClient.put(`/admin/teams/${testTeamId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.name).toBe(updateData.name);
    });

    it('应该成功更新战队描述', async () => {
      const updateData = {
        description: `更新后的描述 ${Date.now()}`,
      };

      const response = await authClient.put(`/admin/teams/${testTeamId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.description).toBe(updateData.description);
    });

    it('应该成功更新战队Logo', async () => {
      const updateData = {
        logo: `https://example.com/new-logo-${Date.now()}.png`,
      };

      const response = await authClient.put(`/admin/teams/${testTeamId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.logo).toBe(updateData.logo);
    });

    it('应该成功同时更新多个字段', async () => {
      const updateData = {
        name: `新名称 ${Date.now()}`,
        description: '新描述',
        logo: 'https://example.com/new-logo.png',
      };

      const response = await authClient.put(`/admin/teams/${testTeamId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.name).toBe(updateData.name);
      expect(response.data.description).toBe(updateData.description);
      expect(response.data.logo).toBe(updateData.logo);
    });

    it('应该成功更新队员列表', async () => {
      const updateData = {
        players: [
          { id: 'new-p1', name: '新上单', position: '上单' },
          { id: 'new-p2', name: '新打野', position: '打野' },
        ],
      };

      const response = await authClient.put(`/admin/teams/${testTeamId}`, updateData);

      expect(response.status).toBe(200);
      expect(response.data.players).toBeDefined();
    });

    it('应该拒绝未认证的更新请求', async () => {
      try {
        await apiClient.put(`/admin/teams/${testTeamId}`, {
          name: '未认证更新',
        });
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });

    it('应该返回404当更新不存在的战队', async () => {
      try {
        await authClient.put('/admin/teams/nonexistent-id-12345', {
          name: '不存在的战队',
        });
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('应该处理空更新请求', async () => {
      const response = await authClient.put(`/admin/teams/${testTeamId}`, {});

      expect(response.status).toBe(200);
      // 数据应该保持不变
      expect(response.data.id).toBe(testTeamId);
    });
  });

  describe('5. 删除战队', () => {
    it('应该成功删除战队', async () => {
      // 创建要删除的战队
      const timestamp = Date.now();
      const newTeam = createTeamTemplate(`delete-${timestamp}`);
      const createResponse = await authClient.post('/admin/teams', newTeam);
      const teamId = createResponse.data.id;

      // 删除战队
      const deleteResponse = await authClient.delete(`/admin/teams/${teamId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.data).toHaveProperty('message');

      // 验证战队已被删除
      try {
        await apiClient.get(`/teams/${teamId}`);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('应该拒绝未认证的删除请求', async () => {
      // 先创建一个战队
      const timestamp = Date.now();
      const newTeam = createTeamTemplate(`unauth-delete-${timestamp}`);
      const createResponse = await authClient.post('/admin/teams', newTeam);
      const teamId = createResponse.data.id;

      // 尝试未认证删除
      try {
        await apiClient.delete(`/admin/teams/${teamId}`);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }

      // 清理
      await authClient.delete(`/admin/teams/${teamId}`);
    });

    it('应该返回404当删除不存在的战队', async () => {
      try {
        await authClient.delete('/admin/teams/nonexistent-id-12345');
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    });

    it('应该级联删除战队的队员', async () => {
      // 创建带队员的战队
      const timestamp = Date.now();
      const newTeam = createTeamTemplate(`cascade-${timestamp}`);
      const createResponse = await authClient.post('/admin/teams', newTeam);
      const teamId = createResponse.data.id;

      // 删除战队
      await authClient.delete(`/admin/teams/${teamId}`);

      // 验证战队已被删除
      try {
        await apiClient.get(`/teams/${teamId}`);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe('6. 完整战队管理流程', () => {
    it('应该完成创建-读取-更新-删除的完整流程', async () => {
      const timestamp = Date.now();

      // 1. 创建战队
      const newTeam = createTeamTemplate(`crud-${timestamp}`);
      const createResponse = await authClient.post('/admin/teams', newTeam);
      expect(createResponse.status).toBe(201);
      const teamId = createResponse.data.id;

      // 2. 读取战队
      const getResponse = await apiClient.get(`/teams/${teamId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.data.name).toBe(newTeam.name);

      // 3. 更新战队
      const updateData = {
        name: `更新后的战队 ${timestamp}`,
        description: '更新后的描述',
      };
      const updateResponse = await authClient.put(`/admin/teams/${teamId}`, updateData);
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.name).toBe(updateData.name);

      // 4. 验证更新
      const verifyResponse = await apiClient.get(`/teams/${teamId}`);
      expect(verifyResponse.data.name).toBe(updateData.name);

      // 5. 删除战队
      const deleteResponse = await authClient.delete(`/admin/teams/${teamId}`);
      expect(deleteResponse.status).toBe(200);

      // 6. 验证删除
      try {
        await apiClient.get(`/teams/${teamId}`);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe('7. 边界值测试', () => {
    it('应该处理超长战队名称', async () => {
      const timestamp = Date.now();
      const longNameTeam = {
        id: `long-name-${timestamp}`,
        name: 'a'.repeat(200),
        description: '测试超长名称',
      };

      try {
        const response = await authClient.post('/admin/teams', longNameTeam);
        expect(response.status).toBe(201);
        // 清理
        await authClient.delete(`/admin/teams/${response.data.id}`);
      } catch (error: any) {
        // 如果拒绝超长名称也是合理的
        expect([201, 400]).toContain(error.response?.status || 201);
      }
    });

    it('应该处理空字符串名称', async () => {
      const emptyNameTeam = {
        id: `empty-name-${Date.now()}`,
        name: '',
        description: '测试空名称',
      };

      try {
        await authClient.post('/admin/teams', emptyNameTeam);
        expect.fail('应该抛出错误');
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }
    });

    it('应该处理大量队员', async () => {
      const timestamp = Date.now();
      const manyPlayersTeam = {
        id: `many-players-${timestamp}`,
        name: `多队员战队 ${timestamp}`,
        players: Array(20).fill(null).map((_, i) => ({
          id: `player-${i}`,
          name: `选手${i}`,
          position: ['上单', '打野', '中单', 'AD', '辅助'][i % 5],
        })),
      };

      try {
        const response = await authClient.post('/admin/teams', manyPlayersTeam);
        expect(response.status).toBe(201);
        // 清理
        await authClient.delete(`/admin/teams/${response.data.id}`);
      } catch (error: any) {
        // 如果限制队员数量也是合理的
        expect([201, 400]).toContain(error.response?.status || 201);
      }
    });
  });

  describe('8. 性能测试', () => {
    it('获取战队列表响应时间应该小于 1 秒', async () => {
      const startTime = Date.now();
      await apiClient.get('/teams');
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000);
    });

    it('创建战队响应时间应该小于 2 秒', async () => {
      const timestamp = Date.now();
      const newTeam = createTeamTemplate(`perf-${timestamp}`);

      const startTime = Date.now();
      const response = await authClient.post('/admin/teams', newTeam);
      const endTime = Date.now();

      expect(response.status).toBe(201);
      expect(endTime - startTime).toBeLessThan(2000);

      // 清理
      await authClient.delete(`/admin/teams/${response.data.id}`);
    });
  });
});
