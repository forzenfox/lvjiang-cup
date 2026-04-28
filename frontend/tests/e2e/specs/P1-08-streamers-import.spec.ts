import { test, expect } from '@playwright/test';

test.describe('主播管理 - 批量导入功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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

    await expect(dialog.locator('button:has-text("下载导入模板")')).toBeVisible();
    await expect(dialog.locator('text=拖拽文件到此处')).toBeVisible();

    await dialog.locator('button:has-text("取消")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('导入结果弹窗显示', async ({ page }) => {
    await page.waitForSelector('text=主播管理', { timeout: 10000 });

    const streamersLink = page.locator('text=主播管理').first();
    await streamersLink.click();

    await page.waitForURL('**/admin/streamers', { timeout: 10000 });
  });

  test('未认证用户不能访问导入功能', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/admin/streamers');
    await expect(page).not.toHaveSelector('button:has-text("批量导入")', { timeout: 5000 });
  });
});
