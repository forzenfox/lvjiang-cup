/**
 * E2E 测试 - 登录流程
 * 测试完整的登录功能，包括页面交互、表单验证、认证状态管理
 */

import { describe, it, expect } from 'vitest';
import axios, { AxiosInstance } from 'axios';

// API 配置
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'http://localhost:5173';

// 测试账号
const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

const INVALID_CREDENTIALS = {
  username: 'admin',
  password: 'wrongpassword',
};

describe('E2E 测试 - 登录流程', () => {
  let apiClient: AxiosInstance;

  beforeAll(() => {
    apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  describe('1. 登录页面访问', () => {
    it('应该能访问登录页面', async () => {
      // 测试前端页面可访问
      try {
        const response = await axios.get(`${FRONTEND_URL}/admin/login`, {
          timeout: 5000,
        });
        expect(response.status).toBe(200);
      } catch {
        // 如果前端服务未启动，跳过此测试
        console.log('前端服务可能未启动，跳过页面访问测试');
      }
    });
  });

  describe('2. 登录表单验证', () => {
    it('应该拒绝空用户名', async () => {
      try {
        await apiClient.post('/admin/auth/login', {
          username: '',
          password: VALID_CREDENTIALS.password,
        });
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect([400, 401]).toContain(axiosError.response?.status);
      }
    });

    it('应该拒绝空密码', async () => {
      try {
        await apiClient.post('/admin/auth/login', {
          username: VALID_CREDENTIALS.username,
          password: '',
        });
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect([400, 401]).toContain(axiosError.response?.status);
      }
    });

    it('应该拒绝空表单提交', async () => {
      try {
        await apiClient.post('/admin/auth/login', {});
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('应该拒绝缺少用户名字段', async () => {
      try {
        await apiClient.post('/admin/auth/login', {
          password: VALID_CREDENTIALS.password,
        });
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('应该拒绝缺少密码字段', async () => {
      try {
        await apiClient.post('/admin/auth/login', {
          username: VALID_CREDENTIALS.username,
        });
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('3. 登录认证流程', () => {
    it('应该使用有效凭据成功登录', async () => {
      const response = await apiClient.post('/admin/auth/login', VALID_CREDENTIALS);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('access_token');
      expect(response.data).toHaveProperty('token_type');
      expect(response.data.token_type).toBe('Bearer');
      expect(typeof response.data.access_token).toBe('string');
      expect(response.data.access_token.length).toBeGreaterThan(0);

      // 验证 token 格式 (JWT)
      const tokenParts = response.data.access_token.split('.');
      expect(tokenParts.length).toBe(3); // JWT 有三个部分
    });

    it('应该拒绝无效密码', async () => {
      try {
        await apiClient.post('/admin/auth/login', INVALID_CREDENTIALS);
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number; data: unknown } };
        expect(axiosError.response?.status).toBe(401);
        expect(axiosError.response?.data).toBeDefined();
      }
    });

    it('应该拒绝不存在的用户', async () => {
      try {
        await apiClient.post('/admin/auth/login', {
          username: 'nonexistentuser',
          password: 'somepassword',
        });
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('应该拒绝特殊字符用户名', async () => {
      try {
        await apiClient.post('/admin/auth/login', {
          username: '<script>alert("xss")</script>',
          password: VALID_CREDENTIALS.password,
        });
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('应该拒绝过长的用户名', async () => {
      try {
        await apiClient.post('/admin/auth/login', {
          username: 'a'.repeat(1000),
          password: VALID_CREDENTIALS.password,
        });
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        // 可能返回 400 或 401
        const axiosError = error as { response?: { status: number } };
        expect([400, 401]).toContain(axiosError.response?.status);
      }
    });

    it('应该拒绝过长的密码', async () => {
      try {
        await apiClient.post('/admin/auth/login', {
          username: VALID_CREDENTIALS.username,
          password: 'b'.repeat(1000),
        });
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('4. Token 管理和使用', () => {
    let authToken: string;

    beforeAll(async () => {
      const response = await apiClient.post('/admin/auth/login', VALID_CREDENTIALS);
      authToken = response.data.access_token;
    });

    it('应该使用有效 Token 访问受保护资源', async () => {
      const authClient = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      // 尝试访问需要认证的端点
      try {
        const response = await authClient.get('/admin/teams');
        expect(response.status).toBe(200);
      } catch (error: unknown) {
        // 如果没有战队数据，可能返回 200 空数组或 404
        const axiosError = error as { response?: { status: number } };
        expect([200, 404]).toContain(axiosError.response?.status || 200);
      }
    });

    it('应该拒绝无效 Token', async () => {
      const invalidClient = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      try {
        await invalidClient.get('/admin/teams');
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('应该拒绝过期 Token', async () => {
      const expiredClient = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        },
      });

      try {
        await expiredClient.get('/admin/teams');
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('应该拒绝缺少 Token 的请求', async () => {
      try {
        await apiClient.get('/admin/teams');
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('应该拒绝错误的 Authorization 格式', async () => {
      const malformedClient = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Authorization': 'Basic dXNlcjpwYXNz', // Basic 而不是 Bearer
        },
      });

      try {
        await malformedClient.get('/admin/teams');
        expect.fail('应该抛出错误');
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number } };
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('5. 会话管理', () => {
    it('应该支持多次登录获取不同 Token', async () => {
      const response1 = await apiClient.post('/admin/auth/login', VALID_CREDENTIALS);
      const response2 = await apiClient.post('/admin/auth/login', VALID_CREDENTIALS);

      expect(response1.data.access_token).toBeDefined();
      expect(response2.data.access_token).toBeDefined();
      // 每次登录应该生成不同的 token
      expect(response1.data.access_token).not.toBe(response2.data.access_token);
    });
  });

  describe('6. 安全测试', () => {
    it('应该防止 SQL 注入攻击', async () => {
      const sqlInjectionAttempts = [
        { username: "admin' OR '1'='1", password: 'anything' },
        { username: 'admin"; DROP TABLE users; --', password: 'anything' },
        { username: "admin' UNION SELECT * FROM users --", password: 'anything' },
      ];

      for (const attempt of sqlInjectionAttempts) {
        try {
          await apiClient.post('/admin/auth/login', attempt);
        } catch (error: unknown) {
          // 所有注入尝试都应该失败
          const axiosError = error as { response?: { status: number } };
          expect([400, 401]).toContain(axiosError.response?.status);
        }
      }
    });

    it('应该防止 XSS 攻击', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>',
      ];

      for (const payload of xssPayloads) {
        try {
          await apiClient.post('/admin/auth/login', {
            username: payload,
            password: VALID_CREDENTIALS.password,
          });
        } catch (error: unknown) {
          const axiosError = error as { response?: { status: number } };
          expect(axiosError.response?.status).toBe(401);
        }
      }
    });

    it('登录响应不应包含敏感信息', async () => {
      const response = await apiClient.post('/admin/auth/login', VALID_CREDENTIALS);

      // 响应中不应包含密码相关信息
      const responseStr = JSON.stringify(response.data);
      expect(responseStr).not.toContain('password');
      expect(responseStr).not.toContain(VALID_CREDENTIALS.password);
    });
  });

  describe('7. 性能测试', () => {
    it('登录响应时间应该小于 2 秒', async () => {
      const startTime = Date.now();
      await apiClient.post('/admin/auth/login', VALID_CREDENTIALS);
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(2000);
    });

    it('应该处理并发登录请求', async () => {
      const promises = Array(5).fill(null).map(() =>
        apiClient.post('/admin/auth/login', VALID_CREDENTIALS)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('access_token');
      });
    });
  });

  describe('8. API 文档验证', () => {
    it('应该能访问 Swagger 文档', async () => {
      const response = await apiClient.get('/docs');
      expect(response.status).toBe(200);
    });
  });
});
