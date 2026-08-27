import path from 'node:path';
import { test, expect } from '@playwright/test';
import { prepareHome, clearAuthState } from '../utils/test-helpers';

/**
 * 主播管理 - 批量导入功能
 *
 * 说明：
 * - 本文件以 ESM 运行（frontend package.json "type": "module"），因此不使用 __dirname，
 *   需要定位 fixture 文件时改用 process.cwd()（测试从 frontend 目录启动）。
 * - StreamerImportDialog 弹窗内并无「下载导入模板」按钮（该按钮位于页面工具栏「下载模板」），
 *   故用例 1 不做该断言。
 */
const IMPORT_XLSX = path.join(process.cwd(), 'tests', 'e2e', 'fixtures', 'test-import.xlsx');

test.describe('主播管理 - 批量导入功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 退出首页 StartBox 全屏封面，避免封面拦截对导航区的点击
    await prepareHome(page);
  });

  test('批量导入完整流程', async ({ page }) => {
    await page.waitForSelector('text=主播管理', { timeout: 10000 });

    const streamersLink = page.locator('text=主播管理').first();
    await streamersLink.click();

    await page.waitForURL('**/admin/streamers', { timeout: 10000 });

    const importButton = page.locator('button:has-text("批量导入")');
    await expect(importButton).toBeVisible();
    await importButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('text=批量导入主播')).toBeVisible();

    await expect(dialog.locator('text=⚠️ 重要警告')).toBeVisible();
    await expect(dialog.locator('text=导入将删除所有现有主播数据')).toBeVisible();
    await expect(dialog.locator('text=拖拽文件到此处')).toBeVisible();

    await dialog.locator('button:has-text("取消")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('导入结果弹窗显示', async ({ page }) => {
    await page.waitForSelector('text=主播管理', { timeout: 10000 });

    const streamersLink = page.locator('text=主播管理').first();
    await streamersLink.click();

    await page.waitForURL('**/admin/streamers', { timeout: 10000 });

    // Mock 导入接口，返回成功结果，避免依赖真实后端
    await page.route('**/api/admin/streamers/import', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            code: 20000,
            message: '导入成功',
            data: { total: 1, created: 1, failed: 0 },
          }),
        });
      }
    });

    const importButton = page.locator('button:has-text("批量导入")');
    await expect(importButton).toBeVisible();
    await importButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // 上传示例 xlsx 文件，触发导入
    await dialog.locator('[data-testid="file-input"]').setInputFiles(IMPORT_XLSX);
    await dialog.locator('button:has-text("开始导入")').click();

    // 导入成功后应弹出「导入结果」弹窗
    const resultDialog = page.locator('[role="dialog"]:has-text("导入结果")');
    await expect(resultDialog).toBeVisible({ timeout: 10000 });
    console.log('✅ 导入结果弹窗正常显示');
  });

  test('未认证用户不能访问导入功能', async ({ page }) => {
    // 清除 localStorage token 与 cookie，确保为未登录态
    await clearAuthState(page);

    await page.goto('/admin/streamers');
    // 未登录访问管理页面应被重定向或进入登录态，不可见「批量导入」按钮
    // （注意：Playwright 无 toHaveSelector 断言，改用 not.toBeVisible）
    await expect(page.locator('button:has-text("批量导入")').first()).not.toBeVisible({
      timeout: 5000,
    });
  });
});
