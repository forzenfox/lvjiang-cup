import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for 驴酱杯赛事网站 E2E Tests
 * @version 1.1.0
 * @update 2026-03-13: 禁用并行执行，解决测试依赖问题
 * 
 * ⚠️ 重要提示：当前测试用例存在强依赖关系，必须串行执行
 * 依赖链：TEST-001 → TEST-101 → TEST-105 → TEST-108 → TEST-110 → TEST-111 → TEST-112
 * 详见：tests/e2e/docs/concurrent-execution-guide.md
 */
export default defineConfig({
  // 测试目录
  testDir: './tests/e2e/specs',
  
  // ⚠️ 禁用并行执行 - 测试用例存在强依赖关系
  fullyParallel: false,
  
  // CI环境下禁止.only测试
  forbidOnly: !!process.env.CI,
  
  // 重试次数
  retries: process.env.CI ? 2 : 0,
  
  // ⚠️ 串行执行 - workers设为1
  workers: 1,
  
  // ⚠️ 测试文件按依赖顺序执行
  // 顺序: 首页 → 登录 → 直播 → 战队 → 赛程 → 晋级 → 边界
  testMatch: [
    '**/01-home.spec.ts',           // 第一阶段：首页基础
    '**/02-admin-login.spec.ts',    // 第二阶段-1：登录
    '**/05-stream.spec.ts',         // 第二阶段-2：直播
    '**/03-teams.spec.ts',          // 第二阶段-3/4：战队
    '**/04-schedule.spec.ts',       // 第二阶段-5/6/7：赛程
    '**/06-advancement.spec.ts',    // 第四阶段-1/2：晋级名单
    '**/07-edge-cases.spec.ts',     // 第五阶段：边界测试
  ],
  
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
