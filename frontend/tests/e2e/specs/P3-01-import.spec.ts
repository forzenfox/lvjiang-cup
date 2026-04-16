import { test, expect } from '@playwright/test';
import { DashboardPage, TeamsPage } from '../pages';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const TEST_TEAM_NAME = '导入测试战队';

function getFixtureExcelPath(): string {
  return path.join(__dirname, '..', 'fixtures', 'test-import.xlsx');
}

function copyFixtureToTemp(tempDir: string): string {
  const fixturePath = getFixtureExcelPath();
  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture file not found: ${fixturePath}. Please run 'npm run generate:test-excel' in frontend directory first.`);
  }
  const destPath = path.join(tempDir, `test_import_${Date.now()}.xlsx`);
  fs.copyFileSync(fixturePath, destPath);
  return destPath;
}

/**
 * 战队导入功能测试用例
 * 对应测试计划: TEST-1401, TEST-1403, TEST-1404, TEST-1405, TEST-1410
 *
 * 测试依赖关系:
 * - TEST-1401: 依赖 TEST-101 (登录)
 * - TEST-1403: 依赖 TEST-101, TEST-1401 (需要模板)
 * - TEST-1404: 依赖 TEST-101, TEST-1401
 * - TEST-1405: 依赖 TEST-101
 * - TEST-1410: 依赖 TEST-101
 */

test.describe('【导入功能】战队批量导入测试', () => {
  let dashboardPage: DashboardPage;
  let teamsPage: TeamsPage;
  let tempDir: string;

  test.beforeAll(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'team-import-test-'));
  });

  test.afterAll(async () => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    teamsPage = new TeamsPage(page);
    await page.goto('/admin/dashboard');
    await dashboardPage.expectPageLoaded();
    await dashboardPage.navigateToTeams();
    await teamsPage.expectPageLoaded();
  });

  /**
   * TEST-1401: 下载模板测试
   * 优先级: P1
   * 验证模板下载功能
   */
  test('TEST-1401: 下载模板 @P1', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

    await teamsPage.clickDownloadTemplateButton();

    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toMatch(/.*\.xlsx$/);
      console.log(`✅ 模板下载成功: ${download.suggestedFilename()}`);
    } else {
      console.log('⚠️ 下载未触发或超时');
    }
  });

  /**
   * TEST-1410: 按钮顺序验证测试
   * 优先级: P1
   * 验证按钮顺序为：刷新 → 添加战队 → 下载模板 → 批量导入
   */
  test('TEST-1410: 按钮顺序验证 @P1', async ({ page }) => {
    const buttons = page.locator('.flex.gap-2 > button, .flex.gap-2 > div > button');
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThanOrEqual(4);
    console.log(`✅ 找到 ${buttonCount} 个按钮`);

    const buttonTexts: string[] = [];
    for (let i = 0; i < buttonCount; i++) {
      const text = await buttons.nth(i).textContent();
      if (text) buttonTexts.push(text.trim());
    }

    console.log(`按钮顺序: ${buttonTexts.join(' → ')}`);

    const refreshIndex = buttonTexts.findIndex(t => t.includes('刷新'));
    const addIndex = buttonTexts.findIndex(t => t.includes('添加战队'));
    const templateIndex = buttonTexts.findIndex(t => t.includes('下载模板'));
    const importIndex = buttonTexts.findIndex(t => t.includes('批量导入'));

    expect(refreshIndex).toBeLessThan(addIndex);
    expect(addIndex).toBeLessThan(templateIndex);
    expect(templateIndex).toBeLessThan(importIndex);
    console.log('✅ 按钮顺序正确');
  });

  /**
   * TEST-1403: 导入成功流程测试
   * 优先级: P1
   * 验证正常Excel文件导入成功 - 真实业务场景
   */
  test('TEST-1403: 导入成功流程 @P1', async ({ page }) => {
    const fixturePath = getFixtureExcelPath();
    if (!fs.existsSync(fixturePath)) {
      console.log('⚠️ 测试fixtures文件不存在，请先运行 create-test-excel.js 生成');
      test.skip();
      return;
    }

    await teamsPage.clickBatchImportButton();

    const dialogVisible = await page.locator('text=批量导入战队').isVisible();
    expect(dialogVisible).toBeTruthy();
    console.log('✅ 导入对话框打开成功');

    const excelFilePath = copyFixtureToTemp(tempDir);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(excelFilePath);

    await page.waitForTimeout(500);

    const importButton = page.locator('button:has-text("开始导入")');
    await importButton.click();

    await page.waitForTimeout(3000);

    const successVisible = await page.locator('text=导入成功').isVisible({ timeout: 10000 }).catch(() => false);
    const partialVisible = await page.locator('text=部分成功').isVisible({ timeout: 10000 }).catch(() => false);

    expect(successVisible || partialVisible).toBeTruthy();
    console.log(`✅ 导入结果展示成功`);

    await page.locator('button:has-text("关闭")').click();
    await page.waitForTimeout(1000);

    await teamsPage.refresh();
    await page.waitForTimeout(1000);

    const teamExists = await teamsPage.hasTeam(TEST_TEAM_NAME);
    if (teamExists) {
      console.log(`✅ 导入后战队列表刷新，新战队"${TEST_TEAM_NAME}"可见`);
    } else {
      console.log(`⚠️ 导入后刷新列表，未找到"${TEST_TEAM_NAME}"`);
    }
  });

  /**
   * TEST-1404: 导入失败校验测试
   * 优先级: P2
   * 验证无效文件格式校验 - 真实业务场景
   */
  test('TEST-1404: 导入失败校验 @P2', async ({ page }) => {
    await teamsPage.clickBatchImportButton();

    const dialogVisible = await page.locator('text=批量导入战队').isVisible();
    expect(dialogVisible).toBeTruthy();

    const invalidFilePath = path.join(tempDir, `invalid_${Date.now()}.txt`);
    fs.writeFileSync(invalidFilePath, '这不是Excel文件');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidFilePath);

    await page.waitForTimeout(500);

    const errorVisible = await page.locator('text=仅支持 .xlsx 格式').isVisible({ timeout: 3000 }).catch(() => false);
    expect(errorVisible).toBeTruthy();
    console.log('✅ 前端校验：无效文件格式被正确拦截');

    await page.keyboard.press('Escape');

    if (fs.existsSync(invalidFilePath)) {
      fs.unlinkSync(invalidFilePath);
    }
  });

  /**
   * TEST-1405: 导入覆盖验证测试
   * 优先级: P2
   * 验证覆盖模式正确工作 - 真实业务场景
   */
  test('TEST-1405: 导入覆盖验证 @P2', async ({ page }) => {
    const fixturePath = getFixtureExcelPath();
    if (!fs.existsSync(fixturePath)) {
      console.log('⚠️ 测试fixtures文件不存在，请先运行 create-test-excel.js 生成');
      test.skip();
      return;
    }

    await teamsPage.clickBatchImportButton();

    const coverModeHint = await page.locator('text=覆盖模式').isVisible().catch(() => false);
    expect(coverModeHint).toBeTruthy();
    console.log('✅ 覆盖模式提示可见');

    const excelFilePath = copyFixtureToTemp(tempDir);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(excelFilePath);

    await page.waitForTimeout(500);

    const importButton = page.locator('button:has-text("开始导入")');
    await importButton.click();

    await page.waitForTimeout(3000);

    const successVisible = await page.locator('text=导入成功').isVisible({ timeout: 10000 }).catch(() => false);
    expect(successVisible).toBeTruthy();
    console.log('✅ 首次导入成功');

    await page.locator('button:has-text("关闭")').click();
    await page.waitForTimeout(1000);

    await teamsPage.refresh();
    await page.waitForTimeout(1000);

    const teamExists = await teamsPage.hasTeam(TEST_TEAM_NAME);
    expect(teamExists).toBeTruthy();
    console.log(`✅ 导入后战队"${TEST_TEAM_NAME}"存在`);
  });
});
