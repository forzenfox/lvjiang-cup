import { chromium, FullConfig } from '@playwright/test';
import { getTestConfig } from '../config/TestConfig';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 开始全局清理...');

  // 加载测试配置
  const testConfig = getTestConfig();

  try {
    const enableDataCleanup = testConfig.testOptions.enableDataCleanup;

    if (enableDataCleanup) {
      await clearBackendData(testConfig);
    } else {
      console.log('ℹ️ 数据清理已禁用');
    }

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const baseURL = testConfig.urls.frontend;
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
      const keysToClear = [
        'lvjiang-cup-cache',
        'token',
        'user',
        'auth-token',
        'teams',
        'matches',
        'streams',
        'advancement',
        'theme',
        'test-data',
        'e2e-data',
      ];

      keysToClear.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });

      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('test-') || key.startsWith('e2e-')) {
          localStorage.removeItem(key);
        }
      });

      sessionStorage.clear();
    });

    await context.clearCookies();

    await page.evaluate(() => {
      return new Promise<void>(resolve => {
        const request = indexedDB.deleteDatabase('lvjiang-cup-db');
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    });

    await browser.close();

    console.log('✅ 全局清理完成');
  } catch (error) {
    console.error('❌ 全局清理失败:', error);
  }
}

async function clearBackendData(testConfig: ReturnType<typeof getTestConfig>) {
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

export default globalTeardown;
