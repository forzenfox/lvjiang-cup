import { getTestConfig } from '../config/TestConfig';

/**
 * 后端 API 交互工具
 * 提供与后端服务通信的共享函数，供 global-setup 和 global-teardown 使用
 */

/**
 * 清空后端数据库数据
 * 通过管理员认证后调用清空数据 API
 */
export async function clearBackendData(
  testConfig: ReturnType<typeof getTestConfig>
): Promise<void> {
  const backendUrl = testConfig.urls.backend;
  const adminUsername = testConfig.admin.username;
  const adminPassword = testConfig.admin.password;

  try {
    const loginResponse = await fetch(`${backendUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: adminUsername, password: adminPassword }),
    });

    if (!loginResponse.ok) {
      throw new Error(`登录失败：${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data?.access_token;

    if (!token) {
      throw new Error('未获取到 access_token');
    }

    const clearResponse = await fetch(`${backendUrl}/api/admin/data`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (clearResponse.ok) {
      console.log('✅ 后端数据库数据已清空');
    } else if (clearResponse.status === 404) {
      console.log('⚠️ 清空数据 API 不存在');
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
        console.error('🔴 无法连接到后端服务');
      } else {
        console.error('❌ 清空后端数据失败:', error.message);
      }
    }
  }
}
