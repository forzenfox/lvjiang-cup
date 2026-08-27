import { test, expect } from '@playwright/test';
import { prepareHome } from '../utils/test-helpers';

test.describe('奖金池展示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 退出 StartBox 全屏封面并滚动激活懒加载，避免遮挡 / 未渲染导致断言失败
    await prepareHome(page);
  });

  test('奖金池区域在 HeroSection 内显示', async ({ page }) => {
    const prizePool = page.locator('#hero >> text=赛事奖金池');
    await expect(prizePool).toBeVisible();
  });

  test('常规奖金金额展示正确', async ({ page }) => {
    // 金额来自 public/config.js 注入的 window.PRIZE_POOL_DATA：
    // regular.total=109000，冠军占 70%=76300，亚军占 30%=32700
    await expect(page.locator('text=¥109,000')).toBeVisible();
    await expect(page.locator('text=¥76,300')).toBeVisible();
    await expect(page.locator('text=¥32,700')).toBeVisible();
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
    // 同一奖项文案在首页与鸣谢区等多处重复出现，用 .first() 规避 strict mode 冲突
    await expect(page.locator('text=8强每个队伍1K').first()).toBeVisible();
    await expect(page.locator('text=冠军打野 1K').first()).toBeVisible();
  });

  test('移动端上下堆叠布局', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    const grid = page.locator('[data-testid="prize-pool-grid"]');
    await expect(grid).toHaveClass(/grid-cols-1/);
  });
});
