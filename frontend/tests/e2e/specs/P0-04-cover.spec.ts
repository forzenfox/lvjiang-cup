import { test, expect } from '@playwright/test';

test.describe('网页封面 (P0)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('UC-1: 游客首次访问看到封面', async ({ page }) => {
    const coverElement = page.locator('.start-box-cover');
    await expect(coverElement).toBeVisible();
  });

  test('UC-2: 滚动后封面退出', async ({ page }) => {
    await expect(page.locator('.start-box-cover')).toBeVisible();

    await page.mouse.wheel(0, 100);

    await page.waitForTimeout(1000);

    const coverElement = page.locator('.start-box-cover');
    await expect(coverElement).not.toBeVisible();
  });

  test('UC-4: 管理员路径不显示封面', async ({ page }) => {
    await page.goto('/admin/login');

    const coverElement = page.locator('.start-box-cover');
    await expect(coverElement).not.toBeVisible();
  });
});

test.describe('网页封面 - 移动端 (P0)', () => {
  test('移动端布局正确', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const coverElement = page.locator('.start-box-cover');
    await expect(coverElement).toBeVisible();
  });

  test('移动端触摸滑动退出', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('.start-box-cover')).toBeVisible();

    await page.touchscreen.tap(200, 400);

    const coverElement = page.locator('.start-box-cover');
    await expect(coverElement).not.toBeVisible();
  });
});
