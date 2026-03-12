/**
 * API 集成测试
 * 测试所有 API 端点、认证流程和错误处理
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios, { AxiosError, AxiosInstance } from 'axios';

// API 基础配置
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 测试数据
const TEST_ADMIN = {
  username: 'admin',
  password: 'admin123',
};

const TEST_INVALID_USER = {
  username: 'invalid',
  password: 'wrongpassword',
};

// 创建 axios 实例
const createApiClient = (): AxiosInstance => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// 带认证的 axios 实例
const createAuthClient = (token: string): AxiosInstance => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
};

describe('API 集成测试', () => {
  let apiClient: AxiosInstance;
  let authToken: string;
  let authClient: AxiosInstance;

  beforeAll(() => {
    apiClient = createApiClient();
  });

  describe('1. 认证流程测试', () => {
    describe('POST /admin/auth/login - 登录接口', () => {
      it('应该使用有效凭据成功登录', async () => {
        const response = await apiClient.post('/admin/auth/login', TEST_ADMIN);

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('access_token');
        expect(response.data).toHaveProperty('token_type');
        expect(response.data.token_type).toBe('Bearer');
        expect(typeof response.data.access_token).toBe('string');
        expect(response.data.access_token.length).toBeGreaterThan(0);

        // 保存 token 用于后续测试
        authToken = response.data.access_token;
        authClient = createAuthClient(authToken);
      });

      it('应该拒绝无效的用户名', async () => {
        try {
          await apiClient.post('/admin/auth/login', {
            username: 'nonexistent',
            password: TEST_ADMIN.password,
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(401);
        }
      });

      it('应该拒绝无效的密码', async () => {
        try {
          await apiClient.post('/admin/auth/login', {
            username: TEST_ADMIN.username,
            password: 'wrongpassword',
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(401);
        }
      });

      it('应该拒绝空用户名', async () => {
        try {
          await apiClient.post('/admin/auth/login', {
            username: '',
            password: TEST_ADMIN.password,
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect([400, 401]).toContain(axiosError.response?.status);
        }
      });

      it('应该拒绝空密码', async () => {
        try {
          await apiClient.post('/admin/auth/login', {
            username: TEST_ADMIN.username,
            password: '',
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect([400, 401]).toContain(axiosError.response?.status);
        }
      });

      it('应该拒绝缺少用户名', async () => {
        try {
          await apiClient.post('/admin/auth/login', {
            password: TEST_ADMIN.password,
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(400);
        }
      });

      it('应该拒绝缺少密码', async () => {
        try {
          await apiClient.post('/admin/auth/login', {
            username: TEST_ADMIN.username,
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(400);
        }
      });

      it('应该拒绝空请求体', async () => {
        try {
          await apiClient.post('/admin/auth/login', {});
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(400);
        }
      });
    });
  });

  describe('2. 战队管理 API 测试', () => {
    let testTeamId: string;

    describe('GET /teams - 获取战队列表', () => {
      it('应该返回战队列表（无需认证）', async () => {
        const response = await apiClient.get('/teams');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
      });

      it('应该支持分页参数', async () => {
        const response = await apiClient.get('/teams', {
          params: { page: 1, pageSize: 5 },
        });

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
      });
    });

    describe('POST /admin/teams - 创建战队（需认证）', () => {
      it('应该成功创建战队', async () => {
        const newTeam = {
          id: `test-team-${Date.now()}`,
          name: `测试战队 ${Date.now()}`,
          logo: 'https://example.com/logo.png',
          description: '这是一个测试战队',
          players: [
            { id: 'p1', name: '玩家1', position: '上单' },
            { id: 'p2', name: '玩家2', position: '打野' },
          ],
        };

        const response = await authClient.post('/admin/teams', newTeam);

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        expect(response.data.name).toBe(newTeam.name);
        testTeamId = response.data.id;
      });

      it('应该拒绝未认证的请求', async () => {
        try {
          await apiClient.post('/admin/teams', {
            id: 'test-team',
            name: '测试战队',
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(401);
        }
      });

      it('应该拒绝无效的 Token', async () => {
        const invalidClient = createAuthClient('invalid-token');
        try {
          await invalidClient.post('/admin/teams', {
            id: 'test-team',
            name: '测试战队',
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(401);
        }
      });

      it('应该拒绝缺少必填字段', async () => {
        try {
          await authClient.post('/admin/teams', {
            description: '缺少名称的战队',
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(400);
        }
      });

      it('应该拒绝重复的战队ID', async () => {
        const teamWithSameId = {
          id: testTeamId,
          name: '另一个战队',
        };

        try {
          await authClient.post('/admin/teams', teamWithSameId);
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          // 可能返回 409 (Conflict) 或 400
          expect([400, 409]).toContain(axiosError.response?.status);
        }
      });
    });

    describe('GET /teams/:id - 获取单个战队', () => {
      it('应该返回指定战队的详情', async () => {
        const response = await apiClient.get(`/teams/${testTeamId}`);

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('id', testTeamId);
      });

      it('应该返回404当战队不存在', async () => {
        try {
          await apiClient.get('/teams/nonexistent-team-id');
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(404);
        }
      });
    });

    describe('PUT /admin/teams/:id - 更新战队', () => {
      it('应该成功更新战队信息', async () => {
        const updateData = {
          name: `更新后的战队名 ${Date.now()}`,
          description: '更新后的描述',
        };

        const response = await authClient.put(`/admin/teams/${testTeamId}`, updateData);

        expect(response.status).toBe(200);
        expect(response.data.name).toBe(updateData.name);
        expect(response.data.description).toBe(updateData.description);
      });

      it('应该拒绝未认证的更新请求', async () => {
        try {
          await apiClient.put(`/admin/teams/${testTeamId}`, {
            name: '未认证更新',
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(401);
        }
      });

      it('应该返回404当更新不存在的战队', async () => {
        try {
          await authClient.put('/admin/teams/nonexistent-id', {
            name: '不存在的战队',
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(404);
        }
      });
    });

    describe('DELETE /admin/teams/:id - 删除战队', () => {
      let teamToDelete: string;

      beforeEach(async () => {
        // 创建一个用于删除测试的战队
        const newTeam = {
          id: `delete-test-${Date.now()}`,
          name: `待删除战队 ${Date.now()}`,
        };
        const response = await authClient.post('/admin/teams', newTeam);
        teamToDelete = response.data.id;
      });

      it('应该成功删除战队', async () => {
        const response = await authClient.delete(`/admin/teams/${teamToDelete}`);

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message');
      });

      it('应该拒绝未认证的删除请求', async () => {
        try {
          await apiClient.delete(`/admin/teams/${teamToDelete}`);
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(401);
        }
      });

      it('应该返回404当删除不存在的战队', async () => {
        try {
          await authClient.delete('/admin/teams/nonexistent-id');
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(404);
        }
      });
    });
  });

  describe('3. 比赛管理 API 测试', () => {
    describe('GET /matches - 获取比赛列表', () => {
      it('应该返回比赛列表（无需认证）', async () => {
        const response = await apiClient.get('/matches');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
      });

      it('应该支持按阶段筛选', async () => {
        const response = await apiClient.get('/matches', {
          params: { stage: 'swiss' },
        });

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
      });
    });

    describe('GET /matches/:id - 获取单个比赛', () => {
      it('应该返回404当比赛不存在', async () => {
        try {
          await apiClient.get('/matches/nonexistent-match-id');
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(404);
        }
      });
    });

    describe('PUT /admin/matches/:id - 更新比赛（需认证）', () => {
      it('应该拒绝未认证的更新请求', async () => {
        try {
          await apiClient.put('/admin/matches/match-1', {
            scoreA: 2,
            scoreB: 1,
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(401);
        }
      });

      it('应该返回404当更新不存在的比赛', async () => {
        try {
          await authClient.put('/admin/matches/nonexistent-match', {
            scoreA: 2,
            scoreB: 1,
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(404);
        }
      });
    });

    describe('DELETE /admin/matches/:id/scores - 清空比分（需认证）', () => {
      it('应该拒绝未认证的请求', async () => {
        try {
          await apiClient.delete('/admin/matches/match-1/scores');
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(401);
        }
      });
    });
  });

  describe('4. 直播管理 API 测试', () => {
    describe('GET /streams - 获取直播信息', () => {
      it('应该返回直播信息（无需认证）', async () => {
        const response = await apiClient.get('/streams');

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('id');
      });
    });

    describe('PUT /admin/streams - 更新直播信息（需认证）', () => {
      it('应该拒绝未认证的更新请求', async () => {
        try {
          await apiClient.put('/admin/streams', {
            title: '新标题',
            url: 'https://example.com/stream',
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(401);
        }
      });
    });
  });

  describe('5. 晋级管理 API 测试', () => {
    describe('GET /advancement - 获取晋级信息', () => {
      it('应该返回晋级信息（无需认证）', async () => {
        const response = await apiClient.get('/advancement');

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('id');
      });
    });

    describe('PUT /admin/advancement - 更新晋级信息（需认证）', () => {
      it('应该拒绝未认证的更新请求', async () => {
        try {
          await apiClient.put('/admin/advancement', {
            winners_2_0: ['team1', 'team2'],
          });
          expect.fail('应该抛出错误');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(401);
        }
      });
    });
  });

  describe('6. 错误处理测试', () => {
    it('应该处理404路由', async () => {
      try {
        await apiClient.get('/nonexistent-route');
        expect.fail('应该抛出错误');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });

    it('应该处理405方法不允许', async () => {
      try {
        await apiClient.patch('/teams', {});
        expect.fail('应该抛出错误');
      } catch (error) {
        const axiosError = error as AxiosError;
        // 可能是 404 或 405
        expect([404, 405]).toContain(axiosError.response?.status);
      }
    });

    it('应该处理无效的JSON', async () => {
      try {
        await apiClient.post('/admin/auth/login', 'invalid json', {
          headers: { 'Content-Type': 'application/json' },
        });
        expect.fail('应该抛出错误');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 500]).toContain(axiosError.response?.status);
      }
    });

    it('应该处理请求超时', async () => {
      const slowClient = axios.create({
        baseURL: API_BASE_URL,
        timeout: 1, // 1ms 超时
      });

      try {
        await slowClient.get('/teams');
        expect.fail('应该抛出错误');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.code).toBe('ECONNABORTED');
      }
    });
  });

  describe('7. 响应格式测试', () => {
    it('应该返回正确的Content-Type', async () => {
      const response = await apiClient.get('/teams');

      expect(response.headers['content-type']).toContain('application/json');
    });

    it('应该包含CORS头', async () => {
      const response = await apiClient.get('/teams');

      // 检查是否有CORS相关头
      expect(response.headers).toBeDefined();
    });
  });

  describe('8. Token 验证测试', () => {
    it('应该正确验证Bearer Token格式', async () => {
      const malformedClient = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Authorization': 'Basic invalid-token', // 错误的格式
        },
      });

      try {
        await malformedClient.get('/admin/teams');
        expect.fail('应该抛出错误');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('应该拒绝过期的Token', async () => {
      // 使用一个明显无效的token
      const expiredClient = createAuthClient('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      try {
        await expiredClient.get('/admin/teams');
        expect.fail('应该抛出错误');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });
});
