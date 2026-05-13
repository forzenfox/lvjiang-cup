import { chromium, devices, FullConfig } from '@playwright/test';
import { getTestConfig } from '../config/TestConfig';
import { clearBackendData } from './backend-api';

async function globalTeardown(_config: FullConfig) {
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

    const browser = await chromium.launch({
      channel: 'msedge',
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    });
    const context = await browser.newContext({
      ...devices['Desktop Edge'],
      viewport: { width: 1920, height: 1080 },
    });
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

export default globalTeardown;
