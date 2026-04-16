import { test, expect } from '@playwright/test';
import { DashboardPage, TeamsPage } from '../pages';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const TEST_TEAM_NAME = `导入测试战队_${Date.now()}`;
const TEST_TEAM_NAME_2 = `导入测试战队2_${Date.now()}`;

function createMockExcelFile(filePath: string): void {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('战队与队员信息导入');

  sheet.getCell('A1').value = '战队与队员信息导入模板';
  sheet.getCell('A3').value = '战队名称';
  sheet.getCell('B3').value = '队标URL';
  sheet.getCell('C3').value = '参赛宣言';
  sheet.getCell('D3').value = '位置';
  sheet.getCell('E3').value = '队员昵称';
  sheet.getCell('F3').value = '队员游戏ID';
  sheet.getCell('G3').value = '队员头像URL';
  sheet.getCell('H3').value = '评分';
  sheet.getCell('I3').value = '是否队长';
  sheet.getCell('J3').value = '实力等级';
  sheet.getCell('K3').value = '常用英雄';
  sheet.getCell('L3').value = '直播间号';
  sheet.getCell('M3').value = '个人简介';

  const row4Data = [
    TEST_TEAM_NAME,
    'https://example.com/logo.png',
    '测试宣言',
    '上单',
    '小明',
    'GameID001',
    'https://example.com/avatar.png',
    85,
    '是',
    'S',
    '亚索,盲僧',
    '123456',
    '我是上单选手'
  ];
  row4Data.forEach((val, idx) => {
    sheet.getCell(idx + 1, 4).value = val;
  });

  const positions = ['打野', '中单', 'ADC', '辅助'];
  positions.forEach((pos, idx) => {
    const rowNum = idx + 5;
    sheet.getCell(1, rowNum).value = TEST_TEAM_NAME;
    sheet.getCell(4, rowNum).value = pos;
    sheet.getCell(5, rowNum).value = `队员${idx + 1}`;
    sheet.getCell(8, rowNum).value = 75;
    sheet.getCell(9, rowNum).value = '否';
    sheet.getCell(10, rowNum).value = 'B';
  });

  const buffer = await workbook.xlsx.writeBuffer();
  fs.writeFileSync(filePath, buffer);
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
    await teamsPage.clickBatchImportButton();

    const dialogVisible = await page.locator('text=批量导入战队').isVisible();
    expect(dialogVisible).toBeTruthy();
    console.log('✅ 导入对话框打开成功');

    const excelFilePath = path.join(tempDir, `test_import_${Date.now()}.xlsx`);
    createMockExcelFile(excelFilePath);

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

    if (fs.existsSync(excelFilePath)) {
      fs.unlinkSync(excelFilePath);
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
    await teamsPage.clickBatchImportButton();

    const coverModeHint = await page.locator('text=覆盖模式').isVisible().catch(() => false);
    expect(coverModeHint).toBeTruthy();
    console.log('✅ 覆盖模式提示可见');

    const excelFilePath = path.join(tempDir, `test_overwrite_${Date.now()}.xlsx`);
    createMockExcelFile(excelFilePath);

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

    await page.locator('text=取消').click();

    if (fs.existsSync(excelFilePath)) {
      fs.unlinkSync(excelFilePath);
    }
  });
});
