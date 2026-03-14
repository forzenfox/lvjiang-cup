import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 模块中获取 __dirname 的替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量 - 使用 tests/e2e/.env
const e2eEnvPath = path.resolve(__dirname, 'tests', 'e2e', '.env');
dotenv.config({ path: e2eEnvPath });

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
  
  // ⚠️ 测试文件按依赖顺序执行（通过文件名数字前缀控制）
  // 正确顺序: 登录 → 仪表盘 → 直播 → 战队 → 赛程 → 晋级 → 首页验证 → 边界 → 并发
  // 注：testMatch 不控制执行顺序，执行顺序由文件名决定
  
  // 测试报告配置
  reporter: [
    ['html', { outputFolder: './tests/e2e/report', open: 'never' }],
    ['junit', { outputFile: './tests/e2e/report/results.xml' }],
    ['list']
  ],
  
  // 全局测试配置
  use: {
    // 基础URL
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
    
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
    // 项目1：登录测试（不使用 storageState，因为需要测试登录功能本身）
    {
      name: 'msedge-login',
      testMatch: ['**/01-login.spec.ts', '**/09-concurrent.spec.ts'],
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        // 不使用 storageState
      },
    },
    // 项目2：其他所有测试（使用全局登录状态）
    {
      name: 'msedge',
      testIgnore: ['**/01-login.spec.ts', '**/09-concurrent.spec.ts'],
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        // 使用保存的认证状态 - 避免频繁登录
        storageState: './tests/e2e/.auth/auth.json',
      },
      dependencies: ['msedge-login'],
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
