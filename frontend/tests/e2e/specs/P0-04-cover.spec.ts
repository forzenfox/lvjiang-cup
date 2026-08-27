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
  // 移动端触摸测试需要启用 hasTouch，否则 page.touchscreen / TouchEvent 不可用
  test.use({ hasTouch: true });

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

    // 模拟移动端单指向上滑动（touchstart + 上移的 touchmove），
    // 触发 StartBox 的触摸退出逻辑（window touchstart/touchmove 监听）
    await page.evaluate(() => {
      const target = window as unknown as EventTarget;
      const start = new Touch({ identifier: 1, target, clientX: 187, clientY: 500 });
      const moved = new Touch({ identifier: 1, target, clientX: 187, clientY: 260 });
      window.dispatchEvent(
        new TouchEvent('touchstart', {
          bubbles: true,
          touches: [start],
          targetTouches: [start],
          changedTouches: [start],
        })
      );
      window.dispatchEvent(
        new TouchEvent('touchmove', {
          bubbles: true,
          touches: [moved],
          targetTouches: [moved],
          changedTouches: [moved],
        })
      );
    });

    // 等待退出动画结束（ANIMATION_CONFIG.exitDuration ≈ 900ms）
    await page.waitForTimeout(1200);

    const coverElement = page.locator('.start-box-cover');
    await expect(coverElement).not.toBeVisible();
  });
});
