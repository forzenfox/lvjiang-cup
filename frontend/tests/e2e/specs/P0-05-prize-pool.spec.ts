import { test, expect } from '@playwright/test';

test.describe('奖金池展示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('奖金池区域在 HeroSection 内显示', async ({ page }) => {
    const prizePool = page.locator('#hero >> text=赛事奖金池');
    await expect(prizePool).toBeVisible();
  });

  test('常规奖金金额展示正确', async ({ page }) => {
    await expect(page.locator('text=¥100,000')).toBeVisible();
    await expect(page.locator('text=¥70,000')).toBeVisible();
    await expect(page.locator('text=¥30,000')).toBeVisible();
  });

  test('冠军亚军占比展示正确', async ({ page }) => {
    await expect(page.locator('text=冠军 70%')).toBeVisible();
    await expect(page.locator('text=亚军 30%')).toBeVisible();
  });

  test('特殊奖项纵向滚动展示', async ({ page }) => {
    const scrollContainer = page.locator('[data-testid="special-awards-scroll"]');
    await expect(scrollContainer).toBeVisible();
  });

  test('特殊奖项内容展示正确', async ({ page }) => {
    await expect(page.locator('text=8强每个队伍1K')).toBeVisible();
    await expect(page.locator('text=冠军打野 1K')).toBeVisible();
  });

  test('移动端上下堆叠布局', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    const grid = page.locator('[data-testid="prize-pool-grid"]');
    await expect(grid).toHaveClass(/grid-cols-1/);
  });
});
