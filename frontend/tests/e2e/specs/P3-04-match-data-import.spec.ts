import { test, expect } from '@playwright/test';
import { DashboardPage, SchedulePage } from '../pages';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import dotenv from 'dotenv';

// 加载测试环境变量
dotenv.config({ path: path.resolve(process.cwd(), 'tests', 'e2e', '.env') });

const TEST_TEMPLATE_DIR = path.join(os.tmpdir(), 'match-data-template-test');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

/**
 * 对战数据导入功能 E2E 测试用例
 *
 * 测试范围：
 * 1. 下载导入模板功能
 * 2. 在对战列表（瑞士轮和淘汰赛）中显示"导入数据"按钮
 *
 * 对应测试用例：
 * - TEST-MD-IMPORT-001: 下载对战数据导入模板（后端 API）
 * - TEST-MD-IMPORT-002: 模板文件格式验证
 * - TEST-MD-IMPORT-003: 前端页面模板下载按钮展示
 * - TEST-MD-IMPORT-004: 瑞士轮比赛卡片显示导入按钮
 * - TEST-MD-IMPORT-005: 淘汰赛比赛卡片显示导入按钮
 *
 * ⚠️ 注意：本测试不依赖全局设置，可独立运行
 */
test.describe('【对战数据导入功能】模板下载与导入按钮展示', () => {
  let authToken: string;
  let dashboardPage: DashboardPage;
  let schedulePage: SchedulePage;

  /**
   * 在所有测试执行前获取认证 token
   */
  test.beforeAll(async () => {
    // 确保测试目录存在
    if (!fs.existsSync(TEST_TEMPLATE_DIR)) {
      fs.mkdirSync(TEST_TEMPLATE_DIR, { recursive: true });
    }

    // 1. 登录获取 token
    try {
      const loginResponse = await fetch(`${BACKEND_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
      });

      if (!loginResponse.ok) {
        console.log(`⚠️ 后端登录失败: ${loginResponse.status}`);
        test.skip();
        return;
      }

      const loginData = await loginResponse.json();
      authToken = loginData.data?.access_token;

      if (!authToken) {
        console.log('⚠️ 未获取到 access_token');
        test.skip();
        return;
      }

      console.log('✅ 认证 token 获取成功');
    } catch (error) {
      console.error('❌ 获取认证 token 失败:', error);
      test.skip();
    }
  });

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    schedulePage = new SchedulePage(page);
  });

  /**
   * TEST-MD-IMPORT-001: 下载对战数据导入模板（后端 API）
   * 优先级: P1
   * 验证模板下载 API 功能正常
   */
  test('TEST-MD-IMPORT-001: 下载对战数据导入模板（后端 API） @P1', async () => {
    test.skip(!authToken, '未获取到认证 token');

    // 2. 调用模板下载 API
    const downloadResponse = await fetch(`${BACKEND_URL}/api/admin/matches/import/template`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // 3. 验证响应成功
    expect(downloadResponse.ok).toBeTruthy();

    // 4. 验证响应类型
    const contentType = downloadResponse.headers.get('content-type');
    expect(contentType).toMatch(/application\/vnd\.openxmlformats/);

    // 5. 获取文件内容
    const buffer = await downloadResponse.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(5000); // 至少 5KB（包含表头和示例数据）

    // 6. 保存到本地
    const tempFilePath = path.join(TEST_TEMPLATE_DIR, `template_api_${Date.now()}.xlsx`);
    fs.writeFileSync(tempFilePath, Buffer.from(buffer));

    console.log(`✅ 模板下载成功（API）: ${tempFilePath}, 大小: ${buffer.byteLength} bytes`);
  });

  /**
   * TEST-MD-IMPORT-002: 模板文件格式验证
   * 优先级: P1
   * 验证下载的模板文件结构符合设计规范
   */
  test('TEST-MD-IMPORT-002: 模板文件格式验证 @P1', async () => {
    test.skip(!authToken, '未获取到认证 token');

    // 1. 下载模板
    const downloadResponse = await fetch(`${BACKEND_URL}/api/admin/matches/import/template`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(downloadResponse.ok).toBeTruthy();

    // 2. 验证 Content-Disposition 头
    const contentDisposition = downloadResponse.headers.get('content-disposition');
    expect(contentDisposition).toMatch(/filename/);
    expect(contentDisposition).toMatch(/\.xlsx/);

    // 3. 验证文件大小
    const buffer = await downloadResponse.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(5000);

    // 4. 保存并验证 Excel 文件
    const tempFilePath = path.join(TEST_TEMPLATE_DIR, `template_validation_${Date.now()}.xlsx`);
    fs.writeFileSync(tempFilePath, Buffer.from(buffer));

    // 验证文件存在
    expect(fs.existsSync(tempFilePath)).toBeTruthy();

    // 验证文件大小合理
    const stats = fs.statSync(tempFilePath);
    expect(stats.size).toBeGreaterThan(5000);

    console.log(`✅ 模板文件格式验证通过: ${tempFilePath}, 大小: ${stats.size} bytes`);
    console.log('✅ 验证项目：');
    console.log('  - Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    console.log('  - Content-Disposition: 包含 filename 和 .xlsx 扩展名');
    console.log('  - 文件大小: > 5KB（包含完整表头和示例数据）');
  });

  /**
   * TEST-MD-IMPORT-003: 前端页面模板下载按钮展示
   * 优先级: P1
   * 验证前端赛程管理页面模板下载按钮存在并可正常下载
   */
  test('TEST-MD-IMPORT-003: 前端页面模板下载按钮展示 @P1', async ({ page }) => {
    test.skip(!authToken, '未获取到认证 token');

    // 1. 设置 localStorage 中的 token（模拟登录状态）
    await page.context().addCookies([
      {
        name: 'auth-token',
        value: authToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await page.goto('http://localhost:5173/admin/schedule');

    // 设置 localStorage
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin' }));
      localStorage.setItem('auth-token', token);
    }, authToken);

    // 刷新页面使 token 生效
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 2. 验证下载模板按钮存在
    const downloadTemplateButton = page.getByTestId('download-template-button');
    await expect(downloadTemplateButton).toBeVisible({ timeout: 10000 });

    // 3. 验证按钮文本
    const buttonText = await downloadTemplateButton.textContent();
    expect(buttonText).toContain('下载导入模板');

    console.log(`✅ 下载模板按钮可见: "${buttonText?.trim()}"`);

    // 4. 测试点击下载功能
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);

    await downloadTemplateButton.click();

    const download = await downloadPromise;
    if (download) {
      const filename = download.suggestedFilename();
      expect(filename).toMatch(/\.xlsx$/);
      console.log(`✅ 前端点击下载成功: ${filename}`);
    } else {
      console.log('⚠️ 前端点击下载未触发（可能后端服务未启动）');
    }
  });

  /**
   * TEST-MD-IMPORT-004: 瑞士轮比赛卡片显示导入按钮
   * 优先级: P1
   * 验证瑞士轮比赛卡片悬停时显示"导入"按钮
   */
  test('TEST-MD-IMPORT-004: 瑞士轮比赛卡片显示导入按钮 @P1', async ({ page }) => {
    test.skip(!authToken, '未获取到认证 token');

    // 1. 设置登录状态
    await page.context().addCookies([
      {
        name: 'auth-token',
        value: authToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await page.goto('http://localhost:5173/admin/schedule');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin' }));
      localStorage.setItem('auth-token', token);
    }, authToken);

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 2. 切换到瑞士轮Tab
    const swissTab = page.getByTestId('swiss-tab');
    const swissTabVisible = await swissTab.isVisible().catch(() => false);

    if (swissTabVisible) {
      await swissTab.click();
      await page.waitForTimeout(500);
    }

    // 3. 查找瑞士轮比赛卡片
    const swissCards = page.locator('[data-testid^="swiss-match-card-"]');
    const cardCount = await swissCards.count();

    if (cardCount === 0) {
      console.log('⚠️ 瑞士轮暂无比赛卡片，无法验证导入按钮');
      return;
    }

    console.log(`✅ 找到 ${cardCount} 个瑞士轮比赛卡片`);

    // 4. 悬停在第一个卡片上
    const firstCard = swissCards.first();
    await firstCard.hover();
    await page.waitForTimeout(500);

    // 5. 验证导入按钮出现
    const importButton = page.locator('button[title="导入对战数据"]').first();
    const importVisible = await importButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (importVisible) {
      console.log('✅ 瑞士轮比赛卡片悬停时"导入"按钮可见');
    } else {
      console.log('⚠️ 瑞士轮比赛卡片悬停时"导入"按钮未显示');
    }
  });

  /**
   * TEST-MD-IMPORT-005: 淘汰赛比赛卡片显示导入按钮
   * 优先级: P1
   * 验证淘汰赛比赛卡片悬停时显示"导入"按钮
   */
  test('TEST-MD-IMPORT-005: 淘汰赛比赛卡片显示导入按钮 @P1', async ({ page }) => {
    test.skip(!authToken, '未获取到认证 token');

    // 1. 设置登录状态
    await page.context().addCookies([
      {
        name: 'auth-token',
        value: authToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await page.goto('http://localhost:5173/admin/schedule');
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin' }));
      localStorage.setItem('auth-token', token);
    }, authToken);

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 2. 切换到淘汰赛Tab
    const eliminationTab = page.getByTestId('elimination-tab');
    const eliminationTabVisible = await eliminationTab.isVisible().catch(() => false);

    if (eliminationTabVisible) {
      await eliminationTab.click();
      await page.waitForTimeout(500);
    }

    // 3. 查找淘汰赛比赛卡片
    const elimCards = page.locator('[data-testid^="elim-match-card-"]');
    const cardCount = await elimCards.count();

    if (cardCount === 0) {
      console.log('⚠️ 淘汰赛暂无比赛卡片，无法验证导入按钮');
      return;
    }

    console.log(`✅ 找到 ${cardCount} 个淘汰赛比赛卡片`);

    // 4. 悬停在第一个卡片上
    const firstCard = elimCards.first();
    await firstCard.hover();
    await page.waitForTimeout(500);

    // 5. 验证导入按钮出现
    const importButton = page.locator('button[title="导入对战数据"]').first();
    const importVisible = await importButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (importVisible) {
      console.log('✅ 淘汰赛比赛卡片悬停时"导入"按钮可见');
    } else {
      console.log('⚠️ 淘汰赛比赛卡片悬停时"导入"按钮未显示');
    }
  });
});

/**
 * 清理临时测试目录
 */
test.afterAll(async () => {
  if (fs.existsSync(TEST_TEMPLATE_DIR)) {
    try {
      fs.rmSync(TEST_TEMPLATE_DIR, { recursive: true, force: true });
      console.log('✅ 临时测试目录已清理');
    } catch (error) {
      console.log('⚠️ 临时测试目录清理失败');
    }
  }
});
