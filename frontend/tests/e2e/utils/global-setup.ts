import { chromium, FullConfig } from '@playwright/test';
import * as path from 'path';
import { getTestConfig } from '../config/TestConfig';

// 认证状态存储路径
const authStatePath = path.resolve(process.cwd(), 'tests', 'e2e', '.auth', 'auth.json');

async function globalSetup(config: FullConfig) {
  console.log('🚀 开始全局设置...');

  // 加载测试配置
  const testConfig = getTestConfig();

  try {
    const enableDataCleanup = testConfig.testOptions.enableDataCleanup;

    if (enableDataCleanup) {
      await clearBackendData(testConfig);
    } else {
      console.log('ℹ️ 数据清理已禁用');
    }

    // 启动浏览器并登录
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const baseURL = testConfig.urls.frontend;

    // 先清空本地存储
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
        'test-data',
        'e2e-data',
      ];

      keysToClear.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('test-') || key.startsWith('e2e-')) {
          localStorage.removeItem(key);
        }
      });

      sessionStorage.clear();
    });
    await context.clearCookies();

    // 执行登录操作
    console.log('🔐 正在执行登录...');
    await page.goto(`${baseURL}/admin/login`, { waitUntil: 'domcontentloaded' });

    // 填写登录表单 - 从配置中读取
    const adminUsername = testConfig.admin.username;
    const adminPassword = testConfig.admin.password;

    // 输入用户名
    const usernameInput = page
      .locator('input#username, input[name="username"], input[placeholder*="用户名"], input[type="text"]')
      .first();
    await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await usernameInput.fill(adminUsername);

    // 输入密码
    const passwordInput = page
      .locator('input#password, input[name="password"], input[placeholder*="密码"], input[type="password"]')
      .first();
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill(adminPassword);

    // 点击登录按钮
    const loginButton = page.locator('button[type="submit"], button:has-text("登录")').first();
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
    await loginButton.click();

    // 等待登录成功并跳转到仪表盘
    await page.waitForURL(/.*admin\/dashboard.*/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // 保存登录状态
    await context.storageState({ path: authStatePath });
    console.log('✅ 登录状态已保存到:', authStatePath);

    await browser.close();

    console.log('✅ 全局设置完成');
  } catch (error) {
    console.error('❌ 全局设置失败:', error);
    throw error;
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

export default globalSetup;
