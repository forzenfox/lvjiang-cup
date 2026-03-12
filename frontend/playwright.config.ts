import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for 驴酱杯赛事网站 E2E Tests
 * @version 1.0.0
 */
export default defineConfig({
  // 测试目录
  testDir: './tests/e2e/specs',
  
  // 完全并行执行
  fullyParallel: true,
  
  // CI环境下禁止.only测试
  forbidOnly: !!process.env.CI,
  
  // 重试次数
  retries: process.env.CI ? 2 : 0,
  
  // 工作进程数
  workers: process.env.CI ? 1 : undefined,
  
  // 测试报告配置
  reporter: [
    ['html', { outputFolder: './tests/e2e/report', open: 'never' }],
    ['junit', { outputFile: './tests/e2e/report/results.xml' }],
    ['list']
  ],
  
  // 全局测试配置
  use: {
    // 基础URL
    baseURL: 'http://localhost:5173',
    
    // 追踪配置
    trace: 'on-first-retry',
    
    // 失败时截图
    screenshot: 'only-on-failure',
    
    // 失败时保留视频
    video: 'retain-on-failure',
    
    // 视口大小
    viewport: { width: 1920, height: 1080 },
    
    // 动作超时
    actionTimeout: 15000,
    
    // 导航超时
    navigationTimeout: 30000,
  },
  
  // 浏览器项目配置 - 仅支持 Edge
  projects: [
    {
      name: 'msedge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },
  ],
  
  // 开发服务器配置
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // 全局设置 - 使用import语法
  globalSetup: './tests/e2e/utils/global-setup.ts',
  globalTeardown: './tests/e2e/utils/global-teardown.ts',
});
